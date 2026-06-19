import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee/leave.css";

function Leave() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [leaves, setLeaves] = useState([]);
  const API_URL = "https://attendance-backend-ym0q.onrender.com";

  const [form, setForm] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
    const res = await axios.get(
  `${API_URL}/api/leave/employee/${user._id}`
);
      setLeaves(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await axios.post(
  `${API_URL}/api/leave/apply`,
  {
          employee: user._id,
          leaveType: form.leaveType,
          fromDate: form.fromDate,
          toDate: form.toDate,
          reason: form.reason,
        }
      );

      alert("Leave Request Sent");

      setForm({
        leaveType: "",
        fromDate: "",
        toDate: "",
        reason: "",
      });

      fetchLeaves();

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Error submitting leave"
      );

    }
  };

  const currentMonthLeaves = leaves.length;

  return (
    <div>

      <div className="page-title">
        <h2>Leave Application</h2>
        <p>
          Monthly Leaves Used : {currentMonthLeaves}/2
        </p>
      </div>

      <div className="leave-form-card">

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Leave Type</label>

            <select
              name="leaveType"
              value={form.leaveType}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Leave
              </option>

              <option value="Casual">
                Casual Leave
              </option>

              <option value="Sick">
                Sick Leave
              </option>

              <option value="Emergency">
                Emergency Leave
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>From Date</label>

            <input
              type="date"
              name="fromDate"
              value={form.fromDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>To Date</label>

            <input
              type="date"
              name="toDate"
              value={form.toDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Reason</label>

            <textarea
              rows="4"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Enter reason..."
              required
            />
          </div>

          <button
            className="submit-btn"
            type="submit"
          >
            Submit Leave Request
          </button>

        </form>

      </div>

      <div className="history-card">

        <h3>My Leave Requests</h3>

        <table>

          <thead>
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {leaves.length === 0 ? (
              <tr>
                <td colSpan="4">
                  No Leave Requests Yet
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave._id}>

                  <td>
                    {leave.leaveType}
                  </td>

                  <td>
                    {new Date(
                      leave.fromDate
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {new Date(
                      leave.toDate
                    ).toLocaleDateString()}
                  </td>

                  <td
                    className={
                      leave.status === "Approved"
                        ? "approved-status"
                        : leave.status === "Rejected"
                        ? "rejected-status"
                        : "pending-status"
                    }
                  >
                    {leave.status}
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

export default Leave;