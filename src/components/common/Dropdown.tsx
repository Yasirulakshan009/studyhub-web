import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"

export interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  label: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  align?: "left" | "right"
}

export default function Dropdown({ label, value, options, onChange, align = "left" }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const baseId = useId()

  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const selected = options[selectedIndex]

  const openMenu = () => {
    setActive(selectedIndex)
    setOpen(true)
  }

  const closeMenu = () => setOpen(false)

  const choose = (index: number) => {
    const option = options[index]
    if (option) onChange(option.value)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    document.getElementById(`${baseId}-${active}`)?.scrollIntoView({ block: "nearest" })
  }, [open, active, baseId])

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault()
        openMenu()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActive((i) => Math.min(options.length - 1, i + 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setActive((i) => Math.max(0, i - 1))
        break
      case "Home":
        e.preventDefault()
        setActive(0)
        break
      case "End":
        e.preventDefault()
        setActive(options.length - 1)
        break
      case "Enter":
      case " ":
        e.preventDefault()
        choose(active)
        break
      case "Escape":
        e.preventDefault()
        closeMenu()
        break
      case "Tab":
        closeMenu()
        break
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${baseId}-list`}
        aria-activedescendant={open ? `${baseId}-${active}` : undefined}
        onClick={(e) => {
          if (e.detail === 0) return
          if (open) {
            closeMenu()
          } else {
            openMenu()
          }
        }}
        onKeyDown={handleKeyDown}
        className="glass flex h-11 items-center gap-2 rounded-full pl-5 pr-4 text-sm font-medium text-slate-900 outline-none transition focus-visible:ring-4 focus-visible:ring-brand/20 dark:text-white"
      >
        <span className="truncate">{selected?.label}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 dark:text-slate-300 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id={`${baseId}-list`}
          role="listbox"
          aria-label={label}
          className={`absolute z-30 mt-2 max-h-72 w-max min-w-full max-w-[calc(100vw-2rem)] overflow-auto rounded-2xl border border-white/70 bg-white/90 p-1.5 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl dark:border-white/15 dark:bg-slate-900/90 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex
            return (
              <li
                key={option.value}
                id={`${baseId}-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(index)}
                className={`flex cursor-pointer items-center justify-between gap-6 rounded-xl px-3.5 py-2.5 text-sm ${
                  index === active ? "bg-brand/10" : ""
                } ${isSelected ? "font-semibold text-brand" : "text-slate-900 dark:text-white"}`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}