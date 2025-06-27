import { useState } from "react"
import { Plus } from "lucide-react"

import MainLayout from "../../layouts/MainLayout"
import CreateCampaignModal from "../../modals/CreateCampaignModal"
import SecondaryButton from "../../base/SecondaryButton"

const Campaigns = () => {
  const [createCampaignModalVisible, setCreateCampaignModalVisible] = useState<boolean>(false)

  return (
    <MainLayout>
      <div className="min-h-screen">
        <header className="flex justify-between items-center mb-10">
          <SecondaryButton Icon={Plus} onClick={() => setCreateCampaignModalVisible(true)}>
            <span>Create campaign</span>
          </SecondaryButton>
        </header>
      </div>
      <CreateCampaignModal visible={createCampaignModalVisible} onClose={() => setCreateCampaignModalVisible(false)} />
    </MainLayout>
  )
}

export default Campaigns
