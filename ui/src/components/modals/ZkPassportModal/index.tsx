import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import QRCode from "react-qr-code"

import Spinner from "../../base/Spinner"

const ZkPassportModal = ({ url, isGeneratingProof, onClose }) => {
  return (
    <AnimatePresence>
      {url && (
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
            className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center relative text-center"
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={onClose}
            >
              <X size={20} />
            </button>

            {isGeneratingProof ? (
              <Spinner size="lg" text="Collecting your anonymized deposit material ..." color="gray-600" />
            ) : (
              <>
                <QRCode value={url || ""} size={240} bgColor="transparent" fgColor="black" className="mt-4" />
                <p className="mt-6 text-md text-gray-600 leading-relaxed max-w-xs">
                  Scan this QR code to open the <span className="text-black font-semibold">zkPassport</span> app on your
                  phone, or click{" "}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline font-semibold"
                  >
                    here
                  </a>{" "}
                  instead.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ZkPassportModal
