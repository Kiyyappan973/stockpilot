import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Settings, History, LogOut, Users } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

function Sidebar({ user, membership, onlineUsers = [] }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
      isActive
        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
    }`

  // Bottom tab bar link style (icon + tiny label, stacked)
  const mobileTabClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition ${
      isActive ? 'text-indigo-600' : 'text-slate-400'
    }`

  return (
    <>
      {/* Mobile top bar — simple header, no hamburger needed anymore */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-gray-800 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Package className="text-indigo-600" size={22} />
          <div>
            <span className="text-base font-bold text-slate-800 dark:text-white block leading-tight">StockPilot</span>
            {membership && (
              <span className="text-[10px] text-slate-400 dark:text-gray-500 leading-tight">
                {membership.warehouse_name}
              </span>
            )}
          </div>
        </div>
        <button onClick={handleLogout} className="text-rose-500">
          <LogOut size={20} />
        </button>
      </div>

      {/* Desktop sidebar — unchanged */}
      <div className="hidden md:flex w-64 bg-white dark:bg-gray-900 shadow-sm p-4 flex-col gap-2 h-screen sticky top-0 self-start">
        <div className="px-2 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Package className="text-indigo-600" size={28} />
            <span className="text-xl font-bold text-slate-800 dark:text-white">StockPilot</span>
          </div>
          {membership && (
            <p className="text-xs text-slate-400 dark:text-gray-500 truncate">
              {membership.warehouse_name} · {membership.role}
            </p>
          )}
        </div>

        <NavLink to="/app" end className={linkClass}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/app/products" className={linkClass}>
          <Package size={20} />
          Products
        </NavLink>
        <NavLink to="/app/history" className={linkClass}>
          <History size={20} />
          History
        </NavLink>
        {membership && membership.role === 'Manager' && (
          <NavLink to="/app/team" className={linkClass}>
            <Users size={20} />
            Team
          </NavLink>
        )}
        {membership && membership.role === 'Manager' && (
          <NavLink to="/app/settings" className={linkClass}>
            <Settings size={20} />
            Settings
          </NavLink>
        )}

        {onlineUsers.length > 0 && (
          <div className="px-4 mb-2">
            <p className="text-xs text-slate-400 mb-2">Online now ({onlineUsers.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {onlineUsers.map((u, i) => (
                <div
                  key={i}
                  title={u.email}
                  className="w-7 h-7 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-green-700 text-xs font-semibold"
                  style={{ boxShadow: '0 0 0 1px #d1fae5' }}
                >
                  {u.email?.[0]?.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-gray-800">
          <p className="text-xs text-slate-400 dark:text-gray-500 px-4 mb-2 truncate">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 w-full"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile bottom tab bar — real app style navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800 flex items-center z-40 pb-safe">
        <NavLink to="/app" end className={mobileTabClass}>
          <LayoutDashboard size={22} />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>
        <NavLink to="/app/products" className={mobileTabClass}>
          <Package size={22} />
          <span className="text-[10px] font-medium">Products</span>
        </NavLink>
        <NavLink to="/app/history" className={mobileTabClass}>
          <History size={22} />
          <span className="text-[10px] font-medium">Activity</span>
        </NavLink>
        {membership && membership.role === 'Manager' && (
          <NavLink to="/app/team" className={mobileTabClass}>
            <Users size={22} />
            <span className="text-[10px] font-medium">Team</span>
          </NavLink>
        )}
        {membership && membership.role === 'Manager' ? (
          <NavLink to="/app/settings" className={mobileTabClass}>
            <Settings size={22} />
            <span className="text-[10px] font-medium">Settings</span>
          </NavLink>
        ) : null}
      </div>
    </>
  )
}

export default Sidebar