import { useCallback, useRef } from "react"
import { AztecAddress, Contract } from "@aztec/aztec.js"
import { TokenContractArtifact } from "@aztec/noir-contracts.js/Token"
import BigNumber from "bignumber.js"

import { getAztecWallet } from "../utils/aztec"
import { useAppStore } from "../store"
import { formatAssetAmount } from "../utils/amount"

interface UseAssetOptions {
  address: `0x${string}`
  decimals: number
  symbol: string
}

const useAsset = ({ address, decimals, symbol }: UseAssetOptions) => {
  const { assets, updateAsset } = useAppStore()
  const timeout = useRef(null)

  const fetch = useCallback(async () => {
    try {
      const aztecWallet = await getAztecWallet()
      const token = await Contract.at(AztecAddress.fromString(address), TokenContractArtifact, aztecWallet)
      const balance: bigint = await token.methods.balance_of_private(aztecWallet.getAddress()).simulate()
      const offchainBalance = BigNumber(balance).dividedBy(10 ** decimals)

      updateAsset({
        [address.toLowerCase()]: {
          address,
          decimals,
          symbol,
          balance,
          offchainBalance: offchainBalance.toFixed(),
          formattedBalance: formatAssetAmount(offchainBalance, "", {
            decimals: 4,
            forceDecimals: true,
          }),
          formattedBalanceWithSymbol: formatAssetAmount(offchainBalance, symbol, {
            decimals: 6,
            forceDecimals: true,
          }),
        },
      })
    } catch (err) {
      console.error(err)
    }
  }, [address])

  const startPolling = useCallback(() => {
    if (timeout.current) return
    fetch()
    timeout.current = setTimeout(() => {
      fetch()
    }, 30000)
  }, [address, fetch])

  return {
    data: assets[address.toLowerCase()],
    fetch,
    startPolling,
  }
}

export { useAsset }
