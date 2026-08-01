import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const FloatingIcons = () => {
  const icons = [
    // Book
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
    // Pen
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>,
    // Graduation Cap
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>,
    // File/Journal
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    // Microscope (Research)
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"></path><path d="M3 22h18"></path><path d="M14 22a7 7 0 1 0 0-14h-1"></path><path d="M9 14h2"></path><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"></path><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"></path></svg>
  ]

  const positions = [
    { top: '15%', left: '10%', delay: 0, duration: 4 },
    { top: '25%', right: '15%', delay: 1, duration: 5 },
    { bottom: '20%', left: '20%', delay: 2, duration: 4.5 },
    { bottom: '30%', right: '10%', delay: 0.5, duration: 5.5 },
    { top: '50%', left: '5%', delay: 1.5, duration: 6 },
    { top: '60%', right: '5%', delay: 2.5, duration: 4 },
  ]

  return (
    <div className="floating-icons-container">
      {positions.map((pos, i) => (
        <motion.div
          key={i}
          className="floating-icon"
          style={{ top: pos.top, left: pos.left, right: pos.right, bottom: pos.bottom }}
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 15, -15, 0],
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{
            repeat: Infinity,
            duration: pos.duration,
            delay: pos.delay,
            ease: "easeInOut"
          }}
        >
          {icons[i % icons.length]}
        </motion.div>
      ))}
    </div>
  )
}

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page-wrapper">
      <div className="texture-overlay"></div>
      <FloatingIcons />
      
      <motion.div
        className="landing-content-inner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 1 }}
      >
        <motion.h1 
          className="spark-title"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          DCSE <span className="highlight-text">SPARK</span>
        </motion.h1>
        
        <motion.p 
          className="spark-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          Discover and analyze the impactful publications, research, and scholarly achievements of the DCSE faculty in one centralized platform.
        </motion.p>

        <motion.button 
          className="spark-explore-btn"
          onClick={() => navigate('/dashboard')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Explore Dashboard
        </motion.button>
      </motion.div>
    </div>
  )
}

export default LandingPage


