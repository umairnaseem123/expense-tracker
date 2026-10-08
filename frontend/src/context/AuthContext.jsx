import { createContext, useContext, useState } from "react";
import api from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const authenticate = async (path, data) => {
    const res = await api.post(`/auth/${path}`, data);
    localStorage.setItem("user", JSON.stringify(res.data));
    setUser(res.data);
  };

  const login = (data) => authenticate("login", data);
  const register = (data) => authenticate("register", data);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);