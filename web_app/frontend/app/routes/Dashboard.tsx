import { NavBar } from '~/components/NavBar';
import { WeatherWidget } from '~/components/Weather';
import { ForecastWidget } from '~/components/ForecastWidget';
import { AvelancheWarning } from '~/components/AvelancheWarning';
import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { isAuthenticated } from '~/utils/auth';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const check = async () => {
            const ok = await isAuthenticated();
            if (!ok) {
                navigate('/login');
            }
        };
        check();
    }, [navigate]);

    return (
        <motion.div
            className="flex flex-col flex-grow bg-gray-900 text-white p-4 gap-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5}}
        >
            <motion.div
                className="w-full text-center mb-2"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <NavBar />

                <br />
                
                <motion.h1 className="text-4xl font-bold press-start">
                    Welcome to CabinConnect!
                </motion.h1>
            </motion.div>

            <hr className="border-t border-gray-700 mt-4 w-2/3 mx-auto" />

            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full mt-6">
                <h2 className="text-3xl font-extrabold text-white mb-6 text-center tracking-wide">
                    Weather
                </h2>
                <div className="flex flex-col items-center space-y-6">
                    {/* Current Weather Widget */}
                    <WeatherWidget />

                    {/* Forecast */}
                    <ForecastWidget />
                </div>
            </div>

            <hr className="border-t border-gray-700 mt-6" />
            <AvelancheWarning/>
        </motion.div>
    );
}

export default Dashboard;