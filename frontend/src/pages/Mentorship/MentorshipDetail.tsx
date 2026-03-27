import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ChevronLeft, 
  Clock, 
  User,
  MoreVertical,
  Paperclip,
  Calendar,
  X,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';
import { useSocket } from '../../hooks/useSocket';
import type { MentorshipRequest, Message } from '../../types';
import toast from 'react-hot-toast';

const SchedulingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (start: string, end: string) => Promise<void>;
}> = ({ isOpen, onClose, onSchedule }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end) {
      toast.error('Please select both start and end times');
      return;
    }
    setLoading(true);
    try {
      await onSchedule(start, end);
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md glass-strong p-8 rounded-[32px] border border-white/10 shadow-2xl relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Schedule Session</h2>
                <p className="text-slate-400 text-sm font-medium">Book a time for your mentorship session.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full px-5 py-4 glass rounded-2xl border-white/5 focus:border-primary/50 text-white outline-none transition-all font-medium [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full px-5 py-4 glass rounded-2xl border-white/5 focus:border-primary/50 text-white outline-none transition-all font-medium [color-scheme:dark]"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      'Schedule & Sync Calendar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const MentorshipDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const socket = useSocket();
  
  const [request, setRequest] = useState<MentorshipRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchDetail = async () => {
    try {
      const response = await client.get(`/mentorship/${id}`);
      setRequest(response.data);
      if (response.data.messages) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching mentorship detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();

    if (socket && id) {
      socket.emit('join_request', id);

      socket.on('new_message', (msg: Message) => {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });
    }

    return () => {
      if (socket && id) {
        socket.off('new_message');
        socket.emit('leave_request', id);
      }
    };
  }, [id, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await client.post(`/mentorship/${id}/messages`, { content: newMessage });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const response = await client.patch(`/mentorship/${id}/status`, { status });
      setRequest(response.data);
      toast.success(`Request ${status.toLowerCase()}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSchedule = async (startTime: string, endTime: string) => {
    try {
      await client.post(`/mentorship/${id}/schedule`, { startTime, endTime });
      toast.success('Session scheduled and synced with Google Calendar!');
      fetchDetail(); // Refresh to potentially show new session (if we add linked sessions UI)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to schedule session');
      throw error;
    }
  };

  if (loading) return <div className="p-20 text-center text-white animate-pulse">Loading conversation...</div>;
  if (!request) return <div className="p-20 text-center text-white">Mentorship not found</div>;

  const isMentor = currentUser?.id === request.mentorId;
  const otherUser = isMentor ? request.student : request.mentor;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-1000">
      <SchedulingModal 
        isOpen={isScheduling} 
        onClose={() => setIsScheduling(false)} 
        onSchedule={handleSchedule}
      />

      {/* Header */}
      <div className="glass border-b border-white/5 px-8 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-500" />
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 p-0.5 border border-primary/20 overflow-hidden">
               {otherUser.avatar ? <img src={otherUser.avatar} className="w-full h-full object-cover rounded-full" /> : <User className="w-6 h-6 m-auto text-primary" />}
            </div>
            <div>
              <h2 className="text-white font-bold">{otherUser.name}</h2>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${request.status === 'ACCEPTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{request.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isMentor && request.status === 'ACCEPTED' && (
            <button 
              onClick={() => setIsScheduling(true)}
              className="flex items-center px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-black rounded-xl border border-primary/20 transition-all uppercase tracking-widest"
            >
              <Plus className="w-3 h-3 mr-2" />
              Schedule Session
            </button>
          )}

          {isMentor && request.status === 'PENDING' && (
            <div className="flex space-x-3">
               <button 
                 onClick={() => handleUpdateStatus('REJECTED')}
                 className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-black rounded-xl border border-red-500/20 transition-all uppercase tracking-widest"
               >
                 Reject
               </button>
               <button 
                 onClick={() => handleUpdateStatus('ACCEPTED')}
                 className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-black rounded-xl border border-emerald-500/20 transition-all uppercase tracking-widest shadow-xl shadow-emerald-500/10"
               >
                 Accept Request
               </button>
            </div>
          )}

          <div className="hidden md:block">
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest text-right">Subject</p>
              <p className="text-xs font-bold text-slate-300">{request.subject}</p>
          </div>
          <button className="p-2 text-slate-600 hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-8 space-y-6">
        <div className="max-w-3xl mx-auto flex flex-col space-y-8">
           <div className="flex flex-col items-center mb-10 text-center">
              <div className="h-px w-full bg-white/5 mb-8"></div>
              <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Request Initiated</span>
              <p className="text-slate-500 text-sm font-medium italic max-w-md">"{request.message}"</p>
           </div>

           <AnimatePresence>
            {messages.map((msg, idx) => {
              const isMine = msg.senderId === currentUser?.id;
              return (
                <motion.div 
                  key={msg.id || idx}
                  initial={{ opacity: 0, scale: 0.9, x: isMine ? 20 : -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] p-4 rounded-3xl relative ${
                    isMine 
                      ? 'bg-primary text-white rounded-tr-none shadow-xl shadow-primary/10' 
                      : 'glass border border-white/5 bg-white/5 text-slate-200 rounded-tl-none'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                    <span className={`text-[9px] font-bold mt-2 block opacity-40 ${isMine ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
           </AnimatePresence>
           <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 glass border-t border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto">
           {request.status === 'ACCEPTED' ? (
             <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                <button type="button" className="p-3 text-slate-600 hover:text-white transition-colors">
                   <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  className="flex-grow py-4 px-6 glass rounded-2xl border-white/5 bg-white/5 text-white placeholder:text-slate-700 outline-none focus:border-primary/50 transition-all font-medium"
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  disabled={sending}
                />
                <button 
                  type="submit" 
                  disabled={sending || !newMessage.trim()}
                  className="p-4 bg-primary hover:bg-primary/90 text-white rounded-2xl transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:scale-95 active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
             </form>
           ) : (
             <div className="py-4 text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest">
                   <Clock className="w-3 h-3 mr-2" />
                   {request.status === 'PENDING' ? 'Waiting for mentor to accept the request' : 'This request has been rejected'}
                </div>
                {isMentor && request.status === 'PENDING' && (
                  <p className="text-slate-500 text-xs font-medium mt-3">Accept the request above to start messaging.</p>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MentorshipDetail;
