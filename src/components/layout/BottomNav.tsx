import type { ReactNode } from "react"
import { NavLink } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

interface Tab {
  to: string
  label: string
  end?: boolean
  authOnly?: boolean
  icon: ReactNode
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const tabs: Tab[] = [
  {
    to: "/",
    label: "Home",
    end: true,
    icon: (
      <Icon>
        <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      </Icon>
    )
  },
  {
    to: "/browse",
    label: "Browse",
    icon: (
      <Icon>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </Icon>
    )
  },
  {
    to: "/upload",
    label: "Upload",
    icon: (
      <Icon>
        <path d="M12 16V4M6 10l6-6 6 6M4 20h16" />
      </Icon>
    )
  },
  {
    to: "/my-notes",
    label: "My notes",
    authOnly: true,
    icon: (
      <Icon>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v4h4M9 12h6M9 16h6" />
      </Icon>
    )
  }
]

export default function BottomNav() {
  const { user } = useAuth()
  const visibleTabs = tabs.filter((tab) => !tab.authOnly || user)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <nav
        aria-label="Mobile"
        className="glass pointer-events-auto mx-auto flex max-w-md items-center justify-between gap-1 rounded-full p-1.5"
      >
        {visibleTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 rounded-full px-1 py-2 text-[11px] font-medium transition duration-200 active:scale-95 ${
                isActive
                  ? "bg-white/70 text-brand shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_2px_10px_rgb(15_23_42/0.1)] dark:bg-white/15 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_2px_10px_rgb(0_0_0/0.3)]"
                  : "text-slate-600 dark:text-slate-300"
              }`
            }
          >
            {tab.icon}
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}