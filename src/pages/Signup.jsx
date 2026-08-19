import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { supabase } from '../supabase'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Boxes, TrendingUp, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

// Generates a short random invite code, like "X7K9P2"
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function Signup() {
  const [mode, setMode] = useState('create') // 'create' or 'join'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [warehouseName, setWarehouseName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (mode === 'create') {
        // Create a new warehouse, owned by this user
        const { data: warehouse, error: warehouseError } = await supabase
          .from('warehouses')
          .insert([{ name: warehouseName, owner_id: user.uid, invite_code: generateInviteCode() }])
          .select()

        if (warehouseError) throw new Error(warehouseError.message)

        // Add this user as a Manager member of that warehouse
        const { error: memberError } = await supabase
          .from('members')
          .insert([{ user_id: user.uid, warehouse_id: warehouse[0].id, role: 'Manager', email }])

        if (memberError) throw new Error(memberError.message)
      } else {
        // Find the warehouse matching this invite code
        const { data: warehouse, error: findError } = await supabase
          .from('warehouses')
          .select('*')
          .eq('invite_code', inviteCode.toUpperCase())
          .single()

        if (findError || !warehouse) throw new Error('Invalid invite code. Please check and try again.')

        // Add this user as a Worker member of that warehouse
        const { error: memberError } = await supabase
          .from('members')
          .insert([{ user_id: user.uid, warehouse_id: warehouse.id, role: 'Worker', email }])

        if (memberError) throw new Error(memberError.message)
      }

      navigate('/app')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-700 relative overflow-hidden items-center justify-center">
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, -25, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />

        <div className="relative z-10 text-white text-center px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Package size={56} className="mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-3">Start managing smarter</h2>
            <p className="text-purple-100">Join StockPilot and take control of your inventory today.</p>
          </motion.div>

          <div className="grid grid-cols-3 gap-4 mt-12">
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0 }} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Boxes size={28} className="mx-auto" />
            </motion.div>
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <TrendingUp size={28} className="mx-auto" />
            </motion.div>
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <ShieldCheck size={28} className="mx-auto" />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-8 w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-6 justify-center lg:hidden">
            <Package className="text-blue-600" size={28} />
            <span className="text-xl font-bold text-gray-800">StockPilot</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h1>
          <p className="text-gray-500 mb-6">Sign up to get started</p>

          {/* Mode toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition ${
                mode === 'create' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
              }`}
            >
              Create Warehouse
            </button>
            <button
              type="button"
              onClick={() => setMode('join')}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition ${
                mode === 'join' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
              }`}
            >
              Join Warehouse
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4"
            >
              {error}
            </motion.p>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {mode === 'create' ? (
              <input
                type="text"
                placeholder="Warehouse name"
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            ) : (
              <input
                type="text"
                placeholder="Invite code (e.g. X7K9P2)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="password"
              placeholder="Password (6+ characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 rounded-lg transition"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </motion.button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Signup