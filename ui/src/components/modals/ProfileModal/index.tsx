import Modal from "../Modal"
import { useAppKit } from "@reown/appkit/react"
import { useAccount } from "wagmi"

import { copyToClipboard } from "../../../utils/clipboard"
import useWallet from "../../../hooks/use-wallet"
import { useAsset } from "../../../hooks/use-assets"
import settings from "../../../settings"

import Spinner from "../../base/Spinner"
import Button from "../../base/Button"

import type { ModalProps } from "../Modal"

interface ProfileModalProps extends ModalProps {}

const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose }) => {
  const { data: asset } = useAsset({
    address: settings.addresses.aztecBuyToken as `0x${string}`,
    decimals: settings.aztecBuyTokenDecimals,
    symbol: settings.aztecBuyTokenSymbol,
  })

  const { account, formattedAccount, isConnected: isAztecWalletConnected, connect } = useWallet()
  const { open } = useAppKit()
  const { address: evmAddress, isConnected: isEvmWalletConnected } = useAccount()

  return (
    <Modal visible={visible} title={"Profile"} onClose={onClose}>
      {!isEvmWalletConnected ? (
        <Button className="w-full mb-4 w-48" onClick={() => open()}>
          Connect EVM wallet
        </Button>
      ) : (
        <button
          className="text-center mb-4 bg-gray-100 h-10 w-48 hover:bg-gray-200 rounded-xl cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          onClick={() => copyToClipboard(evmAddress)}
          disabled={!isEvmWalletConnected}
        >
          <span className="font-mono text-xs text-gray-700 text-center">{`base:${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`}</span>
        </button>
      )}

      {!isAztecWalletConnected ? (
        <Button className="w-48" onClick={connect}>
          Connect Aztec wallet
        </Button>
      ) : (
        <button
          className="text-center bg-gray-100 h-10 w-48 hover:bg-gray-200 rounded-xl cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          onClick={() => copyToClipboard(account)}
          disabled={!isAztecWalletConnected}
        >
          <span className="font-mono text-xs text-gray-700">{`aztec:${formattedAccount}`}</span>
        </button>
      )}

      {isAztecWalletConnected && (
        <div className="mt-4">
          {asset ? (
            <span className="text-gray-700 font-bold">{asset.formattedBalanceWithSymbol}</span>
          ) : (
            <Spinner color="gray-700" />
          )}
        </div>
      )}
    </Modal>
  )
}

export default ProfileModal
