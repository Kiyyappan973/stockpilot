import RotatingCube from '../RotatingCube'
import { Package, TrendingUp, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function Dashboard({ products }) {
  // Colors for each pie slice (cycles through if more categories exist)
  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6366f1']

  // Group products by category, and add up quantity for each group
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
  const lowStockCount = products.filter((product) => product.quantity < 5).length

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Overview of your inventory</p>
        </div>
        <div style={{ width: '120px', height: '120px' }}>
          <RotatingCube hasLowStock={lowStockCount > 0} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Package className="text-blue-600" size={22} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Products</p>
            <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <TrendingUp className="text-green-600" size={22} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Stock</p>
            <p className="text-2xl font-bold text-gray-800">{totalQuantity}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className={`p-3 rounded-lg ${lowStockCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
            <AlertTriangle className={lowStockCount > 0 ? 'text-red-600' : 'text-gray-400'} size={22} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Low Stock Alerts</p>
            <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-gray-800'}`}>
              {lowStockCount}
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Stock by Category</h2>

        {categoryData.length === 0 ? (
          <p className="text-gray-400">Add some products to see the breakdown.</p>
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
    </div>
  )
}

export default Dashboard