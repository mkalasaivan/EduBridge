import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Activity, 
  Clock, 
  ChevronRight,
  TrendingUp,
  PlusCircle,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';
import type { Resource, MentorshipRequest, User as UserType } from '../types';
import { Link, useNavigate } from 'react-router-dom';

interface MentorshipSession {
  id: string;
  startTime: string;
  endTime: string;
  googleEventId?: string;
  request: {
    subject: string;
    student: UserType;
    mentor: UserType;
  };
}

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resResponse, reqResponse, sesResponse] = await Promise.all([
          client.get('/resources?limit=3'),
          client.get('/mentorship'),
          client.get('/mentorship/sessions/all'),
        ]);
        setResources(resResponse.data.data);
        setRequests(reqResponse.data);
        setSessions(sesResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="h-12 w-64 bg-slate-800 animate-spin rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-800 animate-pulse rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto space-y-12 relative overflow-visible">
      {/* Welcome Section */}
      <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-4">
        <div>
          <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg">Your EduBridge journey continues here.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/resources" className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center group">
            <PlusCircle className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
            Share Resource
          </Link>
        </div>
      </motion.div>

      {/* Upcoming Sessions Section */}
      {sessions.length > 0 && (
        <motion.div {...fadeInUp} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-emerald-400" />
              Upcoming Sessions
            </h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {sessions.map((session) => {
              const otherUser = user?.role === 'MENTOR' ? session.request.student : session.request.mentor;
              const date = new Date(session.startTime);
              return (
                <div 
                  key={session.id}
                  className="min-w-[300px] flex-shrink-0 card-premium p-6 group border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent shadow-xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 overflow-hidden">
                      {otherUser.avatar ? (
                        <img src={otherUser.avatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Users className="w-6 h-6 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Session In</p>
                      <p className="text-lg font-black text-white">{date.toLocaleDateString([], { day: '2-digit', month: 'short' })}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-white truncate">{session.request.subject}</h3>
                    <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                       <Clock className="w-3 h-3 mr-2" />
                       {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {otherUser.name.split(' ')[0]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Completion Rate', value: '85%', icon: <TrendingUp className="text-emerald-400" /> },
          { label: 'Active Requests', value: requests.filter(r => r.status === 'PENDING').length.toString(), icon: <Clock className="text-amber-400" /> },
          { label: 'Resources Read', value: '12', icon: <BookOpen className="text-blue-400" /> },
          { label: 'Mentors Contacted', value: '4', icon: <Users className="text-indigo-400" /> },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            {...fadeInUp} 
            transition={{ delay: i * 0.1 }}
            className="p-8 glass-strong rounded-[32px] border border-white/10 hover:border-primary/20 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-primary/10 transition-colors">{stat.icon}</div>
              <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{stat.label.split(' ')[0]}</div>
            </div>
            <h3 className="text-3xl font-black text-white mb-1">{stat.value}</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Feed Section (Resources) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Activity className="w-6 h-6 mr-3 text-primary" />
              Recent Resources
            </h2>
            <Link to="/resources" className="text-primary hover:text-primary/80 font-bold text-sm flex items-center group">
              View all <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {resources.length > 0 ? resources.map((res, i) => (
              <motion.div 
                key={res.id}
                {...fadeInUp}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => navigate(`/resources/${res.id}`)}
                className="card-premium p-8 group cursor-pointer border-white/5 shadow-xl"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                        {res.type}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg">
                        {res.level}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors leading-tight">{res.title}</h3>
                    <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">{res.description}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl text-slate-700 group-hover:text-primary group-hover:bg-primary/10 transition-all shrink-0">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="p-20 card-premium border-dashed border-white/10 text-center text-slate-600 font-bold">
                No resources shared yet. Be the first!
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Section (Requests) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Users className="w-6 h-6 mr-3 text-indigo-400" />
            {user?.role === 'MENTOR' ? 'Mentorship Requests' : 'My Mentors'}
          </h2>

          <div className="space-y-4">
            {requests.length > 0 ? requests.map((req, i) => (
              <motion.div 
                key={req.id}
                {...fadeInUp}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Link 
                  to={`/mentorship/${req.id}`}
                  className="p-6 glass-strong rounded-[24px] border border-white/5 bg-white/5 flex items-center space-x-5 hover:bg-white/[0.08] transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 overflow-hidden shrink-0 border border-white/5 shadow-lg">
                    {user?.role === 'MENTOR' ? (
                       req.student.avatar ? <img src={req.student.avatar} className="w-full h-full object-cover" alt="" /> : <GraduationCap className="w-7 h-7" />
                    ) : (
                       req.mentor.avatar ? <img src={req.mentor.avatar} className="w-full h-full object-cover" alt="" /> : <Users className="w-7 h-7" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-md font-black text-white truncate group-hover:text-primary transition-colors mb-0.5">
                      {user?.role === 'MENTOR' ? req.student.name : req.mentor.name}
                    </p>
                    <p className="text-slate-500 text-[9px] font-black truncate uppercase tracking-[0.2em]">{req.subject}</p>
                  </div>
                  <div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/5 ${
                      req.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400' :
                      req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                      req.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                      'bg-slate-500/10 text-slate-500'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </Link>
              </motion.div>
            )) : (
              <div className="p-8 bg-white/2 rounded-2xl border border-white/5 text-center text-slate-600 text-sm font-medium">
                No active mentorships found.
              </div>
            )}
          </div>

          <div className="p-6 bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-3xl border border-white/10 shadow-xl">
            <h4 className="text-white font-bold mb-2">Need Help?</h4>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed font-bold">
              Connecting with a mentor can speed up your learning by 200%. Browse our expert directory now.
            </p>
            <Link to="/mentors" className="text-xs text-indigo-400 font-black flex items-center hover:text-indigo-300 transition-colors">
              Find a Mentor <ChevronRight className="ml-1 w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
