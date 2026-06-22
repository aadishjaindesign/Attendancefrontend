import { useEffect, useState } from "react";
import axios from "axios";
import {
  LogIn, LogOut, CheckCircle, Clock,
  Calendar, TrendingUp, Sun, User
} from "lucide-react";
import Toast from "../../components/Toast";
import Spinner from "../../components/Spinner";
import { useToast } from "../../hooks/useToast";
import "../../styles/employee/dashboard.css";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function Dashboard() {
  const [user, setUser] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { toasts, toast, removeToast } = useToast();

  const [stats, setStats] = useState({
    present: 0, halfDay: 0, absent: 0, hours: 0, percent: 0,
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) { window.location.href = "/"; return; }
    setUser(storedUser);
    if (storedUser?._id) {
      Promise.all([
        fetchAttendance(storedUser._id),
        fetchToday(storedUser._id),
      ]).finally(() => setPageLoading(false));
    }
  }, []);

  // ── Today status ──
  const fetchToday = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/api/attendance/today/${id}`);
      setTodayRecord(res.data);
    } catch (e) { console.error(e); }
  };

  // ── History ──
  const fetchAttendance = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/api/attendance/${id}`);
      const data = res.data;
      setAttendance(data);

      let totalHours = 0;
      data.forEach((item) => {
        if (item.checkIn && item.checkOut) {
          totalHours += (new Date(item.checkOut) - new Date(item.checkIn)) / 3600000;
        }
      });

      const presentDays = data.filter((x) => x.status === "Present").length;
      const halfDays    = data.filter((x) => x.status === "Half Day").length;
      const totalWD     = data.filter((x) => ["Present","Half Day","Absent"].includes(x.status)).length;
      const percent     = totalWD > 0 ? (((presentDays + halfDays * 0.5) / totalWD) * 100).toFixed(1) : 0;

      setStats({
        present: presentDays,
        halfDay: halfDays,
        absent: data.filter((x) => x.status === "Absent").length,
        hours: totalHours.toFixed(1),
        percent,
      });
    } catch (e) { console.error(e); }
  };

  // ── Geolocation ──
  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error("Geolocation not supported")); return; }
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
        () => reject(new Error("Location permission denied. Please allow location access."))
      );
    });

  // ── Check In ──
  const handleCheckIn = async () => {
    if (checkLoading) return;
    setCheckLoading(true);
    try {
      const loc = await getLocation();
      await axios.post(`${API_URL}/api/attendance/checkin`, {
        employeeId: user._id,
        latitude: loc.latitude,
        longitude: loc.longitude,
      });
      toast.success("Check-in successful! Have a great day 🎉");
      await fetchToday(user._id);
      await fetchAttendance(user._id);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Check-in failed");
    } finally {
      setCheckLoading(false);
    }
  };

  // ── Check Out ──
  const handleCheckOut = async () => {
    if (checkLoading) return;
    setCheckLoading(true);
    try {
      await axios.post(`${API_URL}/api/attendance/checkout`, { employeeId: user._id });
      toast.success("Check-out successful! See you tomorrow 👋");
      await fetchToday(user._id);
      await fetchAttendance(user._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-out failed");
    } finally {
      setCheckLoading(false);
    }
  };

  // ── Derived states ──
  const isSunday   = todayRecord?.isSunday  === true;
  const isHoliday  = todayRecord?.isHoliday === true;
  const isDayOff   = isSunday || isHoliday;
  const isCheckedIn        = !isDayOff && todayRecord?.checkIn && !todayRecord?.checkOut;
  const attendanceCompleted = !isDayOff && todayRecord?.checkIn &&  todayRecord?.checkOut;

  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const workingHours = todayRecord?.checkIn && todayRecord?.checkOut
    ? ((new Date(todayRecord.checkOut) - new Date(todayRecord.checkIn)) / 3600000).toFixed(2)
    : null;

  const statusBadgeClass = (s) => {
    if (s === "Present")  return "st-present";
    if (s === "Half Day") return "st-halfday";
    if (s === "Sunday")   return "st-sunday";
    if (s === "Holiday")  return "st-holiday";
    if (s === "Leave")    return "st-leave";
    return "st-absent";
  };

  if (pageLoading) {
    return (
      <div className="emp-page-loading">
        <Spinner size={36} color="#e11d48" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="emp-dash">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* ── Header ── */}
      <div className="emp-dash-header">
        <div>
          <h2 className="emp-dash-title">Welcome, {user?.name?.split(" ")[0]} 👋</h2>
          <p className="emp-dash-date"><Calendar size={13} /> {todayDate}</p>
        </div>
      </div>

      {/* ── TODAY ATTENDANCE CARD ── */}
      <div className={`today-card ${isDayOff ? "today-dayoff" : isCheckedIn ? "today-in" : attendanceCompleted ? "today-done" : "today-idle"}`}>

        <div className="today-card-left">
          <p className="today-card-label">Today's Attendance</p>

          {isDayOff ? (
            <div className="today-status-row">
              <Sun size={18} />
              <span className="today-status-text">{isSunday ? "Sunday — Office Closed" : `Holiday: ${todayRecord?.message}`}</span>
            </div>
          ) : attendanceCompleted ? (
            <div className="today-status-row">
              <CheckCircle size={18} />
              <span className="today-status-text">Day Complete</span>
            </div>
          ) : isCheckedIn ? (
            <div className="today-status-row">
              <Clock size={18} className="pulse-icon" />
              <span className="today-status-text">Checked In — Working</span>
            </div>
          ) : (
            <div className="today-status-row">
              <User size={18} />
              <span className="today-status-text">Not Checked In Yet</span>
            </div>
          )}

          {/* Times */}
          <div className="today-times">
            {todayRecord?.checkIn && (
              <span className="today-time-pill time-in">
                <LogIn size={12} />
                In: {new Date(todayRecord.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {todayRecord?.checkOut && (
              <span className="today-time-pill time-out">
                <LogOut size={12} />
                Out: {new Date(todayRecord.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {workingHours && (
              <span className="today-time-pill time-hours">
                <Clock size={12} /> {workingHours}h worked
              </span>
            )}
          </div>
        </div>

        {/* ── ACTION BUTTON ── */}
        <div className="today-card-right">
          {isDayOff ? (
            <div className="att-off-badge">
              <Sun size={20} />
              <span>Day Off</span>
            </div>
          ) : attendanceCompleted ? (
            <div className="att-done-badge">
              <CheckCircle size={20} />
              <span>Done</span>
            </div>
          ) : isCheckedIn ? (
            <button className="att-checkout-btn" onClick={handleCheckOut} disabled={checkLoading}>
              {checkLoading ? (
                <><Spinner size={20} color="#fff" /> Checking Out...</>
              ) : (
                <><LogOut size={20} /> Check Out</>
              )}
            </button>
          ) : (
            <button className="att-checkin-btn" onClick={handleCheckIn} disabled={checkLoading}>
              {checkLoading ? (
                <><Spinner size={20} color="#fff" /> Checking In...</>
              ) : (
                <><LogIn size={20} /> Check In</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Profile Summary ── */}
      <div className="profile-summary">
        <div className="profile-box"><h4>Name</h4><p>{user?.name}</p></div>
        <div className="profile-box"><h4>Email</h4><p>{user?.email}</p></div>
        <div className="profile-box"><h4>Department</h4><p>{user?.department || "-"}</p></div>
        <div className="profile-box">
          <h4>Status</h4>
          <p><span className="approved-badge">● {user?.status}</span></p>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="stats-grid">
        <div className="stat-card sc-indigo">
          <div className="sc-icon"><TrendingUp size={18} /></div>
          <h4>Present Days</h4>
          <h2>{stats.present}</h2>
        </div>
        <div className="stat-card sc-yellow">
          <div className="sc-icon"><Clock size={18} /></div>
          <h4>Half Days</h4>
          <h2>{stats.halfDay}</h2>
        </div>
        <div className="stat-card sc-red">
          <div className="sc-icon"><User size={18} /></div>
          <h4>Absent Days</h4>
          <h2>{stats.absent}</h2>
        </div>
        <div className="stat-card sc-green">
          <div className="sc-icon"><Clock size={18} /></div>
          <h4>Total Hours</h4>
          <h2>{stats.hours}h</h2>
        </div>
        <div className="stat-card sc-blue">
          <div className="sc-icon"><TrendingUp size={18} /></div>
          <h4>Attendance %</h4>
          <h2>{stats.percent}%</h2>
        </div>
      </div>

      {/* ── Recent Attendance Table ── */}
      <div className="table-card">
        <div className="table-header">
          <h3>Recent Attendance</h3>
          <span className="table-count">{Math.min(attendance.length, 7)} records</span>
        </div>

        {/* Desktop */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr><td colSpan="5" className="no-att">No attendance records yet</td></tr>
              ) : (
                attendance.slice(0, 7).map((item) => (
                  <tr key={item._id}>
                    <td>{item.date || new Date(item.createdAt).toLocaleDateString("en-IN")}</td>
                    <td>{item.checkIn ? new Date(item.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--"}</td>
                    <td>{item.checkOut ? new Date(item.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--"}</td>
                    <td>
                      {item.checkIn && item.checkOut
                        ? `${((new Date(item.checkOut) - new Date(item.checkIn)) / 3600000).toFixed(1)}h`
                        : "--"}
                    </td>
                    <td><span className={`st-badge ${statusBadgeClass(item.status)}`}>{item.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="att-mobile-list">
          {attendance.length === 0 ? (
            <p className="no-att">No attendance records yet</p>
          ) : (
            attendance.slice(0, 7).map((item) => (
              <div key={item._id} className="att-mobile-card">
                <div className="amc-left">
                  <span className="amc-date">{item.date || new Date(item.createdAt).toLocaleDateString("en-IN")}</span>
                  <div className="amc-times">
                    {item.checkIn && <span><LogIn size={11} /> {new Date(item.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
                    {item.checkOut && <span><LogOut size={11} /> {new Date(item.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
                  </div>
                </div>
                <span className={`st-badge ${statusBadgeClass(item.status)}`}>{item.status}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;