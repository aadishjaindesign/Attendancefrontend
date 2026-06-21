import { useEffect } from "react";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

// Render free tier me 15 min bad sleep ho jata hai
// Har 10 min me ping karo taaki active rahe
export function useKeepAlive() {
  useEffect(() => {
    const ping = () => {
      fetch(`${API_URL}/ping`)
        .then(() => console.log("🏓 Keep-alive ping sent"))
        .catch(() => {});
    };

    ping(); // Immediately on mount
    const interval = setInterval(ping, 10 * 60 * 1000); // Har 10 minutes

    return () => clearInterval(interval);
  }, []);
}