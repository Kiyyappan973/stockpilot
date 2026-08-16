import { Trash2, Moon, Sun } from 'lucide-react'

function Settings({ clearAllData, darkMode, setDarkMode }) {
  function handleClearAllData() {
    const confirmed = confirm(
      'Are you sure you want to delete ALL products? This cannot be undone.'
    )
    if (confirmed) {
      clearAllData()
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500">Manage your app preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={20} className="text-gray-600" /> : <Sun size={20} className="text-yellow-500" />}
            <span className="text-gray-700">Dark Mode</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-14 h-8 rounded-full flex items-center px-1 transition ${
              darkMode ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
            }`}
          >
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700 font-medium">Clear All Data</p>
            <p className="text-gray-400 text-sm">Permanently delete all products</p>
          </div>
          <button
            onClick={handleClearAllData}
            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear Data
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings