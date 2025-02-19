import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ChatPage from "./pages/ChatPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProfilePage from "./pages/profile/ProfilePage";
import { RouteControl } from "./RouteControl";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import FriendPage from "./pages/friends/FriendPage";
import UserProfilePage from "./pages/profile/user/UserProfilePage";

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
        <Route
          path="user/:username"
          element={
            <RouteControl>
              <UserProfilePage />
            </RouteControl>
          }
        />
        <Route
          path="/friends"
          element={
            <RouteControl>
              <FriendPage />
            </RouteControl>
          }
        />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
