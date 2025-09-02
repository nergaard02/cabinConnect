import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
const backendUrl = "http://127.0.0.1:8000";


const RegistrationForm: React.FC = () => {
    const navigate = useNavigate();
    
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [cabinNumber, setCabinNumber] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/resident/register/`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    firstName, 
                    lastName, 
                    username,
                    email, 
                    password, 
                    resident: {
                        cabin_number: Number(cabinNumber)
                    }
                })
            }); 
            
            const data = await response.json();

            if(!response.ok) {
                const parseErrors = (obj: any, prefix = ''): string[] => {
                    const errors: string[] = [];
                    for (const key in obj) {
                        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                            errors.push(...parseErrors(obj[key], `${prefix}${key}.`));
                        } else if (Array.isArray(obj[key])) {
                            errors.push(`${prefix}${key}: ${obj[key].join(' ')}`);
                        } else {
                            errors.push(`${prefix}${key}: ${obj[key]}`);
                        }
                    }
                    return errors;
                };
            
                const fieldErrors = parseErrors(data);
                alert("Registration failed:\n" + fieldErrors.join("\n"));
                return;
            }
        
        } catch (error) {
            console.error("Error during registration:", error);
            alert("An error occured during registration.");
            return;
        }

        alert("Registration successfull!");
        navigate(`/verify/${email}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify center text-white pt-20" style={{ opacity: 1 }}>
            <h1 className="text-4xl press-start font-bold mb-6" style={{ transform: 'none' }}>Register for CabinConnect</h1>
                <motion.form
                    onSubmit={handleSubmit}
                    className="mt-10 mx-auto w-full max-w-sm bg-gray-800 p-6 rounded-lg shadow-lg"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                
                    {/* Names */}
                    <div className="mb-4">
                        <label className="block mb-1">First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1">Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white"
                        />
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white"
                        />
                    </div>

                    {/* Cabin Number */}
                    <div className="mb-4">
                        <label className="block mb-1">Cabin Number</label>
                        <input
                            type="number"
                            value={cabinNumber}
                            onChange={e => setCabinNumber(e.target.value)}
                            required
                            min="1"
                            className="w-full p-2 rounded bg-gray-700 text-white"
                        />
                    </div>

                    <motion.button
                        type="submit"
                        className="w-full py-2 bg-blue-600 rounded hover:bg-blue-700 transition cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                    >
                        Register
                    </motion.button>
                </motion.form>

                <p className="mt-4" style={{ opacity: 1 }}>Already have an account?
                    <a href="/login" className="text-blue-500 hover:underline"> Login</a>
                </p>

        </div>
    )

};

export default RegistrationForm;