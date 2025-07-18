import {
  AccountWalletWithSecretKey,
  AztecAddress,
  createAztecNodeClient,
  Fr,
  getContractInstanceFromDeployParams,
  waitForPXE,
  type AztecNode,
  type PXE,
  type ContractInstanceWithAddress,
  SponsoredFeePaymentMethod,
} from "@aztec/aztec.js"
import { TokenContract, TokenContractArtifact } from "@aztec/noir-contracts.js/Token"
import { createPXEService, getPXEServiceConfig } from "@aztec/pxe/client/lazy"
import { createStore } from "@aztec/kv-store/indexeddb"
import { deriveSigningKey } from "@aztec/stdlib/keys"
import { getSchnorrAccount, SchnorrAccountContractArtifact } from "@aztec/accounts/schnorr"
import { Mutex } from "async-mutex"
import { SponsoredFPCContract } from "@aztec/noir-contracts.js/SponsoredFPC"

import { AztecGateway7683ContractArtifact } from "./artifacts/AztecGateway7683/AztecGateway7683"
import settings from "../settings"

export interface RegisterContractParams {
  artifact: any
}

let waitForInitPxeResolve: () => void
const waitForInitPxe = new Promise<void>((resolve) => {
  waitForInitPxeResolve = resolve
})

export const registerAztecContracts = async () => {
  const pxe = getPxe()

  await Promise.all([
    registerContract(AztecAddress.fromString(settings.addresses.aztecBuyToken), {
      artifact: TokenContractArtifact,
    }),
    registerContract(AztecAddress.fromString(settings.addresses.aztecGateway), {
      artifact: AztecGateway7683ContractArtifact,
    }),
    pxe.registerContract({
      instance: await getSponsoredFPCInstance(),
      artifact: SponsoredFPCContract.artifact,
    }),
    pxe.registerSender(AztecAddress.fromString("0x1046de5c4b2076a3e510a800efac69915e01e9ed671fb968fb10b672ffb725e7")), // FIXME
  ])
}

export const registerContract = async (address: AztecAddress, { artifact }: RegisterContractParams) => {
  const node = await getAztecNode()
  const pxe = await getPxe()

  const contractInstance = await node.getContract(address)
  await pxe.registerContract({
    instance: contractInstance!,
    artifact,
  })
}

export const getAztecNode = async (): Promise<AztecNode> => {
  return await createAztecNodeClient(settings.pxeUrl)
}

let pxe: PXE
export const initPxe = async () => {
  const node = await getAztecNode()
  const fullConfig = {
    ...getPXEServiceConfig(),
    l1Contracts: await node.getL1ContractAddresses(),
    proverEnabled: true,
  }
  const store = await createStore("pxe", {
    dataDirectory: "store",
    dataStoreMapSizeKB: 1e6,
  })
  pxe = await createPXEService(node, fullConfig, {
    store,
    useLogSuffix: true,
  })
  await waitForPXE(pxe)
  waitForInitPxeResolve()
}

export const getPxe = (): PXE => {
  return pxe
}

let accountRegistered = false
let wallet: AccountWalletWithSecretKey = null
let mutex = new Mutex()
export const getAztecWallet = async (): Promise<AccountWalletWithSecretKey> => {
  if (wallet) return wallet

  const release = await mutex.acquire()

  try {
    await waitForInitPxe
    const pxe = getPxe()

    // TODO: integrate wallet
    const getFrValueByKey = (key: string): Fr => {
      let str = localStorage.getItem(key)
      if (!str) {
        str = Fr.random().toString()
        localStorage.setItem(key, str as string)
      }
      return Fr.fromHexString(str)
    }

    const secretKey = getFrValueByKey("AZTEC_SECRET_KEY")
    const salt = getFrValueByKey("AZTEC_SALT")

    const signingKey = deriveSigningKey(secretKey)
    const account = await getSchnorrAccount(pxe, secretKey, signingKey, salt)
    if (!Boolean(localStorage.getItem("DEPLOYED"))) {
      await account.deploy({ fee: { paymentMethod: await getPaymentMethod() } }).wait()
      localStorage.setItem("DEPLOYED", "true")
    }

    wallet = await account.getWallet()

    if (!accountRegistered) {
      await pxe.registerAccount(secretKey, (await account.getCompleteAddress()).partialAddress)
      await pxe.registerContract({
        instance: account.getInstance(),
        artifact: SchnorrAccountContractArtifact,
      })
      accountRegistered = true
    }
  } catch (err) {
    throw err
  } finally {
    release()
  }

  return wallet
}

export type ParsedFilledLog = {
  orderId: `0x${string}`
  fillerData: `0x${string}`
  originData: `0x${string}`
}

const SPONSORED_FPC_SALT = new Fr(0)

export async function getSponsoredFPCInstance(): Promise<ContractInstanceWithAddress> {
  return await getContractInstanceFromDeployParams(SponsoredFPCContract.artifact, {
    salt: SPONSORED_FPC_SALT,
  })
}

export async function getSponsoredFPCAddress() {
  return (await getSponsoredFPCInstance()).address
}

export async function getDeployedSponsoredFPCAddress(pxe: PXE) {
  const fpc = await getSponsoredFPCAddress()
  const contracts = await pxe.getContracts()
  if (!contracts.find((c) => c.equals(fpc))) {
    throw new Error("SponsoredFPC not deployed.")
  }
  return fpc
}

export const getPaymentMethod = async () => new SponsoredFeePaymentMethod(await getSponsoredFPCAddress())

export const parseFilledLog = (log: any): ParsedFilledLog => {
  let orderId = log[0].toString()
  let fillerData = log[11].toString()
  const residualBytes = log[12].toString()
  const originData = ("0x" +
    log[1].toString().slice(4) +
    residualBytes.slice(6, 8) +
    log[2].toString().slice(4) +
    residualBytes.slice(8, 10) +
    log[3].toString().slice(4) +
    residualBytes.slice(10, 12) +
    log[4].toString().slice(4) +
    residualBytes.slice(12, 14) +
    log[5].toString().slice(4) +
    residualBytes.slice(14, 16) +
    log[6].toString().slice(4) +
    residualBytes.slice(16, 18) +
    log[7].toString().slice(4) +
    residualBytes.slice(18, 20) +
    log[8].toString().slice(4) +
    residualBytes.slice(20, 22) +
    log[9].toString().slice(4) +
    residualBytes.slice(22, 24) +
    log[10].toString().slice(4, 30)) as `0x${string}`

  orderId = "0x" + orderId.slice(4) + residualBytes.slice(4, 6)
  fillerData = "0x" + fillerData.slice(4) + residualBytes.slice(24, 26)

  return {
    orderId,
    fillerData,
    originData,
  }
}
