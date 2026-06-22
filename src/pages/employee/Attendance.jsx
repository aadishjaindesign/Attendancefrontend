import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle } from "lucide-react";
import Toast from "../../components/Toast";
import Spinner from "../../components/Spinner";
import { useToast } from "../../hooks/useToast";
import "../../styles/employee/attendance.css";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function Attendance() {
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { toasts, toast, removeToast } = useToast();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Sunday ya Holiday ka response backend se aata hai
  const isSunday  = today?.isSunday  === true;
  const isHoliday = today?.isHoliday === true;
  const isDayOff  = isSunday || isHoliday;

  // Buttons ki state — day off pe sab disabled
  const isCheckedIn         = !isDayOff && today?.checkIn && !today?.checkOut;
  const attendanceCompleted = !isDayOff && today?.checkIn &&  today?.checkOut;

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setPageLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/attendance/today/${user._id}`);
      // Backend ab Sunday/Holiday pe bhi 200 deta hai — catch mein nahi jaata
      setToday(res.data);
    } catch (error) {
      // Sirf real network error
      toast.error("Network error. Please try again.");
    } finally {
      setPageLoading(false);
    }
  };

  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported on this device"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => reject(new Error("Location permission denied. Please allow location access."))
      );
    });

  const handleCheckIn = async () => {
    if (loading || isDayOff || isCheckedIn || attendanceCompleted) return;
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      await axios.post(`${API_URL}/api/attendance/checkin`, {
        employeeId: user._id,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      toast.success("Check-in successful! Have a great day 🎉");
      await loadAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (loading || !isCheckedIn) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/attendance/checkout`, {
        employeeId: user._id,
      });
      toast.success("Check-out successful! See you tomorrow 👋");
      await loadAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  const workingHours =
    today?.checkIn && today?.checkOut
      ? ((new Date(today.checkOut) - new Date(today.checkIn)) / 3600000).toFixed(2)
      : 0;

  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Status badge
  const statusText = isDayOff
    ? (isSunday ? "Sunday" : "Holiday")
    : (today?.status || "Not Marked");

  const statusClass = isDayOff
    ? (isSunday ? "status-sunday" : "status-holiday")
    : `status-${(today?.status || "unmarked").toLowerCase().replace(" ", "-")}`;

  return (
    <div className="attendance-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="page-title">
        <h2>Attendance</h2>
        <p>{todayDate}</p>
      </div>

      {pageLoading ? (
        <div className="att-page-loading">
          <Spinner size={36} />
          <p>Loading attendance...</p>
        </div>
      ) : (
        <>
          {/* Sunday / Holiday — page mein banner, koi popup nahi */}
          {isDayOff && (
            <div className={`info-banner ${isHoliday ? "banner-holiday" : "banner-sunday"}`}>
              <span className="info-banner-icon">{isSunday ? "🌴" : "🎉"}</span>
              <div>
                <strong>{isSunday ? "Sunday — Office Closed" : "Holiday"}</strong>
                <p>{today?.message}</p>
              </div>
            </div>
          )}

          <div className="attendance-card">

            {/* Status */}
            <div className="attendance-status">
              <div className="status-left">
                <span className="status-icon">📋</span>
                <h3>Today's Status</h3>
              </div>
              <span className={`status-badge ${statusClass}`}>
                {statusText}
              </span>
            </div>

            {/* Info cells */}
            <div className="attendance-info">
              <div className="info-cell">
                <span className="info-label">Check In</span>
                <span className="info-value">
                  {today?.checkIn ? new Date(today.checkIn).toLocaleTimeString() : "--"}
                </span>
              </div>
              <div className="info-cell">
                <span className="info-label">Check Out</span>
                <span className="info-value">
                  {today?.checkOut ? new Date(today.checkOut).toLocaleTimeString() : "--"}
                </span>
              </div>
              <div className="info-cell">
                <span className="info-label">Hours</span>
                <span className="info-value">{workingHours} h</span>
              </div>
            </div>

            <div className="attendance-divider" />

            {/* Buttons */}
            <div className="attendance-actions">
              <button
                className={`checkin-btn ${
                  isDayOff ? "btn-dayoff"
                  : (isCheckedIn || attendanceCompleted) ? "checked-in"
                  : ""
                }`}
                onClick={handleCheckIn}
                disabled={isDayOff || !!today?.checkIn || loading}
              >
                {loading && !isCheckedIn && !attendanceCompleted ? (
                  <><Spinner size={18} color="#fff" /> Checking In...</>
                ) : isDayOff ? (
                  "Office Closed"
                ) : today?.checkIn ? (
                  <><CheckCircle size={18} /> Checked In</>
                ) : (
                  "Check In"
                )}
              </button>

              <button
                className={`checkout-btn ${
                  isDayOff ? "btn-dayoff"
                  : attendanceCompleted ? "checked-out"
                  : ""
                }`}
                onClick={handleCheckOut}
                disabled={isDayOff || !isCheckedIn || !!attendanceCompleted || loading}
              >
                {loading && isCheckedIn ? (
                  <><Spinner size={18} color="#fff" /> Checking Out...</>
                ) : isDayOff ? (
                  "Office Closed"
                ) : attendanceCompleted ? (
                  <><CheckCircle size={18} /> Checked Out</>
                ) : (
                  "Check Out"
                )}
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

export default Attendance;