import Sidebar from "../../complex/Sidebar"

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 text-gray-900 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}

export default MainLayout
