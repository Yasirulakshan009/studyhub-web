import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAppDispatch } from "../../hooks/redux"
import { useAuth } from "../../hooks/useAuth"
import { useTheme } from "../../hooks/useTheme"
import { logout } from "../../store/authSlice"

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-white/70 text-slate-900 dark:bg-white/15 dark:text-white"
      : "text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-white/10"
  }`

const itemClass =
  "block w-full rounded-2xl px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"

const dropdownClass =
  "rounded-3xl border border-white/60 bg-white/90 p-2 shadow-xl dark:border-white/10 dark:bg-slate-900/90"

export default function Header() {
  const { user, isAdmin } = useAuth()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const closeMenus = () => {
    setMenuOpen(false)
    setUserOpen(false)
  }

  const handleLogout = () => {
    dispatch(logout())
    closeMenus()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <nav
        aria-label="Main"
        className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2"
      >
        <Link
          to="/"
          onClick={closeMenus}
          className="flex items-center gap-2 pl-1 text-lg font-semibold tracking-tight"
        >
          <img src="/logo.png" alt="" className="h-9 w-9" />
          <span>
            Study<span className="text-brand">Hub</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/browse" className={navLinkClass}>
            Browse
          </NavLink>
          <NavLink to="/upload" className={navLinkClass}>
            Upload
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-white/50 dark:hover:bg-white/10"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {user ? (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setUserOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={userOpen}
                aria-label="Account menu"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {userOpen && (
                <div role="menu" className={`absolute right-0 mt-3 w-56 ${dropdownClass}`}>
                  <p className="truncate px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                    {user.name}
                  </p>
                  <Link to="/my-notes" className={itemClass} onClick={closeMenus}>
                    My Notes
                  </Link>
                  <Link to="/profile" className={itemClass} onClick={closeMenus}>
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className={itemClass} onClick={closeMenus}>
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`${itemClass} text-red-600 dark:text-red-400`}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary hidden px-4! py-1.5! text-sm md:inline-flex">
              Log in
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-white/50 md:hidden dark:hover:bg-white/10"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className={`mx-auto mt-2 max-w-6xl md:hidden ${dropdownClass}`}>
          <Link to="/" className={itemClass} onClick={closeMenus}>
            Home
          </Link>
          <Link to="/browse" className={itemClass} onClick={closeMenus}>
            Browse
          </Link>
          <Link to="/upload" className={itemClass} onClick={closeMenus}>
            Upload
          </Link>

          {user ? (
            <>
              <Link to="/my-notes" className={itemClass} onClick={closeMenus}>
                My Notes
              </Link>
              <Link to="/profile" className={itemClass} onClick={closeMenus}>
                Profile
              </Link>
              {isAdmin && (
                <Link to="/admin" className={itemClass} onClick={closeMenus}>
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className={`${itemClass} text-red-600 dark:text-red-400`}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={itemClass} onClick={closeMenus}>
                Log in
              </Link>
              <Link to="/register" className={itemClass} onClick={closeMenus}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}