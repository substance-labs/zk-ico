import { useCallback, useState } from "react"

import { useCreateCampaign } from "../../../hooks/use-campaigns"

import Input from "../../base/Input"
import Button from "../../base/Button"
import Label from "../../base/Label"
import Modal, { type ModalProps } from "../Modal"
import { zeroAddress } from "viem"
import settings from "../../../settings"

interface CreateCampaignModalProps extends ModalProps {}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ visible, onClose }) => {
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [icoTokenName, setIcoTokenName] = useState<string>("")
  const [icoTokenSymbol, setIcoTokenSymbol] = useState<string>("")
  const [rate, setRate] = useState<string>("")

  const { create } = useCreateCampaign()

  const onCreate = useCallback(() => {
    create({
      gateway: settings.addresses.l2EvmGateway,
      verifier: zeroAddress, // disabled proof verification,
      aztecBuyTokenAddress: settings.addresses.buyToken.aztecAddress,
      icoToken: {
        name: icoTokenName,
        symbol: icoTokenSymbol,
      },
      buyTokenAddress: settings.addresses.buyToken.baseSepoliaAddress,
      title,
      description,
      rate,
    })
  }, [rate, icoTokenName, icoTokenSymbol, title, description, create])

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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="icoTokenName" className="text-sm mb-1 block">
              Token Name
            </Label>
            <Input
              id="icoTokenName"
              placeholder="e.g. OCEAN"
              value={icoTokenName}
              onChange={(e) => setIcoTokenName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="icoTokenSymbol" className="text-sm mb-1 block">
              Symbol
            </Label>
            <Input
              id="icoTokenSymbol"
              placeholder="e.g. OCN"
              value={icoTokenSymbol}
              onChange={(e) => setIcoTokenSymbol(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label className="text-sm mb-1 block">Buy Token</Label>
          <Input value="ETH" disabled />
        </div>

        <div>
          <Label className="text-sm mb-1 block">Rate (1 ETH = ? Buy Token)</Label>
          <Input placeholder="" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
      </div>

      <div className="mt-6">
        <Button className="py-2 px-3" onClick={onCreate}>
          Create Campaign
        </Button>
      </div>
    </Modal>
  )
}

export default CreateCampaignModal
