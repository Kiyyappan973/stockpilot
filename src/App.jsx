import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { supabase } from './supabase'
import Toast from './components/Toast'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Settings from './pages/Settings'
import History from './pages/History'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Landing from './pages/Landing'
import './App.css'

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" />
  }
  return children
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

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
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
      if (!user) {
        setProducts([])
        setProductsLoading(false)
        return
      }
      setProductsLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.uid)
        .order('id', { ascending: true })

      if (error) {
        showError('Failed to load products. Please refresh the page.')
      } else {
        setProducts(data)
      }
      setProductsLoading(false)
    }
    fetchProducts()
  }, [user])

  async function addProduct(newProduct) {
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...newProduct, user_id: user.uid }])
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
      .eq('user_id', user.uid)

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
                <Sidebar user={user} />
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
                  <Routes>
                    <Route path="/" element={<Dashboard products={products} />} />
                    <Route
                      path="products"
                      element={
                        <Products
                          products={products}
                          productsLoading={productsLoading}
                          addProduct={addProduct}
                          updateProduct={updateProduct}
                          deleteProduct={deleteProduct}
                          adjustStock={adjustStock}
                        />
                      }
                    />
                    <Route path="/history" element={<History history={history} />} />
                    <Route
                      path="/settings"
                      element={
                        <Settings
                          clearAllData={clearAllData}
                          darkMode={darkMode}
                          setDarkMode={setDarkMode}
                        />
                      }
                    />
                  </Routes>
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