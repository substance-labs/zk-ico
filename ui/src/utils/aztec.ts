import {
  AccountWalletWithSecretKey,
  AztecAddress,
  createAztecNodeClient,
  Fr,
  waitForPXE,
  type AztecNode,
  type PXE,
} from "@aztec/aztec.js"
import { TokenContractArtifact } from "@aztec/noir-contracts.js/Token"
import { createPXEService, getPXEServiceConfig } from "@aztec/pxe/client/lazy"
import { createStore } from "@aztec/kv-store/indexeddb"
import { deriveSigningKey } from "@aztec/stdlib/keys"
import { getSchnorrAccount, SchnorrAccountContractArtifact } from "@aztec/accounts/schnorr"

import { AztecGateway7683ContractArtifact } from "./artifacts/AztecGateway7683/AztecGateway7683"
import { AZTEC_7683_CHAIN_ID } from "../settings/constants"
import settings from "../settings"

export interface RegisterContractParams {
  wallet: AccountWalletWithSecretKey
  artifact: any
}

export const registerAztecContracts = async () => {
  console.log("registering aztec contracts ...")
  const wallet = await getAztecWallet()
  const pxe = await getPxe()
  await Promise.all([
    registerContract(AztecAddress.fromString(settings.addresses.aztecBuyToken), {
      wallet,
      artifact: TokenContractArtifact,
    }),
    registerContract(AztecAddress.fromString(settings.addresses.aztecGateway), {
      wallet,
      artifact: AztecGateway7683ContractArtifact,
    }),
    pxe.registerSender(AztecAddress.fromString(settings.addresses.aztecGateway)),
  ])
}

export const registerContract = async (address: AztecAddress, { wallet, artifact }: RegisterContractParams) => {
  const node = await getAztecNode()
  const contractInstance = await node.getContract(address)
  await wallet.registerContract({
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
  const store = await createStore("filler-pxe", {
    dataDirectory: "store",
    dataStoreMapSizeKB: 1e6,
  })
  pxe = await createPXEService(node, fullConfig, {
    store,
    useLogSuffix: true,
  })
  await waitForPXE(pxe)
}

export const getPxe = (): PXE => {
  return pxe
}

let accountRegistered = false
export const getAztecWallet = async (): Promise<AccountWalletWithSecretKey> => {
  const pxe = getPxe()

  // TODO: integrate wallet
  let secretKeyStr = localStorage.getItem("AZTEC_SECRET_KEY")
  if (!secretKeyStr) {
    secretKeyStr = Fr.random().toString()
    localStorage.setItem("AZTEC_SECRET_KEY", secretKeyStr as string)
  }
  const secretKey = Fr.fromHexString(secretKeyStr)

  let saltStr = localStorage.getItem("AZTEC_SALT")
  if (!saltStr) {
    saltStr = Fr.random().toString()
    localStorage.setItem("AZTEC_SALT", saltStr as string)
  }
  const salt = Fr.fromHexString(secretKeyStr)

  const signingKey = deriveSigningKey(secretKey)
  const account = await getSchnorrAccount(pxe, secretKey, signingKey, salt)
  const wallet = await account.getWallet()

  if (!accountRegistered) {
    await pxe.registerAccount(secretKey, (await account.getCompleteAddress()).partialAddress)
    await pxe.registerContract({
      instance: account.getInstance(),
      artifact: SchnorrAccountContractArtifact,
    })
    accountRegistered = true
  }

  return wallet
}

export type ParsedFilledLog = {
  orderId: `0x${string}`
  fillerData: `0x${string}`
  originData: `0x${string}`
}
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
