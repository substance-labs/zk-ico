import {
  createPublicClient,
  encodeAbiParameters,
  encodePacked,
  hexToBytes,
  http,
  keccak256,
  padHex,
  zeroAddress,
} from "viem"
import { baseSepolia } from "viem/chains"
import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import BigNumber from "bignumber.js"
import { AztecAddress, Fr } from "@aztec/aztec.js"
import { TokenContract } from "@aztec/noir-contracts.js/Token"
import { poseidon2HashBytes } from "@aztec/foundation/crypto"

import { useAppStore } from "../store"
import zkIcoAbi from "../utils/abi/zkIco.json"
import zkIcoContractBytecode from "../utils/bytecodes/zkico.json"
import zkIcoTokenBytecode from "../utils/bytecodes/token.json"
// import { getZkPassportProof } from "../utils/zkpassport.js"
import settings from "../settings/index.js"
import { getAztecWallet, getPaymentMethod } from "../utils/aztec.js"
import { AztecGateway7683Contract } from "../utils/artifacts/AztecGateway7683/AztecGateway7683.js"
import { AZTEC_7683_CHAIN_ID, ORDER_DATA_TYPE, PRIVATE_ORDER_WITH_HOOK, PRIVATE_SENDER } from "../settings/constants.js"

import type { Campaign, CreateCampaign } from "../types.js"

const TOPIC = "0x60b9b0a19932bdb414abc97a985884150d3e16dae4b1e007681f0c0949bcde98"

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
      const zkIcoAddresses = result.map(({ address }: any) => address)
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
              buyTokenDecimals,
              icoTokenAddress,
              icoTokenName,
              icoTokenSymbol,
              icoTokenDecimals,
              rate,
            ],
            index,
          ) => ({
            zkIcoAddress: zkIcoAddresses[index],
            title,
            description,
            aztecBuyToken: {
              address: aztecBuyToken,
              symbol: buyTokenSymbol, // same symbol for now
              name: buyTokenName, // same name for now
              decimals: buyTokenDecimals,
            },
            buyToken: {
              name: buyTokenName,
              symbol: buyTokenSymbol,
              address: buyTokenAddress,
              decimals: buyTokenDecimals,
            },
            icoToken: {
              name: icoTokenName,
              symbol: icoTokenSymbol,
              address: icoTokenAddress,
              decimals: icoTokenDecimals,
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

  const participate = useCallback(async (campaign: Campaign, receiverAddress: string, amount: string) => {
    try {
      /*const [proofParams] = await getZkPassportProof({
        address: receiverAddress,
        scope: "hello",
        domain: "hello"
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
      })*/

      const onChainAmount = BigNumber(amount)
        .multipliedBy(10 ** 18)
        .toFixed()
      const gatewayAddress = AztecAddress.fromString(settings.addresses.aztecGateway)
      const aztecWallet = await getAztecWallet()
      const [token, aztecGateway] = await Promise.all([
        TokenContract.at(AztecAddress.fromString(campaign.aztecBuyToken.address), aztecWallet),
        AztecGateway7683Contract.at(gatewayAddress, aztecWallet),
      ])

      // TODO: use valid proof
      const depositCommitment = keccak256(
        encodeAbiParameters(
          [
            {
              type: "tuple",
              components: [
                { name: "vkeyHash", type: "bytes32" },
                { name: "proof", type: "bytes" },
                { name: "publicInputs", type: "bytes32[]" },
                { name: "committedInputs", type: "bytes" },
                { name: "committedInputCounts", type: "uint256[]" },
                { name: "validityPeriodInDays", type: "uint256" },
                { name: "domain", type: "string" },
                { name: "scope", type: "string" },
                { name: "devMode", type: "bool" },
              ],
            },
          ],
          [
            {
              vkeyHash: padHex("0x0"),
              proof: padHex("0x0"),
              publicInputs: [padHex("0x0")],
              committedInputs: padHex("0x0"),
              committedInputCounts: [0n],
              validityPeriodInDays: 0n,
              domain: "hello",
              scope: "hello",
              devMode: false,
            },
          ],
        ),
      )

      const fillDeadline = 2 ** 32 - 1
      const nonce = Fr.random()
      const orderData = encodePacked(
        [
          "bytes32",
          "bytes32",
          "bytes32",
          "bytes32",
          "uint256",
          "uint256",
          "uint256",
          "uint32",
          "uint32",
          "bytes32",
          "uint32",
          "uint8",
          "bytes32",
        ],
        [
          PRIVATE_SENDER,
          padHex(campaign.zkIcoAddress as `0x${string}`),
          campaign.aztecBuyToken.address as `0x${string}`,
          padHex(campaign.buyToken.address as `0x${string}`),
          BigInt(onChainAmount),
          BigInt(onChainAmount),
          nonce.toBigInt(),
          AZTEC_7683_CHAIN_ID,
          baseSepolia.id,
          padHex(settings.addresses.aztecGateway as `0x${string}`),
          fillDeadline,
          PRIVATE_ORDER_WITH_HOOK,
          depositCommitment,
        ],
      )

      const witness = await aztecWallet.createAuthWit({
        caller: gatewayAddress,
        action: token.methods.transfer_to_public(
          aztecWallet.getAddress(),
          gatewayAddress,
          BigInt(onChainAmount),
          nonce,
        ),
      })
      const receipt = await aztecGateway.methods
        .open_private({
          fill_deadline: fillDeadline,
          order_data: Array.from(hexToBytes(orderData)),
          order_data_type: Array.from(hexToBytes(ORDER_DATA_TYPE)),
        })
        .with({
          authWitnesses: [witness],
        })
        .send({
          fee: {
            paymentMethod: await getPaymentMethod(),
          },
        })
        .wait()

      const orderId = poseidon2HashBytes(Buffer.from(orderData.slice(2), "hex"))
      console.log(`order ${orderId} sent: ${receipt.txHash.toString()}`)

      // TODO: finalize
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
