import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Pencil, Trash2, Check, X, Plus, ArrowUpCircle, ArrowDownCircle,
  Download, Upload, PackageSearch, Shirt, Cpu, Apple, Wrench, Armchair, Package
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { motion, AnimatePresence } from 'framer-motion'

// Professional icon assigned automatically per category
const categoryIcons = {
  General: Package,
  Electronics: Cpu,
  Clothing: Shirt,
  Food: Apple,
  Tools: Wrench,
  Furniture: Armchair
}

const categoryStyles = {
  General: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  Electronics: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  Clothing: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
  Food: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  Tools: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  Furniture: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'
}

function Products({ products, productsLoading, addProduct, updateProduct, deleteProduct, adjustStock, membership }) {
  const [adding, setAdding] = useState(false)
  const [importing, setImporting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('General')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const categories = ['General', 'Electronics', 'Clothing', 'Food', 'Tools', 'Furniture']

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [threshold, setThreshold] = useState('5')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editQuantity, setEditQuantity] = useState('')
  const [editThreshold, setEditThreshold] = useState('5')

  async function handleAddProduct() {
    if (name === '' || quantity === '') return
    setAdding(true)
    const success = await addProduct({
      name,
      quantity: Number(quantity),
      category,
      low_stock_threshold: Number(threshold) || 5
    })
    setAdding(false)
    if (success) {
      setName('')
      setQuantity('')
      setThreshold('5')
      setCategory('General')
      setShowAddForm(false)
    }
  }

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && products.length > 0) {
      const product = products.find((p) => p.id === Number(editId))
      if (product) startEdit(product)
    }
  }, [searchParams, products])

  function handleDeleteClick(product) {
    const confirmed = confirm(`Delete "${product.name}"? This cannot be undone.`)
    if (confirmed) deleteProduct(product.id)
  }

  function startEdit(product) {
    setEditingId(product.id)
    setEditName(product.name)
    setEditQuantity(product.quantity)
    setEditThreshold(product.low_stock_threshold ?? 5)
  }

  function saveEdit(id) {
    updateProduct(id, {
      name: editName,
      quantity: Number(editQuantity),
      low_stock_threshold: Number(editThreshold) || 5
    })
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

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      await importFromCSV(event.target.result)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function importFromCSV(text) {
    setImporting(true)
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
    const dataLines = lines.slice(1)

    let successCount = 0
    let failCount = 0

    for (const line of dataLines) {
      const parts = line.split(',').map((p) => p.trim())
      const [productName, productCategory, productQuantity] = parts

      if (!productName || isNaN(Number(productQuantity))) {
        failCount++
        continue
      }

      const success = await addProduct({
        name: productName,
        category: categories.includes(productCategory) ? productCategory : 'General',
        quantity: Number(productQuantity)
      })

      if (success) successCount++
      else failCount++
    }

    setImporting(false)
    alert(`Import complete: ${successCount} added, ${failCount} skipped.`)
  }

  function getIcon(cat) {
    return categoryIcons[cat] || Package
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Products</h1>
          <p className="text-slate-500 dark:text-gray-400">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} in inventory
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-200 dark:shadow-none"
        >
          <Plus size={18} />
          Add Product
        </motion.button>
      </div>

      {/* Add Product Panel — professional form layout */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-slate-800 dark:text-white">Add New Product</h2>
                <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Wireless Mouse"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">Quantity</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">Low Stock Alert At</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const CatIcon = getIcon(cat)
                    const isSelected = category === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <CatIcon size={15} />
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddProduct}
                  disabled={adding}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium px-6 py-2.5 rounded-xl transition"
                >
                  {adding ? 'Adding...' : 'Add Product'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar: search, filter, import/export */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="border border-slate-200 dark:border-gray-700 dark:text-gray-300 rounded-xl px-3 py-2.5 text-sm flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-gray-800"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <label className="border border-slate-200 dark:border-gray-700 dark:text-gray-300 rounded-xl px-3 py-2.5 text-sm flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-gray-800 cursor-pointer">
            <Upload size={14} />
            <span className="hidden sm:inline">{importing ? 'Importing...' : 'Import'}</span>
            <input type="file" accept=".csv" onChange={handleFileSelect} disabled={importing} className="hidden" />
          </label>
        </div>
      </div>

      {/* Product Grid */}
      {productsLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800">
          {searchTerm || categoryFilter !== 'All' ? (
            <EmptyState icon={PackageSearch} title="No matching products" description="Try adjusting your search or category filter." />
          ) : (
            <EmptyState icon={PackageSearch} title="No products yet" description="Click 'Add Product' above to start tracking inventory." />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredProducts.map((product) => {
              const CatIcon = getIcon(product.category)
              const iconStyle = categoryStyles[product.category] || categoryStyles.General
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-5 hover:shadow-md transition-shadow"
                >
                  {editingId === product.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        placeholder="Quantity"
                        className="w-full border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        value={editThreshold}
                        onChange={(e) => setEditThreshold(e.target.value)}
                        placeholder="Low stock threshold"
                        className="w-full border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(product.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg flex items-center justify-center"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 p-2 rounded-lg flex items-center justify-center"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconStyle}`}>
                          <CatIcon size={22} />
                        </div>
                        <span
                          className={`text-sm font-bold px-3 py-1 rounded-full ${
                            product.quantity < (product.low_stock_threshold ?? 5)
                              ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'
                              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                          }`}
                        >
                          {product.quantity} units
                        </span>
                      </div>

                      <Link
                        to={`/app/products/${product.id}`}
                        className="font-semibold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 block truncate mb-1"
                      >
                        {product.name}
                      </Link>
                      <span className="text-xs font-medium text-slate-400 dark:text-gray-500 uppercase tracking-wide">
                        {product.category || 'General'}
                      </span>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-gray-800">
                        <button
                          onClick={() => adjustStock(product.id, 1, 'in')}
                          className="flex-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 p-2 rounded-lg flex items-center justify-center"
                          title="Stock In (+1)"
                        >
                          <ArrowUpCircle size={16} />
                        </button>
                        <button
                          onClick={() => adjustStock(product.id, -1, 'out')}
                          className="flex-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 p-2 rounded-lg flex items-center justify-center"
                          title="Stock Out (-1)"
                          disabled={product.quantity <= 0}
                        >
                          <ArrowDownCircle size={16} />
                        </button>
                        <button
                          onClick={() => startEdit(product)}
                          className="flex-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 p-2 rounded-lg flex items-center justify-center"
                        >
                          <Pencil size={16} />
                        </button>
                        {membership?.role === 'Manager' && (
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="flex-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 p-2 rounded-lg flex items-center justify-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default Products