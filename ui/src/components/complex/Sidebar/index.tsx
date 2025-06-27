import { Home, BarChart3, X } from "lucide-react"
import { useLocation, useNavigate } from "react-router"

import { useAppStore } from "../../../store"

const selectSidebarOpen = (state) => state.sidebarOpen
const selectCloseSidebar = (state) => state.closeSidebar

const Sidebar = () => {
  const sidebarOpen = useAppStore(selectSidebarOpen)
  const closeSidebar = useAppStore(selectCloseSidebar)

  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <>
      <div
        className={`fixed inset-0 bg-white/80 z-40 md:hidden transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => closeSidebar()}
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
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <div className="flex items-center justify-between md:hidden mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🪙</div>
            <div className="text-xl font-semibold text-gray-600 tracking-tight">ZK ICO</div>
          </div>
          <button onClick={() => closeSidebar()} className="text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-8">
          <div className="hidden md:flex items-center space-x-3">
            <div className="text-2xl">🪙</div>
            <div className="text-xl font-semibold text-gray-600 tracking-tight">ZK ICO</div>
          </div>

          <nav className="flex flex-col space-y-2 mt-6">
            {[
              { to: "/", icon: Home, label: "Home" },
              { to: "/campaigns", icon: BarChart3, label: "Campaigns" },
            ].map(({ to, icon: Icon, label }) => {
              const isActive = pathname === to
              return (
                <button
                  key={to}
                  onClick={() => {
                    navigate(to)
                    closeSidebar()
                  }}
                  className={`
                    group flex items-center space-x-3 py-2
                    rounded-xl
                    ${isActive ? "bg-purple-100" : "hover:bg-purple-50"}
                    transition-colors duration-150
                    cursor-pointer
                  `}
                >
                  <Icon
                    className={`
                      w-5 h-5
                      text-gray-600
                      transition-colors duration-150
                      ml-3
                    `}
                  />
                  <span
                    className={`text-sm font-medium text-gray-600
                  `}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
