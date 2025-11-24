import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {auth, db} from "../firebase";
import {doc, getDoc} from "firebase/firestore";


function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("")
        try{
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userDocRef = doc(db, "users", user.uid)
            const userDoc = await getDoc(userDocRef);
            const role = userDoc.exists() ? userDoc.data().role : null;

            if(role === "admin"){
                navigate("/admin")
            } else if(role === "participant") { //Update "Participant" later         
                navigate("/participant")
            }else if(role === "organizer") {
                navigate("/organizer")
            }else{
                setError("User role not found. Please Contact Support")
            }
            console.log(user);
            console.log("User logged in successfully");
            // navigate("/admin");
            



        }catch (error){
            console.log(error.message);

            //display error message on screen
            setError("Invalid Credentials. Please try again.")
        }
    }


    return (
        <form onSubmit={handleSubmit}>
            <h3>Login</h3>

            <div className="mb-3">
                <label>Email Address</label>
                <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value = {email}
                onChange={(e) => setEmail(e.target.value)}
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
                />
            </div>

            <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                    Submit
                </button>
            </div>
            <p><a href="/signup">Register Here</a></p>

        </form>
    )
}

export default LoginPage;