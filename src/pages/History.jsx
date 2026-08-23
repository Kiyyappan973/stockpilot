import { useState, useEffect } from 'react'
import { ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react'
import { supabase } from '../supabase'
import EmptyState from '../components/EmptyState'
import { motion } from 'framer-motion'

function History({ membership }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      if (!membership) return
      setLoading(true)
      const { data, error } = await supabase
        .from('stock_history')
        .select('*')
        .eq('warehouse_id', membership.warehouse_id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error) {
        setHistory(data)
      }
      setLoading(false)
    }
    fetchHistory()

    if (!membership) return

    // Live updates: new activity appears instantly for the whole team
    const channel = supabase
      .channel('stock-history-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stock_history',
          filter: `warehouse_id=eq.${membership.warehouse_id}`
        },
        (payload) => {
          setHistory((current) => [payload.new, ...current])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [membership])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Activity Feed</h1>
        <p className="text-slate-500">Track every stock movement across your team</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No activity yet"
            description="Stock movements will appear here once your team starts adding or removing inventory."
          />
        ) : (
          <div className="space-y-2">
            {history.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
                className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {entry.type === 'in' ? (
                    <ArrowUpCircle className="text-green-600" size={20} />
                  ) : (
                    <ArrowDownCircle className="text-red-600" size={20} />
                  )}
                  <div>
                    <p className="font-medium text-gray-700">{entry.product_name}</p>
                    <p className="text-xs text-gray-400">
                      {entry.user_email || 'Unknown user'} · {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    entry.type === 'in'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {entry.type === 'in' ? '+' : '-'}{entry.amount}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default History