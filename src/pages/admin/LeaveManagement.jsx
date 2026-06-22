import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Clock, Gift, RefreshCw, X, AlertCircle } from "lucide-react";
import Toast from "../../components/Toast";
import Spinner from "../../components/Spinner";
import { useToast } from "../../hooks/useToast";
import "../../styles/admin/leaves.css";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const { toasts, toast, removeToast } = useToast();

  // Reason modal
  const [reasonModal, setReasonModal] = useState(null);

  // Reject modal
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectLeaveId, setRejectLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => { fetchLeaves(); }, []);

  useEffect(() => {
    if (filterStatus === "All") setFiltered(leaves);
    else setFiltered(leaves.filter((l) => l.status === filterStatus));
  }, [leaves, filterStatus]);

  const fetchLeaves = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/leave/all`);
      setLeaves(res.data);
    } catch (error) {
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    if (!rejectionReason.trim()) { toast.error("Please enter rejection reason"); return; }
    setRejectLoading(true);
    try {
      await axios.put(`${API_URL}/api/leave/reject/${rejectLeaveId}`, { rejectionReason });
      toast.info("Leave rejected");
      setRejectModal(false);
      fetchLeaves();
    } catch (error) {
      toast.error("Rejection failed");
    } finally {
      setRejectLoading(false);
    }
  };

  const statusIcon = (s) => {
    if (s === "Approved") return <CheckCircle size={12} />;
    if (s === "Rejected") return <XCircle size={12} />;
    return <Clock size={12} />;
  };

  const statusClass = (s) => {
    if (s === "Approved") return "lv-badge lv-approved";
    if (s === "Rejected") return "lv-badge lv-rejected";
    return "lv-badge lv-pending";
  };

  const typeClass = (leave) =>
    leave.isAdminGranted ? "lv-type-badge lv-type-admin" : "lv-type-badge";

  const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const statuses = ["All", "Pending", "Approved", "Rejected"];
  const pendingCount  = leaves.filter((l) => l.status === "Pending").length;
  const approvedCount = leaves.filter((l) => l.status === "Approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "Rejected").length;

  return (
    <div className="lv-root">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="lv-header">
        <div>
          <h2 className="lv-title">Leave Requests</h2>
          <p className="lv-sub">Manage employee leave requests</p>
        </div>
        <button className="lv-refresh" onClick={() => fetchLeaves(true)} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? "spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Summary */}
      <div className="lv-summary">
        <div className="lv-sum-pill lv-sum-pending"><Clock size={13} /> Pending: <strong>{pendingCount}</strong></div>
        <div className="lv-sum-pill lv-sum-approved"><CheckCircle size={13} /> Approved: <strong>{approvedCount}</strong></div>
        <div className="lv-sum-pill lv-sum-rejected"><XCircle size={13} /> Rejected: <strong>{rejectedCount}</strong></div>
      </div>

      {/* Filter tabs */}
      <div className="lv-tabs">
        {statuses.map((s) => (
          <button key={s} className={`lv-tab ${filterStatus === s ? "lv-tab-active" : ""}`} onClick={() => setFilterStatus(s)}>
            {s} {s !== "All" && <span className="lv-tab-count">{leaves.filter((l) => l.status === s).length}</span>}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="lv-card">
        {loading ? (
          <div className="lv-loading"><Spinner size={30} color="#e11d48" /><span>Loading...</span></div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="lv-table-wrap">
              <table className="lv-table">
                <thead>
                  <tr>
                    <th>#</th>
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
                  {filtered.length === 0 ? (
                    <tr><td colSpan="8" className="lv-no-data">No leave requests found</td></tr>
                  ) : (
                    filtered.map((leave, i) => (
                      <tr key={leave._id}>
                        <td className="lv-num">{i + 1}</td>
                        <td>
                          <div className="lv-emp">
                            <span className="lv-emp-name">{leave.employee?.name}</span>
                            {leave.employee?.department && (
                              <span className="lv-emp-dept">{leave.employee.department}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={typeClass(leave)}>
                            {leave.isAdminGranted && <Gift size={11} />}
                            {leave.leaveType}
                          </span>
                        </td>
                        <td className="lv-date">{fmt(leave.fromDate)}</td>
                        <td className="lv-date">{fmt(leave.toDate)}</td>
                        <td>
                          <span
                            className="lv-reason-text"
                            onClick={() => setReasonModal({ reason: leave.reason, name: leave.employee?.name })}
                            title="Click to read full reason"
                          >
                            {leave.reason}
                          </span>
                        </td>
                        <td>
                          <div className="lv-status-col">
                            <span className={statusClass(leave.status)}>
                              {statusIcon(leave.status)} {leave.status}
                            </span>
                            {leave.status === "Rejected" && leave.rejectionReason && (
                              <span className="lv-rejection-note">
                                <AlertCircle size={11} /> {leave.rejectionReason}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {leave.status === "Pending" ? (
                            <div className="lv-action-btns">
                              <button className="lv-approve-btn" onClick={() => approveLeave(leave._id)} disabled={!!actionId}>
                                {actionId === leave._id ? <Spinner size={13} color="#fff" /> : <><CheckCircle size={13} /> Approve</>}
                              </button>
                              <button className="lv-reject-btn" onClick={() => openRejectModal(leave._id)} disabled={!!actionId}>
                                <XCircle size={13} /> Reject
                              </button>
                            </div>
                          ) : <span className="lv-dash">—</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lv-mobile-list">
              {filtered.length === 0 ? (
                <p className="lv-no-data">No leave requests found</p>
              ) : (
                filtered.map((leave) => (
                  <div key={leave._id} className="lv-mobile-card">
                    <div className="lv-mc-top">
                      <div className="lv-emp">
                        <span className="lv-emp-name">{leave.employee?.name}</span>
                        {leave.employee?.department && <span className="lv-emp-dept">{leave.employee.department}</span>}
                      </div>
                      <span className={statusClass(leave.status)}>
                        {statusIcon(leave.status)} {leave.status}
                      </span>
                    </div>
                    <div className="lv-mc-row2">
                      <span className={typeClass(leave)}>
                        {leave.isAdminGranted && <Gift size={11} />} {leave.leaveType}
                      </span>
                      <span className="lv-date">{fmt(leave.fromDate)} → {fmt(leave.toDate)}</span>
                    </div>
                    <p className="lv-mc-reason" onClick={() => setReasonModal({ reason: leave.reason, name: leave.employee?.name })}>
                      {leave.reason}
                    </p>
                    {leave.status === "Rejected" && leave.rejectionReason && (
                      <span className="lv-rejection-note"><AlertCircle size={11} /> {leave.rejectionReason}</span>
                    )}
                    {leave.status === "Pending" && (
                      <div className="lv-action-btns" style={{ marginTop: "10px" }}>
                        <button className="lv-approve-btn" onClick={() => approveLeave(leave._id)} disabled={!!actionId}>
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button className="lv-reject-btn" onClick={() => openRejectModal(leave._id)} disabled={!!actionId}>
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Reason Modal */}
      {reasonModal && (
        <div className="lv-overlay" onClick={() => setReasonModal(null)}>
          <div className="lv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lv-modal-header">
              <h3>Leave Reason</h3>
              <button className="lv-modal-close" onClick={() => setReasonModal(null)}><X size={18} /></button>
            </div>
            <p className="lv-modal-emp">{reasonModal.name}</p>
            <p className="lv-modal-body">{reasonModal.reason}</p>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="lv-overlay" onClick={() => setRejectModal(false)}>
          <div className="lv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lv-modal-header">
              <h3>Reject Leave</h3>
              <button className="lv-modal-close" onClick={() => setRejectModal(false)}><X size={18} /></button>
            </div>
            <p className="lv-modal-hint">This reason will be shown to the employee as a rejection slip.</p>
            <div className="lv-modal-form">
              <label>Rejection Reason *</label>
              <textarea
                rows={3}
                placeholder="Enter reason for rejecting this leave..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="lv-modal-actions">
              <button className="lv-modal-cancel" onClick={() => setRejectModal(false)}>Cancel</button>
              <button className="lv-modal-reject" onClick={confirmReject} disabled={rejectLoading}>
                {rejectLoading ? <Spinner size={16} color="#fff" /> : <><XCircle size={15} /> Confirm Reject</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveManagement;