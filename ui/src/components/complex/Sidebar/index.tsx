import { BarChart3, Info, X } from "lucide-react"
import { useLocation, useNavigate } from "react-router"
import { useCallback, useState } from "react"
import { toast } from "react-toastify"
import BigNumber from "bignumber.js"

import { useAppStore } from "../../../store"
import useAztecWallet from "../../../hooks/use-aztec-wallet"

import SecondaryButton from "../../base/SecondaryButton"
import FaucetRegisterToast from "../FaucetRegisterToast"
import { getAztecAddressFromAzguardAccount } from "../../../utils/account"
import settings from "../../../settings"

const Sidebar = () => {
  const [isUsingFaucet, setIsUsingFaucet] = useState<boolean>(false)
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const closeSidebar = useAppStore((state) => state.closeSidebar)
  const { isConnected: isAztecWalletConnected, account: aztecAccount, client: aztecWalletClient } = useAztecWallet()

  const { pathname } = useLocation()
  const navigate = useNavigate()

  const onRegisterSender = useCallback(
    async (senderAddress: string) => {
      try {
        const [response] = await aztecWalletClient.execute([
          {
            kind: "register_sender",
            chain: "aztec:11155111",
            address: senderAddress,
          },
        ])
        if (response.status === "failed") {
          throw new Error(response.error)
        }
      } catch (err) {
        console.error(err)
      }
    },
    [aztecWalletClient],
  )

  const onFaucet = useCallback(async () => {
    try {
      setIsUsingFaucet(true)
      const res = await fetch(`${settings.aztecTokenFaucetUrl}/request-tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverAddress: getAztecAddressFromAzguardAccount(aztecAccount),
          amount: BigNumber("0.01")
            .multipliedBy(10 ** settings.aztecBuyTokenDecimals)
            .toFixed(),
          mode: "private",
          tokenAddress: settings.addresses.aztecBuyToken,
        }),
      })

      if (!res.ok) {
        const errorBody = await res.text()
        throw new Error(`Request failed: ${res.status} ${res.statusText} - ${errorBody}`)
      }
      const { senderAddress } = await res.json()
      console.log("senderAddress:", senderAddress)
      toast.success(
        <FaucetRegisterToast
          senderAddress={senderAddress}
          sourceAssetSymbol={settings.aztecBuyTokenSymbol}
          onRegisterSender={onRegisterSender}
        />,
        {
          autoClose: false,
          closeOnClick: false,
        },
      )
    } catch (err) {
      console.error(err)
    } finally {
      setIsUsingFaucet(false)
    }
  }, [aztecAccount, onRegisterSender])

  return (
    <>
      <div
        className={`fixed inset-0 bg-white/80 z-40 md:hidden transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />

      <aside
        className={`
          fixed z-50
          md:static top-0 left-0
          w-64 min-h-screen
          bg-white/80
          border-r border-gray-200
          backdrop-blur-md
          px-4 py-6 flex flex-col
          transform transition-transform duration-300 ease-in-out
          shadow-sm
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🪙</div>
            <div className="text-xl font-semibold text-gray-600 tracking-tight">ZK ICO</div>
          </div>
          <button onClick={closeSidebar} className="text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between space-y-8">
          {/* Top section: Logo + Nav */}
          <div>
            {/* Logo for desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-2xl">🪙</div>
              <div className="text-xl font-semibold text-gray-600 tracking-tight">ZK ICO</div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col space-y-2 mt-6">
              {[{ to: "/campaigns", icon: BarChart3, label: "Campaigns" }].map(({ to, icon: Icon, label }) => {
                const isActive = pathname === to
                return (
                  <SecondaryButton
                    key={to}
                    onClick={() => {
                      navigate(to)
                      closeSidebar()
                    }}
                    Icon={Icon}
                    withBackground={isActive}
                  >
                    <span className="text-sm text-gray-600">{label}</span>
                  </SecondaryButton>
                )
              })}
            </nav>
          </div>

          {/* Bottom section: Faucet + Footer */}
          <div className="space-y-4">
            {/* Faucet */}
            {isAztecWalletConnected && (
              <div className="mb-4">
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-sm p-4 rounded-lg">
                  {isUsingFaucet ? (
                    <span>
                      You have requested 0.01 <b>WETH</b>! Be patient, this operation can take a couple of minutes ...
                    </span>
                  ) : (
                    <>
                      <Info size={24} className="mt-0.5 text-blue-500" />
                      <span>
                        If you need <b>WETH</b> on Aztec, click&nbsp;
                        <button
                          disabled={isUsingFaucet}
                          onClick={onFaucet}
                          className="font-semibold underline hover:text-blue-600 transition cursor-pointer disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                        >
                          here
                        </button>
                        &nbsp;to request 0.01 <b>WETH</b> from the faucet.
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-gray-200 flex justify-center">
              <span className="text-gray-600 text-sm">© Substance Labs 2025</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
