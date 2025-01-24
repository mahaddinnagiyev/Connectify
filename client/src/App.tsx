import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ChatPage from './pages/ChatPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<ChatPage />} />
        <Route path='/auth/login' element={<Login />} />
        <Route path='/auth/signup' element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
