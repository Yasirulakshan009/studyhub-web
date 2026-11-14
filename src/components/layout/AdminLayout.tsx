import { Link, NavLink, Outlet } from "react-router-dom"

const links = [
  { to: "/admin", label: "Pending review", end: true },
  { to: "/admin/categories", label: "Categories", end: false }
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition ${
    isActive
      ? "bg-white/70 text-brand shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_2px_10px_rgb(15_23_42/0.1)] dark:bg-white/15 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_2px_10px_rgb(0_0_0/0.3)]"
      : "text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-white/10"
  }`

export default function AdminLayout() {
  return (
    <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
      <aside>
        <nav
          aria-label="Admin"
          className="glass flex gap-1 overflow-x-auto rounded-[2rem] p-2 md:sticky md:top-28 md:flex-col"
        >
          <p className="hidden px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:block dark:text-slate-400">
            Admin
          </p>

          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}

          <Link
            to="/browse"
            className="whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-brand md:mt-2 dark:text-slate-400"
          >
            ← Back to site
          </Link>
        </nav>
      </aside>

      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}