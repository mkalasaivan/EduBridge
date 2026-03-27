import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ThumbsUp, 
  Bookmark, 
  MessageCircle, 
  User, 
  Calendar, 
  ExternalLink,
  ChevronLeft,
  Send,
  Trash2
} from 'lucide-react';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { Resource } from '../types';

const ResourceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  const fetchResource = async () => {
    try {
      const response = await client.get(`/resources/${id}`);
      setResource(response.data);
    } catch (error) {
      console.error('Error fetching resource:', error);
      navigate('/resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResource();
  }, [id]);

  const handleLike = async () => {
    if (!resource) return;
    try {
      await client.post(`/resources/${id}/like`);
      fetchResource();
    } catch (error) {
      console.error('Error liking resource:', error);
    }
  };

  const handleSave = async () => {
    if (!resource) return;
    try {
      await client.post(`/resources/${id}/save`);
      fetchResource();
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || commenting) return;
    
    setCommenting(true);
    try {
      await client.post(`/resources/${id}/comments`, { content: comment });
      setComment('');
      fetchResource();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await client.delete(`/resources/${id}/comments/${commentId}`);
      fetchResource();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!resource) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-20">
      <button 
        onClick={() => navigate('/resources')}
        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors font-bold group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Directory</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-[40px] border border-white/5 space-y-6"
          >
            <div className="flex flex-wrap gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                {resource.type}
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                {resource.level}
              </span>
            </div>

            <h1 className="text-4xl font-black text-white leading-tight">
              {resource.title}
            </h1>

            <div className="flex items-center space-x-6 text-slate-500 text-sm font-medium">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ThumbsUp className="w-4 h-4 text-primary" />
                <span>{resource._count?.likes} likes</span>
              </div>
            </div>

            <p className="text-slate-300 text-lg leading-relaxed font-medium">
              {resource.description}
            </p>

            {resource.content && (
              <div className="prose prose-invert max-w-none pt-6 border-t border-white/5">
                <p className="whitespace-pre-wrap text-slate-400">{resource.content}</p>
              </div>
            )}

            {resource.url && (
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 group"
              >
                <span>Visit External Resource</span>
                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            )}
          </motion.div>

          {/* Comments Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center space-x-3">
              <MessageCircle className="w-6 h-6 text-primary" />
              <span>Discussion ({resource.comments?.length || 0})</span>
            </h2>

            <form onSubmit={handleAddComment} className="glass p-6 rounded-3xl border border-white/5 space-y-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts or ask a question..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white placeholder:text-slate-600 outline-none focus:border-primary/50 transition-all font-medium min-h-[100px]"
              />
              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={commenting || !comment.trim()}
                  className="px-6 py-3 bg-white/5 hover:bg-primary text-white font-bold rounded-xl transition-all border border-white/5 disabled:opacity-50 flex items-center space-x-2"
                >
                  <span>Post Comment</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {resource.comments?.map((c: any) => (
                <div key={c.id} className="glass p-6 rounded-3xl border border-white/5 flex space-x-4">
                  <div className="flex-shrink-0">
                    {c.author.avatar ? (
                      <img src={c.author.avatar} alt={c.author.name} className="w-10 h-10 rounded-full border border-white/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/5">
                        {c.author.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white text-sm">{c.author.name}</h4>
                      <div className="flex items-center space-x-3 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                        {currentUser?.id === c.authorId && (
                          <button 
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Interaction Card */}
          <div className="glass p-8 rounded-[40px] border border-white/5 space-y-6 sticky top-8">
            <div className="flex flex-col space-y-3">
              <button 
                onClick={handleLike}
                className="w-full py-4 glass hover:bg-white/10 text-white font-bold rounded-2xl flex items-center justify-center space-x-3 transition-all"
              >
                <ThumbsUp className="w-5 h-5 text-primary" />
                <span>Like Resource</span>
              </button>
              <button 
                onClick={handleSave}
                className="w-full py-4 glass hover:bg-white/10 text-white font-bold rounded-2xl flex items-center justify-center space-x-3 transition-all border border-white/5"
              >
                <Bookmark className="w-5 h-5 text-emerald-400" />
                <span>Save to My List</span>
              </button>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-600">Shared By</h4>
              <div className="flex items-center space-x-4">
                {resource.author.avatar ? (
                  <img src={resource.author.avatar} alt={resource.author.name} className="w-12 h-12 rounded-2xl border border-white/10" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5 text-slate-500">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h5 className="font-bold text-white">{resource.author.name}</h5>
                  <p className="text-xs font-medium text-slate-500 capitalize">{resource.author.role?.toLowerCase()}</p>
                </div>
              </div>
              {resource.author.bio && (
                <p className="text-xs font-medium text-slate-500 italic leading-relaxed">
                  "{resource.author.bio}"
                </p>
              )}
            </div>

            {resource.tags?.length > 0 && (
              <div className="pt-6 border-t border-white/5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-600">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map(t => (
                    <span key={t} className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;
