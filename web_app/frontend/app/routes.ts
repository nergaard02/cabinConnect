import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/Home.tsx"),
    route("login", "routes/Login.tsx"),
    route("register", "routes/Register.tsx"),
    route("verify/:email", "routes/Verification.tsx"),
    route("dashboard", "routes/Dashboard.tsx"),
    route("snow_shoveling", "routes/SnowShoveling.tsx"),
    route("ski_center", "routes/SkiCenter.tsx"),
    
] satisfies RouteConfig;