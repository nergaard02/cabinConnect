const backendUrl = "http://127.0.0.1:8000";

export const isAuthenticated = async (): Promise<boolean> => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const accessExp = localStorage.getItem('tokenExpiration');
    const refreshExp = localStorage.getItem('refreshTokenExpiration');

    const now = Date.now();

    if (!accessToken || !refreshToken || !accessExp || !refreshExp) {
        return false;
    }

    const accessExpired = now > parseInt(accessExp);
    const refreshExpired = now > parseInt(refreshExp);

    if (!accessExpired) {
        return true; // The  access token is still valid
    }

    if (refreshExpired) {
        return false; // Both tokens have expired
    }

    // Only the access token has expired, try to refresh

    try {
        const response = await fetch(`${backendUrl}/token/refresh/`, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) { 
            return false;
        }

        const data = await response.json();

        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);

        const now = Date.now();
        
        const tokenExpiration = now + parseFloat(data.token_expiration) * 1000;
        localStorage.setItem("tokenExpiration", tokenExpiration.toString());

        const refreshTokenExpiration = now + parseFloat(data.token_refresh_expiration) * 1000;
        localStorage.setItem("refreshTokenExpiration", refreshTokenExpiration.toString());
        
        return true;

    } catch (error) {
        console.error("Token refresh failed:", error);
        return false;
    }
};