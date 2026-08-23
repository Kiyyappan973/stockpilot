import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Pencil, Trash2, Check, X, Plus, ArrowUpCircle, ArrowDownCircle, Download, PackageSearch } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { motion, AnimatePresence } from 'framer-motion'

function Products({ products, productsLoading, addProduct, updateProduct, deleteProduct, adjustStock, membership }) {
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

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && products.length > 0) {
      const product = products.find((p) => p.id === Number(editId))
      if (product) {
        startEdit(product)
      }
    }
  }, [searchParams, products])

  function handleDeleteClick(product) {
    const confirmed = confirm(`Delete "${product.name}"? This cannot be undone.`)
    if (confirmed) {
      deleteProduct(product.id)
    }
  }

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
    const headers = ['Name', 'Category', 'Quantity']
    const rows = filteredProducts.map((p) => [p.name, p.category, p.quantity].join(','))
    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'stockpilot-products.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Products</h1>
        <p className="text-slate-500 dark:text-gray-400">Manage your inventory items</p>
      </div>

       <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Add New Product</h2>
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
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium px-5 py-2 rounded-xl transition flex items-center gap-1"
          >
            <Plus size={18} />
            {adding ? 'Adding...' : 'Add Product'}
          </motion.button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Product List</h2>
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
          searchTerm || categoryFilter !== 'All' ? (
            <EmptyState
              icon={PackageSearch}
              title="No matching products"
              description="Try adjusting your search or category filter."
            />
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="No products yet"
              description="Add your first product above to start tracking inventory."
            />
          )
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
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center border border-slate-100 dark:border-gray-800 rounded-xl px-4 py-3 gap-3 hover:bg-slate-50/50 dark:hover:bg-gray-800/50 transition-colors"
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
                      <div className="flex items-center justify-between w-full sm:w-auto sm:flex-1 gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-lg shrink-0">
                            {product.icon || '📦'}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/app/products/${product.id}`}
                              className="font-medium text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 block truncate"
                            >
                              {product.name}
                            </Link>
                            <span className="text-xs text-slate-400 dark:text-gray-500">{product.category || 'General'}</span>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-semibold px-3 py-1 rounded-full shrink-0 ${
                            product.quantity < 5
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          {product.quantity}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                        <button
                          onClick={() => adjustStock(product.id, 1, 'in')}
                          className="flex-1 sm:flex-none bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-2 rounded-lg flex items-center justify-center gap-1 text-xs font-medium"
                          title="Stock In (+1)"
                        >
                          <ArrowUpCircle size={16} />
                          <span className="sm:hidden">In</span>
                        </button>
                        <button
                          onClick={() => adjustStock(product.id, -1, 'out')}
                          className="flex-1 sm:flex-none bg-amber-50 hover:bg-amber-100 text-amber-700 p-2 rounded-lg flex items-center justify-center gap-1 text-xs font-medium"
                          title="Stock Out (-1)"
                          disabled={product.quantity <= 0}
                        >
                          <ArrowDownCircle size={16} />
                          <span className="sm:hidden">Out</span>
                        </button>
                        <button
                          onClick={() => startEdit(product)}
                          className="flex-1 sm:flex-none bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-2 rounded-lg flex items-center justify-center"
                        >
                          <Pencil size={16} />
                        </button>
                        {membership?.role === 'Manager' && (
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="flex-1 sm:flex-none bg-rose-50 hover:bg-rose-100 text-rose-700 p-2 rounded-lg flex items-center justify-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
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