import { createBrowserRouter, Navigate, RouterProvider } from "react-router"
import { ToastContainer } from "react-toastify"
import { WagmiProvider } from "wagmi"
import { baseSepolia, type AppKitNetwork } from "@reown/appkit/networks"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"

import { AztecWalletProvider } from "./contexts/AztecWalletContext"
import Campaigns from "./components/pages/Campaigns"
// import Home from "./components/pages/Home"

import { createAppKit } from "@reown/appkit/react"

const queryClient = new QueryClient()
const projectId = process.env.REOWN_PROJECT_ID
const metadata = {
  name: "ZkIco",
  description: "ZkIco Dapp",
  url: window.location.origin, // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
}

const networks = [baseSepolia] as [AppKitNetwork, ...AppKitNetwork[]]
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
})

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
})

const router = createBrowserRouter([
  {
    path: "/",
    element: <Campaigns />,
  },
])

const App = () => {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AztecWalletProvider>
          <RouterProvider router={router} />
          <ToastContainer />
        </AztecWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
