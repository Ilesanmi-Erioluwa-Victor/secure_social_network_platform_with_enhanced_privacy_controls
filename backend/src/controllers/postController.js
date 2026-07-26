const Post = require('../models/Post');
const Comment = require('../models/Comment');
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');

const createPost = async (req, res) => {
  try {
    const { content, mediaUrls, visibility, customAudience } = req.body;

    const post = new Post({
      author: req.userId,
      content,
      mediaUrls: mediaUrls || [],
      visibility: visibility || 'public',
      customAudience: visibility === 'custom' ? customAudience || [] : [],
    });

    await post.save();
    await post.populate('author', 'name username avatarUrl');

    res.status(201).json({ message: 'Post created', post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.userId);

    const friendRequests = await FriendRequest.find({
      $or: [{ requester: req.userId }, { recipient: req.userId }],
      status: 'accepted',
    });

    const friendIds = friendRequests.map(fr =>
      fr.requester.equals(req.userId) ? fr.recipient : fr.requester
    );

    const visibilityFilter = {
      $or: [
        { visibility: 'public' },
        { author: req.userId },
        {
          visibility: 'friends',
          author: { $in: friendIds },
        },
        {
          visibility: 'custom',
          customAudience: req.userId,
        },
      ],
      author: { $nin: user.blockedUsers },
    };

    const posts = await Post.find(visibilityFilter)
      .populate('author', 'name username avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(visibilityFilter);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const viewer = await User.findById(req.userId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser.blockedUsers.includes(req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const isOwnProfile = req.userId.equals(userId);
    const areFriends = await FriendRequest.findOne({
      $or: [
        { requester: req.userId, recipient: userId, status: 'accepted' },
        { requester: userId, recipient: req.userId, status: 'accepted' },
      ],
    });

    let visibilityFilter;

    if (isOwnProfile) {
      visibilityFilter = { author: userId };
    } else if (areFriends) {
      visibilityFilter = {
        author: userId,
        visibility: { $in: ['public', 'friends'] },
      };
    } else {
      visibilityFilter = {
        author: userId,
        visibility: 'public',
      };
    }

    const posts = await Post.find(visibilityFilter)
      .populate('author', 'name username avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(visibilityFilter);

    res.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePostVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { visibility, customAudience } = req.body;

    const post = await Post.findOne({ _id: id, author: req.userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    post.visibility = visibility;
    if (visibility === 'custom') {
      post.customAudience = customAudience || [];
    } else {
      post.customAudience = [];
    }

    await post.save();
    res.json({ message: 'Visibility updated', post });
  } catch (error) {
    console.error('Update visibility error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = post.likes.includes(req.userId);
    if (alreadyLiked) {
      post.likes.pull(req.userId);
      await post.save();
      return res.json({ message: 'Post unliked', liked: false, likesCount: post.likes.length });
    }

    post.likes.push(req.userId);
    await post.save();
    res.json({ message: 'Post liked', liked: true, likesCount: post.likes.length });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      post: id,
      author: req.userId,
      content,
    });

    await comment.save();
    post.commentsCount += 1;
    await post.save();

    await comment.populate('author', 'name username avatarUrl');

    res.status(201).json({ message: 'Comment added', comment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ post: id })
      .populate('author', 'name username avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ post: id });

    res.json({
      comments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate('author', 'name username avatarUrl');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const user = await User.findById(req.userId);
    if (post.author.blockedUsers?.includes(req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const isOwnPost = req.userId.equals(post.author._id);
    const areFriends = await FriendRequest.findOne({
      $or: [
        { requester: req.userId, recipient: post.author._id, status: 'accepted' },
        { requester: post.author._id, recipient: req.userId, status: 'accepted' },
      ],
    });

    if (post.visibility === 'public') {
      return res.json({ post });
    }

    if (post.visibility === 'only_me' && !isOwnPost) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (post.visibility === 'friends' && !isOwnPost && !areFriends) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (post.visibility === 'custom' && !isOwnPost && !post.customAudience.includes(req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPost,
  getFeed,
  getUserPosts,
  updatePostVisibility,
  likePost,
  addComment,
  getComments,
  getPostById,
};
