import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/attendance.css";

function AttendanceManagement() {

  const [records, setRecords] = useState([]);
  const API_URL = "https://attendance-backend-ym0q.onrender.com";

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/admin/attendance`
      );
      setRecords(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = (end - start) / (1000 * 60 * 60);
    return `${diff.toFixed(1)}h`;
  };

  return (
    <div>

      <div className="page-title">
        <h2>Attendance Management</h2>
        <p>Monitor employee attendance records</p>
      </div>

      <div className="attendance-card">
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
              <tr>
                <td colSpan="6">No Attendance Records Found</td>
              </tr>
            ) : (
              records.map((item) => (
                <tr key={item._id}>

                  <td>{item.employee?.name}</td>

                  <td>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>

                  <td>
                    {item.checkIn
                      ? new Date(item.checkIn).toLocaleTimeString()
                      : "-"}
                  </td>

                  <td>
                    {item.checkOut
                      ? new Date(item.checkOut).toLocaleTimeString()
                      : "-"}
                  </td>

                  <td>{calculateHours(item.checkIn, item.checkOut)}</td>

                  <td className={
                    item.status === "Present"
                      ? "present-status"
                      : "absent-status"
                  }>
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

export default AttendanceManagement;