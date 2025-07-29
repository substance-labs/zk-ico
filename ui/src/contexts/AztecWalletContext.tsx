import { createContext } from "react"
import { useState, useCallback } from "react"
import { AzguardClient } from "@azguardwallet/client"

import type { ReactNode } from "react"

type WalletContextType = {
  isConnected: boolean
  client: AzguardClient | null
  connect: () => Promise<void>
  account: `aztec:${number}:${string}` | null
  formattedAccount: string
}

export const AztecWalletContext = createContext<WalletContextType | undefined>(undefined)

export const AztecWalletProvider = ({ children }: { children: ReactNode }) => {
  const [selectedAccount, setSelectedAccount] = useState<`aztec:${number}:${string}` | null>(null)
  const [client, setClient] = useState<AzguardClient | null>(null)

  const connect = useCallback(async () => {
    try {
      const azguard = await AzguardClient.create()
      await azguard.connect({ name: "ZkIco" }, [
        {
          chains: [`aztec:11155111`],
          methods: [
            "simulate_transaction",
            "call",
            "send_transaction",
            "register_contract",
            "register_sender",
            "register_token",
            "simulate_views",
            "add_private_authwit",
          ],
        },
      ])

      azguard.onDisconnected.addHandler(() => {
        setSelectedAccount(null)
      })

      azguard.onAccountsChanged.addHandler((accounts) => {
        // setSelectedAccount(accounts[0])
      })

      setSelectedAccount(azguard.accounts[0])
      setClient(azguard)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const formattedAccount = selectedAccount
    ? `${selectedAccount.split(":").at(-1)!.slice(0, 6)}…${selectedAccount.split(":").at(-1)!.slice(-6)}`
    : ""

  return (
    <AztecWalletContext.Provider
      value={{ isConnected: !!client, client, connect, account: selectedAccount, formattedAccount }}
    >
      {children}
    </AztecWalletContext.Provider>
  )
}
