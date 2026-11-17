import { BrowserRouter, Route, Routes } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import RequireAuth from "../components/common/RequireAuth"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import HomePage from "../pages/HomePage"
import BrowsePage from "../pages/BrowsePage"
import NoteDetailPage from "../pages/NoteDetailPage"
import UploadPage from "../pages/UploadPage"
import MyNotesPage from "../pages/MyNotesPage"
import EditNotePage from "../pages/EditNotePage"
import ProfilePage from "../pages/ProfilePage"
import AdminLayout from "../components/layout/AdminLayout"
import AdminReviewPage from "../pages/AdminReviewPage"
import AdminCategoriesPage from "../pages/AdminCategoriesPage"
import ForgotPasswordPage from "../pages/ForgotPasswordPage"
import ResetPasswordPage from "../pages/ResetPasswordPage"
import PublicProfilePage from "../pages/PublicProfilePage"
import ChatPage from "../pages/ChatPage"

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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<RequireAuth />}>
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/my-notes" element={<MyNotesPage />} />
          <Route path="/my-notes/:id/edit" element={<EditNotePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users/:userId" element={<PublicProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />
          </Route>

          <Route element={<RequireAuth adminOnly />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminReviewPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Placeholder title="Page not found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}