import { useContext } from "react"
import { WalletContext } from "../contexts/WalletContext"

const useAztecWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useAztecWallet must be used within a WalletProvider")
  }
  return context
}

export default useAztecWallet
