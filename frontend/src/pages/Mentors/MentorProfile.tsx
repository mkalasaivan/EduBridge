import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  MessageSquare, 
  ShieldCheck, 
  Award, 
  ChevronLeft,
  Send,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';
import type { User as UserType } from '../../types';

const MentorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  
  const [mentor, setMentor] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const response = await client.get(`/users/${id}`);
        setMentor(response.data);
      } catch (error) {
        console.error('Error fetching mentor:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentor();
  }, [id]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return navigate('/login');
    
    setSubmitting(true);
    try {
      await client.post('/mentorship', { mentorId: id, subject, message });
      setShowRequestForm(false);
      alert('Mentorship request sent successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Failed to send request. Have you already contacted this mentor?');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-white animate-pulse">Loading profile...</div>;
  if (!mentor) return <div className="p-20 text-center text-white">Mentor not found</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <Link to="/mentors" className="flex items-center text-slate-500 hover:text-white transition-colors group">
        <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Mentors
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-8"
        >
          <div className="glass p-8 rounded-[48px] border border-white/5 bg-white/5 flex flex-col items-center text-center space-y-6">
            <div className="w-32 h-32 rounded-[32px] bg-primary/20 p-1 border border-primary/20 overflow-hidden shadow-2xl">
              {mentor.avatar ? (
                <img src={mentor.avatar} className="w-full h-full object-cover rounded-[28px]" alt={mentor.name} />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-primary rounded-[28px]">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">{mentor.name}</h1>
              <div className="flex items-center justify-center mt-2 space-x-2">
                 <ShieldCheck className="w-4 h-4 text-emerald-400" />
                 <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Verified Expert Mentor</span>
              </div>
            </div>
            
            <p className="text-slate-400 font-medium leading-relaxed italic">
              "{mentor.bio || "Enthusiastic educator committed to helping students achieve their technical potential."}"
            </p>

            <div className="w-full grid grid-cols-2 gap-4 py-4 border-y border-white/5">
               <div>
                  <p className="text-white font-black">4.9/5</p>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Rating</p>
               </div>
               <div>
                  <p className="text-white font-black">15+</p>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Students</p>
               </div>
            </div>

            <button 
              onClick={() => setShowRequestForm(!showRequestForm)}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center"
            >
              <MessageSquare className="w-5 h-5 mr-3" />
              Request Mentorship
            </button>
          </div>

          <div className="glass p-8 rounded-[40px] border border-white/5 bg-white/5 space-y-6">
             <h3 className="text-white font-bold flex items-center">
                <Award className="w-5 h-5 mr-3 text-amber-400" />
                Skills & Expertise
             </h3>
             <div className="flex flex-wrap gap-2">
                {mentor.skills.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-slate-300">
                    {skill}
                  </span>
                ))}
             </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          {showRequestForm ? (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-10 rounded-[48px] border-primary/20 bg-primary/5 shadow-2xl relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Send className="w-32 h-32 text-primary" />
               </div>
               <h2 className="text-3xl font-black text-white mb-2">Send Mentorship Request</h2>
               <p className="text-slate-400 font-medium mb-8">Tell {mentor.name} what you'd like to learn and why they are a good fit.</p>
               
               <form onSubmit={handleSubmitRequest} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300">Subject Area</label>
                    <input 
                      required
                      className="w-full px-5 py-4 glass rounded-2xl border-white/5 text-white placeholder:text-slate-700 outline-none focus:border-primary/50"
                      placeholder="e.g. Master Backend with NestJS"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300">Personal Message</label>
                    <textarea 
                      required
                      className="w-full px-5 py-4 glass rounded-2xl border-white/5 text-white placeholder:text-slate-700 outline-none focus:border-primary/50 min-h-[150px]"
                      placeholder="Hi! I am struggling with API design and I've seen your resources..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button 
                      type="button" 
                      onClick={() => setShowRequestForm(false)}
                      className="flex-1 py-4 glass text-white font-bold rounded-2xl hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20 flex items-center justify-center"
                    >
                      {submitting ? 'Sending Request...' : 'Submit Request'}
                    </button>
                  </div>
               </form>
            </motion.div>
          ) : null}

          <div className="space-y-8">
            <h2 className="text-2xl font-black text-white flex items-center">
              <BookOpen className="w-6 h-6 mr-3 text-blue-400" />
              Shared Learning Resources
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(mentor as any).resources?.length > 0 ? (mentor as any).resources.map((res: any, idx: number) => (
                 <div key={idx} className="glass p-6 rounded-[32px] border border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all group">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md mb-3 inline-block">
                      {res.type}
                    </span>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{res.title}</h3>
                    <div className="flex items-center text-xs font-bold text-slate-600 space-x-1 uppercase tracking-widest">
                       <span>{res.level}</span>
                       <span>•</span>
                       <span>{res.tags?.join(', ') || 'General'}</span>
                    </div>
                 </div>
              )) : (
                <div className="col-span-2 p-12 glass border-dashed glass rounded-[40px] text-center text-slate-700 font-bold italic">
                   No specific resources shared on the profile yet.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MentorProfile;
