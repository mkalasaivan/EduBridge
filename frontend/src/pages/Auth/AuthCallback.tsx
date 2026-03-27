import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, checkAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const isNew = searchParams.get('isNew') === 'true';

    if (token) {
      setToken(token);
      
      const handleAuth = async () => {
        try {
          await checkAuth();
          if (isNew) {
            navigate('/complete-profile');
          } else {
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          navigate('/login');
        }
      };

      handleAuth();
    } else {
      navigate('/login');
    }
  }, [searchParams, setToken, checkAuth, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-white mb-2">Rounding things up...</h2>
        <p className="text-slate-400 font-medium italic">Securely signing you in via Google</p>
      </div>
    </div>
  );
};

export default AuthCallback;
