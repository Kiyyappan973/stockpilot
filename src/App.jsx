import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { supabase } from './supabase'
import Toast from './components/Toast'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Settings from './pages/Settings'
import History from './pages/History'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Landing from './pages/Landing'
import Team from './pages/Team'
import './App.css'

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" />
  }
  return children
}
// Wraps page switching with a fade + slide transition
function AnimatedRoutes(props) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard products={props.products} />
            </motion.div>
          }
        />
        <Route
          path="products"
          element={
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Products
                products={props.products}
                productsLoading={props.productsLoading}
                addProduct={props.addProduct}
                updateProduct={props.updateProduct}
                deleteProduct={props.deleteProduct}
                adjustStock={props.adjustStock}
                membership={props.membership}
              />
            </motion.div>
          }
        />
        <Route
          path="history"
          element={
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <History history={props.history} />
            </motion.div>
          }
        />
                <Route
          path="team"
          element={
            props.membership?.role === 'Manager' ? (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Team membership={props.membership} />
              </motion.div>
            ) : (
              <div className="text-gray-500">You don't have permission to view this page.</div>
            )
          }
        />
        <Route
          path="settings"
          element={
            props.membership?.role === 'Manager' ? (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Settings
                  clearAllData={props.clearAllData}
                  darkMode={props.darkMode}
                  setDarkMode={props.setDarkMode}
                />
              </motion.div>
            ) : (
              <div className="text-gray-500">You don't have permission to view this page.</div>
            )
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('stockpilot-darkmode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('stockpilot-darkmode', JSON.stringify(darkMode))
  }, [darkMode])

  const [membership, setMembership] = useState(null) // { warehouse_id, role, warehouse_name }
  const [membershipLoading, setMembershipLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)

  // Load this user's warehouse membership (which warehouse, what role)
  useEffect(() => {
    async function fetchMembership() {
      if (!user) {
        setMembership(null)
        setMembershipLoading(false)
        return
      }
      setMembershipLoading(true)

      const { data: memberRow, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user.uid)
        .single()

      if (memberError || !memberRow) {
        setMembership(null)
        setMembershipLoading(false)
        return
      }

      const { data: warehouseRow } = await supabase
        .from('warehouses')
        .select('*')
        .eq('id', memberRow.warehouse_id)
        .single()

      setMembership({
        warehouse_id: memberRow.warehouse_id,
        role: memberRow.role,
        warehouse_name: warehouseRow ? warehouseRow.name : 'Warehouse',
        invite_code: warehouseRow ? warehouseRow.invite_code : ''
      })
      setMembershipLoading(false)
    }
    fetchMembership()
  }, [user])
  const [toast, setToast] = useState({ message: '', type: 'success' })

  // Shows a toast message for 3 seconds, then auto-clears it
  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: 'success' }), 3000)
  }

  // Keep "showError" name working everywhere, just routes to showToast
  function showError(message) {
    showToast(message, 'error')
  }

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('stockpilot-history')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('stockpilot-history', JSON.stringify(history))
  }, [history])

  // Load THIS user's products from Supabase whenever they log in
  
useEffect(() => {
    async function fetchProducts() {
      if (!membership) {
        setProducts([])
        setProductsLoading(false)
        return
      }
      setProductsLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('warehouse_id', membership.warehouse_id)
        .order('id', { ascending: true })

      if (error) {
        showError('Failed to load products. Please refresh the page.')
      } else {
        setProducts(data)
      }
      setProductsLoading(false)
    }
    fetchProducts()
  }, [membership])
  async function addProduct(newProduct) {
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...newProduct, warehouse_id: membership.warehouse_id, user_id: user.uid }])
      .select()

    if (error) {
      showError('Error adding product: ' + error.message)
      return false
    }
    setProducts([...products, data[0]])
    showToast('Product added successfully!')
    return true
  }
  async function updateProduct(id, updates) {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)

    if (error) {
      showError('Error updating product: ' + error.message)
      return
    }
    setProducts(products.map((p) => (p.id === id ? { ...p, ...updates } : p)))
    showToast('Product updated!')
  }

  async function deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      showError('Error deleting product: ' + error.message)
      return
    }
    setProducts(products.filter((p) => p.id !== id))
    showToast('Product deleted.')
  }

  // Plays a short beep sound using the browser's built-in audio engine
  function playAlertSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800 // pitch of the beep
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime) // volume

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.15) // beep lasts 0.15 seconds
  }

  async function adjustStock(productId, amount, type) {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const newQuantity = product.quantity + amount
    await updateProduct(productId, { quantity: newQuantity })

    // If this movement caused stock to CROSS below 5, play an alert sound
    if (product.quantity >= 5 && newQuantity < 5) {
      playAlertSound()
    }

    const logEntry = {
      id: Date.now(),
      productName: product.name,
      type: type,
      amount: Math.abs(amount),
      date: new Date().toLocaleString()
    }
    setHistory([logEntry, ...history])
  }

  async function clearAllData() {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('warehouse_id', membership.warehouse_id)

    if (error) {
      alert('Error clearing data: ' + error.message)
      return
    }
    setProducts([])
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  }
  const lowStockProducts = products.filter((p) => p.quantity < 5)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/app/*"
          element={
            <ProtectedRoute user={user}>
              <div className={`flex flex-col md:flex-row ${darkMode ? 'dark' : ''}`}>
                <Sidebar user={user} membership={membership} />
                <div className={`flex-1 min-h-screen p-4 md:p-8 transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <Toast message={toast.message} type={toast.type} />
                  {lowStockProducts.length > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      <span className="text-sm font-medium">
                        {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low on stock:{' '}
                        {lowStockProducts.map((p) => p.name).join(', ')}
                      </span>
                    </div>
                  )}
                  <AnimatedRoutes
                    products={products}
                    productsLoading={productsLoading}
                    addProduct={addProduct}
                    updateProduct={updateProduct}
                    deleteProduct={deleteProduct}
                    adjustStock={adjustStock}
                    history={history}
                    clearAllData={clearAllData}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    membership={membership}
                  />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App