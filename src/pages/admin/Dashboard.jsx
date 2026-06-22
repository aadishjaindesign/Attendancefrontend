import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users, UserCheck, UserX, Clock,
  RefreshCw, Calendar, TrendingUp
} from "lucide-react";
import Spinner from "../../components/Spinner";
import "../../styles/admin/dashboard.css";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingApprovals: 0,
    presentToday: 0,
    absentToday: 0,
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/dashboard`);
      setStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const statusBadge = (status) => {
    if (status === "approved") return "badge badge-approved";
    if (status === "removed")  return "badge badge-removed";
    return "badge badge-pending";
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner size={36} color="#e11d48" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dash-root">

      {/* Header */}
      <div className="dash-header">
        <div>
          <h2 className="dash-title">Admin Dashboard</h2>
          <p className="dash-subtitle">
            <Calendar size={13} strokeWidth={2} />
            {todayDate}
          </p>
        </div>
        <button
          className="dash-refresh"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          title="Refresh"
        >
          <RefreshCw size={15} className={refreshing ? "spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="dash-stats">

        <div className="stat-card card-blue">
          <div className="stat-card-icon">
            <Users size={22} strokeWidth={1.8} />
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Total Employees</span>
            <span className="stat-value">{stats.totalEmployees}</span>
          </div>
          <TrendingUp size={40} className="stat-card-bg-icon" />
        </div>

        <div className="stat-card card-green">
          <div className="stat-card-icon">
            <UserCheck size={22} strokeWidth={1.8} />
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Present Today</span>
            <span className="stat-value">{stats.presentToday}</span>
          </div>
          <UserCheck size={40} className="stat-card-bg-icon" />
        </div>

        <div className="stat-card card-red">
          <div className="stat-card-icon">
            <UserX size={22} strokeWidth={1.8} />
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Absent Today</span>
            <span className="stat-value">{stats.absentToday}</span>
          </div>
          <UserX size={40} className="stat-card-bg-icon" />
        </div>

        <div className="stat-card card-orange">
          <div className="stat-card-icon">
            <Clock size={22} strokeWidth={1.8} />
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Pending Approvals</span>
            <span className="stat-value">{stats.pendingApprovals}</span>
          </div>
          <Clock size={40} className="stat-card-bg-icon" />
        </div>

      </div>

      {/* Recent Registrations */}
      <div className="dash-table-card">
        <div className="dash-table-header">
          <h3>Recent Registrations</h3>
          <span className="dash-count">{stats.recentUsers.length} records</span>
        </div>

        {/* Desktop table */}
        <div className="table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">No recent registrations</td>
                </tr>
              ) : (
                stats.recentUsers.map((user, i) => (
                  <tr key={user._id}>
                    <td className="row-num">{i + 1}</td>
                    <td className="user-name">{user.name}</td>
                    <td className="user-email">{user.email}</td>
                    <td>
                      <span className={statusBadge(user.status)}>
                        {user.status === "approved" && <UserCheck size={11} />}
                        {user.status === "pending"  && <Clock size={11} />}
                        {user.status === "removed"  && <UserX size={11} />}
                        {user.status}
                      </span>
                    </td>
                    <td className="user-date">
                      {new Date(user.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mobile-cards">
          {stats.recentUsers.length === 0 ? (
            <p className="no-data">No recent registrations</p>
          ) : (
            stats.recentUsers.map((user) => (
              <div key={user._id} className="mobile-card">
                <div className="mc-top">
                  <span className="mc-name">{user.name}</span>
                  <span className={statusBadge(user.status)}>
                    {user.status === "approved" && <UserCheck size={11} />}
                    {user.status === "pending"  && <Clock size={11} />}
                    {user.status === "removed"  && <UserX size={11} />}
                    {user.status}
                  </span>
                </div>
                <span className="mc-email">{user.email}</span>
                <span className="mc-date">
                  {new Date(user.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;