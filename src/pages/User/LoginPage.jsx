import React, { useState, useEffect } from 'react'
import { auth, db } from '../../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate, Link } from "react-router-dom";
import '../../css/LoginPage.css'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // Fetch user role from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid))
            if (userDoc.exists()) {
                const userData = userDoc.data()
                const role = userData.role

                // Simulate loading for better UX
                await new Promise(resolve => setTimeout(resolve, 800))

                // Navigate based on role
                if (role === 'admin') {
                    navigate('/admin')
                } else if (role === 'organizer') {
                    navigate('/organizer')
                } else {
                    navigate('/participant/events')
                }
            } else {
                setError('User data not found. Please contact support.')
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', '').replace('auth/', ''))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-particles"></div>

            <div className="auth-container">
                {/* Logo Section */}
                <div className="logo-section">
                    <p className="logo-text">EZEvent</p>
                    <p className="logo-subtext">EVENT MANAGEMENT</p>
                </div>

                {/* Header */}
                <h2>SIGN IN TO YOUR ACCOUNT</h2>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <strong>Authentication Error:</strong> {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>EMAIL ADDRESS</label>
                        <input
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>PASSWORD</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`auth-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg style={{ width: '20px', height: '20px', marginRight: '10px', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24">
                                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                AUTHENTICATING...
                            </span>
                        ) : (
                            'LOGIN'
                        )}
                    </button>
                    <style>{`
                        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    `}</style>
                </form>

                {/* Footer Links */}
                <div className="auth-footer">
                    <p>
                        Don't have an account?
                        <Link to="/signup">
                            Register Here
                        </Link>
                    </p>
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.7 }}>
                        <Link to="/forgot-password" style={{ fontWeight: 'normal' }}>
                            Forgot your password?
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}