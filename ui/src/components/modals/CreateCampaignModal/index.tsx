import { useCallback, useMemo, useState } from "react"
import { toast } from "react-toastify"

import { useCreateCampaign } from "../../../hooks/use-campaigns"
import settings from "../../../settings"

import Input from "../../base/Input"
import Button from "../../base/Button"
import Label from "../../base/Label"
import Modal, { type ModalProps } from "../Modal"

interface CreateCampaignModalProps extends ModalProps {
  onCreated?: () => void
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ visible, onClose, onCreated }) => {
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [icoTokenName, setIcoTokenName] = useState<string>("")
  const [icoTokenSymbol, setIcoTokenSymbol] = useState<string>("")
  const [icoTokenTotalSupply, setIcoTokenTotalSupply] = useState<string>("")
  const [icoTokenReceiver, setIcoTokenReceiver] = useState<string>("")
  const [rate, setRate] = useState<string>("")

  const { create, isCreating } = useCreateCampaign()

  const isButtonDisabled = useMemo(() => {
    return (
      title.length === 0 ||
      description.length === 0 ||
      icoTokenName.length === 0 ||
      icoTokenSymbol.length === 0 ||
      icoTokenTotalSupply.length === 0 ||
      icoTokenReceiver.length === 0 ||
      rate.length === 0 ||
      isCreating
    )
  }, [rate, icoTokenName, icoTokenSymbol, title, description, icoTokenTotalSupply, icoTokenReceiver, isCreating])

  const onCreate = useCallback(async () => {
    try {
      await create({
        aztecBuyTokenAddress: settings.addresses.aztecBuyToken,
        icoToken: {
          name: icoTokenName,
          symbol: icoTokenSymbol,
          totalSupply: icoTokenTotalSupply,
        },
        icoTokenReceiver,
        buyTokenAddress: settings.addresses.baseSepoliaBuyToken,
        title,
        description,
        rate,
      })

      toast.success(<div className="text-sm text-gray-600">Your campaign was created successfully.</div>, {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      setTimeout(() => {
        onCreated && onCreated()
      }, 1500)
    } catch (err) {
      console.error(err)
    }
  }, [rate, icoTokenName, icoTokenSymbol, title, description, icoTokenTotalSupply, icoTokenReceiver, create, onCreated])

  return (
    <Modal title="Create Campaign" visible={visible} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="mb-1 block">
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
          <Label htmlFor="description" className="mb-1 block">
            Description
          </Label>
          <textarea
            id="description"
            placeholder="Describe your campaign..."
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-purple-500 resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="icoTokenName" className="mb-1 block">
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
            <Label htmlFor="icoTokenSymbol" className="mb-1 block">
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
          <Label className="mb-1 block">Total Supply</Label>
          <Input
            id="icoTokenTotalSupply"
            placeholder="e.g. 10000"
            type="number"
            value={icoTokenTotalSupply}
            onChange={(e) => setIcoTokenTotalSupply(e.target.value)}
          />
        </div>

        <div>
          <Label className="mb-1 block">Receiver</Label>
          <Input
            id="icoTokenReceiver"
            placeholder="e.g. 0x1234...6789"
            value={icoTokenReceiver}
            onChange={(e) => setIcoTokenReceiver(e.target.value)}
          />
        </div>

        <div>
          <Label className="mb-1 block">Buy Token</Label>
          <Input value="ETH" disabled />
        </div>

        <div>
          <Label className="mb-1 block">Rate (1 ETH = ? Buy Token)</Label>
          <Input placeholder="" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
      </div>

      <div className="mt-6">
        <Button className="py-2 w-42" disabled={isButtonDisabled} onClick={onCreate}>
          {isCreating ? "Creating ..." : "Create Campaign"}
        </Button>
      </div>
    </Modal>
  )
}

export default CreateCampaignModal
