import { createPublicClient, encodeAbiParameters, hexToBytes, http, keccak256, padHex, zeroAddress } from "viem"
import { baseSepolia } from "viem/chains"
import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import BigNumber from "bignumber.js"
import { AztecAddress, createAztecNodeClient, Fr, TxHash } from "@aztec/aztec.js"
import { TokenContractArtifact } from "@aztec/noir-contracts.js/Token"
import { usePublicClient, useWalletClient } from "wagmi"
import { waitForTransactionReceipt } from "viem/actions"

import { useAppStore } from "../store"
import zkIcoAbi from "../utils/abi/zkIco.js"
import zkIcoTokenAbi from "../utils/abi/zkicoToken.js"
import l2Gateway7683Abi from "../utils/abi/l2Gateway7683.js"
import zkIcoContractBytecode from "../utils/bytecodes/zkico.js"
import zkIcoTokenBytecode from "../utils/bytecodes/token.js"
import { getZkPassportProof } from "../utils/zkpassport.js"
import settings from "../settings/index.js"
import { AztecGateway7683ContractArtifact } from "../utils/artifacts/AztecGateway7683/AztecGateway7683.js"
import { AZTEC_7683_CHAIN_ID, ORDER_DATA_TYPE, PRIVATE_ORDER_WITH_HOOK, PRIVATE_SENDER } from "../settings/constants.js"
import useAztecWallet from "./use-aztec-wallet.js"
import { sleep } from "../utils/sleep.js"
import { OrderData } from "../utils/OrderData.js"
import { getResolvedOrdersByLogs } from "../utils/aztec-gateway.js"
import { getAztecAddressFromAzguardAccount } from "../utils/account.js"

import type { Campaign, CreateCampaign } from "../types.js"

const TOPIC = "0x35a442bd130b461f57d26dc44a0cd8ac21c253665322e59848e33eb9cae1babc"

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
        details
          .map(
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
              id: index,
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
          )
          .reverse(),
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
    campaigns: campaigns,
  }
}

