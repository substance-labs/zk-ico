import { useState } from "react"
import { Plus } from "lucide-react"

import { useCampaigns, useParticipateToCampaign } from "../../../hooks/use-campaigns"

import MainLayout from "../../layouts/MainLayout"
import CreateCampaignModal from "../../modals/CreateCampaignModal"
import SecondaryButton from "../../base/SecondaryButton"
import Button from "../../base/Button"
import ZkPassportModal from "../../modals/ZkPassportModal"

import type { Campaign } from "../../../types"

export const CampaignCard = ({
  campaign: { title, description, icoToken, buyToken, rate },
  onParticipate,
}: {
  campaign: Campaign
  onParticipate: () => void
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-md">
      <h3 className="text-xl font-semibold text-gray-900 tracking-tight">{title}</h3>
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{description}</p>

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
        <Button className="w-full py-2 px-4" onClick={onParticipate}>
          Participate
        </Button>
      </div>
    </div>
  )
}

const Campaigns = () => {
  const [createCampaignModalVisible, setCreateCampaignModalVisible] = useState<boolean>(false)
  const { campaigns } = useCampaigns()
  const { participate, zkPassportCurrentUrl, resetZkPassportProof, isGeneratingZkPassportProof } =
    useParticipateToCampaign()

  return (
    <MainLayout>
      <div className="min-h-screen">
        <header className="flex justify-between items-center mb-5">
          <SecondaryButton Icon={Plus} onClick={() => setCreateCampaignModalVisible(true)}>
            <span>Create campaign</span>
          </SecondaryButton>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {campaigns.map((campaign, idx) => (
            <CampaignCard key={idx} campaign={campaign} onParticipate={() => participate(campaign)} />
          ))}
        </section>
      </div>

      <ZkPassportModal
        url={zkPassportCurrentUrl}
        onClose={resetZkPassportProof}
        isGeneratingProof={isGeneratingZkPassportProof}
      />
      <CreateCampaignModal visible={createCampaignModalVisible} onClose={() => setCreateCampaignModalVisible(false)} />
    </MainLayout>
  )
}

export default Campaigns
