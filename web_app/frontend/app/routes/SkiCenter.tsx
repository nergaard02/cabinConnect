import { isAuthenticated } from '~/utils/auth';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '~/components/NavBar';
import { motion } from 'framer-motion';

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
const mapContainerStyle = { width: "100%", height: "500px" };

import {Instagram, Twitter, Globe, Camera, Calendar } from "lucide-react";

interface SkiItem {
    name: string;
    status: string;
    slope_difficulty: string; //Only relevant for slopes
}

interface SkiCategory {
    count: number;
    closed: number;
    list: SkiItem[];
}

interface LiftTicketPrice {
    card_name: string;
    price_adult: number;
    price_youth: number;
}

interface SkiResort {
    name: string;
    images: {
        ski_resort: string;
        slope_map: string
    }
    about?: string;
    description?: string;

    lifts?: SkiCategory;
    slopes?: SkiCategory;
    urls: {
        opening_hours: string;
        lift_ticket_prices: string;
        homepage:  string;
        booking: string;
        web_camera: string;
    }
    open_today: boolean;
    lift_ticket_prices: LiftTicketPrice[];
    address: string;
    zip_code: number;
    call_number: number;
    ski_patrol_number: number;
    city: string;

    location: {
        lat: number;
        lon: number;
    }

    social_media: {
        instagram: string;
        twitter: string;
    }

    last_updated: string;
}

