import Modal from "../Modal"
import Button from "../../base/Button"

import type { ModalProps } from "../Modal"

export interface SecretModalProps extends ModalProps {
  onUnderstand: () => void
}

const WarningClosePageModal: React.FC<SecretModalProps> = ({ visible, onClose, onUnderstand }) => {
  return (
    <Modal visible={visible} title={"Attention!"} onClose={onClose}>
      <div className="flex flex-col justify-center items-center space-y-4 p-4 text-center">
        <div>
          <p className="text-md text-gray-700">
            When you participate in a campaign, it's important to keep this page open.
            <br />
            <strong>If you close or refresh the page, you won’t be able to claim your tokens.</strong>
            <br />
            Please stay on this page until the process is complete.
          </p>
        </div>
        <Button className="w-54 mt-6" onClick={() => onUnderstand()}>
          I understand
        </Button>
      </div>
    </Modal>
  )
}

export default WarningClosePageModal
