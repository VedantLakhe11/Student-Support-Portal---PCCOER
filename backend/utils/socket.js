const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*', // Allows Vercel frontend client connections dynamically
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // JWT socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication failed: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name role email');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed: Invalid Token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    // Broadcast online status to all nodes
    io.emit('presence-update', Array.from(onlineUsers.keys()));
    console.log(`[Socket Connected]: ${socket.user.name} (${socket.user.role}) connected on socket ID: ${socket.id}`);

    // Join user's personal room for direct notification alerts
    socket.join(userId);

    // Join custom conversation rooms (DM or Group Channel)
    socket.on('join-conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`[Socket Joined Conversation]: User ${socket.user.name} joined room: ${conversationId}`);
    });

    // Handle real-time messaging broadcast
    socket.on('send-message', (message) => {
      // Broadcast to other participants in the conversation room
      socket.to(message.conversationId).emit('receive-message', message);
    });

    // Handle typing status indicators
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('typing-status', {
        userId,
        userName: socket.user.name,
        isTyping,
      });
    });

    // ==========================================
    // WebRTC VIDEO / AUDIO CALL SIGNALING
    // ==========================================

    // User initiates call request
    socket.on('call-user', ({ targetUserId, offer, signalData, roomId }) => {
      const targetSocketId = onlineUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('incoming-call', {
          callerId: userId,
          callerName: socket.user.name,
          offer,
          signalData,
          roomId,
        });
      }
    });

    // User answers incoming call
    socket.on('answer-call', ({ targetUserId, answer, signalData }) => {
      const targetSocketId = onlineUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call-answered', {
          answer,
          signalData,
        });
      }
    });

    // Decline or end active call session
    socket.on('end-call', ({ targetUserId }) => {
      const targetSocketId = onlineUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call-ended');
      }
    });

    // Join audio/video WebRTC room for group channels
    socket.on('join-meeting-room', ({ roomId, peerId }) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined-meeting', {
        peerId,
        userId,
        userName: socket.user.name,
      });
      console.log(`[WebRTC Room]: User ${socket.user.name} joined room: ${roomId} with Peer ID: ${peerId}`);
    });

    // Signal WebRTC updates (offers, answers, ice candidates)
    socket.on('meeting-signal', ({ roomId, signal, to }) => {
      const targetSocketId = onlineUsers.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('meeting-signal-receive', {
          signal,
          from: userId,
        });
      } else {
        socket.to(roomId).emit('meeting-signal-receive', {
          signal,
          from: userId,
        });
      }
    });

    // Leave call/meeting room
    socket.on('leave-meeting-room', ({ roomId, peerId }) => {
      socket.to(roomId).emit('user-left-meeting', {
        peerId,
        userId,
      });
      socket.leave(roomId);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      // Broadcast updated online presence roster
      io.emit('presence-update', Array.from(onlineUsers.keys()));
      console.log(`[Socket Disconnected]: ${socket.user.name} disconnected`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
};

const getOnlineUsers = () => onlineUsers;

module.exports = {
  initSocket,
  getIo,
  getOnlineUsers,
};
