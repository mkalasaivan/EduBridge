import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  BookOpen, 
  ExternalLink, 
  ThumbsUp, 
  User,
  Plus,
  X,
  Link as LinkIcon,
  Sparkles,
  ChevronRight,
  Globe,
  Library,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import ExternalResourceCard from '../components/resources/ExternalResourceCard';
import type { Resource, ResourceLevel, ResourceType } from '../types';

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState<ResourceLevel | ''>('');
  const [type, setType] = useState<ResourceType | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [externalResources, setExternalResources] = useState<any[]>([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [importedUrls, setImportedUrls] = useState<Set<string>>(new Set());
  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    subject: '',
    level: 'BEGINNER' as ResourceLevel,
    type: 'ARTICLE' as ResourceType,
    tags: [] as string[],
    tagInput: ''
  });
  const [postError, setPostError] = useState('');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (subject) params.append('subject', subject);
      if (level) params.append('level', level);
      if (type) params.append('type', type);
      
      const response = await client.get(`/resources?${params.toString()}`);
      setResources(response.data.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExternalResources = async () => {
    if (!search || search.length < 2) return;
    setIsSearchingExternal(true);
    try {
      const response = await client.get(`/external-search?q=${encodeURIComponent(search)}`);
      setExternalResources(response.data);
    } catch (error) {
      console.error('Error fetching external resources:', error);
    } finally {
      setIsSearchingExternal(false);
    }
  };

  useEffect(() => {
    if (isGlobalSearch) {
      const timeout = setTimeout(fetchExternalResources, 500);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(fetchResources, 300);
      return () => clearTimeout(timeout);
    }
  }, [search, subject, level, type, isGlobalSearch]);

  const handleImport = async (ext: any) => {
    try {
      const typeMap: Record<string, ResourceType> = {
        'YOUTUBE': 'YOUTUBE',
        'GITHUB': 'GITHUB',
        'UDEMY': 'UDEMY',
        'COURSERA': 'COURSERA',
        'MEDIUM': 'MEDIUM'
      };
      
      await client.post('/resources', {
        title: ext.title,
        description: ext.description,
        url: ext.url,
        subject: search || 'General',
        type: typeMap[ext.platform] || 'OTHER_LINK',
        level: 'BEGINNER',
        tags: [ext.platform.toLowerCase(), 'imported']
      });
      
      setImportedUrls(prev => new Set([...prev, ext.url]));
      // Optional: Toast success
    } catch (error) {
      console.error('Error importing resource:', error);
    }
  };

  const levels: ResourceLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const types: ResourceType[] = ['YOUTUBE', 'GITHUB', 'PDF', 'ARTICLE', 'COURSERA', 'UDEMY', 'MEDIUM', 'DEV_TO', 'DOCS', 'OTHER_LINK'];

  const handleUrlChange = async (url: string) => {
    setFormData({ ...formData, url });
    if (url.startsWith('http')) {
      setIsFetchingUrl(true);
      try {
        const response = await client.get(`/resources/preview?url=${encodeURIComponent(url)}`);
        if (response.data) {
          setFormData(prev => ({
            ...prev,
            title: prev.title || response.data.title,
            description: prev.description || response.data.description,
            // Try to guess type from URL
            type: url.includes('youtube.com') || url.includes('youtu.be') ? 'YOUTUBE' :
                  url.includes('github.com') ? 'GITHUB' :
                  url.includes('medium.com') ? 'MEDIUM' :
                  url.includes('dev.to') ? 'DEV_TO' : prev.type
          }));
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      } finally {
        setIsFetchingUrl(false);
      }
    }
  };

  const handlePostResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError('');
    try {
      // Create a clean DTO by removing tagInput
      const { tagInput, ...dto } = formData;
      await client.post('/resources', dto);
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        url: '',
        subject: '',
        level: 'BEGINNER',
        type: 'ARTICLE',
        tags: [],
        tagInput: ''
      });
      fetchResources();
    } catch (error: any) {
      console.error('Error posting resource:', error);
      setPostError(error.response?.data?.message || 'Failed to share resource. Please check all fields.');
    }
  };

  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: ''
      });
    }
  };

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto space-y-12 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Learning Directory</h1>
          <p className="text-slate-500 font-medium">Explore hand-picked resources to supercharge your learning.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-4 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Share Resource</span>
        </button>
      </div>

      {/* Share Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl glass p-8 rounded-[40px] border border-white/10 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <span>Share a Learning Resource</span>
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handlePostResource} className="space-y-6">
              {postError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                  {postError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1">Resource URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="url"
                    required
                    className={`w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-primary/50 transition-all font-medium ${isFetchingUrl ? 'animate-pulse' : ''}`}
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">Title</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-primary/50 transition-all font-medium"
                    placeholder="Enter resource title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">Subject</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-primary/50 transition-all font-medium"
                    placeholder="e.g. JavaScript, Physics"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1">Description</label>
                <textarea
                  required
                  className="w-full px-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-primary/50 transition-all font-medium min-h-[100px]"
                  placeholder="What makes this resource great?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">Type</label>
                  <select 
                    className="w-full px-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-primary/50 transition-all font-medium appearance-none"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  >
                    {types.map(t => <option key={t} value={t} className="bg-slate-900">{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">Difficulty Level</label>
                  <select 
                    className="w-full px-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-primary/50 transition-all font-medium appearance-none"
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value as any})}
                  >
                    {levels.map(l => <option key={l} value={l} className="bg-slate-900">{l.charAt(0) + l.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 ml-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-lg flex items-center space-x-2">
                      <span>{tag}</span>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, tags: formData.tags.filter(t => t !== tag)})}
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white outline-none focus:border-primary/50 transition-all font-medium text-sm"
                    placeholder="Add a tag..."
                    value={formData.tagInput}
                    onChange={(e) => setFormData({...formData, tagInput: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button 
                    type="button"
                    onClick={addTag}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/5 transition-all text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-2"
              >
                <span>Share with Community</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-strong p-6 rounded-[32px] border border-white/10 flex flex-col lg:flex-row gap-6 items-center shadow-xl">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all font-bold"
            placeholder={isGlobalSearch ? "Search YouTube, GitHub, Udemy, Coursera..." : "Search community library..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
           <button 
             onClick={() => setIsGlobalSearch(false)}
             className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 transition-all ${!isGlobalSearch ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
             <Library className="w-4 h-4" />
             <span className="hidden sm:inline">Community</span>
           </button>
           <button 
             onClick={() => setIsGlobalSearch(true)}
             className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 transition-all ${isGlobalSearch ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
             <Globe className="w-4 h-4" />
             <span className="hidden sm:inline">Web Explorer</span>
           </button>
        </div>
        
        {!isGlobalSearch && (
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select 
              className="px-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 font-bold text-sm outline-none cursor-pointer hover:bg-white/10"
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
            >
              <option value="">All Levels</option>
              {levels.map(l => <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>)}
            </select>
            
            <select 
              className="px-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 font-bold text-sm outline-none cursor-pointer hover:bg-white/10"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
        )}

        <button 
          onClick={() => { setSearch(''); setLevel(''); setType(''); setSubject(''); setIsGlobalSearch(false) }}
          className="px-4 py-3 text-slate-500 hover:text-white font-bold text-sm"
        >
          Reset
        </button>
      </div>

      {/* Discovery Prompt for Global Search */}
      {isGlobalSearch && !search && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-20 text-center glass rounded-[48px] border border-white/5 bg-gradient-to-br from-primary/5 to-transparent"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Discover Learning from the Entire Web</h2>
          <p className="max-w-md mx-auto text-slate-500 font-medium leading-relaxed">
            Search for any topic and we'll scan YouTube, GitHub, and major course platforms to find the best resources for you—all in one place.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
             {['Data Science', 'React Native', 'UI/UX Design', 'Blockchain'].map(tag => (
               <button 
                 key={tag} 
                 onClick={() => setSearch(tag)}
                 className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-slate-400 text-xs font-bold hover:bg-primary/20 hover:text-primary transition-all flex items-center"
               >
                 <Zap className="w-3 h-3 mr-2" />
                 {tag}
               </button>
             ))}
          </div>
        </motion.div>
      )}

      {/* Resource Grid */}
      {isGlobalSearch ? (
        isSearchingExternal ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-slate-900 animate-pulse rounded-[32px] border border-white/5"></div>)}
          </div>
        ) : externalResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {externalResources.map((res, idx) => (
              <ExternalResourceCard 
                key={idx} 
                resource={res} 
                onImport={handleImport}
                isImported={importedUrls.has(res.url)}
              />
            ))}
          </div>
        ) : search && (
          <div className="py-20 text-center glass rounded-3xl border border-white/5 border-dashed">
            <Globe className="w-16 h-16 text-slate-800 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">No external results found for "{search}"</h3>
            <p className="text-slate-600 mt-2">Try a different keyword or check your internet connection.</p>
          </div>
        )
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-slate-900 animate-pulse rounded-3xl"></div>)}
        </div>
      ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {resources.map((res, idx) => (
              <motion.div 
                key={res.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/resources/${res.id}`)}
                className="card-premium p-8 group flex flex-col justify-between cursor-pointer border-white/5 shadow-2xl"
              >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md">
                      {res.type}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                      {res.level}
                    </span>
                  </div>
                  <div className="flex space-x-2 text-slate-600">
                    <ThumbsUp className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
                    <span className="text-xs font-bold">{res._count?.likes || 0}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary/90 transition-colors line-clamp-2">
                  {res.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                  {res.description}
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {res.author.avatar ? (
                    <img src={res.author.avatar} alt={res.author.name} className="w-8 h-8 rounded-full border border-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-300">{res.author.name}</span>
                </div>
                <a 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/5 hover:bg-primary hover:text-white transition-all text-slate-500"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass rounded-3xl border border-white/5 border-dashed">
          <BookOpen className="w-16 h-16 text-slate-800 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400">No resources found matching your search.</h3>
          <p className="text-slate-600 mt-2">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
};

export default Resources;
