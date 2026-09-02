import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../supabase'
import RotatingCube from '../RotatingCube'
import WarehouseScene from '../WarehouseScene'
import { Package, TrendingUp, AlertTriangle, TrendingDown, Sparkles } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function Dashboard({ products, membership }) {
  const navigate = useNavigate()
  const [predictions, setPredictions] = useState([])
  const [predictionsLoading, setPredictionsLoading] = useState(true)

  function handleBoxClick(productId) {
    navigate(`/app/products?edit=${productId}`)
  }

  useEffect(() => {
    async function calculatePredictions() {
      if (!membership) return
      setPredictionsLoading(true)

      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

      const { data, error } = await supabase
        .from('stock_history')
        .select('*')
        .eq('warehouse_id', membership.warehouse_id)
        .eq('type', 'out')
        .gte('created_at', fourteenDaysAgo.toISOString())

      if (error || !data) {
        setPredictionsLoading(false)
        return
      }

      const usageByProduct = {}
      data.forEach((entry) => {
        if (!usageByProduct[entry.product_id]) {
          usageByProduct[entry.product_id] = 0
        }
        usageByProduct[entry.product_id] += entry.amount
      })

      const results = products
        .map((product) => {
          const totalUsed = usageByProduct[product.id] || 0
          if (totalUsed === 0) return null

          const dailyRate = totalUsed / 14
          const daysRemaining = Math.floor(product.quantity / dailyRate)

          return {
            product,
            dailyRate: dailyRate.toFixed(1),
            daysRemaining
          }
        })
        .filter(Boolean)
        .filter((p) => p.daysRemaining <= 14)
        .sort((a, b) => a.daysRemaining - b.daysRemaining)
        .slice(0, 5)

      setPredictions(results)
      setPredictionsLoading(false)
    }
    calculatePredictions()
  }, [membership, products])

  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6366f1']

  const categoryData = Object.values(
    products.reduce((groups, product) => {
      const cat = product.category || 'General'
      if (!groups[cat]) {
        groups[cat] = { name: cat, value: 0 }
      }
      groups[cat].value += product.quantity
      return groups
    }, {})
  )

  const totalProducts = products.length
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0)
  const lowStockCount = products.filter(
    (product) => product.quantity < (product.low_stock_threshold ?? 5)
  ).length

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-gray-400">Overview of your inventory</p>
        </div>
        <div style={{ width: '120px', height: '120px' }}>
          <RotatingCube hasLowStock={lowStockCount > 0} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-5 flex items-center gap-4"
        >
          <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
            <Package className="text-blue-600 dark:text-blue-400" size={22} />
          </div>
          <div>
            <p className="text-slate-400 dark:text-gray-500 text-sm">Total Products</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalProducts}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-5 flex items-center gap-4"
        >
          <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-lg">
            <TrendingUp className="text-green-600 dark:text-green-400" size={22} />
          </div>
          <div>
            <p className="text-slate-400 dark:text-gray-500 text-sm">Total Stock</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalQuantity}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-5 flex items-center gap-4"
        >
          <div className={`p-3 rounded-lg ${lowStockCount > 0 ? 'bg-red-100 dark:bg-red-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <AlertTriangle className={lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'} size={22} />
          </div>
          <div>
            <p className="text-slate-400 dark:text-gray-500 text-sm">Low Stock Alerts</p>
            <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
              {lowStockCount}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Category Breakdown Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-6 mt-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Stock by Category</h2>

        {categoryData.length === 0 ? (
          <p className="text-slate-400 dark:text-gray-500">Add some products to see the breakdown.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Reorder Predictions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-6 mt-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-indigo-500" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Reorder Suggestions</h2>
        </div>
        <p className="text-slate-400 dark:text-gray-500 text-sm mb-4">
          Based on stock movement over the last 14 days
        </p>

        {predictionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : predictions.length === 0 ? (
          <p className="text-slate-400 dark:text-gray-500 text-sm py-4">
            No products at risk of running out soon. Keep it up!
          </p>
        ) : (
          <div className="space-y-2">
            {predictions.map(({ product, dailyRate, daysRemaining }) => (
              <div
                key={product.id}
                className="flex items-center justify-between border border-slate-100 dark:border-gray-800 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      daysRemaining <= 3
                        ? 'bg-rose-100 dark:bg-rose-900/40'
                        : 'bg-amber-100 dark:bg-amber-900/40'
                    }`}
                  >
                    <TrendingDown
                      size={16}
                      className={daysRemaining <= 3 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-700 dark:text-white truncate">{product.name}</p>
                    <p className="text-xs text-slate-400 dark:text-gray-500">
                      Using ~{dailyRate}/day · {product.quantity} left
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full shrink-0 ${
                    daysRemaining <= 3
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'
                      : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
                  }`}
                >
                  {daysRemaining <= 0 ? 'Out now' : `${daysRemaining}d left`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3D Warehouse View */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-6 mt-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">3D Warehouse View</h2>
        <p className="text-slate-400 dark:text-gray-500 text-sm mb-4">Drag to rotate, scroll to zoom, hover a box to see details</p>

        {products.length === 0 ? (
          <p className="text-slate-400 dark:text-gray-500">Add some products to see your warehouse.</p>
        ) : (
          <div style={{ height: '400px' }}>
            <WarehouseScene products={products} onBoxClick={handleBoxClick} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard