import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuthStore } from '../../store/authStore';

const Layout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  // Persist collapsed state
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  React.useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="min-h-screen gradient-bg flex relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="glow-blob w-[500px] h-[500px] bg-primary/30 -top-48 -left-48"></div>
      <div className="glow-blob w-[400px] h-[400px] bg-indigo-500/20 top-1/2 -right-24"></div>
      <div className="glow-blob w-[300px] h-[300px] bg-blue-500/10 bottom-0 left-1/4"></div>

      {isAuthenticated ? (
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      ) : (
        <Navbar />
      )}
      
      <div className={`flex-grow flex flex-col min-h-screen transition-all duration-500 ease-in-out ${
        isAuthenticated ? (isCollapsed ? 'pl-20' : 'pl-72') : ''
      }`}>
        <main className={`flex-grow z-10 ${isAuthenticated ? 'p-8' : 'pt-24'}`}>
          <Outlet />
        </main>
        
        {!isAuthenticated && (
          <footer className="py-12 border-t border-white/5 bg-black/20 backdrop-blur-xl z-20">
            <div className="max-w-7xl mx-auto px-8">
              <div className="flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
                <div className="mb-6 md:mb-0">
                  <span className="font-black text-white tracking-tight text-lg mr-2">EduBridge</span>
                  <span className="font-medium">Connecting minds across the globe.</span>
                </div>
                <div className="flex space-x-8 font-bold">
                  <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                  <a href="#" className="hover:text-primary transition-colors">Terms</a>
                  <a href="#" className="hover:text-primary transition-colors">Contact</a>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 text-center text-[10px] font-black uppercase tracking-widest text-slate-700">
                © 2026 EduBridge Platforms Inc. All Rights Reserved.
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Layout;
