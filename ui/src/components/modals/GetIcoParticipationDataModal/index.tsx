import { useCallback, useEffect, useMemo, useState } from "react"
import type { Campaign } from "../../../types"
import Button from "../../base/Button"
import Input from "../../base/Input"
import Label from "../../base/Label"
import Modal, { type ModalProps } from "../Modal"
import { isAddress } from "viem"
import { TokenContract } from "@aztec/noir-contracts.js/Token"
import { AztecAddress } from "@aztec/aztec.js"
import { getAztecWallet } from "../../../utils/aztec"

interface GetIcoParticipationDataModalProps extends ModalProps {
  campaign: Campaign
  onData: (address: string, amount: string) => void
}

const GetIcoParticipationDataModal: React.FC<GetIcoParticipationDataModalProps> = ({
  campaign,
  visible,
  onClose,
  onData,
}) => {
  const [address, setAddress] = useState<string>("")
  const [amount, setAmount] = useState<string>("")

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const aztecWallet = await getAztecWallet()
        const token = await TokenContract.at(AztecAddress.fromString(campaign.aztecBuyToken.address), aztecWallet)
        const balance: bigint = await token.methods.balance_of_private(aztecWallet.getAddress()).simulate()

        console.log(balance)
      } catch (err) {
        console.error(err)
      }
    }

    if (visible) {
      fetchBalance()
    }
  }, [campaign, visible])

  const isValidAddress = useMemo(() => isAddress(address), [address])

  const onConfirm = useCallback(() => {
    onData(address, amount)
    setAddress("")
  }, [address, amount, onData])

  return (
    <Modal visible={visible} title={"Participate in ICO"} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="recipient" className="text-sm mb-1 block">
            Receiving Address
          </Label>
          <Input
            id="recipient"
            placeholder="e.g. 0x2345 ..."
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

        <div>
          <Label htmlFor="amount" className="text-sm mb-1 block">
            Amount (ETH on Aztec)
          </Label>
          <Input
            id="amount"
            placeholder="e.g. 0.003"
            className="bg-gray-50 border-gray-300 focus:ring-gray-900 focus:border-purple-500"
            type="number"
            value={address}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        <Button disabled={!isValidAddress} className="w-full py-2 px-8" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  )
}

export default GetIcoParticipationDataModal
