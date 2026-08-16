import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pencil, Trash2, Check, X, Plus, ArrowUpCircle, ArrowDownCircle, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function Products({ products, productsLoading, addProduct, updateProduct, deleteProduct, adjustStock }) {
  const [adding, setAdding] = useState(false)
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('General')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const categories = ['General', 'Electronics', 'Clothing', 'Food', 'Tools', 'Furniture']

  const [icon, setIcon] = useState('📦')
  const iconOptions = ['📦', '👕', '👟', '📱', '💻', '🍎', '🔧', '🪑', '🎮', '📚', '🧴', '🚗']

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editQuantity, setEditQuantity] = useState('')

  async function handleAddProduct() {
    if (name === '' || quantity === '') {
      return
    }
    setAdding(true)
    const success = await addProduct({ name, quantity: Number(quantity), category, icon })
    setAdding(false)

    if (success) {
      setName('')
      setQuantity('')
      setCategory('General')
      setIcon('📦')
    }
  }
  // If the URL has ?edit=<id> (from clicking a 3D warehouse box), auto-open that product's edit mode
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && products.length > 0) {
      const product = products.find((p) => p.id === Number(editId))
      if (product) {
        startEdit(product)
      }
    }
  }, [searchParams, products])

  function startEdit(product) {
    setEditingId(product.id)
    setEditName(product.name)
    setEditQuantity(product.quantity)
  }

  function saveEdit(id) {
    updateProduct(id, { name: editName, quantity: Number(editQuantity) })
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })
  function exportToCSV() {
    // Header row (column titles)
    const headers = ['Name', 'Category', 'Quantity']

    // Turn each product into one CSV row: "name,category,quantity"
    const rows = filteredProducts.map((p) => [p.name, p.category, p.quantity].join(','))

    // Combine header + rows, separated by new lines
    const csvContent = [headers.join(','), ...rows].join('\n')

    // Create a downloadable file in memory
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    // Create an invisible link, click it automatically, then remove it
    const link = document.createElement('a')
    link.href = url
    link.download = 'stockpilot-products.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        <p className="text-gray-500">Manage your inventory items</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Add New Product</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {iconOptions.map((emoji) => (
              <option key={emoji} value={emoji}>{emoji}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-32 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAddProduct}
            disabled={adding}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-5 py-2 rounded-lg transition flex items-center gap-1"
          >
            <Plus size={18} />
            {adding ? 'Adding...' : 'Add Product'}
          </motion.button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Product List</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToCSV}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1 hover:bg-gray-50"
            >
              <Download size={14} />
              Export CSV
            </button>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {productsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-gray-400">No products found.</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center border border-gray-100 rounded-lg px-4 py-3 gap-3"
                >
                {editingId === product.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 mr-2 flex-1"
                    />
                    <input
                      type="number"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 w-20 mr-2"
                    />
                    <button
                      onClick={() => saveEdit(product.id)}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded mr-2"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-2 rounded"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xl">{product.icon || '📦'}</span>
                      <span className="font-medium text-gray-700">{product.name}</span>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-600">
                        {product.category || 'General'}
                      </span>
                      <span
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          product.quantity < 5
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-600'
                        }`}
                      >
                        Qty: {product.quantity}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => adjustStock(product.id, 1, 'in')}
                        className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded"
                        title="Stock In (+1)"
                      >
                        <ArrowUpCircle size={16} />
                      </button>
                      <button
                        onClick={() => adjustStock(product.id, -1, 'out')}
                        className="bg-orange-100 hover:bg-orange-200 text-orange-700 p-2 rounded"
                        title="Stock Out (-1)"
                        disabled={product.quantity <= 0}
                      >
                        <ArrowDownCircle size={16} />
                      </button>
                      <button
                        onClick={() => startEdit(product)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products