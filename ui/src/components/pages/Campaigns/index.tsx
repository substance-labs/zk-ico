import { useCallback, useState } from "react"
import { Plus, User } from "lucide-react"
import { toast } from "react-toastify"
import { useAccount } from "wagmi"

import { useCampaigns, useParticipateToCampaign } from "../../../hooks/use-campaigns"
import useWallet from "../../../hooks/use-wallet"
import { useAsset } from "../../../hooks/use-assets"
import settings from "../../../settings"

import MainLayout from "../../layouts/MainLayout"
import CreateCampaignModal from "../../modals/CreateCampaignModal"
import SecondaryButton from "../../base/SecondaryButton"
import Button from "../../base/Button"
import ZkPassportModal from "../../modals/ZkPassportModal"
import GetIcoParticipationDataModal from "../../modals/GetIcoParticipationDataModal"
import Spinner from "../../base/Spinner"
import ProfileModal from "../../modals/ProfileModal"

import type { Campaign } from "../../../types"

export const CampaignCard = ({
  campaign: { title, description, icoToken, buyToken, rate },
  onParticipate,
  isParticipating,
  disabled,
}: {
  campaign: Campaign
  onParticipate: () => void
  isParticipating: boolean
  disabled: boolean
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-md">
      <h3 className="text-xl font-semibold text-gray-900 tracking-tight">{title}</h3>
      <p className="text-sm text-gray-600 mt-2 line-clamp-3 h-20">{description}</p>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-500">Buy Token</div>
          <div className="font-medium text-gray-800">{buyToken.symbol}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-500">ICO Token</div>
          <div className="font-medium text-gray-800">{icoToken.symbol}</div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <span className="text-gray-500">Rate:</span> 1 {buyToken.symbol} = {rate} {icoToken.symbol}
      </div>

      <div className="mt-6">
        <Button className="w-full px-4" onClick={onParticipate} disabled={disabled || isParticipating}>
          {isParticipating ? <Spinner /> : "Participate"}
        </Button>
      </div>
    </div>
  )
}

const Campaigns = () => {
  const [createCampaignModalVisible, setCreateCampaignModalVisible] = useState<boolean>(false)
  const [profileModalVisibile, setProfileModalVisible] = useState<boolean>(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const { campaigns } = useCampaigns()
  const {
    participate,
    zkPassportCurrentUrl,
    resetZkPassportProof,
    isGeneratingZkPassportProof,
    isParticipatingInCampaignId,
  } = useParticipateToCampaign()
  const { isConnected: isAztecWalletConnected } = useWallet()
  const { isConnected: isEvmWalletConnected } = useAccount()
  const { data: asset } = useAsset({
    address: settings.addresses.aztecBuyToken as `0x${string}`,
    decimals: settings.aztecBuyTokenDecimals,
    symbol: settings.aztecBuyTokenSymbol,
  })

  const onGetAddress = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign)
  }, [])

  const onParticipate = useCallback(
    (receiverAddress: string, amount: string) => {
      setTimeout(() => {
        try {
          participate(selectedCampaign, receiverAddress, amount).then(() => {
            toast.success(`You succesfully participated to the ${selectedCampaign.title} campaign!`)
          })
        } catch (err) {
          console.error(err)
        }
      }, 500)

      setSelectedCampaign(null)
    },
    [selectedCampaign],
  )

  return (
    <MainLayout
      header={
        <div className="flex justify-between items-center ">
          <SecondaryButton Icon={Plus} iconPosition="left" onClick={() => setCreateCampaignModalVisible(true)}>
            <span>Create campaign</span>
          </SecondaryButton>
          {!isAztecWalletConnected || !isEvmWalletConnected ? (
            <SecondaryButton onClick={() => setProfileModalVisible(true)}>
              <div className="relative inline-block w-fit">
                <User />
                <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full ring-2 ring-white" />
              </div>
            </SecondaryButton>
          ) : (
            <SecondaryButton Icon={User} iconPosition={"right"} onClick={() => setProfileModalVisible(true)}>
              {asset ? asset.formattedBalanceWithSymbol : "-"}
            </SecondaryButton>
          )}
        </div>
      }
    >
      <div className="min-h-screen">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
          {campaigns.map((campaign, idx) => (
            <CampaignCard
              key={idx}
              campaign={campaign}
              onParticipate={() => onGetAddress(campaign)}
              isParticipating={isParticipatingInCampaignId === campaign.id}
              disabled={!isAztecWalletConnected}
            />
          ))}
        </section>
      </div>

      <ZkPassportModal
        url={zkPassportCurrentUrl}
        onClose={resetZkPassportProof}
        isGeneratingProof={isGeneratingZkPassportProof}
      />
      <CreateCampaignModal
        visible={createCampaignModalVisible}
        onClose={() => setCreateCampaignModalVisible(false)}
        onCreated={() => setCreateCampaignModalVisible(false)}
      />
      <GetIcoParticipationDataModal
        campaign={selectedCampaign}
        visible={Boolean(selectedCampaign)}
        onClose={() => setSelectedCampaign(null)}
        onData={onParticipate}
      />
      <ProfileModal visible={profileModalVisibile} onClose={() => setProfileModalVisible(false)} />
    </MainLayout>
  )
}

export default Campaigns
