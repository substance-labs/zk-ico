import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

export interface ModalProps {
  visible: boolean
  onClose: React.MouseEventHandler<HTMLButtonElement>
  children?: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ visible, onClose, children }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center relative text-cente border shadow-sm p-6"
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={onClose}
            >
              <X size={20} />
            </button>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal
