import { motion } from 'framer-motion'

function EmptyState({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center py-12 px-4"
    >
      <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-1">{title}</h3>
      <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs">{description}</p>
    </motion.div>
  )
}

export default EmptyState