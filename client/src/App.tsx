import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import ChatPage from "./pages/ChatPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import { getTokenFromStorage } from "./services/auth/token-service";
import ProfilePage from "./pages/profile/ProfilePage";

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

export const RouteControl = ({ children }: { children: React.ReactNode }) => {
  const token = getTokenFromStorage();

  if (!token) {
    return <Navigate to="/auth/login" />;
  }

  try {
    const decodedToken: {
      exp: number;
      iat: number;
      id: string;
      username: string;
    } = jwtDecode(token);
    console.log(decodedToken);

    if (!decodedToken || !decodedToken.id || !decodedToken.username) {
      return <Navigate to="/auth/login" />;
    }

    if (decodedToken.exp * 1000 < Date.now()) {
      return <Navigate to="/auth/login" />;
    }

    return children;
  } catch (error) {
    return <Navigate to="/auth/login" />;
  }
};
