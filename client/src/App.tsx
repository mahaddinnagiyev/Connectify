import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import ChatPage from "./pages/chat/ChatPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProfilePage from "./pages/profile/ProfilePage";
import { RouteControl } from "./RouteControl";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import FriendPage from "./pages/friends/FriendPage";
import UserProfilePage from "./pages/profile/user/UserProfilePage";
import SettingsPage from "./pages/settings/SettingsPage";
import DeleteAccount from "./pages/DeleteAccount";
import { useEffect } from "react";
import FAQPage from "./pages/faq/FAQPage";
import TermsAndConditionPage from "./pages/terms/TermsAndConditionPage";
import PrivacyPolicyPage from "./pages/privacy/PrivacyPolicyPage";
import ContactUsPage from "./pages/contact/ContactUsPage";
import NotFound from "./pages/error/404";

function App() {
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/service-worker.js");
    }
  }, []);

  return (
    <BrowserRouter>
      <HelmetProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/messenger" />} />
          <Route
            path="/messenger"
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
          <Route
            path="/settings"
            element={
              <RouteControl>
                <SettingsPage />
              </RouteControl>
            }
          />
          <Route
            path="/faq"
            element={
              <RouteControl>
                <FAQPage />
              </RouteControl>
            }
          />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/terms" element={<TermsAndConditionPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/delete-account" element={<DeleteAccount />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HelmetProvider>
    </BrowserRouter>
  );
}

export default App;
