import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee/dashboard.css";

function Dashboard() {
  const [user, setUser] = useState({});
  const [attendance, setAttendance] = useState([]);
  const API_URL = "https://attendance-backend-ym0q.onrender.com";

  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    hours: 0,
    percent: 0,
  });

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user")
    );

    setUser(storedUser);

    if (storedUser?._id) {
      fetchAttendance(storedUser._id);
    }
  }, []);

  const fetchAttendance = async (id) => {
    try {
    const res = await axios.get(
  `${API_URL}/api/attendance/${id}`
);

      const data = res.data;

      setAttendance(data);

      let totalHours = 0;

      data.forEach((item) => {
        if (item.checkIn && item.checkOut) {
          const inTime = new Date(item.checkIn);
          const outTime = new Date(item.checkOut);

          totalHours +=
            (outTime - inTime) / (1000 * 60 * 60);
        }
      });

      setStats({
        present: data.length,
        absent: 0,
        hours: totalHours.toFixed(1),
        percent: data.length ? 100 : 0,
      });

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="dashboard">

      <div className="page-title">
        <h2>Employee Dashboard</h2>
        <p>Welcome Back, {user?.name}</p>
      </div>

      <div className="profile-summary">

        <div className="profile-box">
          <h4>Name</h4>
          <p>{user?.name}</p>
        </div>

        <div className="profile-box">
          <h4>Email</h4>
          <p>{user?.email}</p>
        </div>

        <div className="profile-box">
          <h4>Department</h4>
          <p>{user?.department || "-"}</p>
        </div>

        <div className="profile-box">
          <h4>Status</h4>
          <p className={user?.status}>
            {user?.status}
          </p>
        </div>

      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <h4>Present Days</h4>
          <h2>{stats.present}</h2>
        </div>

        <div className="stat-card">
          <h4>Absent Days</h4>
          <h2>{stats.absent}</h2>
        </div>

        <div className="stat-card">
          <h4>Total Hours</h4>
          <h2>{stats.hours}</h2>
        </div>

        <div className="stat-card">
          <h4>Attendance %</h4>
          <h2>{stats.percent}%</h2>
        </div>

      </div>

      <div className="table-card">

        <div className="table-header">
          <h3>Recent Attendance</h3>
        </div>

        <table>

          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {attendance.length === 0 ? (
              <tr>
                <td colSpan="4">
                  No Attendance Found
                </td>
              </tr>
            ) : (
              attendance.slice(0, 5).map((item) => (
                <tr key={item._id}>
                  <td>
                    {new Date(
                      item.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {item.checkIn
                      ? new Date(
                          item.checkIn
                        ).toLocaleTimeString()
                      : "--"}
                  </td>

                  <td>
                    {item.checkOut
                      ? new Date(
                          item.checkOut
                        ).toLocaleTimeString()
                      : "--"}
                  </td>

                  <td className="present">
                    {item.status}
                  </td>
                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Dashboard;