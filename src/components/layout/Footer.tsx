import { Link } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

const headingClass = "mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
const linkClass =
  "block py-1 text-sm text-slate-600 transition hover:text-brand dark:text-slate-300 dark:hover:text-white"

export default function Footer() {
  const { user } = useAuth()

  return (
    <footer className="px-4 pb-6">
      <div className="glass mx-auto max-w-6xl rounded-[2rem] px-8 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <img src="/logo.png" alt="" className="h-8 w-8" />
              <span>
                Study<span className="text-brand">Hub</span>
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              A free, moderated library where students share lecture notes and PDF resources,
              organised by subject.
            </p>
          </div>

          <div>
            <h2 className={headingClass}>Explore</h2>
            <Link to="/" className={linkClass}>
              Home
            </Link>
            <Link to="/browse" className={linkClass}>
              Browse notes
            </Link>
            <Link to="/upload" className={linkClass}>
              Upload a note
            </Link>
          </div>

          <div>
            <h2 className={headingClass}>Account</h2>
            {user ? (
              <>
                <Link to="/my-notes" className={linkClass}>
                  My notes
                </Link>
                <Link to="/profile" className={linkClass}>
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className={linkClass}>
                  Log in
                </Link>
                <Link to="/register" className={linkClass}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-300/50 pt-6 text-xs text-slate-500 sm:flex-row sm:justify-between dark:border-white/10 dark:text-slate-400">
          <p>© 2026 StudyHub. All rights reserved.</p>
          <p>Only upload notes you own or have permission to share.</p>
        </div>
      </div>
    </footer>
  )
}