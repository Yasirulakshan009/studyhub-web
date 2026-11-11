import { BrowserRouter, Route, Routes } from "react-router-dom"
import MainLayout from "./components/layout/MainLayout"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<div className="glass rounded-[2rem] p-8">Home page</div>} />
          <Route path="/browse" element={<div className="glass rounded-[2rem] p-8">Browse page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}