export const useParticipateToCampaign = () => {
  const [zkPassportCurrentUrl, setCurrentZkPassportUrl] = useState<string | null>(null)
  const [isGeneratingZkPassportProof, setIsGeneratingZkPassportProof] = useState<boolean>(false)
  const [isParticipatingInCampaignId, setIsParticipatingInCampaignId] = useState<number | null>(null)
  const { client: azguardClient, account: azguardAccount } = useAztecWallet()
  const { data: evmWalletClient } = useWalletClient({
    chainId: baseSepolia.id,
  })
  const evmPublicClient = usePublicClient({
    chainId: baseSepolia.id,
  })

  const participate = useCallback(
    async (campaign: Campaign, receiverAddress: string, amount: string) => {
      try {
        const [proofParams] = await getZkPassportProof({
          address: receiverAddress,
          scope: "hello",
          hostname: window.location.hostname,
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

        console.log(proofParams)

        setIsParticipatingInCampaignId(campaign.id)

        const onChainAmount = BigNumber(amount)
          .multipliedBy(10 ** 18)
          .toFixed()

        const proof = encodeAbiParameters(
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
          [proofParams as any],
        )
        const depositCommitment = keccak256(proof)

        const fillDeadline = 2 ** 32 - 1
        const nonce = Fr.random()

        const orderData = new OrderData({
          sender: PRIVATE_SENDER,
          recipient: padHex(campaign.zkIcoAddress as `0x${string}`),
          inputToken: campaign.aztecBuyToken.address as `0x${string}`,
          outputToken: padHex(campaign.buyToken.address as `0x${string}`),
          amountIn: BigInt(onChainAmount),
          amountOut: BigInt(onChainAmount),
          senderNonce: nonce.toBigInt(),
          originDomain: AZTEC_7683_CHAIN_ID,
          destinationDomain: baseSepolia.id,
          destinationSettler: padHex(settings.addresses.aztecGateway as `0x${string}`),
          fillDeadline,
          orderType: PRIVATE_ORDER_WITH_HOOK,
          data: depositCommitment,
        })

        if (campaign.aztecBuyToken.address !== settings.addresses.aztecBuyToken)
          throw new Error("Invalid aztec buy token")

        const response = await azguardClient.execute([
          {
            kind: "register_contract",
            chain: `aztec:11155111`,
            address: settings.addresses.aztecGateway,
            artifact: AztecGateway7683ContractArtifact,
          },
          {
            kind: "register_contract",
            chain: `aztec:11155111`,
            address: settings.addresses.aztecBuyToken,
            artifact: TokenContractArtifact,
          },
          {
            kind: "send_transaction",
            account: azguardAccount,
            actions: [
              {
                kind: "add_private_authwit",
                content: {
                  kind: "call",
                  caller: settings.addresses.aztecGateway,
                  contract: campaign.aztecBuyToken.address,
                  method: "transfer_to_public",
                  args: [
                    getAztecAddressFromAzguardAccount(azguardAccount),
                    settings.addresses.aztecGateway,
                    BigInt(onChainAmount),
                    nonce,
                  ],
                },
              },
              {
                kind: "call",
                contract: settings.addresses.aztecGateway,
                method: "open_private",
                args: [
                  {
                    fill_deadline: fillDeadline,
                    order_data: Array.from(hexToBytes(orderData.encode())),
                    order_data_type: Array.from(hexToBytes(ORDER_DATA_TYPE)),
                  },
                ],
              },
            ],
          },
        ])

        response.forEach((res) => {
          if (res.status === "failed") {
            throw new Error(res.error)
          }
        })

        let txHash = (response[2] as any).result
        console.log("transaction sent:", txHash)

        const aztecNode = await createAztecNodeClient(settings.aztecRpcUrl)

        let receipt
        while (true) {
          receipt = await aztecNode.getTxReceipt(TxHash.fromString(txHash))
          if (receipt.status === "success") break
          if (receipt.status === "pending") {
            await sleep(5000)
            continue
          }
          throw new Error("Aztec transaction failed")
        }

        const { logs } = await aztecNode.getPublicLogs({
          fromBlock: receipt.blockNumber - 1,
          toBlock: receipt.blockNumber + 1,
          contractAddress: AztecAddress.fromString(settings.addresses.aztecGateway),
        })
        // TODO: handle multiple orders in the same tx
        const [resolvedOrder] = getResolvedOrdersByLogs(logs)

        console.log(`detected order: ${resolvedOrder.orderId}`)

        // NOTE: wait for the filler to fill the order
        while (true) {
          const result = await evmPublicClient.readContract({
            address: settings.addresses.l2EvmGateway as `0x${string}`,
            abi: l2Gateway7683Abi,
            functionName: "filledOrders",
            args: [resolvedOrder.orderId],
          })
          if (result[0] !== "0x" && result[1] !== "0x") break
          await sleep(5000)
        }

        txHash = await evmWalletClient.writeContract({
          account: evmWalletClient.account,
          address: campaign.zkIcoAddress as `0x${string}`,
          functionName: "finalizeOrder",
          abi: zkIcoAbi,
          args: [Object.values(proofParams), evmWalletClient.account.address], // TODO: remove evmWalletClient.account.address when zkPassport proof will be verified
          chain: baseSepolia,
        })
        console.log("tx:", txHash)
        await waitForTransactionReceipt(evmPublicClient as never, { hash: txHash as `0x${string}` })
      } catch (err) {
        console.error(err)
      } finally {
        setIsParticipatingInCampaignId(null)
      }
    },
    [azguardClient, evmWalletClient, azguardAccount, evmPublicClient],
  )

  return {
    fetch,
    isGeneratingZkPassportProof,
    isParticipatingInCampaignId,
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
            abi: zkIcoTokenAbi,
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
