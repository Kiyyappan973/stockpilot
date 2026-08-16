import { Link } from 'react-router-dom'
import { Package, BarChart3, Boxes, ShieldCheck } from 'lucide-react'

function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
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
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center px-6 py-24">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Smart Inventory Management, Simplified
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
          Track stock, manage products, and stay ahead of low inventory — all in one clean,
          real-time dashboard built for modern warehouses.
        </p>
        <Link
          to="/signup"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg text-lg transition"
        >
          Start Free Today
        </Link>
      </div>

      {/* Feature Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-24">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Boxes className="text-blue-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Real-Time Tracking</h3>
          <p className="text-gray-500 text-sm">
            Add, edit, and monitor stock levels instantly, with live updates across your team.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="text-green-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Insightful Dashboards</h3>
          <p className="text-gray-500 text-sm">
            Visualize stock by category, spot trends, and make smarter restocking decisions.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-purple-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Secure & Private</h3>
          <p className="text-gray-500 text-sm">
            Your data is protected with secure authentication — only you can access your inventory.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Landing