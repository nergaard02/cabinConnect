import React, { useState, useEffect } from 'react';
import { NavBar } from '~/components/NavBar';
import { isAuthenticated } from '~/utils/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const backendUrl = "http://127.0.0.1:8000";

interface SnowShovelingOrder {
    id: number;
    date: string;
    note?: string;
    person_ordered: number;
    cabin_number: number;
}

const SnowShoveling: React.FC = () => {
    const [orders, setOrders] = useState<SnowShovelingOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formDate, setFormDate] = useState("");
    const [formNote, setFormNote] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const navigate = useNavigate();

    const fetchOrders = async () => {
        const ok = await isAuthenticated();
        if (!ok) {
            navigate('/login');
            return;
        }

        setLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        try {
            const response = await fetch(`${backendUrl}/snow_shoveling/orders/`, {
                headers: {
                    "Content-Type":  "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
            });

            if(!response.ok) {
                throw new Error("Failed to fetch orders");
            }

            const data: SnowShovelingOrder[] = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {


        fetchOrders();
    }, [navigate]);

    const handleSubmit =  async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!formDate) {
            setFormError("Date is required");
            return;
        }

        setFormLoading(true);

        try {
            const ok = await isAuthenticated();

            if (!ok) {
                navigate('/login');
                return;
            }

            const accessToken = localStorage.getItem("accessToken");

            const selectedDate = new Date(formDate);
            const awareDate = selectedDate.toISOString();


            const response = await fetch(`${backendUrl}/order/snow_shoveling/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ date: awareDate, note: formNote }),
            })

            if (!response.ok) {
                const data = await response.json();
            
                // If the backend returns an array of strings:
                if (Array.isArray(data)) {
                    setFormError(data.join(' | '));
                } else if (data.detail) {
                    setFormError(data.detail);
                } else {
                    setFormError("Failed to create order");
                }
                return;
            }
            else {
                setFormDate("");
                setFormNote("");
                setShowForm(false);
                fetchOrders();
            }
        } catch {
            setFormError("An error occurred while creating the order");
        } finally {
            setFormLoading(false);
        }
    }

    const handleCancelOrder = async (orderId: number) => {
        const confirmed = window.confirm("Are you sure that you want to cancel this order?");
        if (!confirmed) return;

        const ok = await isAuthenticated();
        if (!ok) {
            navigate('/login');
            return;
        }
        const accessToken = localStorage.getItem("accessToken");

        try {
            const response = await fetch(`${backendUrl}/snow_shoveling/order/delete/${orderId}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.detail || "Failed to cancel order");
                return;
            }

            setOrders((prev) => prev.filter((order) => order.id !== orderId));
        } catch (error) {
            console.error("Error cancelling order:", error);
            alert("Failed to cancel order. Please try again");
        }
    };

    return (
        <motion.div
            className="min-h-screen flex flex-col flex-grow bg-gray-900 text-white p-4 gap-y-3"
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

                <NavBar/>
                <motion.div className="p-6 rounded flex flex-col items-center flex-[2]">
                    <h1 className="text-2xl font-bold mb-4 text-center">Upcoming Snow Shoveling Orders</h1>

                    { loading ? (
                        <p>Loadin...</p>
                    ) : orders.length > 0 ? (
                        <ul className="space-y-3">
                            {orders.map(( order) => (
                                <li key={order.id} className="bg-gray-800 p-3 pt-8 rounded">
                                    <p className="text-sm text-gray-400 mt-1 mb-0">
                                        📅 Date scheduled:{" "}
                                        <span className="front-semibold text-white">
                                            {new Date(order.date).toLocaleDateString("en-GB", {
                                                weekday: "short",
                                                year: "numeric",
                                                month: "short",
                                                day: "2-digit",
                                            })}
                                        </span>
                                    </p>
                                    {order.note && (
                                        <p className="text-sm text-gray-300 mt-1">
                                            📝 Note: {order.note}
                                        </p>
                                    )}
                                    
                                    <button
                                        onClick={() => handleCancelOrder(order.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                                    >
                                        Cancel Order
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400 text"> No upcoming orders</p>
                    )}

                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded mt-6"
                    >
                        New Order
                    </button>

                    {showForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-gray-800 rounded-lg w-96">
                                <h2 className="text-xl font-bold mb-4">Create Snow Shoveling Order</h2>

                                {formError && <div className="bg-red-500 p-2 mb-3 rounded">{formError}</div>}

                                <form onSubmit={handleSubmit}>
                                    <label className="block mb-2">
                                        Date:
                                        <input
                                            type="date"
                                            value={formDate}
                                            onChange={(e) => setFormDate(e.target.value)}
                                            className="w-full mt-1 p-2 text-black rounded"
                                        />
                                    </label>

                                    <label className="block mb-3">
                                        Note (optional):
                                        <textarea
                                            value={formNote}
                                            onChange={(e) =>  setFormNote(e.target.value)}
                                            className="w-full mt-1 p-2 text-black rounded"
                                        />
                                    </label>

                                    <div className="flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="bg-gray-500 px-4 py-2 rounded"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={formLoading}
                                            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
                                        >
                                            {formLoading ? "Submitting..." : "Submit"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default SnowShoveling;