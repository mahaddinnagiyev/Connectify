import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getToken } from "./services/auth/token-service";
import CheckModal from "./components/modals/spinner/CheckModal";

export const RouteControl = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const accessToken = await getToken();

        if (!accessToken) {
          setLoading(false);
          return;
        }

        setToken(accessToken);
      } catch (error) {
        console.error("Error fetching token:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  if (loading) return <CheckModal />;

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
