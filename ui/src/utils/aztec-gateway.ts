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
