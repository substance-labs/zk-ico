import { createPublicClient, http } from "viem"
import { baseSepolia } from "viem/chains"
import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import BigNumber from "bignumber.js"

import { useAppStore } from "../store.js"
import zkIcoAbi from "../utils/abi/zkico.json"
import zkIcoContractBytecode from "../utils/bytecodes/zkico.json"
import zkIcoTokenBytecode from "../utils/bytecodes/token.json"
import type { Campaign, CreateCampaign } from "../types.js"
import { getZkPassportProof } from "../utils/zkpassport.js"
import { useDeployContract } from "./use-deploy.js"

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
      console.log("zkIcoAddresses", zkIcoAddresses)
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

  return {
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
    participate,
    isGeneratingZkPassportProof,
    resetZkPassportProof: () => setCurrentZkPassportUrl(null),
    zkPassportCurrentUrl,
  }
}

export const useCreateCampaign = () => {
  const { deployContract, isDeploying, deploymentResult, resetDeployment } = useDeployContract()
  const create = useCallback(async (params: CreateCampaign) => {
    try {
      // deploy the the ICO token
      const {name: tokenName, symbol: tokenSymbol} = params.icoToken
      if (!tokenName || !tokenSymbol) {
        throw new Error("ICO token name and symbol are required")
      }
      
      const tokenAmount = '1000000000000000000'
      const mintToAddress = process.env.VITE_MINT_TO_ADDRESS
      
      if (!mintToAddress) {
        throw new Error("Mint to address not configured. Please set VITE_MINT_TO_ADDRESS in your environment variables.")
      }
      
      const tokenDeploymentResult = await deployContract({
        bytecode: zkIcoTokenBytecode.object,
        constructorArgs: [tokenName, tokenSymbol, mintToAddress, tokenAmount],
        networkId: baseSepolia.id,
      })
      resetDeployment()
      const zkIcoDeploymentResult = await deployContract({
        bytecode: zkIcoContractBytecode.object,
        constructorArgs: [
          params.gateway,
          params.aztecBuyTokenAddress,
          params.buyTokenAddress,
          tokenDeploymentResult.contractAddress,
          params.verifier,
          params.rate,
          params.title,
          params.description
        ],
        networkId: baseSepolia.id,
      })
      return [tokenDeploymentResult, zkIcoDeploymentResult]
      
      // deploy the zkICO contract with the provided parameters
    } catch (err) {
      console.error(err)
    }
  }, [])

  return {
    create,
  }
}
