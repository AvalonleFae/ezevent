import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../../css/LoginPage.css";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, "users", user.uid));
            const role = userDoc.exists() ? userDoc.data().role : null;

            if (role === "admin") navigate("/admin");
            else if (role === "participant") navigate("/participant");
            else if (role === "organizer") navigate("/organizer");
            else setError("User role not found. Please contact support.");
        } catch (error) {
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">

                {/* Logo */}
                <div className="logo-section">
                    <div className="logo-circle">
                        <span className="logo-icon calendar-base">📅</span>
                        <div className="calendar-square"></div>
                        <span className="checkmark">✔</span>
                    </div>
                    <div className="logo-text">Event Management System</div>
                </div>

                <h2>Sign In</h2>

                {error && <div className="error-message show">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={error ? "error" : ""}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={error ? "error" : ""}
                        />
                    </div>

                    <button type="submit" className="auth-button">Sign In</button>
                </form>

                <div className="auth-footer">
                    Don’t have an account?{" "}
                    <a className="auth-link" href="/signup">Register Here</a>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
