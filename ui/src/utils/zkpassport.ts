import { ZKPassport } from "@zkpassport/sdk"

import type { SolidityVerifierParameters } from "@zkpassport/sdk"

export type GetZkPassportProofParams = {
  address: string
  domain: string
  onGeneratingProof?: () => void
  onProofGenerated?: (proof: unknown) => void
  onRequestReceived?: () => void
  onUrl: (url: string) => void
  scope: string
}

export const getZkPassportProof = async ({
  address,
  domain,
  onGeneratingProof: _onGeneratingProof,
  onProofGenerated: _onProofGenerated,
  onRequestReceived: _onRequestReceived,
  onUrl,
  scope,
}: GetZkPassportProofParams): Promise<[SolidityVerifierParameters, unknown]> => {
  const zkPassport = new ZKPassport(domain)

  const queryBuilder = await zkPassport.request({
    name: "Zk ICO",
    logo: "https://zkpassport.id/logo.png",
    purpose: "You must be at least 18 years old and not coming from North Korea",
    scope,
    devMode: true,
    mode: "compressed-evm",
  })

  const { url, onRequestReceived, onGeneratingProof, onProofGenerated, onResult, onReject } = queryBuilder.done()

  queryBuilder.out("nationality", ["North Korea"])
  queryBuilder.gte("age", 18)
  queryBuilder.bind("user_address", address)
  queryBuilder.done()

  if (onUrl) onUrl(url)
  if (_onRequestReceived) onRequestReceived(_onRequestReceived)
  if (_onGeneratingProof) onGeneratingProof(_onGeneratingProof)

  const waitProofGenerated = () =>
    new Promise<SolidityVerifierParameters>((resolve) => {
      onProofGenerated(async (proof) => {
        _onProofGenerated?.(proof)
        const verifierParams = await zkPassport.getSolidityVerifierParameters({
          proof,
          devMode: true,
          scope,
        })
        resolve(verifierParams)
      })
    })

  const waitResult = () =>
    new Promise<unknown>((resolve) => {
      onResult(resolve)
    })

  const waitReject = () =>
    new Promise<never>((_, reject) => {
      onReject(reject)
    })

  return Promise.race([Promise.all([waitProofGenerated(), waitResult()]), waitReject()])
}
