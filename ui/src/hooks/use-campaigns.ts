import { createPublicClient, http, zeroAddress } from "viem"
import { baseSepolia } from "viem/chains"
import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import BigNumber from "bignumber.js"

import { useAppStore } from "../store.js"
import zkIcoAbi from "../utils/abi/zkIco.json"
import zkIcoContractBytecode from "../utils/bytecodes/zkico.json"
import zkIcoTokenBytecode from "../utils/bytecodes/token.json"
import type { Campaign, CreateCampaign } from "../types.js"
import { getZkPassportProof } from "../utils/zkpassport.js"
import settings from "../settings/index.js"

const TOPIC = "0x531026765026b9af1528359f0fb0ffd560e49666995880799502227196c5d897"

interface UseCampaignsOptions {
  initialFetch?: boolean
}

export const useCampaigns = (options?: UseCampaignsOptions) => {
  const { initialFetch = true } = options ?? {}
  const { campaigns, setCampaigns } = useAppStore()

  const fetchCampaigns = useCallback(async () => {
    try {
      const etherscanApiKey = process.env.ETHERSCAN_API_KEY
      if (!etherscanApiKey) {
        throw new Error("Etherscan api key not configured. Please set ETHERSCAN_API_KEY in your environment variables.")
      }

      const {
        data: { result },
      } = await axios.get(
        `https://api.etherscan.io/v2/api?chainid=${baseSepolia.id}&module=logs&action=getLogs&topic0=${TOPIC}&apikey=${etherscanApiKey}`,
      )
      const zkIcoAddresses = result.map(({ address }: any) => address).slice(7) // FIXME remove first one as it's wrong.
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
          (
            [
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
            ],
            index,
          ) => ({
            address: zkIcoAddresses[index],
            title,
            description,
            aztecBuyToken,
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
    if (initialFetch) fetchCampaigns()
  }, [])

  return {
    fetch: fetchCampaigns,
    campaigns,
  }
}

export const useParticipateToCampaign = () => {
  const [zkPassportCurrentUrl, setCurrentZkPassportUrl] = useState<string | null>(null)
  const [isGeneratingZkPassportProof, setIsGeneratingZkPassportProof] = useState<boolean>(false)

  const participate = useCallback(async (campaign: Campaign) => {
    try {
      const [proofParams] = await getZkPassportProof({
        scope: "scope",
        onGeneratingProof: () => {
          setIsGeneratingZkPassportProof(true)
          console.log("generating proof ...")
        },
        onProofGenerated: () => {
          console.log("proof generated")
          setIsGeneratingZkPassportProof(false)
          setCurrentZkPassportUrl(null)
        },
        onRequestReceived: () => {
          console.log("request received. processing it")
        },
        onUrl: (zkPassportCurrentUrl: string) => {
          console.log("zk passport zkPassportCurrentUrl received")
          setCurrentZkPassportUrl(zkPassportCurrentUrl)
        },
      })
    } catch (err) {
      console.error(err)
    }
  }, [])

  return {
    fetch,
    isGeneratingZkPassportProof,
    participate,
    resetZkPassportProof: () => setCurrentZkPassportUrl(null),
    zkPassportCurrentUrl,
  }
}

export const useCreateCampaign = () => {
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const { fetch } = useCampaigns({ initialFetch: false })

  const create = useCallback(
    async (params: CreateCampaign) => {
      try {
        setIsCreating(true)
        const apiUrl = process.env.API_URL
        if (!apiUrl) {
          throw new Error("API URL not configured. Please set API_URL in your environment variables.")
        }

        const { data: zkIcoTokenData } = await axios.post(
          `${apiUrl}/api/deploy/contract`,
          {
            bytecode: zkIcoTokenBytecode.object,
            constructorArgs: [
              params.icoToken.name,
              params.icoToken.symbol.toUpperCase(),
              params.icoTokenReceiver,
              BigNumber(params.icoToken.totalSupply)
                .multipliedBy(10 ** 18)
                .toFixed(),
            ],
            networkId: baseSepolia.id,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        await axios.post(
          `${apiUrl}/api/deploy/contract`,
          {
            abi: zkIcoAbi,
            bytecode: zkIcoContractBytecode.object,
            constructorArgs: [
              settings.addresses.l2EvmGateway,
              params.aztecBuyTokenAddress,
              params.buyTokenAddress,
              zkIcoTokenData.contractAddress,
              zeroAddress, // verifier
              BigNumber(params.rate)
                .multipliedBy(10 ** 18)
                .toFixed(),
              params.title,
              params.description,
            ],
            networkId: baseSepolia.id,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        fetch()
      } catch (err) {
        throw err
      } finally {
        setIsCreating(false)
      }
    },
    [fetch],
  )

  return {
    create,
    isCreating,
  }
}
