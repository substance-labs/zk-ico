import { useCallback, useEffect, useRef } from "react"
import BigNumber from "bignumber.js"

import { useAppStore } from "../store"
import { formatAssetAmount } from "../utils/amount"
import useWallet from "./use-wallet"

import type { SimulateViewsResult } from "@azguardwallet/types"

interface UseAssetOptions {
  address: `0x${string}`
  decimals: number
  symbol: string
}

const useAsset = ({ address, decimals, symbol }: UseAssetOptions) => {
  const { assets, updateAsset } = useAppStore()
  const timeout = useRef(null)
  const { client, isConnected } = useWallet()

  const fetch = useCallback(async () => {
    try {
      if (!isConnected) return

      const response = await client.execute([
        {
          kind: "register_token",
          address: address,
          account: client.accounts[0],
        },
        {
          kind: "simulate_views",
          account: client.accounts[0],
          calls: [
            {
              kind: "call",
              contract: address,
              method: "balance_of_private",
              args: [client.accounts[0].split(":").at(-1)],
            },
          ],
        },
      ])

      response.forEach((res) => {
        if (res.status === "failed") {
          throw new Error(res.error)
        }
      })

      const encoded = ((response.at(1) as any).result as SimulateViewsResult).encoded[0][0]
      const balance = BigInt(encoded)
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
            decimals: 5,
            forceDecimals: true,
          }),
        },
      })
    } catch (err) {
      console.error(err)
    }
  }, [address, isConnected, client])

  const startPolling = useCallback(() => {
    if (timeout.current) return
    fetch()
    timeout.current = setInterval(() => {
      fetch()
    }, 30000)
  }, [address, fetch])

  useEffect(() => {
    if (isConnected) startPolling()
  }, [isConnected, startPolling])

  return {
    data: assets[address.toLowerCase()],
    fetch,
    startPolling,
  }
}

export { useAsset }
