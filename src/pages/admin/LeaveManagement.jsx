import { useEffect, useState } from "react";
import axios from "axios";
import Toast from "../../components/Toast";
import Spinner from "../../components/Spinner";
import { useToast } from "../../hooks/useToast";
import "../../styles/admin/leaves.css";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const { toasts, toast, removeToast } = useToast();

  // Reject modal
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectLeaveId, setRejectLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/leave/all`);
      setLeaves(res.data);
    } catch (error) {
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const approveLeave = async (id) => {
    setActionId(id);
    try {
      await axios.put(`${API_URL}/api/leave/approve/${id}`);
      toast.success("Leave approved successfully");
      fetchLeaves();
    } catch (error) {
      toast.error("Approval failed");
    } finally {
      setActionId(null);
    }
  };

  const openRejectModal = (id) => {
    setRejectLeaveId(id);
    setRejectionReason("");
    setRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter rejection reason");
      return;
    }

    setRejectLoading(true);
    try {
      await axios.put(`${API_URL}/api/leave/reject/${rejectLeaveId}`, {
        rejectionReason,
      });
      toast.info("Leave rejected");
      setRejectModal(false);
      fetchLeaves();
    } catch (error) {
      toast.error("Rejection failed");
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <div>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="page-title">
        <h2>Leave Requests</h2>
        <p>Manage employee leave requests</p>
      </div>

      <div className="leave-card">
        {loading ? (
          <div className="table-loading"><Spinner size={30} /><span>Loading...</span></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr><td colSpan="7" className="no-data">No Leave Requests Found</td></tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div className="leave-emp-info">
                        <span className="leave-emp-name">{leave.employee?.name}</span>
                        <span className="leave-emp-dept">{leave.employee?.department}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`leave-type-badge ${leave.isAdminGranted ? "admin-granted" : ""}`}>
                        {leave.leaveType}
                        {leave.isAdminGranted && " 🎁"}
                      </span>
                    </td>
                    <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                    <td className="leave-reason">{leave.reason}</td>
                    <td>
                      <span className={
                        leave.status === "Approved" ? "approved-status" :
                        leave.status === "Rejected" ? "rejected-status" : "pending-status"
                      }>
                        {leave.status}
                      </span>
                      {leave.status === "Rejected" && leave.rejectionReason && (
                        <div className="rejection-note">Reason: {leave.rejectionReason}</div>
                      )}
                    </td>
                    <td>
                      {leave.status === "Pending" ? (
                        <div className="action-btns">
                          <button
                            className="approve-btn"
                            onClick={() => approveLeave(leave._id)}
                            disabled={!!actionId}
                          >
                            {actionId === leave._id ? <Spinner size={14} color="#fff" /> : "Approve"}
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => openRejectModal(leave._id)}
                            disabled={!!actionId}
                          >
                            Reject
                          </button>
                        </div>
                      ) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Leave</h3>
              <button className="modal-close" onClick={() => setRejectModal(false)}>×</button>
            </div>
            <p style={{ color: "#64748b", marginBottom: "16px", fontSize: "0.9rem" }}>
              Please provide a reason for rejection. This will be shown to the employee.
            </p>
            <div className="modal-form">
              <label>Rejection Reason *</label>
              <textarea
                rows={3}
                placeholder="Enter reason for rejecting this leave..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setRejectModal(false)}>Cancel</button>
              <button
                className="modal-confirm reject-confirm"
                onClick={confirmReject}
                disabled={rejectLoading}
              >
                {rejectLoading ? <Spinner size={18} color="#fff" /> : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveManagement;