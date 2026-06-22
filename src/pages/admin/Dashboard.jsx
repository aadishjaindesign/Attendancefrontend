import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users, UserCheck, UserX, Clock,
  RefreshCw, Calendar, TrendingUp, X,
  CheckCircle, AlertCircle, Building2
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

  // Modal state
  const [modal, setModal] = useState(null); // { type, title, data, loading }

  useEffect(() => { fetchDashboard(); }, []);

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

  // ── Stat card click handlers ──
  const openModal = async (type) => {
    const titles = {
      present:  "Present Today",
      absent:   "Absent Today",
      pending:  "Pending Approvals",
      total:    "All Employees",
    };
    setModal({ type, title: titles[type], data: [], loading: true });

    try {
      const istDate = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
      const todayStr = istDate.toISOString().slice(0, 10);

      if (type === "present") {
        // Aaj ki attendance records fetch karo
        const [attRes, empRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/attendance`),
          axios.get(`${API_URL}/api/admin/employees`),
        ]);
        const todayPresent = attRes.data.filter(
          (r) => r.date === todayStr && r.status === "Present"
        );
        setModal((m) => ({ ...m, loading: false, data: todayPresent }));

      } else if (type === "absent") {
        // Sab employees - aaj check in kiya = absent
        const [empRes, attRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/employees`),
          axios.get(`${API_URL}/api/admin/attendance`),
        ]);
        const presentIds = new Set(
          attRes.data
            .filter((r) => r.date === todayStr && r.status === "Present")
            .map((r) => r.employee?._id || r.employee)
        );
        const absent = empRes.data.filter((emp) => !presentIds.has(emp._id));
        setModal((m) => ({ ...m, loading: false, data: absent }));

      } else if (type === "pending") {
        const res = await axios.get(`${API_URL}/api/admin/pending`);
        setModal((m) => ({ ...m, loading: false, data: res.data }));

      } else if (type === "total") {
        const res = await axios.get(`${API_URL}/api/admin/employees`);
        setModal((m) => ({ ...m, loading: false, data: res.data }));
      }
    } catch (err) {
      console.error(err);
      setModal((m) => ({ ...m, loading: false, data: [] }));
    }
  };

  const closeModal = () => setModal(null);

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
        <button className="dash-refresh" onClick={() => fetchDashboard(true)} disabled={refreshing}>
          <RefreshCw size={15} className={refreshing ? "spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stat Cards — clickable */}
      <div className="dash-stats">

        <div className="stat-card card-blue clickable" onClick={() => openModal("total")} title="Click to view all employees">
          <div className="stat-card-icon"><Users size={22} strokeWidth={1.8} /></div>
          <div className="stat-card-body">
            <span className="stat-label">Total Employees</span>
            <span className="stat-value">{stats.totalEmployees}</span>
          </div>
          <TrendingUp size={40} className="stat-card-bg-icon" />
          <span className="stat-card-hint">View all →</span>
        </div>

        <div className="stat-card card-green clickable" onClick={() => openModal("present")} title="Click to view present employees">
          <div className="stat-card-icon"><UserCheck size={22} strokeWidth={1.8} /></div>
          <div className="stat-card-body">
            <span className="stat-label">Present Today</span>
            <span className="stat-value">{stats.presentToday}</span>
          </div>
          <UserCheck size={40} className="stat-card-bg-icon" />
          <span className="stat-card-hint">View list →</span>
        </div>

        <div className="stat-card card-red clickable" onClick={() => openModal("absent")} title="Click to view absent employees">
          <div className="stat-card-icon"><UserX size={22} strokeWidth={1.8} /></div>
          <div className="stat-card-body">
            <span className="stat-label">Absent Today</span>
            <span className="stat-value">{stats.absentToday}</span>
          </div>
          <UserX size={40} className="stat-card-bg-icon" />
          <span className="stat-card-hint">View list →</span>
        </div>

        <div className="stat-card card-orange clickable" onClick={() => openModal("pending")} title="Click to view pending approvals">
          <div className="stat-card-icon"><Clock size={22} strokeWidth={1.8} /></div>
          <div className="stat-card-body">
            <span className="stat-label">Pending Approvals</span>
            <span className="stat-value">{stats.pendingApprovals}</span>
          </div>
          <Clock size={40} className="stat-card-bg-icon" />
          <span className="stat-card-hint">View list →</span>
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
                <th>#</th><th>Name</th><th>Email</th><th>Status</th><th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.length === 0 ? (
                <tr><td colSpan="5" className="no-data">No recent registrations</td></tr>
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
                    <td className="user-date">{new Date(user.createdAt).toLocaleDateString("en-IN")}</td>
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
                <span className="mc-date">{new Date(user.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div className="dash-overlay" onClick={closeModal}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="dm-header">
              <div className="dm-header-left">
                {modal.type === "present"  && <CheckCircle size={20} color="#16a34a" />}
                {modal.type === "absent"   && <AlertCircle size={20} color="#dc2626" />}
                {modal.type === "pending"  && <Clock size={20} color="#d97706" />}
                {modal.type === "total"    && <Building2 size={20} color="#2563eb" />}
                <h3>{modal.title}</h3>
              </div>
              <button className="dm-close" onClick={closeModal}><X size={18} /></button>
            </div>

            {/* Count */}
            {!modal.loading && (
              <p className="dm-count">
                {modal.data.length} {modal.data.length === 1 ? "employee" : "employees"}
              </p>
            )}

            {/* Content */}
            <div className="dm-body">
              {modal.loading ? (
                <div className="dm-loading"><Spinner size={28} color="#e11d48" /><span>Loading...</span></div>
              ) : modal.data.length === 0 ? (
                <div className="dm-empty">
                  {modal.type === "present" && "No employees checked in today"}
                  {modal.type === "absent"  && "All employees are present today! 🎉"}
                  {modal.type === "pending" && "No pending approvals"}
                  {modal.type === "total"   && "No employees found"}
                </div>
              ) : (
                <div className="dm-list">
                  {modal.data.map((item, i) => {
                    // Present modal — attendance record
                    if (modal.type === "present") {
                      const emp = item.employee;
                      return (
                        <div key={item._id} className="dm-item">
                          <div className="dm-item-avatar">{emp?.name?.[0]?.toUpperCase() || "?"}</div>
                          <div className="dm-item-info">
                            <span className="dm-item-name">{emp?.name}</span>
                            <span className="dm-item-sub">{emp?.department || "—"}</span>
                          </div>
                          <div className="dm-item-right">
                            <span className="dm-time-badge">
                              In: {item.checkIn ? new Date(item.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--"}
                            </span>
                            {item.checkOut && (
                              <span className="dm-time-badge dm-out">
                                Out: {new Date(item.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Absent, Pending, Total — user object
                    return (
                      <div key={item._id} className="dm-item">
                        <div className={`dm-item-avatar ${modal.type === "absent" ? "av-red" : modal.type === "pending" ? "av-orange" : "av-blue"}`}>
                          {item.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="dm-item-info">
                          <span className="dm-item-name">{item.name}</span>
                          <span className="dm-item-sub">{item.department || item.email}</span>
                        </div>
                        <div className="dm-item-right">
                          {modal.type === "absent" && (
                            <span className="dm-absent-badge"><UserX size={12} /> Absent</span>
                          )}
                          {modal.type === "pending" && (
                            <span className="dm-pending-badge"><Clock size={12} /> Pending</span>
                          )}
                          {modal.type === "total" && (
                            <span className="dm-approved-badge"><UserCheck size={12} /> Active</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;