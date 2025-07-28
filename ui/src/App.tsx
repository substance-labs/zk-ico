import { createBrowserRouter, Navigate, RouterProvider } from "react-router"
import { ToastContainer } from "react-toastify"

import { WalletProvider } from "./contexts/WalletContext"

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
  return (
    <WalletProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </WalletProvider>
  )
}

export default App
