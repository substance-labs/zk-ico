import { createPublicClient, http } from "viem"
import { baseSepolia } from "viem/chains"
import { useCallback, useEffect } from "react"
import axios from "axios"
import BigNumber from "bignumber.js"

import { useAppStore } from "../store.js"
import zkIcoAbi from "../utils/abi/zkico.json"

const TOPIC = "0x531026765026b9af1528359f0fb0ffd560e49666995880799502227196c5d897"

export const useCampaigns = () => {
  const { campaigns, setCampaigns } = useAppStore()

  const fetchCampaigns = useCallback(async () => {
    try {
      const {
        data: { result },
      } = await axios.get(
        `https://api.etherscan.io/v2/api?chainid=${baseSepolia.id}&module=logs&action=getLogs&topic0=${TOPIC}&apikey=${process.env.ETHERSCAN_API_KEY}`,
      )
      const zkIcoAddresses = result.map(({ address }: any) => address).slice(3) // FIXME remove first one as it's wrong.

      const client = createPublicClient({
        chain: baseSepolia,
        transport: http(),
      })

      const details = await Promise.all(
        zkIcoAddresses.map((address) =>
          client.readContract({
            address,
            abi: zkIcoAbi,
            functionName: "getDetails",
            args: [],
          }),
        ),
      )

      setCampaigns(
        details.map(
          ([
            title,
            description,
            aztecBuyToken,
            buyTokenAddress,
            buyTokenName,
            buyTokenSymbol,
            icoTokenAddress,
            icoTokenName,
            icoTokenSymbol,
            rate,
          ]) => ({
            title,
            description,
            buyToken: {
              name: buyTokenName,
              symbol: buyTokenSymbol,
              address: buyTokenAddress,
            },
            icoToken: {
              name: icoTokenName,
              symbol: icoTokenSymbol,
              address: icoTokenAddress,
            },
            rate: BigNumber(rate)
              .dividedBy(10 ** 18)
              .toFixed(),
          }),
        ),
      )
    } catch (err) {
      console.error(err)
    }
  }, [campaigns])

  useEffect(() => {
    fetchCampaigns()
  }, [])

  return { campaigns, fetchCampaigns }
}
