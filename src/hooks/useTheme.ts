import { useEffect, useState } from "react"

type Theme = "light" | "dark"

const THEME_KEY = "THEME"

const getInitialTheme = (): Theme => {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light"
}

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"))
  }

  return { theme, toggleTheme }
}