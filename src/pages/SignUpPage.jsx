import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import React, { useState } from "react";
import {auth, db} from "../firebase";
import { setDoc, doc } from "firebase/firestore";



function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [name, setName] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        try{
            await createUserWithEmailAndPassword(auth, email, password);
            const user = auth.currentUser;
            console.log(user);
            console.log("User registered successfully");
            if(user){
                await setDoc(doc(db, "users", user.uid) , {
                    uid: user.uid,
                    email: user.email,
                    name: name,
                    role: role,
                });
                await signOut(auth);
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    return(
        <form onSubmit={handleRegister}>
            <h3>Sign Up</h3>

            <div className="mb-3">
                <label>Email Address</label>
                <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value = {email}
                onChange={(e) => setEmail(e.target.value)}
                required
                ></input>
            </div>

            <div className="mb-3">
                <label>Password</label>
                <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
            </div>

            <div className="mb-3">
                <label>Role</label>
                <div className="form-check">
                    <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id="roleAdmin"
                    value="admin"
                    checked={role === "admin"}
                    onChange={(e) => setRole(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="roleAdmin">
                        Admin
                    </label>
                </div>
                <div className="form-check">
                    <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id="roleParticipant"
                    value="participant"
                    checked={role === "participant"}
                    onChange={(e) => setRole(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="roleParticipant">
                        Participant
                    </label>
                </div>
                <div className="form-check">
                    <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id="roleOrganizer"
                    value="organizer"
                    checked={role === "organizer"}
                    onChange={(e) => setRole(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="roleOrganizer">
                        Organizer
                    </label>
                </div>
            </div>

            <div className="mb-3">
                <label>Name</label>
                <input
                type="text"
                className="form-control"
                placeholder="Your name"
                onChange={(e) => setName(e.target.value)}
                required
                >
                </input>
            </div>

            <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                    Sign Up
                </button>
            </div>
            <p><a href="/login">Login</a></p>

        </form>
    )
}

export default SignUpPage