import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  LogOut, 
  User, 
  BookOpen, 
  Users, 
  LayoutDashboard, 
  Bell, 
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../../api/client';
import { useSocket } from '../../hooks/useSocket';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Resources', path: '/resources', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Mentors', path: '/mentors', icon: <Users className="w-5 h-5" /> },
  ];

  const fetchNotifications = async () => {
    try {
      const [notifsRes, countRes] = await Promise.all([
        client.get('/notifications'),
        client.get('/notifications/unread-count')
      ]);
      setNotifications(notifsRes.data);
      setUnreadCount(countRes.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (socket) {
      socket.on('new_notification', (notif: any) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }
    return () => {
      if (socket) socket.off('new_notification');
    };
  }, [socket]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const markAsRead = async (id: string, link?: string) => {
    try {
      await client.patch(`/notifications/${id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      if (link) {
        setIsNotificationsOpen(false);
        navigate(link);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <>
      <aside className={`fixed left-0 top-0 bottom-0 z-50 p-4 flex flex-col border-r border-white/5 bg-slate-950/40 backdrop-blur-2xl transition-all duration-500 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'}`}>
        {/* Brand Logo & Toggle */}
        <div className={`mb-10 flex items-center justify-between ${isCollapsed ? 'flex-col space-y-8' : ''}`}>
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300 ring-2 ring-primary/20 shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-black gradient-text tracking-tighter"
              >
                EduBridge
              </motion.span>
            )}
          </Link>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-xl border border-white/10 transition-all ${isCollapsed ? '' : ''}`}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-grow space-y-2">
          {!isCollapsed && (
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4">Main Menu</p>
          )}
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center group transition-all rounded-2xl ${
                  isCollapsed ? 'justify-center p-3.5' : 'justify-between px-4 py-3.5'
                } ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-primary transition-colors'}`}>
                    {link.icon}
                  </span>
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-bold text-sm tracking-tight"
                    >
                      {link.name}
                    </motion.span>
                  )}
                </div>
                {!isCollapsed && isActive && (
                  <motion.div layoutId="activeNav" className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {/* Action Items */}
          <div className="pt-8 space-y-2">
            {!isCollapsed && (
              <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4">Activity</p>
            )}
            
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`w-full flex items-center group transition-all rounded-2xl relative ${
                isCollapsed ? 'justify-center p-3.5' : 'justify-between px-4 py-3.5'
              } ${isNotificationsOpen ? 'bg-white/5 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center space-x-3">
                <span className={`${isNotificationsOpen ? 'text-primary' : 'text-slate-500 group-hover:text-primary transition-colors'}`}>
                  <Bell className="w-5 h-5" />
                </span>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-bold text-sm tracking-tight"
                  >
                    Notifications
                  </motion.span>
                )}
              </div>
              {unreadCount > 0 && (
                <span className={`bg-primary text-white text-[10px] font-black rounded-lg transition-all ${
                  isCollapsed ? 'absolute -top-1 -right-1 px-1.5 py-0.5' : 'px-2 py-0.5'
                }`}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* User Actions & Profile */}
        <div className="mt-auto space-y-6">
          <div className="px-1">
            <Link
              to="/profile"
              className={`flex items-center transition-all group bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 ${
                isCollapsed ? 'justify-center p-2' : 'p-3 space-x-3'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-primary/20 p-0.5 border border-primary/20 shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-[14px]" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-black text-white truncate">{user?.name}</p>
                  <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-tighter">{user?.role}</p>
                </motion.div>
              )}
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center transition-all bg-red-500/5 hover:bg-red-500/10 rounded-2xl border border-red-500/10 group ${
              isCollapsed ? 'justify-center p-3.5' : 'px-6 py-4 space-x-3'
            }`}
          >
            <LogOut className={`w-5 h-5 transition-colors group-hover:text-red-400 ${isCollapsed ? '' : 'transition-transform group-hover:-translate-x-1'}`} />
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-black uppercase tracking-widest"
              >
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </aside>

      {/* Modern Side-Anchored Notifications Panel */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-6 bottom-6 z-50 glass-strong border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
                isCollapsed ? 'left-24 w-96' : 'left-[304px] w-96'
              }`}
            >
              <div className="p-8 border-b border-white/5 bg-white/5 backdrop-blur-3xl relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/20 rounded-xl">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight">Activity Feed</h3>
                  </div>
                  <button 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-2.5 hover:bg-white/10 rounded-2xl text-slate-500 hover:text-white transition-all border border-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                  {unreadCount} UNREAD NOTIFICATIONS
                </p>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n, idx) => (
                    <motion.button
                      key={n.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => markAsRead(n.id, n.link)}
                      className={`w-full p-5 text-left rounded-[24px] border border-white/5 transition-all flex items-start space-x-4 relative group ${
                        !n.isRead ? 'bg-primary/10 border-primary/20 shadow-lg shadow-primary/5' : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {!n.isRead && (
                         <div className="absolute top-6 left-2 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-black text-white group-hover:text-primary transition-colors leading-tight">{n.title}</p>
                          <p className="text-[10px] font-black text-slate-600 uppercase shrink-0 ml-2">
                             {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <p className="text-[12px] font-medium text-slate-400 line-clamp-2 leading-relaxed">{n.content}</p>
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-40">
                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold italic">All interactions caught up!</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-900/50 backdrop-blur-3xl border-t border-white/5 text-center shrink-0">
                 <button className="text-primary font-black text-xs uppercase tracking-widest hover:underline hover:scale-105 transition-all">
                   View All Notifications
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
