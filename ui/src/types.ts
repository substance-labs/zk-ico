export interface Token {
  name: string
  symbol: string
  address: string
}

export interface Campaign {
  zkIcoAddress: string
  title: string
  description: string
  aztecBuyToken: Token
  buyToken: Token
  icoToken: Token
  rate: string
}

export interface CreateCampaign {
  aztecBuyTokenAddress: string
  buyTokenAddress: string
  icoToken: {
    name: string
    symbol: string
    totalSupply: string
  }
  icoTokenReceiver: string
  title: string
  description: string
  rate: string
}