const SkiCenter:  React.FC = () => {
    const navigate = useNavigate();
    const [resortData, setResortData] = useState<SkiResort | null>(null);

    const getDifficultyEmoji = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case "green":
                return "🟩";
            case "blue":
                return "🟦";
            case "red":
                return "♦️";
            case "black":
                return "⬛️";
            default:
                return "❓";
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "hidden",
    })
    
    useEffect(() => {
        const check = async () => {
            const ok = await isAuthenticated();
            if (!ok) {
                navigate('/login');
            }
        };

        const fetchSkiCenterData = async () => {
            try {
                const response = await fetch("https://api.fnugg.no/search?q=tyin");

                if (!response.ok) {
                    throw new Error("Failed to fetch ski center data");
                }

                const data = await response.json();

                console.log("Ski Center Data:", data);

                if (data.hits?.hits?.length > 0) {
                    const src = data.hits.hits[0]._source;
                

                    const resort: SkiResort = {
                        name: src.name,
                        images: {
                            ski_resort: src.images.image_full,
                            slope_map: src.slope_map.image_full,
                        },
                        about: src.description,
                        description: src.park_description,
                        lifts: src.lifts,
                        slopes: src.slopes,
                        urls: {
                            opening_hours: src.urls.opening_hours,
                            lift_ticket_prices: src.urls.lift_ticket_prices,
                            homepage: src.urls.homepage,
                            booking: src.booking[0].url,
                            web_camera: src.booking[1].url,
                        },
                        open_today: src.resort_open,
                        lift_ticket_prices: src.lift_ticket_prices,
                        call_number: src.contact.call_number,
                        zip_code: src.contact.zip_code,
                        city: src.contact.city,
                        ski_patrol_number: src.contact.phone_skipatrol,
                        address: src.contact.address,

                        location: {
                            lat: src.location.lat,
                            lon: src.location.lon,
                        },

                        social_media: {
                            instagram: src.social_media.instagram,
                            twitter: src.social_media.twitter,
                        },

                        last_updated: src.last_updated,

                    }

                    setResortData(resort);
                }

            }
            catch (error) {
                console.error("Error fetching ski center data:", error);
                return;
            }
        }
        check();
        fetchSkiCenterData();
    }, [navigate]);

    if (!isLoaded) return <div>Loading map...</div>

    return (
        <motion.div
            className="min-h-screen flex flex-col flex-grow bg-gray-900 text-white p-4 gap-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5}}
        >
            <NavBar/>
        
                {resortData ? (
                    <>
                        <img
                            src={resortData.images.ski_resort}
                            alt={resortData.name}
                            style={{
                                width: "100%",
                                maxHeight: "500px", 
                                objectFit: "cover", 
                                borderRadius: "12px",
                                marginBottom: "20px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
                            }}
                        />
                        <h1
                            style={{
                                textAlign: "center",
                                fontSize: "2.5rem",
                                fontWeight: "bold",
                                color: "#fff",
                                marginBottom: "10px",
                                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                            }}
                        >
                            {resortData.name}
                        </h1>

                        <p
                            style={{
                                textAlign: "center",
                                fontSize: "0.9rem",
                                fontStyle: "italic",
                                color: "rgba(255,255,255,0.7)",
                                marginBottom: "12px"
                            }}
                        >
                            Sist oppdatert: {resortData.last_updated ? formatDate(resortData.last_updated) : "ukjent"}
                        </p>

                        <hr 
                            style={{ 
                                border: "1px solid rgba(255,255,255,0.2)", 
                                width: "100%", 
                                margin: "0 0 20px" 
                            }} 
                        />

                        {/* About + Park Description */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "stretch",
                                gap: "20px",
                                marginTop: "20px",
                                flexWrap: "wrap",
                            }}
                        >
                            {/* About Box */}
                            {resortData.about && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y:0 }}
                                    transition={{ duration: 0.6 }}
                                    style={{
                                        flex: "1 1 45%",
                                        background: "rgba(255, 255, 255, 0.05)",
                                        borderRadius: "12px",
                                        padding: "20px",
                                        minWidth: "300px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                    }}
                                >
                                    <h2
                                        style={{
                                            textAlign: "center",
                                            fontSize: "1.5rem",
                                            fontWeight: "bold",
                                            marginBottom: "15px",
                                            color: "#fff",
                                            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                        }}
                                    >
                                        Kort om anlegget
                                    </h2>
                                    <p
                                        style={{
                                            fontSize: "1.1rem",
                                            lineHeight: "1.6",
                                            color: "rgba(255, 255, 255, 0.9)",
                                            textAlign: "center",
                                            whiteSpace: "pre-line"
                                        }}
                                    >
                                        {resortData.about}
                                    </p>
                                </motion.div>
                            )}

                                {/* Park Description Box */}
                                {resortData.description && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                        style={{
                                            flex: "1 1 45%",
                                            background: "rgba(255, 255, 255, 0.05)",
                                            borderRadius: "12px",
                                            padding: "20px",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                            minWidth: "300px",
                                        }}
                                    >
                                        <h2
                                            style={{
                                                textAlign: "center",
                                                fontSize: "1.5rem",
                                                fontWeight: "bold",
                                                marginBottom: "15px",
                                                color: "#fff",
                                                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                            }}
                                        >
                                            Parkbeskrivelse
                                        </h2>
                                        <p
                                            style={{
                                                fontSize: "1.1rem",
                                                lineHeight: "1.6",
                                                color: "rgba(255, 255, 255, 0.9)",
                                                textAlign: "center",
                                                whiteSpace: "pre-line"
                                            }}
                                        >
                                            {resortData.description}
                                        </p>
                                    </motion.div>
                                )}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            style={{
                                display: "flex",
                                gap: "20px",
                                width: "100%",
                                maxWidth: "1000%",
                                alignItems: "stretch",
                                flexWrap: "nowrap"
                            }}
                        >

                            {/* Lifts and Slopes */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                style={{
                                    flex: "2",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    borderRadius: "12px",
                                    padding: "20px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                    minWidth: "400px",
                                }}
                            >
                            
                                {/* Lifts Section */}
                                {resortData.lifts && (
                                    <>
                                        <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: "bold", color: "#fff" }}>
                                            Heiser
                                        </h2>
                                        <p style={{ textAlign: "center", marginBottom: "10px", color: "rgba(255,255,255,0.8)" }}>
                                            Totalt: {resortData.lifts.count} | Stengt: {resortData.lifts.closed} | Åpne: {resortData.lifts.count - resortData.lifts.closed}
                                        </p>
                                        <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: "20px" }}>
                                            {resortData.lifts.list.map((lift, index) => (
                                                <li key={index} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                                                    <span style={{ fontWeight: "bold" }}>{lift.name}</span>
                                                    <span>{lift.status === "0" ? "🔴 Stengt" : "🟢 Åpen"}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                {/* Slopes Section */}
                                {resortData.slopes && (
                                    <>
                                        <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: "bold", color: "#fff" }}>
                                            Løyper
                                        </h2>
                                        <p style={{ textAlign: "center", marginBottom: "10px", color: "rgba(255, 255, 255, 0.8)" }}>
                                            Totalt: {resortData.slopes.count} | Stengt: {resortData.slopes.closed} | Åpne: {resortData.slopes.count - resortData.slopes.closed}
                                        </p>
                                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                            {resortData.slopes.list.map((slope, index) => (
                                                <li key={index} style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <span style={{ fontWeight: "bold" }}>{slope.name}</span>
                                                        <span>{slope.status === "0" ? "🔴 Stengt" : "🟢 Åpen"}</span>
                                                    </div>

                                                    {slope.slope_difficulty && (
                                                        <div style={{ marginTop: "4px" }}>
                                                            Vanskelighetsgrad: {getDifficultyEmoji(slope.slope_difficulty)}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </motion.div>

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "20px",
                                    flex: "1",
                                    minWidth: "200px",
                                }}
                            >

                                {/* Difficulty Legend */}
                                <div
                                    style={{
                                        flex: "1",
                                        background: "rgba(255,255,255,0.05)",
                                        borderRadius: "12px",
                                        padding: "15px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                        color: "#fff",
                                        minWidth: "200px",
                                        height: "fit-content",
                                    }}
                                >
                                    <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Vanskelighetsgrad</h3>
                                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                        <li>🟩 Enkel</li>
                                        <li>🟦 Middels</li>
                                        <li>♦️ Vanskelig</li>
                                        <li>⬛️ Ekspert</li>
                                    </ul>
                                </div>

                                {/* Slope Map */}
                                {resortData.images.slope_map && (
                                    <div
                                        style={{
                                            flex: "1",
                                            background: "rgba(255,255,255,0.05)",
                                            borderRadius: "12px",
                                            padding: "15px",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                            color: "#fff",
                                            minWidth: "200px",
                                            height: "fit-content",
                                            textAlign: "center",
                                        }}
                                    >
                                        <a
                                            href={resortData.images.slope_map}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: "block",
                                                width: "100%",
                                                padding: "10px 0",
                                                backgroundColor: "#3B82F6",
                                                color: "white",
                                                borderRadius: "8px",
                                                textDecoration: "none",
                                                fontWeight: "bold",
                                                transition: "background 0.3s", 
                                                textAlign: "center"                              
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")}
                                            onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = "#3B82F6"}}
                                        >
                                            Se løypekart
                                        </a>
                                    </div>                                       
                                )}
                                
                                {/* Opening Hours */}
                                <div
                                    style={{
                                        flex: "1",
                                        background: "rgba(255,255,255,0.05)",
                                        borderRadius: "12px",
                                        padding: "15px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                        color: "#fff",
                                        minWidth: "200px",
                                        height: "fit-content",
                                        textAlign: "center",
                                    }}
                                >
                                    <h3 style={{ marginBottom: "10px" }}>Åpningstider</h3>

                                    <p style={{ marginBottom: "8px" }}>
                                        <strong>Idag: </strong>{""}
                                        {resortData.open_today ? "ÅPENT" : "STENGT"}
                                    </p>

                                    <p style={{ marginBottom: "8px" }}>
                                        Skisenteret er åpent fra <strong>10:00</strong> til <strong>16.30</strong> hver dag
                                    </p>

                                    <p>
                                        <a
                                            href={resortData.urls.opening_hours}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: "#3B82F6",
                                                fontWeight: "bold",
                                                textDecoration: "underline",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "none")}
                                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                        >
                                            Se alle åpningstider
                                        </a>
                                    </p>
                                </div>

                                {/* Lift  Ticket Prices */}
                                {resortData.lift_ticket_prices && resortData.lift_ticket_prices.length > 0 && (
                                    <div
                                        style={{
                                            marginTop: "20px",
                                            background: "rgba(255, 255, 255, 0.05)",
                                            borderRadius: "12px",
                                            padding: "20px",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                            width: "100%",
                                            overflowX: "auto",
                                        }}
                                    >
                                        <h2
                                            style={{
                                                textAlign: "center",
                                                fontSize: "1.5rem",
                                                fontWeight: "bold",
                                                marginBottom: "15px",
                                                color: "#fff",
                                                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                            }}
                                        >
                                            Heiskortpriser
                                        </h2>

                                        <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff"}}>
                                            <thead>
                                                <tr style={{ background: "rgba(255,255,255,0.1" }}>
                                                    <th style={{ padding: "10px", textAlign: "left" }}>Heiskort</th>
                                                    <th style={{ padding: "10px", textAlign: "left" }}>Voksen</th>
                                                    <th style={{ padding: "10px", textAlign: "left" }}>Ungdom</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {resortData.lift_ticket_prices.map((ticket, index) => (
                                                    <tr key={index} style={{ borderBottom:  "1px solid rgba(255,255,255,0.1)" }}>
                                                        <td style={{ padding: "10px" }}>{ticket.card_name}</td>
                                                        <td style={{ padding: "10px", textAlign: "center" }}>
                                                            {ticket.price_adult ? `${ticket.price_adult},-` : "-"}
                                                        </td>
                                                        <td style={{ padding: "10px", textAlign: "center"}}>
                                                            {ticket.price_youth ? `${ticket.price_youth},-` : "-"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <br/>
                                        <p>
                                            <a
                                                href={resortData.urls.opening_hours}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: "#3B82F6",
                                                    fontWeight: "bold",
                                                    textDecoration: "underline",
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "none")}
                                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                            >
                                                Se alle heiskortpriser
                                            </a>
                                        </p>

                                        <p style={{ marginTop: "12px", fontStyle: "italic", fontSize: "0.9rem", color:"rgba(255,255,255,0.7)"}}>
                                            Priser kan i noen tilfeller ikke være helt oppdatert
                                        </p>

                                    </div>
                                )}

                                {/* Contact Information */}
                                <div
                                    style={{
                                        flex: "1",
                                        background: "rgba(255,255,255,0.05)",
                                        borderRadius: "12px",
                                        padding: "15px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                        color: "#fff",
                                        minWidth: "200px",
                                        height: "fit-content",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "15px",
                                    }}
                                >
                                    <h3 style={{ textAlign: "center", marginBottom:"10px" }}>Kontaktinformasjon</h3>

                                    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "10px" }}>
                                        <h4 style={{ margin: "5px 0" }}>Telefon</h4>
                                        <p style={{ margin: "0" }}>{resortData.call_number}</p>
                                    </div>

                                    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "10px" }}>
                                        <h4 style={{ margin: "5px 0" }}>Adresse</h4>
                                        <p style={{ margin: "0" }}>{resortData.address}</p>
                                        <p style={{ margin: "0" }}>{resortData.zip_code} {resortData.city}</p>
                                    </div>

                                    <div style={{ paddingTop: "10px" }}>
                                        <h4 style={{ margin: "5px 0" }}>Telefon Skipatrulje</h4>
                                        <p style={{ margin: "0" }}>{resortData.ski_patrol_number}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Google map box */}
                        {/* <div
                            style={{
                                width: "100%",
                                marginTop: "40px",
                                borderRadius: "12px",
                                overflow: "hidden"
                            }}
                        >
                            <h2 style={{
                                textAlign: "center",
                                color: "#fff",
                                marginBottom: "20px",
                                fontSize: "24px"
                            }}>
                                Finn Tyin Skisenter på kartet
                            </h2>
                            <div style={{ width: "95%", margin: "0 auto", borderRadius: "12px", overflow: "hidden" }}>
                                <GoogleMap
                                    mapContainerStyle={{ width: "100%", height: "500px" }}
                                    center={{ lat: resortData.location.lat, lng: resortData.location.lon }}
                                    zoom={12}
                                >
                                    <Marker
                                        position={{
                                            lat: resortData.location.lat,
                                            lng: resortData.location.lon,
                                        }}
                                    />
                                </GoogleMap>
                            </div>
                        </div> */}


                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "20px",
                                marginTop: "20px",
                            }}
                        >
                            {/* Social Media */}
                            <div
                                style={{
                                    flex: "1",
                                    minWidth: "300px",
                                    padding: "20px",
                                    borderRadius: "12px",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    color: "white",
                                }}
                            >
                                <h2 style={{ marginBottom: "16px", textAlign: "center", fontSize: "24px", fontWeight: "bold" }}>
                                    Finn oss på sosiale medier
                                </h2>

                                <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                                    <Instagram size={20} style={{ marginRight: "10px" }} />
                                    <span style={{ color: "white" }}>
                                        {resortData.social_media.instagram}
                                    </span>
                                </div>

                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <Twitter size={20} style={{ marginRight: "10px" }} />
                                    <span style={{ color: "white" }}>
                                        {resortData.social_media.twitter}
                                    </span>
                                </div>
                            </div>

                            {/* Other links */}
                            <div
                                style={{
                                    flex: "1",
                                    minWidth: "300px",
                                    padding: "20px",
                                    borderRadius: "12px",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px",
                                }}
                            >
                                <div style={{ background: "#334155", padding: "12px",  borderRadius: "8px" }}>
                                    <a
                                        href={resortData.urls.homepage}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            color: "white",
                                            textDecoration: "none"
                                        }}
                                    >
                                        <Globe size={18} style={{ marginRight: "8px" }} /> Hjemmeside
                                    </a>
                                </div>

                                <div style={{ background: "#334155", padding: "12px", borderRadius:  "8px" }}>
                                    <a
                                        href={resortData.urls.web_camera}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            color: "white",
                                            textDecoration: "none"
                                        }}
                                    >
                                        <Camera size={18} style={{ marginRight: "8px" }} /> Webkamera
                                    </a>
                                </div>

                                <div style={{ background: "#334155", padding: "12px", borderRadius: "8px" }}>
                                    <a
                                        href={resortData.urls.booking}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            color: "white",
                                            textDecoration: "none"
                                        }}
                                    >
                                        <Calendar size={18} style={{ marginRight: "8px" }} /> Booking Tyin Filefjell
                                    </a>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <p>Loading ski center data...</p>
                )}

                <p className="text-s text-gray-400 mt-2 flex items-center space-x-2 justify-center">
                    <span>
                        Ski resort data provided by
                    </span>
                    <a
                        href="https://www.fnugg.no"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ski resort data provided by Fnugg"
                    >
                        <img
                            src="https://fnugg.no/app/uploads/2015/10/Fnugg_logotype_horizontal_Pantone_306U.svg" 
                            alt="Fnugg"
                            className="h-6 opacity-60 hover:opacity-100 transition-opacity"
                        />
                    </a>
                </p>
        </motion.div>
    )

}

export default SkiCenter;

