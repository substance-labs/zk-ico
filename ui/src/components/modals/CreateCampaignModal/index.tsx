import Input from "../../base/Input"
import Button from "../../base/Button"
import Label from "../../base/Label"
import Modal, { type ModalProps } from "../Modal"

interface CreateCampaignModalProps extends ModalProps {}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} onClose={onClose}>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center tracking-tight">Create Campaign</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-sm mb-1 block">
            Title
          </Label>
          <Input
            id="title"
            placeholder="e.g. Save the Ocean"
            className="bg-gray-50 border-gray-300 focus:ring-gray-900 focus:border-purple-500"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-sm mb-1 block">
            Description
          </Label>
          <textarea
            id="description"
            placeholder="Describe your campaign..."
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-purple-500 resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tokenName" className="text-sm mb-1 block">
              Token Name
            </Label>
            <Input id="tokenName" placeholder="e.g. OCEAN" />
          </div>

          <div>
            <Label htmlFor="tokenSymbol" className="text-sm mb-1 block">
              Symbol
            </Label>
            <Input id="tokenSymbol" placeholder="e.g. OCN" />
          </div>
        </div>

        <div>
          <Label className="text-sm mb-1 block">Buy Token</Label>
          <Input value="ETH" disabled />
        </div>

        <div>
          <Label className="text-sm mb-1 block">Rate (1 ETH = ? Buy Token)</Label>
          <Input placeholder="" />
        </div>
      </div>

      <div className="mt-6">
        <Button className="py-2 px-3">Create Campaign</Button>
      </div>
    </Modal>
  )
}

export default CreateCampaignModal
