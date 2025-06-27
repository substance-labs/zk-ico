import { Menu } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { ArrowDown } from "lucide-react"
import type { FC } from "react"

import { useAppStore } from "../../../store"

const CustomConnectButton: FC = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
        chainModalOpen,
      }: any) => {
        const ready = mounted && authenticationStatus !== "loading"
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated")

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="pt-2 pb-2 pl-4 pr-4  bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-lg"
                  >
                    Connect
                  </button>
                )
              }

              return (
                <div className="flex justify-between items-center">
                  {!chain.unsupported && (
                    <button
                      onClick={openChainModal}
                      className="flex justify-between items-center bg-gray-100 hover:bg-gray-200 pt-1 pb-1 pl-2 pr-2 rounded-2xl ml-1 mr-2 cursor-pointer"
                      type="button"
                    >
                      {chain.hasIcon && (
                        <div className="flex items-center space-x-1 w-6 h-6">
                          {chain.iconUrl && (
                            <img
                              className="rounded-full w-6 h-6"
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                            />
                          )}
                          <ArrowDown
                            className={`h-4 w-4 transform transition-transform duration-200 ${
                              chainModalOpen ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      )}
                    </button>
                  )}
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="pt-1 pb-1 pl-2 pr-2 bg-gray-100 rounded-3xl text-md hover:bg-gray-200 text-gray-600 font-medium cursor-pointer"
                  >
                    {account.displayName}
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

const Header = () => {
  const { openSidebar } = useAppStore()

  return (
    <header className="border-b border-gray-200 px-4 py-4 bg-white/80 flex">
      <button className="md:hidden text-gray-400 p-2" onClick={() => openSidebar()}>
        <Menu className="w-5 h-5" />
      </button>
      <div className="w-full flex justify-end">
        <CustomConnectButton />
      </div>
    </header>
  )
}

export default Header
