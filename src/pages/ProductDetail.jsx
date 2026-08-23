import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import EmptyState from '../components/EmptyState'

function ProductDetail({ products, membership }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)

  const product = products.find((p) => p.id === Number(id))

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true)
      const { data, error } = await supabase
        .from('stock_history')
        .select('*')
        .eq('product_id', Number(id))
        .order('created_at', { ascending: true })

      if (!error) {
        // Format for the chart: short date/time label + the quantity at that point
        const formatted = data.map((entry) => ({
          date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          quantity: entry.quantity_after
        }))
        setHistoryData(formatted)
      }
      setLoading(false)
    }
    fetchHistory()
  }, [id])

  if (!product) {
    return (
      <div>
        <button onClick={() => navigate('/app/products')} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-4">
          <ArrowLeft size={18} />
          Back to Products
        </button>
        <p className="text-gray-400">Product not found.</p>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => navigate('/app/products')} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-4">
        <ArrowLeft size={18} />
        Back to Products
      </button>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{product.icon || '📦'}</span>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-gray-500">{product.category || 'General'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-400 text-sm">Current Stock</p>
          <p className="text-3xl font-bold text-gray-800">{product.quantity}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-400 text-sm">Status</p>
          <p className={`text-3xl font-bold ${product.quantity < 5 ? 'text-red-600' : 'text-green-600'}`}>
            {product.quantity < 5 ? 'Low Stock' : 'Healthy'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Stock History</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : historyData.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No history yet"
            description="Use Stock In/Out on this product to start building a history chart."
          />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="quantity" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default ProductDetail