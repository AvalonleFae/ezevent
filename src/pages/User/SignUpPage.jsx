import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { setDoc, doc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [institution, setInstitution] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [position, setPosition] = useState("");
    const [companyAddress, setCompanyAddress] = useState("");
    const [matricNumber, setMatricNumber] = useState("");
    const [universities, setUniversities] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const universitiesCollection = collection(db, 'universities');
                const universitiesSnapshot = await getDocs(universitiesCollection);

                const universitiesList = universitiesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().universityName
                }));

                setUniversities(universitiesList);
            } catch (error) {
                console.error('Error fetching universities:', error);
            }
        };

        fetchUniversities();
    }, []);


    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            const user = auth.currentUser;

            if (user) {
                // Prepare user data object
                const userData = {
                    uid: user.uid,
                    email,
                    name,
                    role,
                    age,
                    gender,
                    phoneNumber
                };

                if (role === "participant") {
                    userData.participant = {
                        institution: institution,
                        matricNumber: matricNumber
                    };
                }
                if (role === "organizer") {
                    userData.organizer = {
                        companyName: companyName,
                        position: position,
                        companyAddress: companyAddress,
                        verified: "Pending"
                    };
                }

                await setDoc(doc(db, "users", user.uid), userData);

                // Navigate based on role
                if (role === "participant") navigate("/participant/events");
                else if (role === "organizer") navigate("/organizer/events");
                else if (role === "admin") navigate("/admin/");
                else setError("User role not found. Please contact support.");

                window.location.reload();
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">

                {/* Logo Section */}
                <div className="logo-section">
                    <div className="logo-circle">
                        <span className="logo-icon calendar-base">📅</span>
                        <span className="calendar-square"></span>
                        <span className="checkmark">✔</span>
                    </div>
                    <p className="logo-text">EventEZ</p>
                </div>

                <h2>Create Account</h2>

                {error && <div className="error-message show">{error}</div>}

                <form onSubmit={handleRegister}>
                    {/* Email */}
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Name */}
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Age */}
                    <div className="form-group">
                        <label>Age</label>
                        <input
                            type="number"
                            placeholder="Your age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            placeholder="Your phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </div>

                    {/* Gender */}
                    <div className="form-group">
                        <label>Gender</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            required
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Role */}
                    <div className="form-group">
                        <label>Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="">Select role</option>
                            <option value="participant">Participant</option>
                            <option value="organizer">Organizer</option>
                        </select>
                    </div>

                    {/* Conditional Fields */}
                    {/* Participant Fields */}
                    {role === "participant" && (
                        <>
                            <div className="form-group">
                                <label>Institution</label>
                                <select value={institution} onChange={(e) => setInstitution(e.target.value)} required>
                                    <option value="">Select Institution</option>
                                    {universities.map((uni) => (
                                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Matric Number</label>
                                <input
                                    type="test"
                                    placeholder="Your Matric Number"
                                    value={matricNumber}
                                    onChange={(e) => setMatricNumber(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Organizer Fields */}
                    {role === "organizer" && (
                        <>
                            <div className="form-group">
                                <label>Company Name</label>
                                <input
                                    type="text"
                                    placeholder="Company name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Position</label>
                                <input
                                    type="text"
                                    placeholder="Position"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Company Address</label>
                                <input
                                    type="text"
                                    placeholder="Company address"
                                    value={companyAddress}
                                    onChange={(e) => setCompanyAddress(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="auth-button">
                        Sign Up
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{" "}
                    <a className="auth-link" href="/login">Login</a>
                </div>
            </div>
        </div>
    );
}

export default SignUpPage;