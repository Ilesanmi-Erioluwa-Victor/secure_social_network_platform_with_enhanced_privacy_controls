const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');

const sendFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.userId.equals(id)) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const recipient = await User.findById(id);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (recipient.isSuspended) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { requester: req.userId, recipient: id },
        { requester: id, recipient: req.userId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: 'Already friends' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ message: 'Friend request already sent' });
      }
      if (existing.status === 'rejected') {
        existing.status = 'pending';
        await existing.save();
        return res.json({ message: 'Friend request sent' });
      }
    }

    const friendRequest = new FriendRequest({
      requester: req.userId,
      recipient: id,
    });

    await friendRequest.save();
    res.status(201).json({ message: 'Friend request sent' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const respondToFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use "accepted" or "rejected"' });
    }

    const friendRequest = await FriendRequest.findOne({
      _id: id,
      recipient: req.userId,
      status: 'pending',
    });

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    friendRequest.status = status;
    await friendRequest.save();

    res.json({ message: `Friend request ${status}` });
  } catch (error) {
    console.error('Respond to friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFriendRequests = async (req, res) => {
  try {
    const received = await FriendRequest.find({
      recipient: req.userId,
      status: 'pending',
    }).populate('requester', 'name username avatarUrl');

    const sent = await FriendRequest.find({
      requester: req.userId,
    }).populate('recipient', 'name username avatarUrl');

    res.json({ received, sent });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFriends = async (req, res) => {
  try {
    const friendRequests = await FriendRequest.find({
      $or: [{ requester: req.userId }, { recipient: req.userId }],
      status: 'accepted',
    }).populate('requester recipient', 'name username avatarUrl bio');

    const friends = friendRequests.map(fr => {
      const friend = fr.requester._id.equals(req.userId) ? fr.recipient : fr.requester;
      return {
        ...friend.toJSON(),
        friendsSince: fr.createdAt,
      };
    });

    res.json({ friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const unfriend = async (req, res) => {
  try {
    const { id } = req.params;

    const friendship = await FriendRequest.findOneAndDelete({
      $or: [
        { requester: req.userId, recipient: id, status: 'accepted' },
        { requester: id, recipient: req.userId, status: 'accepted' },
      ],
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    res.json({ message: 'Unfriended successfully' });
  } catch (error) {
    console.error('Unfriend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendFriendRequest,
  respondToFriendRequest,
  getFriendRequests,
  getFriends,
  unfriend,
};
