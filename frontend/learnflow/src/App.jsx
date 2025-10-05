import './App.css'
import Auth from './auth/auth.jsx'
import ShowUsers from './admin/showusers.jsx'
import { Route, Routes } from "react-router-dom"
import Profile from './user/Profile.jsx'
import AdminPanel from './admin/adminpanel.jsx'
import Hero from './hero/hero.jsx'
import CreateDepartment from './admin/CreateDepartement.jsx'
import Showdepartments from './admin/showdepar.jsx'
function App() {
  return (
    <>
      <div id="app">
      <Routes>
        <Route path="/" element={<ShowUsers />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPanel />} />
         <Route path="/hero" element={<Hero />} />
         <Route path="/create-department" element={<CreateDepartment />} />
         <Route path="/show-departments" element={<Showdepartments />} />
      </Routes>
    </div>
    </>
  )
}

export default App
