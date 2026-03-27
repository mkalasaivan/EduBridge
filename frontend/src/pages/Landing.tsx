import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Zap, 
  ChevronRight, 
  Star, 
  CheckCircle,
  Globe,
  Award
} from 'lucide-react';

const Landing: React.FC = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const stats = [
    { label: 'Resources Shared', value: '1,200+' },
    { label: 'Expert Mentors', value: '300+' },
    { label: 'Active Students', value: '5,000+' },
    { label: 'Countries Reached', value: '45+' },
  ];

  const features = [
    {
      title: 'Curated Learning Resources',
      description: 'Access a vast library of hand-picked resources from top educators and platforms like YouTube, GitHub, and Coursera.',
      icon: <BookOpen className="w-6 h-6 text-blue-400" />,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'
    },
    {
      title: 'Direct Mentorship',
      description: 'Connect directly with industry experts and experienced educators who can guide your learning journey.',
      icon: <Users className="w-6 h-6 text-indigo-400" />,
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop'
    },
    {
      title: 'Structured Guidance',
      description: 'Follow clear learning paths and receive personalized feedback to accelerate your skill development.',
      icon: <Zap className="w-6 h-6 text-cyan-400" />,
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop'
    }
  ];

  return (
    <div className="overflow-hidden bg-slate-950">
      {/* Section 1: Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        {/* Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] animate-pulse delay-700"></div>
        
        <div className="max-w-7xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase mb-6">
              Empowering the Next Generation of Learners
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Bridge the Gap Between <br />
            <span className="gradient-text">Learning & Mentorship</span>
          </motion.h1>
          
          <motion.p 
            className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            EduBridge connects students with premium resources and industry-leading mentors 
            to create a seamless path toward mastery and professional growth.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link 
              to="/register" 
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-xl shadow-primary/20 flex items-center group"
            >
              Get Started Free
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/resources" 
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all backdrop-blur-sm"
            >
              Browse Resources
            </Link>
          </motion.div>

          {/* Floating UI Mockup Illustration */}
          <motion.div 
            className="mt-28 relative px-8"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="max-w-5xl mx-auto p-3 glass-strong rounded-[48px] shadow-[0_0_100px_rgba(59,130,246,0.15)] overflow-hidden border-white/10">
               <div className="bg-slate-900 rounded-[36px] overflow-hidden border border-white/5 shadow-2xl">
                 <div className="h-10 bg-slate-800 flex items-center px-6 space-x-2 border-b border-white/5">
                   <div className="w-3 h-3 rounded-full bg-red-500/30"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500/30"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500/30"></div>
                 </div>
                 <div className="aspect-video bg-slate-900/50 flex items-center justify-center relative overflow-hidden backdrop-blur-3xl">
                   {/* Simplified Dashboard Mockup */}
                   <div className="absolute inset-0 p-12 grid grid-cols-12 gap-8 opacity-20">
                      <div className="col-span-3 space-y-6">
                        <div className="h-4 bg-primary rounded-full w-1/2"></div>
                        <div className="h-40 glass rounded-[24px]"></div>
                        <div className="h-40 glass rounded-[24px]"></div>
                      </div>
                      <div className="col-span-9 space-y-8">
                        <div className="h-10 bg-slate-700/50 rounded-2xl w-1/4"></div>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="h-48 glass rounded-[32px]"></div>
                          <div className="h-48 glass rounded-[32px]"></div>
                          <div className="h-48 glass rounded-[32px]"></div>
                        </div>
                        <div className="h-72 glass rounded-[32px]"></div>
                      </div>
                   </div>
                   <div className="z-10 text-center scale-150">
                     <p className="gradient-text font-black text-4xl animate-pulse tracking-tighter">FUTURE READY</p>
                   </div>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-strong rounded-[48px] p-16 flex flex-wrap justify-around items-center gap-16 border border-white/10 bg-white/5 shadow-2xl">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                className="text-center group"
                {...fadeInUp}
              >
                <h3 className="text-5xl font-black text-white mb-3 group-hover:scale-110 transition-transform duration-300">{stat.value}</h3>
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section className="py-24 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.h2 {...fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
            Unlock Your Potential in <span className="text-primary">3 Simple Steps</span>
          </motion.h2>
          <motion.p {...fadeInUp} className="text-slate-400 max-w-2xl mx-auto">
            Our platform is designed to make the transition from student to master 
            as smooth and efficient as possible.
          </motion.p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Discover Resources', desc: 'Browse our extensive library of curated content categorized by subject and difficulty.', icon: <BookOpen />, color: 'text-blue-500' },
            { step: '02', title: 'Connect with Experts', desc: 'Find and message mentors who specialize in your area of interest for personal guidance.', icon: <Users />, color: 'text-indigo-500' },
            { step: '03', title: 'Achieve Mastery', desc: 'Apply what you learn, receive feedback, and earn recognition for your progress.', icon: <Award />, color: 'text-cyan-500' }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              className="p-8 rounded-3xl glass border border-white/5 hover:border-primary/20 transition-all hover:bg-white/[0.07] group"
              {...fadeInUp}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className={`text-4xl font-black opacity-10 ${item.color}`}>{item.step}</span>
                <div className={`p-3 rounded-2xl bg-white/5 ${item.color}`}>
                  {item.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 4: Features */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 space-y-32">
          {features.map((feature, idx) => (
            <div key={idx} className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16`}>
              <motion.div 
                className="flex-1 space-y-6"
                {...fadeInUp}
              >
                <div className="p-4 rounded-2xl bg-primary/10 w-fit">
                  {feature.icon}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                  {feature.title}
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed font-medium">
                  {feature.description}
                </p>
                <ul className="space-y-4">
                  {['Personalized Recommendations', 'Expert Community', 'Real-time Interaction'].map((point, k) => (
                    <li key={k} className="flex items-center text-slate-300">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div 
                className="flex-1 relative"
                initial={{ opacity: 0, x: idx % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-[80px] -z-10"></div>
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="rounded-3xl shadow-2xl border border-white/10 hover:scale-[1.02] transition-transform duration-500"
                />
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Sources Strip */}
      <section className="py-16 border-y border-white/5 bg-slate-950/50">
        <div className="text-center mb-10">
          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">Resources from platforms you love</p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 px-4">
          {['YouTube', 'GitHub', 'Coursera', 'Udemy', 'Khan Academy', 'Medium'].map((source) => (
            <span key={source} className="text-2xl font-black text-white hover:opacity-100 transition-opacity cursor-default">{source}</span>
          ))}
        </div>
      </section>

      {/* Section 6: Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.h2 {...fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
            Hear from our <span className="text-indigo-400">Community</span>
          </motion.h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { name: 'Sarah Johnson', role: 'Student, Computer Science', quote: 'EduBridge helped me find a mentor who guided me through my first large-scale project. The transition was incredible!' },
            { name: 'David Chen', role: 'Full Stack Mentor', quote: 'Teaching on EduBridge allows me to give back to the community and find talented students who are eager to learn.' },
            { name: 'Maya Rodriguez', role: 'UI/UX Designer', quote: 'The resources here are top-tier. I found paths that werent available anywhere else for such specific niche topics.' }
          ].map((t, idx) => (
            <motion.div 
              key={idx}
              className="p-10 rounded-[32px] glass-strong border border-white/5 bg-white/5 flex flex-col justify-between shadow-xl hover:bg-white/[0.08] transition-all"
              {...fadeInUp}
              transition={{ delay: idx * 0.1 }}
            >
              <div>
                <div className="mb-6 flex space-x-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-emerald-400 fill-emerald-400" />)}
                </div>
                <p className="text-slate-300 font-bold text-lg mb-8 leading-relaxed">"{t.quote}"</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white/5">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-white font-black text-md">{t.name}</p>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 7: CTA Banner */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="relative p-12 md:p-20 rounded-[48px] bg-gradient-to-br from-primary to-indigo-800 text-center overflow-hidden shadow-2xl shadow-primary/30"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Globe className="w-64 h-64" />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 relative z-10">
              Ready to accelerate <br /> your learning?
            </h2>
            <p className="text-white/80 text-lg md:text-xl mb-10 max-w-xl mx-auto font-medium relative z-10">
              Join thousands of students and mentors who are already reshaping the 
              future of education together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
              <Link to="/register" className="px-10 py-4 bg-white text-primary font-black rounded-2xl hover:bg-slate-50 transition-colors shadow-xl">
                Join EduBridge Now
              </Link>
              <Link to="/mentors" className="px-10 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm">
                Become a Mentor
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
