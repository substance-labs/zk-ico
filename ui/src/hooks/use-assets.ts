import { useCallback, useEffect, useRef } from "react"
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

/*const useAssets2 = () => {
  const [balances, setBalances] = useState<FormattedBalances[]>([])

  const refresh = useCallback(async () => {
    try {
      const aztecWallet = await getAztecWallet()

      if (userAddress) {
        const localBalances = await Promise.all(
          settings.assets.map(async (asset: Asset) => {
            const publicClient = createPublicClient({
              chain: asset.targetChain,
              transport: http(),
            })

            const targetBalance = await publicClient.readContract({
              address: settings.contractAddresses[asset.targetChain.id]!.vault as `0x${string}`,
              abi: vaultAbi,
              functionName: "amounts",
              args: [asset.targetAddress, userAddress],
            })

            return [sourceBalance, targetBalance]
          }),
        )

        setBalances(
          settings.assets.map((asset: Asset, index: number) => {
            const [sourceBalance, targetBalance] = localBalances[index]
            const offchainSourceAmount = BigNumber(sourceBalance).dividedBy(10 ** asset.sourceDecimals)
            const offchainTargetAmount = BigNumber(targetBalance).dividedBy(10 ** asset.targetDecimals)

            return {
              sourceBalance: offchainSourceAmount.toFixed(),
              targetBalance: offchainTargetAmount.toFixed(),
              formattedSourceBalance: formatAssetAmount(offchainSourceAmount, "", {
                decimals: 4,
                forceDecimals: true,
              }),
              formattedSourceBalanceWithSymbol: formatAssetAmount(offchainSourceAmount, asset.symbol, {
                decimals: 6,
                forceDecimals: true,
              }),
              formattedTargetBalance: formatAssetAmount(offchainTargetAmount, "", {
                decimals: 4,
                forceDecimals: true,
              }),
              formattedTargetBalanceWithSymbol: formatAssetAmount(offchainTargetAmount, asset.symbol, {
                decimals: 6,
                forceDecimals: true,
              }),
            }
          }),
        )
      } else {
        setBalances([])
      }
    } catch (_err) {
      console.error(_err)
    }
  }, [userAddress])

  useEffect(() => {
    refresh()
  }, [refresh])

  const assets = useMemo<Asset[]>(() => {
    return settings.assets.map((_asset, _index) => ({
      ..._asset,
      ...balances[_index],
    }))
  }, [balances])

  return {
    assets,
    refresh,
  }
}

export { useAssets }*/
