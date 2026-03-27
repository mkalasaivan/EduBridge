import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Users, 
  Star, 
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import type { User as UserType } from '../types';

const Mentors: React.FC = () => {
  const [mentors, setMentors] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const response = await client.get(`/users/mentors?q=${search}`);
      setMentors(response.data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchMentors, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Connect with Mentors</h1>
          <p className="text-slate-500 font-medium">Find experts who can guide you to professional mastery.</p>
        </div>
      </div>

      <div className="glass p-6 rounded-3xl border border-white/5">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:border-primary/50 transition-all font-medium"
            placeholder="Search by name, expertise, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-slate-900 animate-pulse rounded-3xl"></div>)}
        </div>
      ) : mentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mentors.map((mentor, idx) => (
            <motion.div 
              key={mentor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass p-8 rounded-[40px] border border-white/5 bg-white/5 hover:bg-white/[0.07] transition-all group flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-20 h-20 rounded-3xl bg-primary/20 p-1 border border-primary/20 overflow-hidden">
                    {mentor.avatar ? (
                      <img src={mentor.avatar} className="w-full h-full object-cover rounded-2xl shadow-xl" alt={mentor.name} />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-primary rounded-2xl">
                        <Users className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md mb-2 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified Expert
                    </span>
                    <div className="flex items-center justify-end mt-2 space-x-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-bold text-white">4.9/5</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
                    {mentor.name}
                  </h3>
                  <p className="text-slate-500 text-sm italic font-medium line-clamp-2">
                    {mentor.bio || "Sharing knowledge in specialized fields to bridge the gap in education."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {mentor.skills.map((skill, si) => (
                    <span key={si} className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-slate-300 transition-colors group-hover:bg-white/10 group-hover:border-primary/20">
                      {skill}
                    </span>
                  ))}
                  {mentor.skills.length === 0 && (
                     ['Web Development', 'UI Design', 'API Architecture'].map((s, i) => (
                       <span key={i} className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-slate-600">
                         {s}
                       </span>
                     ))
                  )}
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-white/40">
                      M
                    </div>
                  ))}
                  <div className="ml-4 pl-4 text-xs font-bold text-slate-500">
                    +15 Students Helped
                  </div>
                </div>
                <Link 
                  to={`/mentors/${mentor.id}`}
                  className="p-3 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-2xl transition-all shadow-lg shadow-primary/5 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass rounded-[40px] border border-white/5 border-dashed">
          <Users className="w-16 h-16 text-slate-800 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-500">No mentors found for your criteria.</h3>
          <p className="text-slate-600 mt-2 font-medium">Try broadening your interest search or skill tags.</p>
        </div>
      )}
    </div>
  );
};

export default Mentors;
