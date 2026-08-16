import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

function History({ history }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Stock History</h1>
        <p className="text-gray-500">Track every stock movement</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {history.length === 0 ? (
          <p className="text-gray-400">No stock movements yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {entry.type === 'in' ? (
                    <ArrowUpCircle className="text-green-600" size={20} />
                  ) : (
                    <ArrowDownCircle className="text-red-600" size={20} />
                  )}
                  <div>
                    <p className="font-medium text-gray-700">{entry.productName}</p>
                    <p className="text-xs text-gray-400">{entry.date}</p>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default History