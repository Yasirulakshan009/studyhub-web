import { Outlet } from "react-router-dom"
import Background from "./Background"
import BottomNav from "./BottomNav"
import Footer from "./Footer"
import Header from "./Header"
import ScrollToTop from "./ScrollToTop"

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-0">
      <Background />
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto w-full max-w-6xl">
          <Outlet />
        </div>
      </main>
      <Footer />
      <ScrollToTop />
      <BottomNav />
    </div>
  )
}