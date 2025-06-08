import { useEffect, useState } from "react"
import jwt_decode, { jwtDecode } from "jwt-decode";

import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

import userSignUp from "../functions/userSignUp";
import { useAuth } from "../context/AuthContext";

interface TokenPayload {
    user_id: number,
    email: string,
    username: string;
}

export default function Topbar() {
    const { isLoggedIn, login, logout, autoLogin, accessToken } = useAuth();

    const [showLogin, setShowLogin] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [showWrongInfo, setShowWrongInfo] = useState(false);

    const [userName, setUserName] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");
    const [userPassword, setPassword] = useState<string>("");

    const handleLogIn = async () => {
        const result = await login(userEmail, userPassword);

        if (result) {
            setShowLogin(false);
            localStorage.setItem("refreshToken", result.refreshToken);

            const tokenInfo = jwtDecode<TokenPayload>(result.accessToken);
            setUserName(tokenInfo.username);
        } else {
            setShowWrongInfo(true);
        }
    }

    const handleRegister = async () => {
        const register = await userSignUp(userName, userEmail, userPassword);

        setShowSignUp(false);
        setShowLogin(true);
    }

    const handleSignOut = async () => {
        const result = await logout(userEmail);

        localStorage.removeItem("refreshToken");
    }

    useEffect(() => {
        const tryAutoLogin = async () => {
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) return;

            const data = await autoLogin(refreshToken);

            if (data?.accessToken) {
                const tokenInfo = jwtDecode<TokenPayload>(data.accessToken);
                setUserEmail(tokenInfo.email);
                setUserName(tokenInfo.username);
            }
        }

        tryAutoLogin();
    }, [])

    return (
        <>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 bg-dark p-2 align-items-center d-flex">
                        <div className="col-6 text-white">
                            <span className="h3">Plan your trips!</span>
                        </div>
                        <div className="col-6 d-flex align-items-center justify-content-end">
                            {!isLoggedIn ? (
                                <>
                                    <button className="btn btn-primary mx-1" onClick={() => setShowLogin(true)}><LoginIcon /> Log In</button>
                                    <button className="btn btn-primary mx-1" onClick={() => setShowSignUp(true)}><AppRegistrationIcon /> Sign Up</button>
                                </>
                            ) : (
                                <>
                                    <span className="text-white mx-2">Hello, {userName}</span>
                                    <button className="btn btn-secondary mx-1" onClick={handleSignOut}><LogoutIcon />Sign Out</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showLogin && (
                <div className="modal d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Log In</h5>
                                <button type="button" className="btn-close" onClick={() => setShowLogin(false)}>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">E-mail</label>
                                    <input type="text" className="form-control" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input type="password" className="form-control" value={userPassword} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                {showWrongInfo && (
                                    <div className="text-danger text-center fw-bold mt-2">
                                        Wrong e-mail or password
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={handleLogIn}>Log In</button>
                                <button className="btn btn-secondary" onClick={() => setShowLogin(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSignUp && (
                <div className="modal d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Sign Up</h5>
                                <button type="button" className="btn-close" onClick={() => setShowSignUp(false)}>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Username</label>
                                    <input type="text" className="form-control" value={userName} onChange={(e) => setUserName(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">E-mail</label>
                                    <input type="text" className="form-control" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input type="password" className="form-control" value={userPassword} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={handleRegister}>Register</button>
                                <button className="btn btn-secondary" onClick={() => setShowSignUp(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}