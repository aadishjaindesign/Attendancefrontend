import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee/leave.css";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function Leave() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [leaves, setLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null); // modal ke liye
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: "", type: "" });

  const [form, setForm] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const showToast = (text, type = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg({ text: "", type: "" }), 3000);
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/leave/employee/${user._id}`);
      setLeaves(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/leave/apply`, {
        employee: user._id,
        leaveType: form.leaveType,
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason,
      });
      showToast("Leave request submitted successfully!", "success");
      setForm({ leaveType: "", fromDate: "", toDate: "", reason: "" });
      fetchLeaves();
    } catch (err) {
      showToast(err.response?.data?.message || "Error submitting leave", "error");
    } finally {
      setLoading(false);
    }
  };

  // Rejected leaves count nahi honge monthly limit mein
  const currentMonthLeaves = leaves.filter(
    (leave) => leave.status !== "Rejected"
  ).length;

  const statusClass = (s) => {
    if (s === "Approved") return "approved-status";
    if (s === "Rejected") return "rejected-status";
    return "pending-status";
  };

  return (
    <div>
      {/* Toast notification */}
      {toastMsg.text && (
        <div className={`leave-toast leave-toast-${toastMsg.type}`}>
          {toastMsg.text}
        </div>
      )}

      {/* ── Reason / Rejection Modal ── */}
      {selectedLeave && (
        <div className="modal-overlay" onClick={() => setSelectedLeave(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <h3>
                {selectedLeave.status === "Rejected"
                  ? "❌ Leave Rejection Slip"
                  : "📋 Leave Details"}
              </h3>
              <span className={`modal-status ${statusClass(selectedLeave.status)}`}>
                {selectedLeave.status}
              </span>
            </div>

            {/* Info rows */}
            <div className="modal-rows">
              <div className="modal-row">
                <span>Leave Type</span>
                <strong>{selectedLeave.leaveType}</strong>
              </div>
              <div className="modal-row">
                <span>From</span>
                <strong>{new Date(selectedLeave.fromDate).toLocaleDateString("en-IN")}</strong>
              </div>
              <div className="modal-row">
                <span>To</span>
                <strong>{new Date(selectedLeave.toDate).toLocaleDateString("en-IN")}</strong>
              </div>
              <div className="modal-row">
                <span>My Reason</span>
                <strong>{selectedLeave.reason}</strong>
              </div>
            </div>

            {/* Rejection reason box — sirf rejected leave pe */}
            {selectedLeave.status === "Rejected" && (
              <div className="rejection-box">
                <p className="rejection-label">Admin Rejection Reason:</p>
                <p className="rejection-text">
                  {selectedLeave.rejectionReason || "No reason provided by admin"}
                </p>
              </div>
            )}

            <button className="modal-close-btn" onClick={() => setSelectedLeave(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Page Title ── */}
      <div className="page-title">
        <h2>Leave Application</h2>
        <p>Monthly Leaves Used : {currentMonthLeaves}/2</p>
      </div>

      {/* ── Form ── */}
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
              <option value="">Select Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Emergency">Emergency Leave</option>
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

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Leave Request"}
          </button>
        </form>
      </div>

      {/* ── History Table ── */}
      <div className="history-card">
        <h3>My Leave Requests</h3>

        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            {leaves.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                  No Leave Requests Yet
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{leave.leaveType}</td>

                  <td>{new Date(leave.fromDate).toLocaleDateString("en-IN")}</td>

                  <td>{new Date(leave.toDate).toLocaleDateString("en-IN")}</td>

                  {/* Reason — truncated, click to see full */}
                  <td
                    className="leave-reason-cell"
                    onClick={() => setSelectedLeave(leave)}
                    title={leave.reason}
                  >
                    {leave.reason.length > 20
                      ? leave.reason.slice(0, 20) + "..."
                      : leave.reason}
                  </td>

                  <td>
                    <span className={statusClass(leave.status)}>
                      {leave.status}
                    </span>
                  </td>

                  {/* Details / Rejection Slip button */}
                  <td>
                    <button
                      className={`detail-btn ${leave.status === "Rejected" ? "detail-btn-reject" : "detail-btn-view"}`}
                      onClick={() => setSelectedLeave(leave)}
                    >
                      {leave.status === "Rejected" ? "View Slip" : "View"}
                    </button>
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