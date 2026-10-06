import { createContext, useContext, useState } from "react";


const AuthContext = createContext(null);

const STORAGE_USER_KEY = "auth_user";
const STORAGE_TOKEN_KEY = "auth_token";

/*
 * Read the saved session SYNCHRONOUSLY, before the first render.
 *
 * Previously user/token started as null and were filled in by a useEffect,
 * so for the first render isLoggedIn was false even for a logged-in
 * person. Any page that reads isLoggedIn (services.jsx, header.jsx) then
 * briefly drew the logged-out layout. Reading localStorage up front means
 * the very first render is already correct.
 */
function readStoredSession() {
  try {
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (storedUser && storedToken) {
      return { user: JSON.parse(storedUser), token: storedToken };
    }
  } catch {
    // Corrupted value - clear it so we don't crash on every load.
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  }
  return { user: null, token: null };
}

export function AuthProvider({ children }) {
  const [session] = useState(readStoredSession);
  const [user, setUser] = useState(session.user);
  const [token, setToken] = useState(session.token);
  // Kept so existing code (ProtectedRoute) that reads isLoading still works.
  // The session is now known immediately, so this is always false.
  const isLoading = false;

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
    localStorage.setItem(STORAGE_TOKEN_KEY, authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  };

  const value = {
    user,
    token,
    isLoggedIn: Boolean(user && token),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
