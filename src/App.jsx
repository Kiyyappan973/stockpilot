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
import ProductDetail from './pages/ProductDetail'
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
               <Dashboard products={props.products} membership={props.membership} />
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
          path="products/:id"
          element={
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ProductDetail products={props.products} membership={props.membership} />
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
              <History membership={props.membership} />
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
                <Team membership={props.membership} onlineUsers={props.onlineUsers} />
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

  const [membership, setMembership] = useState(null)
  const [membershipLoading, setMembershipLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)

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

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: 'success' }), 3000)
  }

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

    if (!membership) return

    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `warehouse_id=eq.${membership.warehouse_id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts((current) => {
              if (current.some((p) => p.id === payload.new.id)) return current
              return [...current, payload.new]
            })
          }
          if (payload.eventType === 'UPDATE') {
            setProducts((current) =>
              current.map((p) => (p.id === payload.new.id ? payload.new : p))
            )
          }
          if (payload.eventType === 'DELETE') {
            setProducts((current) => current.filter((p) => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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

  // Ask for notification permission once, when the app first loads (if logged in)
  useEffect(() => {
    if (!user) return
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [user])

  // Shows a browser notification if permission was granted
  function showLowStockNotification(productName, quantity) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⚠️ Low Stock Alert', {
        body: `${productName} is running low (${quantity} left)`,
        icon: '/favicon.svg'
      })
    }
  }

  // Plays a short beep sound using the browser's built-in audio engine
  function playAlertSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.15)
  }

  async function adjustStock(productId, amount, type) {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const newQuantity = product.quantity + amount
    await updateProduct(productId, { quantity: newQuantity })

    // If this movement caused stock to CROSS below its threshold, play an alert sound + notify
    const productThreshold = product.low_stock_threshold ?? 5
    if (product.quantity >= productThreshold && newQuantity < productThreshold) {
      playAlertSound()
      showLowStockNotification(product.name, newQuantity)
    }

    await supabase.from('stock_history').insert([{
      warehouse_id: membership.warehouse_id,
      product_id: productId,
      product_name: product.name,
      type: type,
      amount: Math.abs(amount),
      quantity_after: newQuantity,
      user_email: user.email
    }])

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

  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    if (!membership || !user) return

    const channel = supabase.channel(`presence-warehouse-${membership.warehouse_id}`, {
      config: { presence: { key: user.uid } }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).map((entries) => entries[0])
        setOnlineUsers(users)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ email: user.email, online_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [membership, user])

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  }
  const lowStockProducts = products.filter((p) => p.quantity < (p.low_stock_threshold ?? 5))

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
              <div className={`flex flex-col md:flex-row w-full overflow-x-hidden md:h-screen ${darkMode ? 'dark' : ''}`}>
                <Sidebar user={user} membership={membership} onlineUsers={onlineUsers} />
                <div className="flex-1 min-h-screen md:h-screen md:overflow-y-auto w-full min-w-0 p-4 pb-24 md:p-8 md:pb-8 transition-colors overflow-x-hidden bg-slate-50 dark:bg-gray-950">
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
                    onlineUsers={onlineUsers}
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