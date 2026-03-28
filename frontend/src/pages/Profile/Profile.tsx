import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Award, 
  BookOpen, 
  ChevronRight,
  ExternalLink,
  Camera
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, updateMe } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills || [] as string[],
    interests: user?.interests || [] as string[],
    skillInput: '',
    interestInput: ''
  });

  const [myResources, setMyResources] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        bio: user.bio || '',
        skills: user.skills || [],
        interests: user.interests || [],
        skillInput: '',
        interestInput: ''
      });
      fetchMyResources();
    }
  }, [user]);

  const fetchMyResources = async () => {
    try {
      const response = await client.get('/auth/me');
      setMyResources(response.data.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { skillInput, interestInput, ...dto } = formData;
      const response = await client.patch('/users/me', dto);
      updateMe(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingAvatar(true);
    const toastId = toast.loading('Uploading profile picture...');
    try {
      const response = await client.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      updateMe(response.data);
      toast.success('Profile picture updated successfully!', { id: toastId });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture.', { id: toastId });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addTag = (type: 'skills' | 'interests') => {
    const inputKey = type === 'skills' ? 'skillInput' : 'interestInput';
    const tag = formData[inputKey].trim();
    if (tag && !formData[type].includes(tag)) {
      setFormData({
        ...formData,
        [type]: [...formData[type], tag],
        [inputKey]: ''
      });
    }
  };

  const removeTag = (type: 'skills' | 'interests', tag: string) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter(t => t !== tag)
    });
  };

  if (!user) return null;

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto space-y-12 relative">
      {/* Header Profile Section */}
      <div className="relative">
        <div className="h-64 w-full bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-[64px] blur-3xl opacity-30 absolute -top-10 -z-10 animate-pulse"></div>
        <div className="glass-strong p-12 rounded-[48px] border border-white/10 flex flex-col md:flex-row items-center md:items-end gap-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative group shrink-0">
            <div className="w-48 h-48 rounded-[40px] bg-slate-900 p-1.5 border-2 border-primary/20 overflow-hidden shadow-2xl transition-transform hover:scale-105 duration-500 ring-8 ring-white/5 relative">
               {user.avatar ? (
                 <img src={user.avatar} className="w-full h-full object-cover rounded-[34px]" alt={user.name} />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-primary bg-primary/5 rounded-[34px]">
                   <User className="w-20 h-20" />
                 </div>
               )}
               {uploadingAvatar && (
                 <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center rounded-[34px] m-1.5 z-20">
                   <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                 </div>
               )}
            </div>
            {isEditing && (
              <>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 right-4 p-3 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 hover:scale-110 transition-all z-10"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
               {isEditing ? (
                 <input 
                   className="text-4xl font-black text-white bg-white/5 border border-white/5 rounded-2xl px-4 py-2 outline-none focus:border-primary/50"
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                 />
               ) : (
                 <h1 className="text-5xl font-black text-white">{user.name}</h1>
               )}
               <div className="flex items-center justify-center md:justify-start space-x-2">
                 <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-md border border-primary/10">
                   {user.role}
                 </span>
                 <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-500/10">
                   Verified
                 </span>
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start text-slate-400 font-medium">
                 <Mail className="w-4 h-4 mr-2" />
                 {user.email}
              </div>
              
              {isEditing ? (
                <textarea 
                  className="w-full max-w-2xl px-6 py-5 glass-strong rounded-3xl border border-white/10 text-white placeholder:text-slate-700 outline-none focus:border-primary/50 min-h-[140px] font-bold"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              ) : (
                <p className="max-w-2xl text-slate-400 font-bold text-lg leading-relaxed">
                  {user.bio || "No bio yet. Tell the community about your learning journey or expertise."}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto self-start md:self-end">
            {isEditing ? (
              <>
                <button 
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center"
                >
                  <Save className="w-5 h-5 mr-3" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-4 glass text-white font-bold rounded-2xl hover:bg-white/10 transition-all border-white/5"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/5 transition-all flex items-center justify-center"
              >
                <Edit3 className="w-5 h-5 mr-3" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Skills & Interests */}
        <div className="lg:col-span-1 space-y-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-strong p-10 rounded-[40px] border border-white/10 space-y-10"
          >
             <div>
                <h3 className="text-white font-black flex items-center mb-6">
                  <Award className="w-5 h-5 mr-3 text-amber-500" />
                  Expertise & Skills
                </h3>
                <div className="flex flex-wrap gap-2.5 mb-6">
                   {formData.skills.map(skill => (
                     <span key={skill} className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-[11px] font-black text-primary flex items-center space-x-2 uppercase tracking-tight">
                       <span>{skill}</span>
                       {isEditing && (
                         <button onClick={() => removeTag('skills', skill)} className="hover:text-white"><X className="w-3.5 h-3.5"/></button>
                       )}
                     </span>
                   ))}
                </div>
                {isEditing && (
                  <div className="flex space-x-2">
                    <input 
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-white text-xs outline-none focus:border-primary/50"
                      placeholder="Add skill..."
                      value={formData.skillInput}
                      onChange={e => setFormData({...formData, skillInput: e.target.value})}
                      onKeyPress={e => e.key === 'Enter' && addTag('skills')}
                    />
                    <button onClick={() => addTag('skills')} className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white"><Plus className="w-4 h-4"/></button>
                  </div>
                )}
             </div>

             <div>
                <h3 className="text-white font-black flex items-center mb-6">
                  <Shield className="w-5 h-5 mr-3 text-blue-500" />
                  Learning Interests
                </h3>
                <div className="flex flex-wrap gap-2.5 mb-6">
                   {formData.interests.map(interest => (
                     <span key={interest} className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] font-black text-blue-400 flex items-center space-x-2 uppercase tracking-tight">
                       <span>{interest}</span>
                       {isEditing && (
                         <button onClick={() => removeTag('interests', interest)} className="hover:text-white"><X className="w-3.5 h-3.5"/></button>
                       )}
                     </span>
                   ))}
                </div>
                {isEditing && (
                  <div className="flex space-x-2">
                    <input 
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-white text-xs outline-none focus:border-primary/50"
                      placeholder="Add interest..."
                      value={formData.interestInput}
                      onChange={e => setFormData({...formData, interestInput: e.target.value})}
                      onKeyPress={e => e.key === 'Enter' && addTag('interests')}
                    />
                    <button onClick={() => addTag('interests')} className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white"><Plus className="w-4 h-4"/></button>
                  </div>
                )}
             </div>
          </motion.div>
        </div>

        {/* Right Column: Shared Resources */}
        <div className="lg:col-span-2 space-y-8">
           <h2 className="text-2xl font-black text-white flex items-center ml-2">
             <BookOpen className="w-6 h-6 mr-3 text-primary" />
             My Shared Learning Resources
           </h2>
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {myResources.length > 0 ? myResources.map((res: any, idx: number) => (
                 <motion.div 
                   key={res.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   onClick={() => navigate(`/resources/${res.id}`)}
                   className="card-premium p-8 border-white/5 shadow-xl group cursor-pointer"
                 >
                   <div className="flex justify-between items-start mb-6">
                     <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/5">
                       {res.type}
                     </span>
                     <button 
                       onClick={(e) => { e.stopPropagation(); navigate(`/resources/${res.id}`); }}
                       className="p-2.5 rounded-2xl bg-white/5 hover:bg-primary transition-all text-slate-500 hover:text-white"
                     >
                       <ExternalLink className="w-5 h-5" />
                     </button>
                   </div>
                   <h3 className="text-xl font-black text-white mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{res.title}</h3>
                   <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-600 space-x-3">
                      <span className="text-emerald-500/80">{res.level}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                      <span className="flex items-center">Open Resource <ChevronRight className="ml-1 w-3 h-3" /></span>
                   </div>
                 </motion.div>
               )) : (
                 <div className="col-span-2 p-20 card-premium border-dashed border-white/10 text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-[24px] flex items-center justify-center mx-auto text-slate-800 ring-8 ring-white/[0.02]">
                      <Plus className="w-10 h-10" />
                    </div>
                    <p className="text-slate-500 font-bold italic text-lg">You haven't shared any resources yet.</p>
                    <button 
                      onClick={() => navigate('/resources')}
                      className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/5 transition-all text-xs uppercase tracking-widest"
                    >
                      Browse Directory
                    </button>
                 </div>
               )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
