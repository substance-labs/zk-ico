import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import QRCode from "react-qr-code"

import Spinner from "../../base/Spinner"
import Modal, { type ModalProps } from "../Modal"

interface ZkPassportModalProps extends ModalProps {
  isGeneratingProof: boolean
  url: string
}

const ZkPassportModal: React.FC<ZkPassportModalProps> = ({ isGeneratingProof, url, onClose }) => {
  return (
    <Modal visible={Boolean(url)} onClose={onClose}>
      {isGeneratingProof ? (
        <Spinner size="lg" text="Collecting your anonymized deposit material ..." color="gray-600" />
      ) : (
        <>
          <QRCode value={url || ""} size={240} bgColor="transparent" fgColor="black" className="mt-4" />
          <p className="mt-6 text-md text-gray-600 leading-relaxed max-w-xs">
            Scan this QR code to open the <span className="text-black font-semibold">zkPassport</span> app on your
            phone, or click{" "}
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-purple-500 underline font-semibold">
              here
            </a>{" "}
            instead.
          </p>
        </>
      )}
    </Modal>
  )
}

export default ZkPassportModal
