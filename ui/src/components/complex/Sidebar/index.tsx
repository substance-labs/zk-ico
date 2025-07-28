import { BarChart3, X } from "lucide-react"
import { useLocation, useNavigate } from "react-router"

import { useAsset } from "../../../hooks/use-assets"
import settings from "../../../settings"
import { useAppStore } from "../../../store"
import { copyToClipboard } from "../../../utils/clipboard"
import useWallet from "../../../hooks/use-wallet"

import SecondaryButton from "../../base/SecondaryButton"
import Spinner from "../../base/Spinner"
import Button from "../../base/Button"

const Sidebar = () => {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const closeSidebar = useAppStore((state) => state.closeSidebar)
  const { account, formattedAccount, isConnected, connect } = useWallet()

  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { data: asset } = useAsset({
    address: settings.addresses.aztecBuyToken as `0x${string}`,
    decimals: settings.aztecBuyTokenDecimals,
    symbol: settings.aztecBuyTokenSymbol,
  })

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

        <div className="space-y-8 flex-1 flex flex-col">
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

          <div className="mt-auto pt-4 border-t border-gray-200">
            {!isConnected ? (
              <Button className="py-2 w-full" onClick={connect}>
                Connect wallet
              </Button>
            ) : (
              <button
                className="flex items-center justify-between bg-gray-100 p-3 hover:bg-gray-200 rounded-xl cursor-pointer w-full disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                onClick={() => copyToClipboard(account)}
                disabled={!account}
              >
                <span className="font-mono text-xs text-gray-700">{formattedAccount}</span>
                {asset ? (
                  <span className="text-gray-700">{asset.formattedBalanceWithSymbol}</span>
                ) : (
                  <Spinner color="gray-700" />
                )}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
