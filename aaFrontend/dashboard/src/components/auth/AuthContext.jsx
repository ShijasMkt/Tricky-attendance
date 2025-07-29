// Update your AuthContext.js with better debugging

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                
                const refreshRes = await fetch("http://localhost:8000/api/token/refresh/", {
                    method: "POST",
                    credentials: "include",
                });
                
                if (refreshRes.ok) {
                    const res = await fetch("http://localhost:8000/api/check_auth/", {
                        credentials: "include",
                    });
                    
                    if (res.ok) {
                        setIsLoggedIn(true);
                    } else {
                        setIsLoggedIn(false);
                    }
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                setIsLoggedIn(false);
            }
        };
        
        checkAuth();
    }, []);
    
    const login = () => setIsLoggedIn(true);
    const logout = async() => {
        const response = await fetch("http://localhost:8000/api/logout/", {
              method: "POST",
              credentials: "include",
          });
          
          if (response.ok) {
             setIsLoggedIn(false)
          }
          else{
            setIsLoggedIn(true)
          }
    }
    
    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout , setIsLoggedIn}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);