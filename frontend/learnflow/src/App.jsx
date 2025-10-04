import './App.css'
import Auth from './auth/auth.jsx'
import ShowUsers from './admin/showusers.jsx'
import { Route, Routes } from "react-router-dom"
import Profile from './user/Profile.jsx'
function App() {
  return (
    <>
      <div id="app">
      <Routes>
        <Route path="/" element={<ShowUsers />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
    </>
  )
}

export default App
