import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../../components/Spinner";
import "../../styles/admin/reports.css";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function Reports() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [filter, setFilter] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedEmp, setExpandedEmp] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchReport();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/employees`);
      setEmployees(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = { filter };
      if (selectedEmp) params.employeeId = selectedEmp;
      if (filter === "custom") {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const res = await axios.get(
  `${API_URL}/api/admin/employee-report`,
  { params }
);

console.log("REPORT DATA =>", res.data);
console.log(
  "FIRST EMPLOYEE ATTENDANCE =>",
  res.data[0]?.attendance
);

console.log(
  "FIRST EMPLOYEE TOTAL DAYS =>",
  res.data[0]?.totalDays
);

console.log(
  "FIRST EMPLOYEE TOTAL HOURS =>",
  res.data[0]?.totalHours
);

setReport(res.data);
      setReport(res.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const toggleExpand = (empId) => {
    setExpandedEmp(expandedEmp === empId ? null : empId);
  };

const statusColor = (s) => {
  if (s === "Present") return "badge-green";
  if (s === "Half Day") return "badge-yellow";
  if (s === "Absent") return "badge-red";
  if (s === "Sunday") return "badge-blue";
  if (s === "Holiday") return "badge-purple";
  if (s === "Leave") return "badge-orange";
  return "badge-gray";
};

  return (
    <div className="reports-page">
      <div className="page-title">
        <h2>Attendance Reports</h2>
        <p>Employee wise weekly / monthly detail</p>
      </div>

      <div className="report-filters">
        <select value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
          <option value="">All Employees</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>{emp.name}</option>
          ))}
        </select>

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </select>

        {filter === "custom" && (
          <>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </>
        )}

        <button className="fetch-btn" onClick={fetchReport} disabled={loading}>
          {loading ? <Spinner size={18} color="#fff" /> : "Search"}
        </button>
      </div>

      {loading ? (
        <div className="report-loading"><Spinner size={32} /><span>Loading Report...</span></div>
      ) : !report || report.length === 0 ? (
        <div className="report-empty">No Records Found</div>
      ) : (
        report.map((emp) => (
          <div className="emp-report-card" key={emp.employeeId}>
            <div className="emp-report-header" onClick={() => toggleExpand(emp.employeeId)}>
              <div className="emp-report-info">
                <span className="emp-name">{emp.name}</span>
                <span className="emp-dept">{emp.department}</span>
              </div>
              <div className="emp-report-stats">
                <div className="stat-pill green">Present: {emp.totalDays}</div>
                <div className="stat-pill yellow">
  Half Day: {emp.halfDays}
</div>
                <div className="stat-pill blue">Hours: {emp.totalHours}h</div>
                <div className="stat-pill orange">Leaves: {emp.leavesCount}</div>
              </div>
              <span className="expand-icon">{expandedEmp === emp.employeeId ? "▲" : "▼"}</span>
            </div>

            {expandedEmp === emp.employeeId && (
              <div className="emp-report-detail">
                <h4 className="detail-heading">Attendance Detail</h4>

                {emp.attendance.length === 0 ? (
                  <p className="no-data">No attendance records</p>
                ) : (
                  <div className="detail-table-wrap">
                    <table className="detail-table">
                      <thead>
                        <tr>
                          <th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emp.attendance.map((a, i) => (
                          <tr key={i}>
                            <td>{a.date}</td>
                            <td>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "--"}</td>
                            <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : "--"}</td>
                            <td>{a.hours}h</td>
                            <td><span className={`status-badge ${statusColor(a.status)}`}>{a.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <h4 className="detail-heading" style={{ marginTop: "20px" }}>Leave Detail</h4>

                {emp.leaves.length === 0 ? (
                  <p className="no-data">No leave records</p>
                ) : (
                  <div className="detail-table-wrap">
                    <table className="detail-table">
                      <thead>
                        <tr>
                          <th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Rejection Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emp.leaves.map((l, i) => (
                          <tr key={i}>
                            <td>{l.leaveType}{l.isAdminGranted ? " 🎁" : ""}</td>
                            <td>{new Date(l.fromDate).toLocaleDateString()}</td>
                            <td>{new Date(l.toDate).toLocaleDateString()}</td>
                            <td>{l.reason}</td>
                            <td>
                              <span className={
                                l.status === "Approved" ? "approved-status" :
                                l.status === "Rejected" ? "rejected-status" : "pending-status"
                              }>
                                {l.status}
                              </span>
                            </td>
                            <td>{l.rejectionReason || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Reports;