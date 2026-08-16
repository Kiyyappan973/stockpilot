import { Link } from 'react-router-dom'
import { Package, BarChart3, Boxes, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden relative">
      {/* Decorative floating blobs in the background */}
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-40"
      />
      <motion.div
        animate={{ y: [0, -25, 0], x: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-40"
      />
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 left-1/3 w-80 h-80 bg-green-200 rounded-full blur-3xl opacity-30"
      />

      {/* Top Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-sm shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Package className="text-blue-600" size={28} />
          <span className="text-xl font-bold text-gray-800">StockPilot</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
            Log In
          </Link>
          <Link
            to="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition"
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative max-w-4xl mx-auto text-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6"
        >
          📦 Now with 3D warehouse visualization
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-6 leading-tight"
        >
          Smart Inventory
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Management, Simplified
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto"
        >
          Track stock, manage products, and stay ahead of low inventory — all in one clean,
          real-time dashboard built for modern warehouses.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link to="/signup">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg text-lg transition shadow-lg shadow-blue-200"
            >
              Start Free Today
            </motion.span>
          </Link>
        </motion.div>
      </div>

      {/* Feature Cards */}
      <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0 }}
          whileHover={{ y: -6 }}
          className="bg-white rounded-xl shadow-sm hover:shadow-xl p-6 text-center transition-shadow"
        >
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Boxes className="text-blue-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Real-Time Tracking</h3>
          <p className="text-gray-500 text-sm">
            Add, edit, and monitor stock levels instantly, with live updates across your team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -6 }}
          className="bg-white rounded-xl shadow-sm hover:shadow-xl p-6 text-center transition-shadow"
        >
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="text-green-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Insightful Dashboards</h3>
          <p className="text-gray-500 text-sm">
            Visualize stock by category, spot trends, and make smarter restocking decisions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -6 }}
          className="bg-white rounded-xl shadow-sm hover:shadow-xl p-6 text-center transition-shadow"
        >
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-purple-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Secure & Private</h3>
          <p className="text-gray-500 text-sm">
            Your data is protected with secure authentication — only you can access your inventory.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Landing