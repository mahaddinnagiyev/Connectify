import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ChatPage from "./pages/ChatPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProfilePage from "./pages/profile/ProfilePage";
import { RouteControl } from "./RouteControl"; // İndi artıq error verməyəcək

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" />} />
        <Route
          path="/chat"
          element={
            <RouteControl>
              <ChatPage />
            </RouteControl>
          }
        />
        <Route
          path="user/my-profile"
          element={
            <RouteControl>
              <ProfilePage />
            </RouteControl>
          }
        />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
