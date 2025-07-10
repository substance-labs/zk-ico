import { createBrowserRouter, Navigate, RouterProvider } from "react-router"
import { ToastContainer } from "react-toastify"
import { useEffect, useRef } from "react"

import { initPxe, registerAztecContracts } from "./utils/aztec"
import { useAsset } from "./hooks/use-assets"
import settings from "./settings"

import Campaigns from "./components/pages/Campaigns"
// import Home from "./components/pages/Home"

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

const App = () => {
  const initiated = useRef(false)

  const { startPolling } = useAsset({
    address: settings.addresses.aztecBuyToken as `0x${string}`,
    decimals: settings.aztecBuyTokenDecimals,
    symbol: settings.aztecBuyTokenSymbol,
  })

  useEffect(() => {
    const init = async () => {
      try {
        initiated.current = true
        await initPxe()
        await registerAztecContracts()
        startPolling()
      } catch (err) {
        console.error(err)
      }
    }

    if (!initiated.current) {
      init()
    }
  }, [])

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  )
}

export default App
