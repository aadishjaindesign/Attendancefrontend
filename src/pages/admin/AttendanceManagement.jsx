import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../../components/Spinner";
import "../../styles/admin/attendance.css";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function AttendanceManagement() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/attendance`);
      setRecords(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
    return `${diff.toFixed(1)}h`;
  };

  const statusColor = (s) => {
    if (s === "Present") return "present-status";
    if (s === "Sunday") return "sunday-status";
    if (s === "Holiday") return "holiday-status";
    if (s === "Leave") return "leave-status";
    return "absent-status";
  };

  return (
    <div>
      <div className="page-title">
        <h2>Attendance Management</h2>
        <p>Monitor employee attendance records</p>
      </div>

      <div className="attendance-card">
        {loading ? (
          <div className="table-loading"><Spinner size={30} /><span>Loading...</span></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan="6" className="no-data">No Attendance Records Found</td></tr>
              ) : (
                records.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="att-emp-info">
                        <span className="att-emp-name">{item.employee?.name}</span>
                        <span className="att-emp-dept">{item.employee?.department}</span>
                      </div>
                    </td>
                    <td>{item.date}</td>
                    <td>{item.checkIn ? new Date(item.checkIn).toLocaleTimeString() : "-"}</td>
                    <td>{item.checkOut ? new Date(item.checkOut).toLocaleTimeString() : "-"}</td>
                    <td>{calculateHours(item.checkIn, item.checkOut)}</td>
                    <td className={statusColor(item.status)}>{item.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AttendanceManagement;