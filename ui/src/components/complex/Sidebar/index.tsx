import { BarChart3, X } from "lucide-react"
import { useLocation, useNavigate } from "react-router"

import { useAppStore } from "../../../store"

import SecondaryButton from "../../base/SecondaryButton"

const Sidebar = () => {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const closeSidebar = useAppStore((state) => state.closeSidebar)

  const { pathname } = useLocation()
  const navigate = useNavigate()

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

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-gray-200 flex justify-center">
            <span className="text-gray-600 text-sm">© Substance Labs 2025</span>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
