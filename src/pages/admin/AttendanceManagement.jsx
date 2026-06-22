import { useEffect, useState } from "react";
import axios from "axios";
import { RefreshCw, Search, Users, Clock, Calendar } from "lucide-react";
import Spinner from "../../components/Spinner";
import "../../styles/admin/attendance.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function AttendanceManagement() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

 useEffect(() => {
  applyFilters();
}, [
  records,
  search,
  filterStatus,
  dateFilter,
  startDate,
  endDate,
]);

  const fetchAttendance = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/attendance`);
      // Admin ki rows filter out karo
      const empOnly = res.data.filter(
        (r) => r.employee?.role !== "admin" && r.employee?.name?.toLowerCase() !== "admin"
      );
      setRecords(empOnly);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

const applyFilters = () => {
  let data = [...records];

  // Search
  if (search.trim()) {
    const q = search.toLowerCase();

    data = data.filter(
      (r) =>
        r.employee?.name?.toLowerCase().includes(q) ||
        r.employee?.department?.toLowerCase().includes(q)
    );
  }

  const today = new Date().toISOString().split("T")[0];

  // Date Filter
  if (dateFilter === "Today") {
    data = data.filter((r) => r.date === today);
  }

  if (dateFilter === "Weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    data = data.filter((r) => {
      const recordDate = new Date(r.date);
      return recordDate >= weekAgo;
    });
  }

  if (dateFilter === "Monthly") {
    const now = new Date();

    data = data.filter((r) => {
      const recordDate = new Date(r.date);

      return (
        recordDate.getMonth() === now.getMonth() &&
        recordDate.getFullYear() === now.getFullYear()
      );
    });
  }

  if (
    dateFilter === "Custom" &&
    startDate &&
    endDate
  ) {
    data = data.filter(
      (r) =>
        r.date >= startDate &&
        r.date <= endDate
    );
  }

  // Status Filter
  if (filterStatus !== "All") {
    if (filterStatus === "Today") {
      data = data.filter((r) => r.date === today);
    } else {
      data = data.filter(
        (r) => r.status === filterStatus
      );
    }
  }

  setFiltered(data);
};

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
    return `${diff.toFixed(1)}h`;
  };
  const downloadPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Attendance Report", 14, 15);

  doc.setFontSize(10);
  doc.text(`Filter: ${dateFilter}`, 14, 22);

  autoTable(doc, {
    startY: 30,
    head: [[
      "#",
      "Employee",
      "Date",
      "Check In",
      "Check Out",
      "Hours",
      "Status"
    ]],
    body: filtered.map((item, i) => [
      i + 1,
      item.employee?.name || "-",
      item.date || "-",
      item.checkIn
        ? new Date(item.checkIn).toLocaleTimeString()
        : "-",
      item.checkOut
        ? new Date(item.checkOut).toLocaleTimeString()
        : "-",
      calculateHours(item.checkIn, item.checkOut),
      item.status
    ])
  });

  doc.save(
    `attendance-${dateFilter.toLowerCase()}.pdf`
  );
};

  const statusClass = (s) => {
    if (s === "Present") return "att-badge att-present";
    if (s === "Half Day") return "att-badge att-halfday";
    if (s === "Sunday") return "att-badge att-sunday";
    if (s === "Holiday") return "att-badge att-holiday";
    if (s === "Leave") return "att-badge att-leave";
    return "att-badge att-absent";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const statuses = [
  "All",
  "Today",
  "Present",
  "Absent",
  "Half Day",
  "Sunday",
  "Holiday",
  "Leave"
];

  // Summary counts
  const presentCount = filtered.filter((r) => r.status === "Present").length;
  const absentCount = filtered.filter((r) => r.status === "Absent").length;
  const totalCount = filtered.length;
  

  return (
    <div className="att-mgmt-root">

      {/* Header */}
      <div className="att-header">
        <div>
          <h2 className="att-title">Attendance Management</h2>
          <p className="att-sub">Monitor employee attendance records</p>
        </div>
        <button
          className="att-refresh-btn"
          onClick={() => fetchAttendance(true)}
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? "spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
        <button
  className="att-refresh-btn"
  onClick={downloadPDF}
>
  Download PDF
</button>
      </div>

      {/* Summary pills */}
      <div className="att-summary">
        <div className="sum-pill sum-total">
          <Users size={14} /> Total: <strong>{totalCount}</strong>
        </div>
        <div className="sum-pill sum-present">
          <Clock size={14} /> Present: <strong>{presentCount}</strong>
        </div>
        <div className="sum-pill sum-absent">
          <Calendar size={14} /> Absent: <strong>{absentCount}</strong>
        </div>
      </div>

      {/* Filters */}
      <div className="att-filters">
        <div className="att-search-wrap">
          <Search size={15} className="att-search-icon" />
          <input
            className="att-search"
            placeholder="Search employee or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      <select
  value={dateFilter}
  onChange={(e) => setDateFilter(e.target.value)}
>
  <option value="All">All</option>
  <option value="Today">Today</option>
  <option value="Weekly">Weekly</option>
  <option value="Monthly">Monthly</option>
  <option value="Custom">Custom</option>
</select>

<p>Current Filter: {dateFilter}</p>
        {dateFilter === "Custom" && (
  <>
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />

    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
    />
  </>
)}

        <div className="att-status-filters">
          {statuses.map((s) => (
            <button
              key={s}
              className={`sf-btn ${filterStatus === s ? "sf-active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="att-card">
        {loading ? (
          <div className="att-loading">
            <Spinner size={32} color="#e11d48" />
            <span>Loading records...</span>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="att-table-wrap">
              <table className="att-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-data">No attendance records found</td>
                    </tr>
                  ) : (
                    filtered.map((item, i) => (
                      <tr key={item._id}>
                        <td className="row-num">{i + 1}</td>
                        <td>
                          <div className="emp-cell">
                            <span className="emp-cell-name">{item.employee?.name}</span>
                            {item.employee?.department && (
                              <span className="emp-cell-dept">{item.employee.department}</span>
                            )}
                          </div>
                        </td>
                        <td className="date-cell">{item.date || formatDate(item.createdAt)}</td>
                        <td className="time-cell">
                          {item.checkIn ? new Date(item.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-"}
                        </td>
                        <td className="time-cell">
                          {item.checkOut ? new Date(item.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-"}
                        </td>
                        <td className="hours-cell">{calculateHours(item.checkIn, item.checkOut)}</td>
                        <td>
                          <span className={statusClass(item.status)}>{item.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="att-mobile-list">
              {filtered.length === 0 ? (
                <p className="no-data">No attendance records found</p>
              ) : (
                filtered.map((item) => (
                  <div key={item._id} className="att-mobile-card">
                    <div className="amc-row1">
                      <div className="emp-cell">
                        <span className="emp-cell-name">{item.employee?.name}</span>
                        {item.employee?.department && (
                          <span className="emp-cell-dept">{item.employee.department}</span>
                        )}
                      </div>
                      <span className={statusClass(item.status)}>{item.status}</span>
                    </div>
                    <div className="amc-row2">
                      <span>📅 {item.date || formatDate(item.createdAt)}</span>
                      <span>In: {item.checkIn ? new Date(item.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-"}</span>
                      <span>Out: {item.checkOut ? new Date(item.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-"}</span>
                      <span>{calculateHours(item.checkIn, item.checkOut)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AttendanceManagement;