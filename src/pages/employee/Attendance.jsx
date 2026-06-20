import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee/attendance.css";
import { CheckCircle, XCircle } from "lucide-react";

function Attendance() {

  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = "https://attendance-backend-ym0q.onrender.com";

  const user = JSON.parse(
    localStorage.getItem("user")
  );
  const isCheckedIn =
    today?.checkIn && !today?.checkOut;

  useEffect(() => {
    loadAttendance();
  }, []);
  const attendanceCompleted =
  today?.checkIn && today?.checkOut;

const loadAttendance = async () => {
  try {

    const res = await axios.get(
      `${API_URL}/api/attendance/today/${user._id}`
    );

    console.log("TODAY DATA =>", res.data);

    setToday(res.data);

  } catch (error) {
    console.log(error);
  }
};

  const handleCheckIn = async () => {

    if (loading || isCheckedIn) return;

    setLoading(true);

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

      await loadAttendance();

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Check In Failed"
      );

    } finally {

      setLoading(false);

    }
  };

  const handleCheckOut = async () => {

    if (loading || !isCheckedIn) return;

    setLoading(true);

    try {

      await axios.post(
        `${API_URL}/api/attendance/checkout`,
        {
          employeeId: user._id,
        }
      );

      alert("Check Out Success");

      await loadAttendance();

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Check Out Failed"
      );

    } finally {

      setLoading(false);

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
            <span className="status-icon"></span>
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
  className={`checkin-btn ${
    today?.checkIn ? "checked-in" : ""
  }`}
  onClick={handleCheckIn}
  disabled={today?.checkIn || loading}
>
  {today?.checkIn
    ? "Attendance Marked"
    : "Check In"}
</button>

        <button
  className={`checkout-btn ${
    attendanceCompleted ? "checked-out" : ""
  }`}
  onClick={handleCheckOut}
  disabled={!isCheckedIn || attendanceCompleted || loading}
>
  {attendanceCompleted
    ? "Checked Out"
    : "Check Out"}
</button>

        </div>

      </div>

    </div>
  );
}

export default Attendance;