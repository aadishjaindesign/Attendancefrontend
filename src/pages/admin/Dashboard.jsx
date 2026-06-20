import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/dashboard.css";

function Dashboard() {
  const API_URL = "https://attendance-backend-ym0q.onrender.com";
  const [stats, setStats] = useState({
  totalEmployees: 0,
  pendingApprovals: 0,
  presentToday: 0,
  absentToday: 0,
  recentUsers: [],
});

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
  `${API_URL}/api/admin/dashboard`
);

      setStats(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="page-title">
        <h2>Admin Dashboard</h2>
        <p>Manage employees and attendance system</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <h4>Total Employees</h4>
          <h2>{stats.totalEmployees}</h2>
        </div>

        <div className="admin-stat-card">
         <h4>Present Today</h4>
<h2>{stats.presentToday}</h2>
        </div>

        <div className="admin-stat-card">
         <h4>Absent Today</h4>
<h2>{stats.absentToday}</h2>
        </div>

        <div className="admin-stat-card pending">
          <h4>Pending Approvals</h4>
          <h2>{stats.pendingApprovals}</h2>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="table-header">
          <h3>Recent Registrations</h3>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {stats.recentUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>

                <td>{user.email}</td>

                <td
                  className={
                    user.status === "pending"
                      ? "pending-status"
                      : "approved-status"
                  }
                >
                  {user.status}
                </td>

                <td>
                  {new Date(
                    user.createdAt
                  ).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;