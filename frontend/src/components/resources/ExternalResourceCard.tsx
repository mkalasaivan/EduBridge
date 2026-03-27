import React from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Plus, 
  Play, 
  Code, 
  BookOpen, 
  Globe,
  Check
} from 'lucide-react';

interface ExternalResource {
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  platform: string;
  type: string;
}

interface Props {
  resource: ExternalResource;
  onImport: (resource: ExternalResource) => void;
  isImported?: boolean;
}

const ExternalResourceCard: React.FC<Props> = ({ resource, onImport, isImported }) => {
  const getIcon = () => {
    switch (resource.platform) {
      case 'YOUTUBE': return <Play className="w-4 h-4 text-red-500" />;
      case 'GITHUB': return <Code className="w-4 h-4 text-white" />;
      case 'UDEMY': return <BookOpen className="w-4 h-4 text-purple-400" />;
      case 'COURSERA': return <Globe className="w-4 h-4 text-blue-400" />;
      default: return <ExternalLink className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium p-8 group flex flex-col h-full border-white/5 shadow-2xl"
    >
      <div className="relative aspect-video mb-4 overflow-hidden rounded-2xl bg-slate-800">
        {resource.thumbnail ? (
          <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-700">
             {getIcon()}
          </div>
        )}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg flex items-center space-x-2 border border-white/10">
          {getIcon()}
          <span className="text-[9px] font-black text-white uppercase tracking-widest">{resource.platform}</span>
        </div>
      </div>

      <div className="flex-grow space-y-2">
        <h3 className="text-md font-bold text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {resource.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
          {resource.description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <a 
          href={resource.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        <button 
          onClick={() => onImport(resource)}
          disabled={isImported}
          className={`flex-grow ml-3 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center space-x-2 shadow-lg ${
            isImported 
              ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 cursor-default' 
              : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
          }`}
        >
          {isImported ? (
            <>
              <Check className="w-3 h-3" />
              <span>In Library</span>
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              <span>Save to EduBridge</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ExternalResourceCard;
