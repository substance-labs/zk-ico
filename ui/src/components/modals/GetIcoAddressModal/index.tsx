import { useCallback, useMemo, useState } from "react"
import type { Campaign } from "../../../types"
import Button from "../../base/Button"
import Input from "../../base/Input"
import Label from "../../base/Label"
import Modal, { type ModalProps } from "../Modal"
import { isAddress } from "viem"

interface GetAddressModalProps extends ModalProps {
  campaign: Campaign
  onAddress: (address: string) => void
}

const GetIcoAddressModal: React.FC<GetAddressModalProps> = ({ campaign, visible, onClose, onAddress }) => {
  const [address, setAddress] = useState<string>("")

  const isValidAddress = useMemo(() => isAddress(address), [address])

  const onConfirm = useCallback(() => {
    onAddress(address)
    setAddress("")
  }, [address, onAddress])

  return (
    <Modal visible={visible} title={"Participate in ICO"} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="recipient" className="text-sm mb-1 block">
            Receiving Address
          </Label>
          <Input
            id="recipient"
            placeholder="0x..."
            className="bg-gray-50 border-gray-300 focus:ring-gray-900 focus:border-purple-500"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {campaign && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm rounded-md px-4 py-3">
            This is the address that will receive the {campaign.title} ICO token ({campaign.icoToken.symbol}) on{" "}
            <strong>Base</strong>.
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button disabled={!isValidAddress} className="w-full py-2 px-8" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  )
}

export default GetIcoAddressModal
