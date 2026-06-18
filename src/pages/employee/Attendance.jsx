import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee/attendance.css";

function Attendance() {

  const [today, setToday] = useState(null);
  const API_URL = "https://attendance-9zjv.onrender.com";

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {

     const res = await axios.get(
  `${API_URL}/api/attendance/${user._id}`
);

      if (res.data.length > 0) {
        setToday(res.data[0]);
      }

    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckIn = async () => {
    try {

      const location =
        await getCurrentLocation();

      await axios.post(
  `${API_URL}/api/attendance/checkin`,
        {
          employeeId: user._id,
          latitude: location.latitude,
          longitude: location.longitude,
        }
      );

      alert("Check In Success");

      loadAttendance();

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Check In Failed"
      );

    }
  };

  const handleCheckOut = async () => {
    try {

      await axios.post(
  `${API_URL}/api/attendance/checkout`,
        {
          employeeId: user._id,
        }
      );

      alert("Check Out Success");

      loadAttendance();

    } catch (err) {
      alert(
        err.response?.data?.message
      );
    }
  };
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const workingHours =
    today?.checkIn && today?.checkOut
      ? (
        (new Date(today.checkOut) -
          new Date(today.checkIn)) /
        3600000
      ).toFixed(2)
      : 0;

  return (
    <div className="attendance-page">

      <div className="page-title">
        <h2>Attendance</h2>
        <p>Manage your attendance</p>
      </div>

      <div className="attendance-card">

        <div className="attendance-status">
          <div className="status-left">
            <span className="status-icon">🗓️</span>
            <h3>Today's Status</h3>
          </div>
          <span className={`status-badge ${today?.status ? "status-" + today.status.toLowerCase() : "status-unmarked"}`}>
            {today?.status || "Not Marked"}
          </span>
        </div>

        <div className="attendance-info">

          <div className="info-cell">
            <span className="info-label">Check In</span>
            <span className="info-value">
              {today?.checkIn
                ? new Date(today.checkIn).toLocaleTimeString()
                : "--"}
            </span>
          </div>

          <div className="info-cell">
            <span className="info-label">Check Out</span>
            <span className="info-value">
              {today?.checkOut
                ? new Date(today.checkOut).toLocaleTimeString()
                : "--"}
            </span>
          </div>

          <div className="info-cell">
            <span className="info-label">Hours</span>
            <span className="info-value">{workingHours} h</span>
          </div>

        </div>

        <div className="attendance-divider" />

        <div className="attendance-actions">

          <button
            className="checkin-btn"
            onClick={handleCheckIn}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Check In
          </button>

          <button
            className="checkout-btn"
            onClick={handleCheckOut}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Check Out
          </button>

        </div>

      </div>

    </div>
  );
}

export default Attendance;