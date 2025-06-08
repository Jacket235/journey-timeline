import { createContext, ReactNode, useContext, useState } from "react";
import userLogIn from "../functions/userLogIn";
import userLogOut from "../functions/userLogOut";
import userAutoLogIn from "../functions/userAutoLogIn";

interface AuthContextType {
    isLoggedIn: boolean;
    login: (email: string, password: string) => Promise<any>;
    logout: (email: string) => Promise<any>;
    autoLogin: (token: string) => Promise<any>;
    accessToken: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [accessToken, setAccessToken] = useState<string>("");

    const login = async (email: string, password: string) => {
        const res = await userLogIn(email, password);
        if (res) {
            setIsLoggedIn(true);
            setAccessToken(res.accessToken);
            return res;
        } else {
            setIsLoggedIn(false);
        }
    }

    const autoLogin = async (token: string) => {
        const res = await userAutoLogIn(token);
        if (res) {
            setIsLoggedIn(true);
            setAccessToken(res.accessToken)
            return res;
        }
    }

    const logout = async (email: string) => {
        const res = await userLogOut(email);
        if (res) {
            setIsLoggedIn(false);
            setAccessToken("");
            return res;
        }
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, autoLogin, accessToken }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}