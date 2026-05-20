import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, MessageSquare, X, Send, ShieldAlert, Cpu, HelpCircle, ArrowRight
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AIAssistantPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your PCCOER AI Campus Assistant. Ask me anything about WiFi credentials, Central Library slot times, hostel rules, or top alumni mentors!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input.trim();
    if (!text) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: text });
      const reply = res.data.data;

      // Simulate streaming response typewriter effect
      let currentWordIndex = 0;
      const words = reply.split(' ');
      let currentText = '';

      setMessages(prev => [...prev, { sender: 'bot', text: '' }]);
      
      const interval = setInterval(() => {
        if (currentWordIndex < words.length) {
          currentText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex];
          setMessages(prev => {
            const copy = [...prev];
            copy[copy.length - 1].text = currentText;
            return copy;
          });
          currentWordIndex++;
        } else {
          clearInterval(interval);
          setLoading(false);
        }
      }, 70); // 70ms per word delay to look natural
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am facing a connection delay. Please retry!' }]);
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    handleSend(prompt);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 text-white font-sans">
      
      {/* Bot Launcher Sphere */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full hover:scale-105 hover:rotate-12 transition-transform shadow-2xl border border-orange-400 flex items-center justify-center animate-bounce"
        >
          <Cpu className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Main ChatGPT Assist Container */}
      {isOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-80 sm:w-96 h-[460px] shadow-2xl flex flex-col justify-between overflow-hidden relative">
          
          {/* Header */}
          <div className="bg-slate-950 border-b border-slate-850 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                <Sparkles className="h-4 w-4 text-orange-500 animate-spin" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-extrabold tracking-wide">AI Campus Assistant</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Typewriter stream active</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Conversation history */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[340px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs font-medium leading-relaxed border ${
                  msg.sender === 'user'
                    ? 'bg-orange-500 border-orange-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border-slate-850 text-slate-300 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-950 border border-slate-850 text-slate-500 rounded-2xl rounded-tl-none px-3 py-2 text-[10px] font-bold animate-pulse">
                  AI parsing campus records...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions footer */}
          {messages.length === 1 && (
            <div className="px-4 py-1.5 flex flex-wrap gap-1.5 shrink-0 bg-slate-950/20 border-t border-slate-850/60">
              {[
                'WiFi Credentials',
                'Library Timing',
                'Hostel Gates',
                'Mentorship Guides'
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="text-[9px] font-extrabold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full hover:bg-orange-500 hover:text-white transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input control block */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-950 border-t border-slate-850 flex items-center justify-between gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about classes, wifi, books, schedules..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none placeholder-slate-650"
            />
            <button type="submit" className="p-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-white">
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
