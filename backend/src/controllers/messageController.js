const Message = require('../models/Message');
const User = require('../models/User');

const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { ciphertext, nonce } = req.body;

    if (!ciphertext || !nonce) {
      return res.status(400).json({ message: 'Ciphertext and nonce are required' });
    }

    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    const message = new Message({
      sender: req.userId,
      recipient: userId,
      ciphertext,
      nonce,
    });

    await message.save();

    res.status(201).json({ message: 'Message sent' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: userId },
        { sender: userId, recipient: req.userId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name username avatarUrl')
      .populate('recipient', 'name username avatarUrl');

    const total = await Message.countDocuments({
      $or: [
        { sender: req.userId, recipient: userId },
        { sender: userId, recipient: req.userId },
      ],
    });

    await Message.updateMany(
      { sender: userId, recipient: req.userId, readAt: null },
      { readAt: new Date() }
    );

    res.json({
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.userId },
            { recipient: req.userId },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.userId] },
              '$recipient',
              '$sender',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', req.userId] },
                    { $eq: ['$readAt', null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    const userIds = conversations.map(c => c._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name username avatarUrl');

    const userMap = {};
    users.forEach(u => { userMap[u._id] = u; });

    const result = conversations.map(c => ({
      user: userMap[c._id],
      lastMessage: c.lastMessage,
      unreadCount: c.unreadCount,
    }));

    res.json({ conversations: result });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ recipient: req.userId, readAt: null });
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  getUnreadCount,
};
