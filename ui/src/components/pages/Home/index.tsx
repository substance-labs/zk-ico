import { useCallback, useState } from "react"
import { getZkPassportProof } from "../../../utils/zkpassport"
import ZkPassportModal from "../../modals/ZkPassportModal"

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
    <>
      <div>
        Home
        <br />
        <button
          className="pt-1 pb-1 pl-2 pr-2 bg-gray-100 rounded-3xl text-md hover:bg-gray-200 text-gray-600 font-medium cursor-pointer"
          onClick={onGenerateProof}
        >
          generate zk passport proof
        </button>
      </div>
      <ZkPassportModal url={url} isGeneratingProof={isGeneratingProof} onClose={() => setUrl(null)} />
    </>
  )
}

export default Home
