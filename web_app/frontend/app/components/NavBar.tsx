import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";

export const NavBar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("tokenExpiration");
        localStorage.removeItem("refreshTokenExpiration");

        navigate("/login");
    };

    return (
        <motion.nav
            className="bg-gradient-to-br from-gray-900 to-gray-800 py-4 shadow-md text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <div className="container mx-auto flex justify-between items-center px-4">
                {/* Left: Logo & nav links */}
                <div className="flex items-center space-x-6">
                    <motion.div initial={{ x: -20 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
                        <Link to="/dashboard" className="text-2xl font-bold">CabinConnect</Link>
                    </motion.div>
                    <motion.div
                        className="flex space-x-4 items-center"
                        initial={{ y: -10 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
                    >
                        <Link
                            to="/dashboard"
                            className={`hover:text-blue-400 ${
                                location.pathname === '/dashboard' ? 'text-blue-400' : ''
                            }`}
                        >
                            Home
                        </Link>

                        <Link
                            to="/snow_shoveling"
                            className={`hover:text-blue-400 ${
                                location.pathname === '/snow_shoveling' ? 'text-blue-400' : ''
                            }`}
                        >
                            Snow Shoveling
                        </Link>

                        <Link
                            to="/ski_center"
                            className={`hover:text-blue-400 ${
                                location.pathname === '/ski_center' ? 'text-blue-400' : ''
                            }`}
                        >
                            Ski Center
                        </Link>
                    </motion.div>
                </div>

                {/* Right: Logout */}
                <motion.button
                    className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded"
                    onClick={handleLogout}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </motion.button>
            </div>
        </motion.nav>
    );
};
