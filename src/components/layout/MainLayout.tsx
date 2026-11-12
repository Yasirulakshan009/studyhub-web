import { Outlet } from "react-router-dom"
import Background from "./Background"
import Header from "./Header"
import Footer from "./Footer"

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Background />
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto w-full max-w-6xl">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}