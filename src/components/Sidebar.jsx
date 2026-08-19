import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Settings, History, LogOut, Menu, X, Users } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

function Sidebar({ user, membership }) {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <>
      {/* Mobile top bar — only visible on small screens */}
      <div className="md:hidden flex items-center justify-between bg-white shadow-sm p-4">
        <div className="flex items-center gap-2">
          <Package className="text-blue-600" size={24} />
          <span className="text-lg font-bold text-gray-800">StockPilot</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar itself */}
      <div
        className={`  
          w-64 bg-white shadow-sm p-4 flex-col gap-2 h-screen
          md:flex md:sticky md:top-0
          ${mobileOpen ? 'flex fixed top-0 left-0 z-50' : 'hidden'}
        `}
      >
        <div className="hidden md:block px-2 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Package className="text-blue-600" size={28} />
            <span className="text-xl font-bold text-gray-800">StockPilot</span>
          </div>
          {membership && (
            <p className="text-xs text-gray-400 truncate">
              {membership.warehouse_name} · {membership.role}
            </p>
          )}
        </div>

        <NavLink to="/app" end className={linkClass} onClick={() => setMobileOpen(false)}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink to="/app/products" className={linkClass} onClick={() => setMobileOpen(false)}>
          <Package size={20} />
          Products
        </NavLink>

        <NavLink to="/app/history" className={linkClass} onClick={() => setMobileOpen(false)}>
          <History size={20} />
          History
        </NavLink>
        {membership && membership.role === 'Manager' && (
          <NavLink to="/app/team" className={linkClass} onClick={() => setMobileOpen(false)}>
            <Users size={20} />
            Team
          </NavLink>
        )}

        {membership && membership.role === 'Manager' && (
          <NavLink to="/app/settings" className={linkClass} onClick={() => setMobileOpen(false)}>
            <Settings size={20} />
            Settings
          </NavLink>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 px-4 mb-2 truncate">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar