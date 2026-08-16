import { CheckCircle, XCircle } from 'lucide-react'

function Toast({ message, type }) {
  if (!message) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-slide-up ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

export default Toast