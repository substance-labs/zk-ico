import { useCallback, useState } from "react"

import { getZkPassportProof } from "../../../utils/zkpassport"

import ZkPassportModal from "../../modals/ZkPassportModal"
import MainLayout from "../../layouts/MainLayout"
import Button from "../../base/Button"

const Home = () => {
  // EXAMPLE
  const [url, setUrl] = useState<string | null>(null)
  const [isGeneratingProof, setIsGeneratingProof] = useState<boolean>(false)

  const onGenerateProof = useCallback(async () => {
    try {
      const [proofParams] = await getZkPassportProof({
        scope: "scope",
        onGeneratingProof: () => {
          setIsGeneratingProof(true)
          console.log("generating proof ...")
        },
        onProofGenerated: () => {
          console.log("proof generated")
          setIsGeneratingProof(false)
          setUrl(null)
        },
        onRequestReceived: () => {
          console.log("request received. processing it")
        },
        onUrl: (url: string) => {
          console.log("zk passport url received")
          setUrl(url)
        },
      })

      console.log(proofParams)
    } catch (err) {
      console.error(err)
    }
  }, [])

  return (
    <MainLayout>
      <div>
        <Button onClick={onGenerateProof}>generate zk passport proof</Button>
      </div>
      <ZkPassportModal url={url} isGeneratingProof={isGeneratingProof} onClose={() => setUrl(null)} />
    </MainLayout>
  )
}

export default Home
