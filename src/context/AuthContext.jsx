import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================================
     CHECK AUTHENTICATION
  ================================= */

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("adminToken");

      console.log(
        "Stored admin token:",
        token ? "YES" : "NO"
      );

      // No token = definitely logged out
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(
          "AUTH ME RESPONSE:",
          response.data
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Authentication failed"
          );
        }

        const authenticatedUser =
          response.data.user ||
          response.data.data;

        if (!authenticatedUser) {
          throw new Error(
            "Authenticated user data was not received"
          );
        }

        setUser(authenticatedUser);
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error.response?.data ||
            error.message
        );

        // Remove invalid/expired token
        localStorage.removeItem("adminToken");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  /* ================================
     LOGIN
  ================================= */

  const login = async (email, password) => {
    try {
      const response = await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      console.log(
        "LOGIN RESPONSE:",
        response.data
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Login failed"
        );
      }

      const token =
        response.data.token ||
        response.data.accessToken;

      const loggedInUser =
        response.data.user ||
        response.data.data;

      if (!token) {
        throw new Error(
          "Login successful but token was not received"
        );
      }

      // Save token
      localStorage.setItem(
        "adminToken",
        token
      );

      // Save user if returned by login
      if (loggedInUser) {
        setUser(loggedInUser);
      } else {
        // Otherwise fetch user from /auth/me
        const meResponse =
          await api.get("/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

        const authenticatedUser =
          meResponse.data?.user ||
          meResponse.data?.data;

        if (!authenticatedUser) {
          throw new Error(
            "User information could not be loaded"
          );
        }

        setUser(authenticatedUser);
      }

      return response.data;
    } catch (error) {
      console.error(
        "Login error:",
        error.response?.data ||
          error.message
      );

      // Make sure a failed login does
      // not leave an old token behind
      localStorage.removeItem(
        "adminToken"
      );

      setUser(null);

      throw error;
    }
  };

  /* ================================
     LOGOUT
  ================================= */

  const logout = () => {
    localStorage.removeItem("adminToken");
    setUser(null);
  };

  /* ================================
     CONTEXT
  ================================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ================================
   USE AUTH
================================ */

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};