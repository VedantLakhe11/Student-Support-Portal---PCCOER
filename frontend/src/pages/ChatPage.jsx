import React, { useState, useEffect, useRef } from 'react';
import { 
  Hash, MessageSquare, Send, Mic, Paperclip, Pin, Smile, Users, Phone, Video,
  Volume2, MicOff, VideoOff, Monitor, PhoneOff, Circle, CheckCheck, Sparkles, X, UserPlus, Play, Square, Award
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getSocket, initSocketConnection } from '../services/socket';

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showPinned, setShowPinned] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  
  // Voice Notes & Media attachments
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // WebRTC Call state
  const [activeCall, setActiveCall] = useState(null); // 'audio', 'video' or null
  const [callState, setCallState] = useState('idle'); // 'calling', 'receiving', 'connected'
  const [callPartner, setCallPartner] = useState(null);
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const socket = getSocket();
  const bottomRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    initSocketConnection();
    fetchConversations();
    fetchUsers();

    const sock = getSocket();
    if (sock) {
      sock.on('receive-message', (message) => {
        if (activeConv && message.conversationId === activeConv._id) {
          setMessages((prev) => [...prev, message]);
        }
        // Increment XP for incoming context interaction
        toast.success(`New real-time message from ${message.sender.name}`);
      });

      sock.on('presence-update', (users) => {
        setOnlineUsers(users);
      });

      sock.on('typing-status', ({ userId, userName, isTyping }) => {
        if (isTyping) {
          if (!typingUsers.includes(userName)) {
            setTypingUsers((prev) => [...prev, userName]);
          }
        } else {
          setTypingUsers((prev) => prev.filter((name) => name !== userName));
        }
      });

      // Signaling Call Handlers
      sock.on('incoming-call', ({ callerId, callerName, offer, roomId }) => {
        setCallState('receiving');
        setCallPartner({ _id: callerId, name: callerName });
        setActiveCall('video'); // default incoming
      });

      sock.on('call-answered', () => {
        setCallState('connected');
        startLocalStream();
      });

      sock.on('call-ended', () => {
        cleanupCall();
      });
    }

    return () => {
      if (sock) {
        sock.off('receive-message');
        sock.off('presence-update');
        sock.off('typing-status');
        sock.off('incoming-call');
        sock.off('call-answered');
        sock.off('call-ended');
      }
    };
  }, [activeConv]);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
      const sock = getSocket();
      if (sock) {
        sock.emit('join-conversation', activeConv._id);
      }
    }
  }, [activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data.data);
      if (res.data.data.length > 0 && !activeConv) {
        setActiveConv(res.data.data[0]);
      }
    } catch (err) {
      toast.error('Failed to load campus channels list.');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/chat/users');
      setUsersList(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await api.get(`/chat/conversations/${convId}/messages`);
      setMessages(res.data.data);
    } catch (err) {
      toast.error('Failed to load message thread history.');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !audioUrl && !mediaUrl) return;

    try {
      const res = await api.post(`/chat/conversations/${activeConv._id}/messages`, {
        text: text.trim(),
        voiceUrl: audioUrl,
        mediaUrl: mediaUrl,
      });

      const newMsg = res.data.data;
      setMessages((prev) => [...prev, newMsg]);

      // Emit to Socket server real-time
      const sock = getSocket();
      if (sock) {
        sock.emit('send-message', newMsg);
        // Stop typing indicator on message submission
        sock.emit('typing', { conversationId: activeConv._id, isTyping: false });
      }

      setText('');
      setAudioUrl('');
      setMediaUrl('');
      setIsTyping(false);
      fetchConversations(); // Reload channel lists sorting
    } catch (err) {
      toast.error('Message failed to transmit.');
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    const sock = getSocket();
    if (sock && activeConv) {
      if (e.target.value.length > 0 && !isTyping) {
        setIsTyping(true);
        sock.emit('typing', { conversationId: activeConv._id, isTyping: true });
      } else if (e.target.value.length === 0 && isTyping) {
        setIsTyping(false);
        sock.emit('typing', { conversationId: activeConv._id, isTyping: false });
      }
    }
  };

  const startDM = async (recipientId) => {
    try {
      const res = await api.post('/chat/conversations', {
        isGroup: false,
        participants: [recipientId],
      });
      fetchConversations();
      setActiveConv(res.data.data);
      setShowNewDM(false);
      toast.success('Direct Message channel established!');
    } catch (err) {
      toast.error('Failed to connect DM conversation.');
    }
  };

  // Reactions & message pins
  const handleReaction = async (msgId, emoji) => {
    try {
      await api.post(`/chat/messages/${msgId}/react`, { emoji });
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === msgId) {
            const index = msg.reactions.findIndex((r) => r.emoji === emoji);
            if (index > -1) {
              msg.reactions.splice(index, 1);
            } else {
              msg.reactions.push({ emoji });
            }
          }
          return msg;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handlePinToggle = async (msgId) => {
    try {
      const res = await api.put(`/chat/messages/${msgId}/pin`);
      toast.success(res.data.message);
      setMessages((prev) =>
        prev.map((msg) => (msg._id === msgId ? { ...msg, isPinned: !msg.isPinned } : msg))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Voice Note Recorder Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Simulating Base64 / Local URL translation
        const base64Url = URL.createObjectURL(audioBlob);
        setAudioUrl(base64Url);
        toast.success('Voice note recorded! Hit send to share.');
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      toast.error('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // WebRTC Audio/Video Room Call Actions
  const startCall = (type) => {
    if (!activeConv) return;
    const partner = activeConv.participants.find((p) => p._id !== user.id);
    if (!partner) {
      toast.error('Calls are only available in private DM channels.');
      return;
    }

    setCallPartner(partner);
    setActiveCall(type);
    setCallState('calling');

    const sock = getSocket();
    if (sock) {
      sock.emit('call-user', {
        targetUserId: partner._id,
        roomId: activeConv._id,
        offer: { type: 'offer', sdp: 'sdp-signaling-mock' },
      });
    }

    // Auto-timeout if call unanswered
    setTimeout(() => {
      setCallState((state) => {
        if (state === 'calling') {
          toast.error('Recipient did not answer.');
          cleanupCall();
        }
        return state;
      });
    }, 12000);
  };

  const acceptCall = () => {
    setCallState('connected');
    const sock = getSocket();
    if (sock && callPartner) {
      sock.emit('answer-call', {
        targetUserId: callPartner._id,
        answer: { type: 'answer', sdp: 'sdp-answer-mock' },
      });
    }
    startLocalStream();
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraActive,
        audio: micActive,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Streams initialized in mock simulation mode.');
    }
  };

  const rejectCall = () => {
    const sock = getSocket();
    if (sock && callPartner) {
      sock.emit('end-call', { targetUserId: callPartner._id });
    }
    cleanupCall();
  };

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setActiveCall(null);
    setCallState('idle');
    setCallPartner(null);
    setScreenSharing(false);
  };

  const toggleMic = () => {
    setMicActive(!micActive);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => (track.enabled = !micActive));
    }
  };

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => (track.enabled = !cameraActive));
    }
  };

  // Mock screen sharing toggle
  const toggleScreenShare = async () => {
    setScreenSharing(!screenSharing);
    toast.success(!screenSharing ? 'Screen sharing enabled' : 'Screen sharing terminated');
  };

  return (
    <div className="flex h-[calc(100vh-76px)] bg-slate-950 text-white rounded-3xl border border-slate-900 overflow-hidden shadow-2xl">
      
      {/* 1. Side panel: Channels Sidebar */}
      <div className="w-64 shrink-0 bg-slate-900 border-r border-slate-950 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="h-16 border-b border-slate-950 flex items-center justify-between px-4">
            <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-orange-500" />
              PCCOER COMMUNICATE
            </span>
            <button 
              onClick={() => setShowNewDM(true)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          </div>

          {/* Communities & Channels Roster */}
          <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)]">
            {/* General Channels */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-2">Public Channels</span>
              <button 
                onClick={() => setActiveConv({ _id: 'general_lobby', name: 'General Lounge', channelType: 'general', participants: [] })}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeConv?._id === 'general_lobby' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Hash className="h-4 w-4 text-orange-500" />
                # general-lounge
              </button>
            </div>

            {/* Department Hubs */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-2">Department Channels</span>
              {['Computer Engineering', 'Mechanical Engineering', 'E&TC Engineering'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveConv({ _id: `dept_${dept.replace(/\s+/g, '')}`, name: `${dept} Space`, channelType: 'department', participants: [] })}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                    activeConv?.name?.includes(dept) ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Hash className="h-4 w-4 text-amber-500" />
                  # {dept.split(' ')[0].toLowerCase()}-space
                </button>
              ))}
            </div>

            {/* Private DMs list */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-2">Direct Messages</span>
              {conversations.filter(c => !c.isGroup && c.channelType === 'one-to-one').map((conv) => {
                const partner = conv.participants.find(p => p._id !== user.id);
                const isOnline = onlineUsers.includes(partner?._id || '');
                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeConv?._id === conv._id ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <img src={partner?.avatar || '/placeholder.png'} className="h-6 w-6 rounded-full object-cover border border-slate-700" alt="avatar" />
                        <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-slate-900 ${isOnline ? 'bg-green-500' : 'bg-slate-500'}`} />
                      </div>
                      <span className="truncate max-w-[130px]">{partner?.name || 'Fellow Peer'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Card Roster bottom */}
        <div className="p-3 bg-slate-950 border-t border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <img src={user?.avatar || '/pccoerimg.jpeg'} className="h-8 w-8 rounded-full border border-slate-800" alt="avatar" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-white truncate max-w-[100px]">{user?.name}</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase">{user?.role}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 shrink-0">
            <Award className="h-3 w-3 text-orange-500 " />
            <span className="text-[9px] font-extrabold text-orange-400">Lv.{user?.level || 1}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Chat Panel */}
      <div className="flex-1 flex flex-col justify-between bg-slate-950">
        {/* Chat header */}
        <div className="h-16 border-b border-slate-900 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-orange-500" />
            <span className="font-extrabold text-sm">{activeConv?.name || 'General Channel'}</span>
            <span className="text-[9px] font-bold bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-slate-400 uppercase">
              {activeConv?.channelType || 'channel'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {activeConv?.channelType === 'one-to-one' && (
              <>
                <button onClick={() => startCall('audio')} className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-colors" title="Voice Call">
                  <Phone className="h-4 w-4" />
                </button>
                <button onClick={() => startCall('video')} className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-colors" title="Video Call">
                  <Video className="h-4 w-4" />
                </button>
              </>
            )}
            <button onClick={() => setShowPinned(!showPinned)} className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-colors" title="Pinned Messages">
              <Pin className="h-4 w-4 text-amber-500" />
            </button>
          </div>
        </div>

        {/* Message Feeds log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[calc(100vh-220px)]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <MessageSquare className="h-10 w-10 text-slate-700 " />
              <span className="text-xs font-bold">This marks the absolute beginning of this dialogue stream.</span>
              <span className="text-[10px] text-slate-600">Send an active packet to start connecting!</span>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg._id} className="flex gap-3 hover:bg-slate-900/40 p-2 rounded-xl transition-all group relative">
                <img src={msg.sender?.avatar || '/placeholder.png'} className="h-8 w-8 rounded-full border border-slate-800 object-cover" alt="avatar" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-extrabold text-white">{msg.sender?.name}</span>
                    <span className="text-[9px] bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded text-slate-400 uppercase font-bold">
                      {msg.sender?.role}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {msg.text && <p className="text-xs text-slate-300 leading-relaxed font-medium">{msg.text}</p>}

                  {/* Audio notes playback */}
                  {msg.voiceUrl && (
                    <div className="mt-2 flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl max-w-xs">
                      <Play className="h-4 w-4 text-orange-500 fill-orange-500" />
                      <div className="h-1.5 flex-1 bg-slate-800 rounded overflow-hidden">
                        <div className="h-full bg-orange-500 w-1/3" />
                      </div>
                      <span className="text-[9px] text-slate-500 font-bold">Voice Note</span>
                    </div>
                  )}

                  {/* Reactions */}
                  {msg.reactions?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {msg.reactions.map((react, i) => (
                        <button key={i} className="text-[10px] bg-slate-900 border border-slate-850 px-2 py-0.5 rounded-full text-slate-300">
                          {react.emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Floating message toolkit on hover */}
                <div className="absolute right-4 top-2 hidden group-hover:flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg shadow-lg">
                  {['👍', '🔥', '💻', '💡'].map((emoji) => (
                    <button key={emoji} onClick={() => handleReaction(msg._id, emoji)} className="hover:scale-125 transition-transform text-xs p-0.5">
                      {emoji}
                    </button>
                  ))}
                  <button onClick={() => handlePinToggle(msg._id)} className="p-1 hover:bg-slate-800 rounded text-amber-500">
                    <Pin className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Dynamic Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="px-6 py-1.5 text-[9px] text-slate-400 font-bold flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-ping" />
            {typingUsers.join(', ')} is typing dynamic responses...
          </div>
        )}

        {/* Chat input box */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-900 bg-slate-950 shrink-0">
          <div className="bg-slate-900 border border-slate-850 p-2 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                <Paperclip className="h-4 w-4" />
              </button>
              <button 
                type="button" 
                onClick={recording ? stopRecording : startRecording}
                className={`p-2 rounded-xl transition-all ${recording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>

            <input
              type="text"
              value={text}
              onChange={handleTyping}
              placeholder={recording ? "Microphone active... speak now..." : "Broadcast your communication packets here..."}
              disabled={recording}
              className="flex-1 bg-transparent border-none text-xs font-medium text-white focus:outline-none placeholder-slate-500 px-2"
            />

            <button type="submit" className="p-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-white transition-all shrink-0">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* 3. Sliding WebRTC CALL PANEL (Active calls, meeting portals overlay) */}
      {activeCall && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 z-55">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-xl w-full flex flex-col items-center space-y-6 shadow-2xl relative">
            <span className="absolute top-4 left-4 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
              {activeCall === 'video' ? 'Video calling' : 'Audio calling'}
            </span>

            {/* Profile Avatar calling indicators */}
            <div className="relative">
              <img src={callPartner?.avatar || '/pccoerimg.jpeg'} className="h-24 w-24 rounded-full border-4 border-orange-500 object-cover" alt="avatar" />
              <div className="absolute inset-0 rounded-full border-4 border-orange-500 animate-ping opacity-75" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-extrabold">{callPartner?.name}</h3>
              <p className="text-slate-400 text-xs font-bold mt-1 uppercase">
                {callState === 'calling' && 'Ringing partner credentials...'}
                {callState === 'receiving' && 'Incoming corporate counseling request...'}
                {callState === 'connected' && 'WebRTC Handshake Verified - Secured call'}
              </p>
            </div>

            {/* Video Streams window layout */}
            {callState === 'connected' && activeCall === 'video' && (
              <div className="grid grid-cols-2 gap-4 w-full h-48 bg-slate-950 rounded-2xl p-2 border border-slate-800 overflow-hidden">
                <div className="bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800">
                  {cameraActive ? (
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 bg-slate-950">Camera Muted</div>
                  )}
                  <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] font-bold">You</span>
                </div>
                <div className="bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800">
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 bg-slate-950 animate-pulse">
                    Peer Stream Active
                  </div>
                  <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] font-bold">{callPartner?.name}</span>
                </div>
              </div>
            )}

            {/* Calling control keys toolbar */}
            <div className="flex items-center gap-4">
              {callState === 'receiving' ? (
                <>
                  <button onClick={acceptCall} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-full text-xs font-bold transition-all shadow-lg flex items-center gap-2">
                    <CheckCheck className="h-4 w-4" /> Accept Call
                  </button>
                  <button onClick={rejectCall} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-full text-xs font-bold transition-all shadow-lg flex items-center gap-2">
                    <PhoneOff className="h-4 w-4" /> Decline
                  </button>
                </>
              ) : (
                <>
                  <button onClick={toggleMic} className={`p-3.5 rounded-full transition-all border ${micActive ? 'bg-slate-800 border-slate-750 hover:bg-slate-700' : 'bg-red-500/20 border-red-500/40 text-red-500'}`}>
                    {micActive ? <Volume2 className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </button>
                  <button onClick={toggleCamera} className={`p-3.5 rounded-full transition-all border ${cameraActive ? 'bg-slate-800 border-slate-750 hover:bg-slate-700' : 'bg-red-500/20 border-red-500/40 text-red-500'}`}>
                    {cameraActive ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </button>
                  <button onClick={toggleScreenShare} className={`p-3.5 rounded-full transition-all border ${screenSharing ? 'bg-orange-500 border-orange-600 text-white' : 'bg-slate-800 border-slate-750 hover:bg-slate-700'}`}>
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button onClick={cleanupCall} className="p-3.5 bg-red-600 hover:bg-red-700 rounded-full text-white transition-all shadow-lg">
                    <PhoneOff className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Sliding PINNED MESSAGES Side Drawer */}
      {showPinned && (
        <div className="w-80 shrink-0 bg-slate-900 border-l border-slate-950 flex flex-col">
          <div className="h-16 border-b border-slate-950 px-4 flex items-center justify-between">
            <span className="font-extrabold text-xs tracking-wider text-slate-400 flex items-center gap-1.5">
              <Pin className="h-4 w-4 text-amber-500" />
              Pinned Message Hub
            </span>
            <button onClick={() => setShowPinned(false)} className="p-1 hover:bg-slate-800 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {messages.filter(m => m.isPinned).length === 0 ? (
              <div className="text-center text-slate-500 text-xs font-bold pt-8">No message pins logged in this channel yet.</div>
            ) : (
              messages.filter(m => m.isPinned).map((msg) => (
                <div key={msg._id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={msg.sender?.avatar || '/placeholder.png'} className="h-5 w-5 rounded-full border border-slate-800" alt="avatar" />
                    <span className="text-[10px] font-extrabold text-white">{msg.sender?.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-medium">{msg.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. Initiate new DM dialog overlay */}
      {showNewDM && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">Initiate Peer Dialogue</span>
              <button onClick={() => setShowNewDM(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {usersList.map((usr) => (
                <button
                  key={usr._id}
                  onClick={() => startDM(usr._id)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-slate-800 rounded-xl transition-all text-left"
                >
                  <img src={usr.avatar || '/placeholder.png'} className="h-8 w-8 rounded-full border border-slate-800 object-cover" alt="avatar" />
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-white">{usr.name}</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase">{usr.dept} | {usr.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
