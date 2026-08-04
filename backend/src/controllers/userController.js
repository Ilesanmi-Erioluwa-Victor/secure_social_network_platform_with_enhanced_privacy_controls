const mongoose = require('mongoose');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const FriendRequest = require('../models/FriendRequest');

const resolveTargetUser = async (identifier) => {
  const isValidId = mongoose.Types.ObjectId.isValid(identifier);
  if (isValidId) {
    return User.findById(identifier);
  }
  return User.findOne({ username: identifier.toLowerCase() });
};

const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-passwordHash -refreshTokens -mfaSecret');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isSuspended) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.blockedUsers.includes(req.userId)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isBlocked = user.blockedUsers.includes(req.userId);
    if (isBlocked) {
      return res.status(403).json({ message: 'You have been blocked by this user' });
    }

    const isOwnProfile = req.userId.equals(user._id);
    let friendshipStatus = null;

    if (!isOwnProfile) {
      const friendRequest = await FriendRequest.findOne({
        $or: [
          { requester: req.userId, recipient: user._id },
          { requester: user._id, recipient: req.userId },
        ],
      });

      if (friendRequest) {
        friendshipStatus = friendRequest.status;
        if (friendRequest.requester.equals(req.userId) && friendRequest.status === 'pending') {
          friendshipStatus = 'requested';
        } else if (friendRequest.requester.equals(user._id) && friendRequest.status === 'pending') {
          friendshipStatus = 'pending_approval';
        } else if (friendRequest.status === 'accepted') {
          friendshipStatus = 'friends';
        }
      } else {
        friendshipStatus = 'not_friends';
      }
    }

    const profileData = user.toJSON();

    if (!isOwnProfile) {
      if (user.privacySettings?.showEmail === 'only_me' || 
          (user.privacySettings?.showEmail === 'friends' && friendshipStatus !== 'friends')) {
        delete profileData.email;
      }
    }

    res.json({ user: profileData, friendshipStatus });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'bio', 'avatarUrl'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash -refreshTokens -mfaSecret');

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePrivacySettings = async (req, res) => {
  try {
    const { friendRequestWho, showFriendsList, showEmail } = req.body;
    const privacySettings = {};

    if (friendRequestWho) privacySettings.friendRequestWho = friendRequestWho;
    if (showFriendsList) privacySettings.showFriendsList = showFriendsList;
    if (showEmail) privacySettings.showEmail = showEmail;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { privacySettings },
      { new: true }
    ).select('-passwordHash -refreshTokens -mfaSecret');

    res.json({ message: 'Privacy settings updated', user });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToBlock = await resolveTargetUser(id);

    if (!userToBlock) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.userId.equals(userToBlock._id)) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    const user = await User.findById(req.userId);
    if (user.blockedUsers.includes(userToBlock._id)) {
      return res.status(400).json({ message: 'User already blocked' });
    }

    user.blockedUsers.push(userToBlock._id);
    await user.save();

    await FriendRequest.deleteMany({
      $or: [
        { requester: req.userId, recipient: userToBlock._id },
        { requester: userToBlock._id, recipient: req.userId },
      ],
    });

    await AuditLog.create({
      user: req.userId,
      action: 'BLOCK_USER',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { blockedUserId: userToBlock._id },
    });

    res.json({ message: 'User blocked' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToUnblock = await resolveTargetUser(id);

    if (!userToUnblock) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findById(req.userId);

    if (!user.blockedUsers.includes(userToUnblock._id)) {
      return res.status(400).json({ message: 'User not in block list' });
    }

    user.blockedUsers.pull(userToUnblock._id);
    await user.save();

    res.json({ message: 'User unblocked' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('blockedUsers', 'name username avatarUrl');
    res.json({ blockedUsers: user.blockedUsers });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    await AuditLog.create({
      user: req.userId,
      action: 'ACCOUNT_DELETION',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    await FriendRequest.deleteMany({
      $or: [
        { requester: req.userId },
        { recipient: req.userId },
      ],
    });

    await User.findByIdAndDelete(req.userId);

    res.clearCookie('refreshToken');
    res.json({ message: 'Account deleted permanently' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const downloadData = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('blockedUsers', 'name username');

    const Post = require('../models/Post');
    const posts = await Post.find({ author: req.userId });

    const FriendRequestModel = require('../models/FriendRequest');
    const friends = await FriendRequestModel.find({
      $or: [{ requester: req.userId }, { recipient: req.userId }],
      status: 'accepted',
    }).populate('requester recipient', 'name username');

    res.json({
      profile: user.toJSON(),
      posts,
      friends: friends.map(f => ({
        friend: f.requester._id.equals(req.userId) ? f.recipient : f.requester,
        since: f.createdAt,
      })),
    });
  } catch (error) {
    console.error('Download data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePrivacySettings,
  blockUser,
  unblockUser,
  getBlockedUsers,
  deleteAccount,
  downloadData,
};
