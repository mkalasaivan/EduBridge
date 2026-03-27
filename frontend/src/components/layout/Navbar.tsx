import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Sparkles } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthenticated || isAuthPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-8 pt-8 pointer-events-none">
      <div className="max-w-5xl mx-auto glass-strong rounded-[32px] px-8 py-3.5 flex items-center justify-between border-white/10 shadow-2xl pointer-events-auto transition-all hover:shadow-primary/5">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black gradient-text tracking-tighter">EduBridge</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-slate-400 hover:text-white px-5 py-2 text-xs font-black transition-colors uppercase tracking-[0.2em]">
            Log in
          </Link>
          <Link
            to="/register"
            className="bg-primary hover:bg-primary/90 text-white px-7 py-3 rounded-2xl text-xs font-black transition-all shadow-xl shadow-primary/20 uppercase tracking-[0.1em] ring-4 ring-primary/5 hover:ring-primary/10"
          >
            Join Free
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
