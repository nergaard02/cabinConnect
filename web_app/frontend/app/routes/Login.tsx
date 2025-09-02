import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const backendUrl = "http://127.0.0.1:8000"

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();


    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        const response = await fetch(`${backendUrl}/token/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
            
        const data = await response.json();

        console.log("response: ", data);
        
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

        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('userId', data.id.toString());
        
        const now = Date.now();
        
        const tokenExpiration = now + parseFloat(data.token_expiration) * 1000;
        localStorage.setItem("tokenExpiration", tokenExpiration.toString());

        const refreshTokenExpiration = now + parseFloat(data.token_refresh_expiration) * 1000;
        localStorage.setItem("refreshTokenExpiration", refreshTokenExpiration.toString());
        
        alert("Login successful!");

    } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occured during registration.");
        return;
    }
    navigate('/dashboard');
}


  return (
    <div className="flex flex-col justify-center min-h-screen w-full px-6 py-12 bg-gray-900 lg:px-8">
      <motion.div
        className="mx-auto w-full max-w-sm flex flex-col"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 12, duration: 0.5 }}
      >
        <div className="h-48">
          <img
            src="/cabin_logo.png"
            className="mx-auto"
            alt="CabinConnect Logo"
          />
        </div>

        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white press-start">
          Login to CabinConnect
        </h2>
      </motion.div>

      <motion.div
        className="mt-10 mx-auto w-full max-w-sm bg-gray-800 p-6 rounded-lg shadow-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm/6 font-medium text-white">
              Username
            </label>
            <div className="mt-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="block w-full rounded-md bg-gray-700 px-3 py-1.5 text-base text-white placeholder-gray-400 outline-1 -outline-offset-1 outline-gray-600 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm/6 font-medium text-white">
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-md bg-gray-700 px-3 py-1.5 text-base text-white placeholder-gray-400 outline-1 -outline-offset-1 outline-gray-600 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Login
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-400">
          Don't have an account?{' '}
          <a href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Sign in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
