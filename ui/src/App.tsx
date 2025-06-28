import { createBrowserRouter, Navigate, RouterProvider } from "react-router"
import { ToastContainer } from "react-toastify"

import Campaigns from "./components/pages/Campaigns"
import { useEffect } from "react"
import { initPxe, registerAztecContracts } from "./utils/aztec"
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
  useEffect(() => {
    const init = async () => {
      try {
        await initPxe()
        await registerAztecContracts()
      } catch (err) {
        console.error(err)
      }
    }

    init()
  }, [])

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  )
}

export default App
