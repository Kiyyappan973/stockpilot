import { Link } from 'react-router-dom'
import { Package, Boxes, BarChart3, ShieldCheck, Users, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import LandingBackground from '../LandingBackground'

const slides = [
  {
    tag: '📦 Smart Inventory',
    title: 'Manage stock like never before',
    desc: 'Track products, quantities, and categories in one clean, real-time dashboard built for modern warehouses.',
    icon: Boxes,
    color: 'from-blue-500 to-cyan-400'
  },
  {
    tag: '📊 Insights',
    title: 'See your data come alive',
    desc: 'Visual dashboards, category breakdowns, and trend charts help you make smarter restocking decisions.',
    icon: BarChart3,
    color: 'from-purple-500 to-pink-400'
  },
  {
    tag: '👥 Built for teams',
    title: 'Invite your whole team',
    desc: 'Share an invite code, assign roles, and watch stock updates sync live across every device instantly.',
    icon: Users,
    color: 'from-green-400 to-emerald-500'
  },
  {
    tag: '🔒 Secure',
    title: 'Your data, protected',
    desc: 'Real authentication and role-based permissions keep your inventory safe and private to your team.',
    icon: ShieldCheck,
    color: 'from-orange-400 to-red-400'
  }
]


function Landing() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const slide = slides[step]
  const isLastSlide = step === slides.length - 1

  function handleScreenClick() {
    if (isLastSlide) return
    setDirection(1)
    setStep((s) => s + 1)
  }

  return (
    <div
      onClick={handleScreenClick}
      className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col cursor-pointer select-none"
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff11 1px, transparent 1px), linear-gradient(to bottom, #ffffff11 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      {/* Real 3D floating box field */}
      <div className="absolute inset-0 pointer-events-none">
        <LandingBackground />
      </div>

      {/* Glow overlay matching current slide color, sits on top of the 3D scene */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br ${slide.color} rounded-full blur-[140px] opacity-10 pointer-events-none`}
      />

      {/* Nav — stopPropagation so clicking links doesn't advance the slide */}
      <nav
        onClick={(e) => e.stopPropagation()}
        className="relative z-20 flex items-center justify-between px-6 py-5 cursor-default"
      >
        <div className="flex items-center gap-2">
          <Package className="text-white" size={26} />
          <span className="text-lg font-bold">StockPilot</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-400 hover:text-white text-sm font-medium transition">
            Log In
          </Link>
          <Link
            to="/signup"
            className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main vertical slide area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${slide.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}
            >
              <slide.icon size={30} className="text-white" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-sm text-gray-400 mb-3 font-medium tracking-wide"
            >
              {slide.tag}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight"
            >
              {slide.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-gray-400 text-lg"
            >
              {slide.desc}
            </motion.p>

            {isLastSlide && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={(e) => e.stopPropagation()}
                className="mt-8"
              >
                <Link to="/signup">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 bg-white text-black font-medium px-6 py-3 rounded-full"
                  >
                    Get Started <ArrowRight size={16} />
                  </motion.span>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot progress + hint text */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex flex-col items-center gap-3 pb-10 cursor-default"
      >
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > step ? 1 : -1)
                setStep(i)
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-8 bg-white' : 'w-1.5 bg-gray-600'
              }`}
            />
          ))}
        </div>
        {!isLastSlide && (
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-500 text-xs tracking-wide"
          >
            Click anywhere to continue
          </motion.p>
        )}
      </div>
    </div>
  )
}

export default Landing