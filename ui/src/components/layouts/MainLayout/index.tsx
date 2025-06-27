import React from "react"
import Sidebar from "../../complex/Sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-white/80 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="px-2 py-3">{children}</div>
      </main>
    </div>
  )
}

export default MainLayout
