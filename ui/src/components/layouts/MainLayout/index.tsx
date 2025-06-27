import Sidebar from "../../complex/Sidebar"
import Header from "../../complex/Header"

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

export default MainLayout
