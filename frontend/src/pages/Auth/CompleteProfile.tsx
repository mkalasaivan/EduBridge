import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';
import type { Role } from '../../types';

const CompleteProfile: React.FC = () => {
  const [role, setRole] = useState<Role>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await client.patch('/users/me', { role });
      setUser(response.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 gradient-bg">
      <motion.div 
        className="w-full max-w-xl p-8 glass rounded-[40px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white">Almost there, {user?.name}!</h1>
          <p className="text-slate-400 font-medium">Please tell us how you'll be using EduBridge</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col space-y-4 ${
                role === 'STUDENT' 
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <div className={`p-3 rounded-2xl w-fit ${role === 'STUDENT' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400'}`}>
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">I'm a Student</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">I want to find mentors and learn new skills.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('MENTOR')}
              className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col space-y-4 ${
                role === 'MENTOR' 
                  ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <div className={`p-3 rounded-2xl w-fit ${role === 'MENTOR' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">I'm a Mentor</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">I want to share knowledge and guide others.</p>
              </div>
            </button>
          </div>

          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Finalize My Account
                <ChevronRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;
