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

    // Check authentication when application starts
    useEffect(() => {
        const checkAuthentication = async () => {
            const token = localStorage.getItem("adminToken");

            console.log("Stored admin token:", token ? "YES" : "NO");

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("/auth/me");

                console.log("AUTH ME RESPONSE:", response.data);

                if (!response.data?.success) {
                    throw new Error(
                        response.data?.message ||
                        "Authentication failed"
                    );
                }

                // Backend may return user or data
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
                    error.response?.data || error.message
                );

                localStorage.removeItem("adminToken");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthentication();
    }, []);

    // Login
    const login = async (email, password) => {
        try {
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            console.log("LOGIN RESPONSE:", response.data);

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
            localStorage.setItem("adminToken", token);

            // Save user
            if (loggedInUser) {
                setUser(loggedInUser);
            } else {
                // If login response doesn't contain user,
                // fetch it from /auth/me
                const meResponse = await api.get("/auth/me");

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
                error.response?.data || error.message
            );

            throw error;
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem("adminToken");
        setUser(null);
    };

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

export const useAuth = () => {
    return useContext(AuthContext);
};