export interface Token {
  name: string
  symbol: string
  address: string
}

export interface Campaign {
  address: string
  title: string
  description: string
  aztecBuyToken?: Token
  buyToken: Token
  icoToken: Token
  rate: string
}

export interface CreateCampaign {
  gateway: string
  verifier: string
  aztecBuyTokenAddress: string
  buyTokenAddress: string
  icoToken: {
    name: string
    symbol: string
  }
  title: string
  description: string
  rate: string
}
