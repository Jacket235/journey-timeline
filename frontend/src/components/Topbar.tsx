import { useState } from "react"

export default function Topbar() {
    const [showLogin, setShowLogin] = useState(false);

    const [userName, setUserName] = useState<string>("");
    const [userPassword, setPassword] = useState<string>("");

    const handleLogin = async () => {
    }

    return (
        <>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 bg-dark p-2 d-flex">
                        <div className="col-6 text-white">
                            <span className="h3">Database app</span>
                        </div>
                        <div className="col-6 d-flex justify-content-end">
                            <button className="btn btn-secondary mx-1" onClick={() => setShowLogin(true)}>Log In</button>
                            <button className="btn btn-secondary mx-1">Sign Up</button>
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
                                    <label className="form-label">Username</label>
                                    <input type="text" className="form-control" value={userName} onChange={(e) => setUserName(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input type="password" className="form-control" value={userPassword} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={handleLogin}>Log In</button>
                                <button className="btn btn-secondary" onClick={() => setShowLogin(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

// Token: 15ee25c5-e600-4268-a1ef-0dc489a1a6e8