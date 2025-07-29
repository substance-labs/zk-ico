export interface Token {
  name: string
  symbol: string
  address: string
  decimals: number
}

export interface Campaign {
  id: number
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

export interface Asset {
  address: string
  decimals: number
  symbol: string
  balance: string | number | bigint
  offchainBalance: string
  formattedBalance: string
  formattedBalanceWithSymbol: string
}
