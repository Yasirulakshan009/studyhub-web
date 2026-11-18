
import { useEffect, useRef, useState } from "react"
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
  "block w-full rounded-2xl px-4 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-white/60 dark:text-slate-100 dark:hover:bg-white/10"

const orbBase =
  "relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/80 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 active:scale-95 dark:border-white/25"

const themeOrb = `${orbBase} bg-gradient-to-br from-white/90 via-white/60 to-sky-200/40 text-slate-700 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-8px_12px_rgb(15_23_42/0.06),0_6px_16px_rgb(15_23_42/0.14)] dark:from-white/25 dark:via-white/10 dark:to-sky-400/20 dark:text-white dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.4),inset_0_-8px_12px_rgb(0_0_0/0.2),0_6px_16px_rgb(0_0_0/0.45)]`

const avatarOrb = `${orbBase} !h-8 !w-8 shrink-0 bg-gradient-to-br from-white/90 via-sky-100/70 to-sky-300/50 text-xs font-semibold text-brand shadow-[inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-8px_12px_rgb(10_132_255/0.14),0_4px_10px_rgb(10_132_255/0.2)] dark:from-white/30 dark:via-sky-300/15 dark:to-sky-500/30 dark:text-white dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.4),inset_0_-8px_12px_rgb(10_132_255/0.25),0_4px_10px_rgb(0_0_0/0.3)]`

function Gloss() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-2 top-0.5 h-3.5 rounded-full bg-gradient-to-b from-white/90 to-white/0 dark:from-white/40"
    />
  )
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="relative h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="relative h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

export default function Header() {
  const { user, isAdmin } = useAuth()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    )

    if (!confirmed) return

    dispatch(logout())
    setOpen(false)
    navigate("/")
  }

  return (
    <header ref={rootRef} className="sticky top-0 z-50 px-4 pt-4">
      <div className="relative mx-auto max-w-6xl">
        <nav
          aria-label="Main"
          className="glass flex items-center justify-between rounded-full px-4 py-1"
        >
          <Link
            to="/"
            onClick={() => setOpen(false)}
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

            {user && (
              <NavLink to="/my-notes" className={navLinkClass}>
                My Notes
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className={themeOrb}
            >
              <Gloss />
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
              <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Account menu"
                className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-white/40 dark:hover:bg-white/10"
              >
                <span className="hidden min-w-0 flex-col items-end text-right sm:flex">
                  <span className="max-w-32 truncate text-xs font-semibold text-slate-800 dark:text-white">
                    {user.name}
                  </span>

                  <span className="mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#007AFF] dark:text-[#0A84FF]">
                    {isAdmin ? "Admin" : "Student"}
                  </span>
                </span>

                <span className="flex items-center gap-1 rounded-full border-2 border-slate-300/80 bg-white/40 p-1 shadow-sm transition hover:border-[#007AFF]/50 dark:border-white/30 dark:bg-white/5 dark:hover:border-[#0A84FF]/50">
                  <span className={avatarOrb}>
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full rounded-full object-cover object-top"
                      />
                    ) : (
                      <>
                        <Gloss />
                        <span className="relative">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </>
                    )}
                  </span>

                  <span className="flex h-8 w-5 shrink-0 items-center justify-center">
                    <svg
                      className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 dark:text-slate-300 ${
                        open ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </span>
              </button>
            ) : (
              <Link
                to="/login"
                className="btn-primary px-4! py-1.5! text-sm"
              >
                Log in
              </Link>
            )}
          </div>
        </nav>

        {user && open && (
          <div
            role="menu"
            className="glass absolute right-0 top-full z-10 mt-3 w-52 rounded-3xl p-2"
          >
            <Link
              to="/profile"
              role="menuitem"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              Profile
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                role="menuitem"
                className={itemClass}
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            )}

            <div className="mx-2 my-1 border-t border-slate-300/50 dark:border-white/10" />

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className={`${itemClass} text-red-600 dark:text-red-400`}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
