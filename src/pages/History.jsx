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

      if (!error) setHistory(data)
      setLoading(false)
    }
    fetchHistory()

    if (!membership) return

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
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Activity Feed</h1>
        <p className="text-slate-500 dark:text-gray-400">Track every stock movement across your team</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
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
                className="flex items-center justify-between border border-slate-100 dark:border-gray-800 rounded-xl px-4 py-3 hover:bg-slate-50/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      entry.type === 'in'
                        ? 'bg-emerald-100 dark:bg-emerald-900/40'
                        : 'bg-rose-100 dark:bg-rose-900/40'
                    }`}
                  >
                    {entry.type === 'in' ? (
                      <ArrowUpCircle className="text-emerald-600 dark:text-emerald-400" size={18} />
                    ) : (
                      <ArrowDownCircle className="text-rose-600 dark:text-rose-400" size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-700 dark:text-white truncate">{entry.product_name}</p>
                    <p className="text-xs text-slate-400 dark:text-gray-500 truncate">
                      {entry.user_email || 'Unknown user'} · {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full shrink-0 ${
                    entry.type === 'in'
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'
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