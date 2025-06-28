import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { createConfig, http, WagmiProvider } from "wagmi"
import { baseSepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, Navigate, RouterProvider } from "react-router"
import { ToastContainer } from "react-toastify"

import Campaigns from "./components/pages/Campaigns"
// import Home from "./components/pages/Home"

import "./index.css"

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/campaigns" replace />,
  },
  {
    path: "/campaigns",
    element: <Campaigns />,
  },
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <RouterProvider router={router} />
          <ToastContainer />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
