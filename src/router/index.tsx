import { BrowserRouter, Route, Routes } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import RequireAuth from "../components/common/RequireAuth"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import HomePage from "../pages/HomePage"
import BrowsePage from "../pages/BrowsePage"
import NoteDetailPage from "../pages/NoteDetailPage"
import UploadPage from "../pages/UploadPage"

function Placeholder({ title }: { title: string }) {
  return (
    <div className="glass rounded-[2rem] p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    </div>
  )
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/notes/:id" element={<NoteDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<RequireAuth />}>
          <Route path="/upload" element={<UploadPage />} />
            <Route path="/my-notes" element={<Placeholder title="My notes" />} />
            <Route path="/profile" element={<Placeholder title="Profile" />} />
          </Route>

          <Route element={<RequireAuth adminOnly />}>
            <Route path="/admin" element={<Placeholder title="Admin" />} />
          </Route>

          <Route path="*" element={<Placeholder title="Page not found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}