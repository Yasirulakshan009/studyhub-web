
import { Outlet, useLocation } from "react-router-dom"
import Background from "./Background"
import BottomNav from "./BottomNav"
import Footer from "./Footer"
import Header from "./Header"
import ScrollToTop from "./ScrollToTop"
import ChatFloatingButton from "./ChatFloatingButton"

export default function MainLayout() {
  const location = useLocation()
  const isChatPage = location.pathname === "/chat"

  return (
    <div
      className={
        isChatPage
          ? "flex h-dvh flex-col overflow-hidden"
          : "flex min-h-screen flex-col pb-24 md:pb-0"
      }
    >
      <Background />

      <div className="relative z-50 shrink-0">
        <Header />
      </div>

      <main
        className={
          isChatPage
            ? "relative z-10 min-h-0 flex-1 overflow-hidden px-3 pt-3 pb-24 md:pb-4 sm:px-4"
            : "relative z-10 flex-1 px-4 py-8"
        }
      >
        <div
          className={
            isChatPage
              ? "mx-auto h-full w-full max-w-6xl"
              : "mx-auto w-full max-w-6xl"
          }
        >
          <Outlet />
        </div>
      </main>

      {!isChatPage && (
        <>
          <Footer />
          <ScrollToTop />
          <ChatFloatingButton />
        </>
      )}

      <BottomNav />
    </div>
  )
}
