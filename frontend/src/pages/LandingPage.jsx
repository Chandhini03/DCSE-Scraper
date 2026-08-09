import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowRight, Sparkles, BookOpen, 
  BarChart3, Microscope, ChevronDown, 
  Terminal, Globe, Zap, Network 
} from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const navigate = useNavigate()
  return (
    <nav className="fixed top-0 w-full z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Sparkles className="text-accent-cyan w-6 h-6" />
          <span className="text-xl font-bold tracking-tight text-white">DCSE <span className="text-white/70 font-light">SPARK</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#stats" className="hover:text-white transition-colors">Statistics</a>
          <a href="#team" className="hover:text-white transition-colors">Team</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="relative group px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent-cyan/20 to-accent-violet/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative text-sm font-medium flex items-center gap-2">
            Launch App <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </div>
    </nav>
  )
}

const BackgroundEffects = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden bg-dark-900">
    <div className="absolute top-0 left-0 w-full h-full bg-aurora opacity-20 mix-blend-screen"></div>
    <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-violet/20 blur-[120px] animate-blob mix-blend-screen"></div>
    <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-accent-cyan/20 blur-[120px] animate-blob animation-delay-2000 mix-blend-screen"></div>
    <div className="absolute bottom-[-20%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-accent-blue/20 blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"></div>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
  </div>
)

const Hero = () => {
  const navigate = useNavigate()
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden px-6">
      <div className="max-w-5xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 text-sm text-accent-cyan"
        >
          <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></span>
          Next-Generation Academic Intelligence
        </motion.div>
        
        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[1.1]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Analyze research with <br className="hidden md:block" />
          <span className="text-gradient">infinite clarity.</span>
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          Discover, track, and visualize the impactful publications and scholarly achievements of the DCSE faculty through our advanced AI-driven platform.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <button 
            onClick={() => navigate('/dashboard')}
            className="group relative px-8 py-4 rounded-2xl bg-white text-dark-900 font-semibold hover:bg-white/90 transition-all overflow-hidden flex items-center gap-3"
          >
            Explore Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a href="#features" className="px-8 py-4 rounded-2xl glass-card font-medium hover:bg-white/10 transition-all flex items-center gap-2 text-white/80">
            View Features <ChevronDown className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

const Stats = () => {
  const stats = [
    { label: "Faculty Profiles", value: "40+" },
    { label: "Publications", value: "10,000+" },
    { label: "Total Citations", value: "50k+" },
    { label: "H-Index Avg", value: "15.2" }
  ]

  return (
    <section id="stats" className="py-24 relative z-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="glass-card p-8 text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{stat.value}</div>
              <div className="text-sm text-white/50 font-medium uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const Features = () => {
  const features = [
    { icon: <Network />, title: "Citation Networks", desc: "Visualize connections between authors and their collaborative research efforts across multiple domains." },
    { icon: <Zap />, title: "Real-time Sync", desc: "Automated daily synchronization with Google Scholar ensures metrics are always up to date." },
    { icon: <BarChart3 />, title: "Advanced Analytics", desc: "Deep dive into h-index trends, i10-index progression, and annual publication velocity." },
    { icon: <Globe />, title: "Global Reach", desc: "Track the international impact and geographic distribution of citations and collaborative papers." },
    { icon: <Terminal />, title: "Developer API", desc: "Access the structured research data directly via our high-performance REST API." },
    { icon: <BookOpen />, title: "Smart Filtering", desc: "Filter thousands of publications by year, keywords, author, and citation count instantly." }
  ]

  return (
    <section id="features" className="py-32 relative z-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Unprecedented <span className="text-gradient">Insights</span></h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg font-light">Everything you need to analyze and understand academic impact at scale.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="glass-card p-8 group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-accent-cyan border border-white/10 group-hover:border-accent-cyan/30 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white/90">{feature.title}</h3>
              <p className="text-white/50 font-light leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const Team = () => {
  const team = [
    { name: "Amitha Shaji K", role: "Developer", img: "/amitha.jpeg" },
    { name: "Sneha Manikandan", role: "Developer", img: "/sneha.jpeg" },
    { name: "Chandhini", role: "Developer", img: "/chandhini.jpg" },
    { name: "Shreem Seth", role: "Developer", img: "/shreem.jpeg" },
    { name: "Bharanidharan", role: "Developer", img: "/bharanidharan.jpg" }
  ]

  return (
    <section id="team" className="py-32 relative z-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Meet the <span className="text-gradient">Team</span></h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg font-light">The brilliant minds engineering DCSE SPARK.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center">
          {team.map((member, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="glass-card p-8 w-full max-w-sm group text-center cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-accent-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative w-40 h-40 mx-auto mb-6 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0)] group-hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-500 border border-white/10 group-hover:border-accent-cyan/40">
                <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-semibold text-white/90 mb-1">{member.name}</h3>
              <p className="text-accent-cyan font-mono text-xs tracking-wider uppercase">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FAQ = () => {
  const faqs = [
    { q: "How often is the data updated?", a: "The scraper runs a scheduled background job weekly to ensure citation metrics and new publications are up to date." },
    { q: "Can I export the publication data?", a: "Yes, you can export structured data (CSV/JSON) via the Developer API endpoints." },
    { q: "Is the platform open for other departments?", a: "Currently, SPARK is optimized for DCSE, but the underlying open-source architecture can be adapted for any academic department." }
  ]

  const [open, setOpen] = useState(null)

  return (
    <section id="faq" className="py-32 relative z-10 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">Questions?</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card overflow-hidden"
            >
              <button 
                className="w-full px-8 py-6 text-left flex justify-between items-center"
                onClick={() => setOpen(open === idx ? null : idx)}
              >
                <span className="font-medium text-lg">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 text-white/50 ${open === idx ? 'rotate-180' : ''}`} />
              </button>
              <motion.div 
                initial={false}
                animate={{ height: open === idx ? 'auto' : 0, opacity: open === idx ? 1 : 0 }}
                className="px-8 overflow-hidden"
              >
                <p className="pb-6 text-white/50 font-light">{faq.a}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const Footer = () => (
  <footer className="relative z-10 border-t border-white/5 py-12 px-6">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2 opacity-50">
        <Sparkles className="w-5 h-5" />
        <span className="font-bold tracking-tight">DCSE <span className="font-light">SPARK</span></span>
      </div>
      <div className="text-sm text-white/30 font-light">
        © {new Date().getFullYear()} DCSE SPARK. Built for academic excellence.
      </div>
      <div className="flex gap-4">
        <a href="#" className="text-white/30 hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
        <a href="#" className="text-white/30 hover:text-white transition-colors"><Terminal className="w-5 h-5" /></a>
      </div>
    </div>
  </footer>
)

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-dark-900 text-white font-sans selection:bg-accent-violet/30">
      <BackgroundEffects />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Team />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
