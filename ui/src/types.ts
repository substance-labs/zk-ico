export interface Token {
  name: string
  symbol: string
  address: string
}

export interface Campaign {
  title: string
  description: string
  aztecBuyToken?: Token
  buyToken: Token
  icoToken: Token
  rate: string
}
