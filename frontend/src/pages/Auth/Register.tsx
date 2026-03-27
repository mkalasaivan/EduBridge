import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Briefcase, GraduationCap, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';
import type { Role } from '../../types';

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as Role,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setPendingVerification } = useAuthStore();
  const navigate = useNavigate();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await client.post('/auth/register', formData);
      setPendingVerification(true, formData.email);
      navigate('/verify-otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/google`;
  };

  const steps = [
    { title: 'Account Info', subtitle: 'Start your journey with us' },
    { title: 'Select Role', subtitle: 'Are you learning or teaching?' },
    { title: 'Confirm Details', subtitle: 'Almost there!' },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 gradient-bg">
      <motion.div 
        className="w-full max-w-xl p-8 glass rounded-[40px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <div className="flex justify-center space-x-2 mb-6">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${step > i ? 'w-8 bg-primary' : 'w-4 bg-white/10'}`} 
              />
            ))}
          </div>
          <h1 className="text-3xl font-black text-white">{steps[step-1].title}</h1>
          <p className="text-slate-400 font-medium">{steps[step-1].subtitle}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-4 glass rounded-2xl border-white/5 focus:border-primary/50 text-white placeholder:text-slate-600 outline-none transition-all"
                      placeholder="Ivan Muhoza"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-4 glass rounded-2xl border-white/5 focus:border-primary/50 text-white placeholder:text-slate-600 outline-none transition-all"
                      placeholder="ivan@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 ml-1">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      required
                      className="w-full pl-12 pr-4 py-4 glass rounded-2xl border-white/5 focus:border-primary/50 text-white placeholder:text-slate-600 outline-none transition-all"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!formData.name || !formData.email || formData.password.length < 6}
                  className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Role Selection
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'STUDENT'})}
                    className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col space-y-4 ${
                      formData.role === 'STUDENT' 
                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl w-fit ${formData.role === 'STUDENT' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">I'm a Student</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">I want to find mentors and learn new skills.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'MENTOR'})}
                    className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col space-y-4 ${
                      formData.role === 'MENTOR' 
                        ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl w-fit ${formData.role === 'MENTOR' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">I'm a Mentor</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">I want to share knowledge and guide others.</p>
                    </div>
                  </button>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-4 glass hover:bg-white/10 text-white font-bold rounded-2xl border border-white/5 transition-all flex items-center justify-center"
                  >
                    <ChevronLeft className="mr-2 w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-[2] py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center"
                  >
                    Final Review
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                  <div className="flex items-center space-x-4 pb-4 border-b border-white/5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Full Name</p>
                      <p className="text-white font-bold">{formData.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 pb-4 border-b border-white/5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Email Address</p>
                      <p className="text-white font-bold">{formData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                      {formData.role === 'STUDENT' ? <GraduationCap className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Joining as</p>
                      <p className="text-white font-bold">{formData.role === 'STUDENT' ? 'Student' : 'Mentor'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-4 glass hover:bg-white/10 text-white font-bold rounded-2xl border border-white/5 transition-all flex items-center justify-center"
                  >
                    <ChevronLeft className="mr-2 w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      'Create My Account'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
        
        <div className="mt-8 flex items-center justify-center space-x-4">
          <div className="h-px flex-1 bg-white/5"></div>
          <span className="text-xs font-bold text-slate-600 uppercase">Or continue with</span>
          <div className="h-px flex-1 bg-white/5"></div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-4 glass hover:bg-white/10 text-white font-bold rounded-2xl border border-white/5 transition-all flex items-center justify-center space-x-3"
          >
            {/* Google SVG Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google Account</span>
          </button>
        </div>

        <p className="mt-10 text-center text-slate-400 text-sm font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary/80 font-bold transition-colors">Log in instead</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
