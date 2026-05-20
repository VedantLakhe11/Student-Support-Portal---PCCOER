const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper to resolve pseudo channel IDs to real DB ObjectIds
const resolvePseudoId = async (id, reqUser) => {
  if (mongoose.Types.ObjectId.isValid(id)) return id;
  
  let channelType = 'general';
  let name = 'General Lounge';
  let department = '';
  
  if (id.startsWith('dept_')) {
    channelType = 'department';
    const rawDept = id.replace('dept_', '');
    department = rawDept === 'E&TCEngineering' ? 'E&TC Engineering' : rawDept.replace(/([A-Z])/g, ' $1').trim();
    name = `${department} Space`;
  }
  
  let conv = await Conversation.findOne({ name, channelType });
  if (!conv) {
    conv = await Conversation.create({
      name,
      isGroup: true,
      participants: [reqUser._id],
      channelType,
      department,
      moderators: [reqUser._id]
    });
  } else if (!conv.participants.includes(reqUser._id)) {
    conv.participants.push(reqUser._id);
    await conv.save();
  }
  return conv._id.toString();
};

// @desc    Get all conversations for the logged in user
// @route   GET /api/chat/conversations
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      $or: [
        { participants: req.user._id },
        { channelType: { $in: ['department', 'club', 'general'] } },
      ],
    })
      .populate('participants', 'name email role avatar dept year xp level')
      .populate('moderators', 'name role')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or retrieve existing one-to-one or group conversation
// @route   POST /api/chat/conversations
const createConversation = async (req, res, next) => {
  try {
    const { name, isGroup, participants, channelType, clubName, department } = req.body;

    if (!isGroup && participants && participants.length === 1) {
      const recipientId = participants[0];

      // Check if 1-to-1 conversation already exists
      let existingConv = await Conversation.findOne({
        isGroup: false,
        channelType: 'one-to-one',
        participants: { $all: [req.user._id, recipientId] },
      }).populate('participants', 'name email role avatar dept year xp level');

      if (existingConv) {
        return res.json({
          success: true,
          data: existingConv,
        });
      }

      // Create new one-to-one DMs
      const newConv = await Conversation.create({
        isGroup: false,
        participants: [req.user._id, recipientId],
        channelType: 'one-to-one',
      });

      const populatedConv = await Conversation.findById(newConv._id)
        .populate('participants', 'name email role avatar dept year xp level');

      return res.status(211).json({
        success: true,
        data: populatedConv,
      });
    }

    // Creating group channels / club channels
    const groupParticipants = participants || [];
    if (!groupParticipants.includes(req.user._id.toString())) {
      groupParticipants.push(req.user._id);
    }

    const newGroup = await Conversation.create({
      name: name || `${clubName || 'General'} Channel`,
      isGroup: true,
      participants: groupParticipants,
      channelType: channelType || 'club',
      clubName: clubName || '',
      department: department || '',
      moderators: [req.user._id],
    });

    const populatedGroup = await Conversation.findById(newGroup._id)
      .populate('participants', 'name email role avatar dept year xp level');

    res.status(201).json({
      success: true,
      data: populatedGroup,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages in a conversation (paginated)
// @route   GET /api/chat/conversations/:id/messages
const getMessages = async (req, res, next) => {
  try {
    let { id } = req.params;
    id = await resolvePseudoId(id, req.user);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId: id })
      .populate('sender', 'name role avatar xp level dept')
      .populate('reactions.user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Messages are sorted descending for pagination, return them in chronological order
    res.json({
      success: true,
      data: messages.reverse(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Post a message in a conversation
// @route   POST /api/chat/conversations/:id/messages
const postMessage = async (req, res, next) => {
  try {
    let { id } = req.params;
    id = await resolvePseudoId(id, req.user);
    
    const { text, mediaUrl, voiceUrl } = req.body;

    const newMsg = await Message.create({
      conversationId: id,
      sender: req.user._id,
      text: text || '',
      mediaUrl: mediaUrl || '',
      voiceUrl: voiceUrl || '',
    });

    // Touch conversation to update its updatedAt field
    await Conversation.findByIdAndUpdate(id, { updatedAt: Date.now() });

    // Grant 1 XP point for communication activity
    const newXp = (req.user.xp || 0) + 1;
    let newLevel = req.user.level || 1;
    let newBadges = req.user.badges || [];
    
    if (newXp >= newLevel * 50) {
      newLevel += 1;
      newBadges.push(`Level ${newLevel} Chatter`);
    }
    
    await User.findByIdAndUpdate(req.user._id, {
      xp: newXp,
      level: newLevel,
      badges: newBadges
    });

    const populatedMsg = await Message.findById(newMsg._id)
      .populate('sender', 'name role avatar xp level dept');

    res.status(201).json({
      success: true,
      data: populatedMsg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Pin a message
// @route   PUT /api/chat/messages/:id/pin
const pinMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    message.isPinned = !message.isPinned;
    await message.save();

    const conv = await Conversation.findById(message.conversationId);
    if (message.isPinned) {
      if (!conv.pinnedMessages.includes(message._id)) {
        conv.pinnedMessages.push(message._id);
      }
    } else {
      conv.pinnedMessages = conv.pinnedMessages.filter(
        (mId) => mId.toString() !== message._id.toString()
      );
    }
    await conv.save();

    res.json({
      success: true,
      message: message.isPinned ? 'Message pinned' : 'Message unpinned',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or toggle emoji reaction to message
// @route   POST /api/chat/messages/:id/react
const reactToMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(id);
    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    // Check if user already reacted with this exact emoji
    const existingIndex = message.reactions.findIndex(
      (r) => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingIndex > -1) {
      // Remove reaction
      message.reactions.splice(existingIndex, 1);
    } else {
      // Add reaction
      message.reactions.push({ user: req.user._id, emoji });
    }

    await message.save();
    res.json({
      success: true,
      data: message.reactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list for initiating DMs
// @route   GET /api/chat/users
const getUsersList = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id }, isBanned: false })
      .select('name email role avatar dept year xp level')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  createConversation,
  getMessages,
  postMessage,
  pinMessage,
  reactToMessage,
  getUsersList,
};
