import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Users, Copy, Check, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function Team({ membership, onlineUsers = [] }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const onlineEmails = new Set(onlineUsers.map((u) => u.email))
  const [currentCode, setCurrentCode] = useState(membership?.invite_code || '')
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    async function fetchMembers() {
      if (!membership) return
      setLoading(true)
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('warehouse_id', membership.warehouse_id)
        .order('created_at', { ascending: true })

      if (!error) setMembers(data)
      setLoading(false)
    }
    fetchMembers()
  }, [membership])

  function copyInviteCode() {
    navigator.clipboard.writeText(currentCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function regenerateCode() {
    const confirmed = confirm(
      'This will invalidate the current invite code. Anyone with the old code will no longer be able to join. Continue?'
    )
    if (!confirmed) return

    setRegenerating(true)
    const newCode = generateInviteCode()

    const { error } = await supabase
      .from('warehouses')
      .update({ invite_code: newCode })
      .eq('id', membership.warehouse_id)

    if (!error) setCurrentCode(newCode)
    setRegenerating(false)
  }

  if (!membership) {
    return <p className="text-slate-400 dark:text-gray-500">Loading...</p>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Team</h1>
        <p className="text-slate-500 dark:text-gray-400">Manage your warehouse team members</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Invite Code</h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm mb-4">
          Share this code with teammates so they can join {membership.warehouse_name}.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-white font-mono text-lg font-bold px-4 py-2 rounded-xl tracking-widest">
            {currentCode}
          </div>
          <button
            onClick={copyInviteCode}
            className="flex items-center gap-1 border border-slate-200 dark:border-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-gray-800"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={regenerateCode}
            disabled={regenerating}
            className="flex items-center gap-1 border border-slate-200 dark:border-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <RefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
          Members ({members.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member, index) => {
              const isOnline = onlineEmails.has(member.email)
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-slate-100 dark:border-gray-800 rounded-xl px-4 py-3 gap-3 hover:bg-slate-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="bg-indigo-100 dark:bg-indigo-900/40 w-9 h-9 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      {isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-700 dark:text-white font-medium truncate">{member.email}</p>
                      <p className="text-xs text-slate-400 dark:text-gray-500">
                        {isOnline ? 'Online now' : 'Offline'} · Joined {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full self-start sm:self-auto shrink-0 ${
                      member.role === 'Manager'
                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {member.role}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Team