import React, { useState, useEffect } from 'react'
import { auth, db } from '../../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, collection, getDocs } from 'firebase/firestore'
import { useNavigate, Link } from "react-router-dom";
import '../../css/LoginPage.css'

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        phoneNumber: '',
        email: '',
        password: '',
        role: 'participant',
        // Participant-specific
        institution: '',
        matricNumber: '',
        // Organizer-specific
        companyName: '',
        position: '',
        address: ''
    });

    const [universities, setUniversities] = useState([]);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUniversities = async () => {
            const uniSnap = await getDocs(collection(db, 'universities'));
            setUniversities(uniSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
        fetchUniversities();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            const userData = {
                uid: user.uid,
                name: formData.name,
                age: formData.age,
                gender: formData.gender,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                role: formData.role,
                createdAt: new Date().toISOString()
            };

            if (formData.role === 'participant') {
                userData.participant = {
                    institution: formData.institution,
                    matricNumber: formData.matricNumber
                };
            } else if (formData.role === 'organizer') {
                userData.organizer = {
                    companyName: formData.companyName,
                    position: formData.position,
                    address: formData.address,
                    verified: 'Pending'
                };
            }

            await setDoc(doc(db, 'users', user.uid), userData);

            // Show success popup
            setShowSuccess(true);



        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-particles"></div>

            <div className="auth-container" style={{ maxWidth: '600px' }}> {/* Wider container for signup */}
                <div className="logo-section">
                    <p className="logo-text">EZEvent</p>
                    <p className="logo-subtext">EVENT MANAGEMENT</p>
                </div>

                <h2>REGISTER ACCOUNT</h2>
                {error && <div className="error-message">{error}</div>}
                {showSuccess && <div className="success-message">Account created successfully!</div>}

                <form onSubmit={handleSignUp}>
                    <div className="form-group" style={{ animationDelay: '0.1s' }}>
                        <label>FULL NAME</label>
                        <input
                            name="name"
                            placeholder="YOUR NAME"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row" style={{ animationDelay: '0.2s' }}>
                        <div className="form-group">
                            <label>AGE</label>
                            <input
                                name="age"
                                type="number"
                                placeholder="20"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>GENDER</label>
                            <select name="gender" onChange={handleChange} required>
                                <option value="">SELECT</option>
                                <option value="Male">MALE</option>
                                <option value="Female">FEMALE</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ animationDelay: '0.3s' }}>
                        <label>EMAIL</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="user@example.com"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row" style={{ animationDelay: '0.4s' }}>
                        <div className="form-group">
                            <label>PASSWORD</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>PHONE</label>
                            <input
                                name="phoneNumber"
                                placeholder="+60..."
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ animationDelay: '0.5s' }}>
                        <label>SELECT YOUR ROLE</label>
                        <select name="role" value={formData.role} onChange={handleChange} required>
                            <option value="participant">PARTICIPANT</option>
                            <option value="organizer">ORGANIZER</option>
                        </select>
                    </div>

                    <div className="role-specific-fields" style={{ animationDelay: '0.6s' }}>
                        {formData.role === 'participant' ? (
                            <div className="form-row">
                                <div className="form-group">
                                    <label>INSTITUTION</label>
                                    <select name="institution" value={formData.institution} onChange={handleChange} required>
                                        <option value="">SELECT UNI</option>
                                        {universities.map(uni => (
                                            <option key={uni.id} value={uni.id}>{uni.universityName || uni.id}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>MATRIC NO</label>
                                    <input name="matricNumber" placeholder="A123..." onChange={handleChange} required />
                                </div>
                            </div>
                        ) : (
                            <div style={{ animation: 'fadeIn 0.5s ease' }}>
                                <div className="form-group">
                                    <label>COMPANY NAME</label>
                                    <input name="companyName" placeholder="ORG INC" onChange={handleChange} required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>POSITION</label>
                                        <input name="position" placeholder="MANAGER" onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>OFFICE ADDRESS</label>
                                        <input name="address" placeholder="STREET..." onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="auth-button">
                        CREATE ACCOUNT
                    </button>
                </form>

                <div className="auth-footer">
                    <p>ALREADY A MEMBER? <Link to="/login">SIGN IN</Link></p>
                </div>
            </div>
        </div>
    )
}