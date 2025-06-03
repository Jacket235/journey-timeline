import { useState } from "react"
import userSignUp from "../functions/userSignUp";
import userLogIn from "../functions/userLogIn";
import userLogOut from "../functions/userLogOut";
import userAutoLogIn from "../functions/userAutoLogIn";
import { useEffect } from "react";

export default function Topbar() {
    const [showLogin, setShowLogin] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    const [showWrongInfo, setShowWrongInfo] = useState(false);

    const [userName, setUserName] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");
    const [userPassword, setPassword] = useState<string>("");

    const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);

    const [accessToken, setAccessToken] = useState<string>("");

    const handleAutoLogin = async () => {
        const autoLogin = await userAutoLogIn();

        if (autoLogin) {
            setAccessToken(autoLogin.accessToken);
            setUserLoggedIn(true);
        }
    }

    const handleLogin = async () => {
        const login = await userLogIn(userEmail, userName, userPassword);

        if (login) {
            setUserLoggedIn(true);
            setShowLogin(false);
            setAccessToken(login.accessToken)
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
        await userLogOut();
        setAccessToken("");
        setUserLoggedIn(false);
    }

    useEffect(() => {
        if (document.readyState === "complete") {
            handleAutoLogin();
        } else {
            window.addEventListener("load", handleAutoLogin);
            return () => window.removeEventListener("load", handleAutoLogin);
        }
    }, []);

    return (
        <>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 bg-dark p-2 align-items-center d-flex">
                        <div className="col-6 text-white">
                            <span className="h3">Plan your trips!</span>
                        </div>
                        <div className="col-6 d-flex align-items-center justify-content-end">
                            {!userLoggedIn ? (
                                <>
                                    <button className="btn btn-primary mx-1" onClick={() => setShowLogin(true)}>Log In</button>
                                    <button className="btn btn-primary mx-1" onClick={() => setShowSignUp(true)}>Sign Up</button>
                                </>
                            ) : (
                                <>
                                    <span className="text-white mx-2">Hello, XYZ</span>
                                    <button className="btn btn-secondary mx-1" onClick={handleSignOut}>Sign Out</button>
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
                                <button className="btn btn-primary" onClick={handleLogin}>Log In</button>
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