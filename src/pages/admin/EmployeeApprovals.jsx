import { useEffect, useState } from "react";
import axios from "axios";
import Toast from "../../components/Toast";
import Spinner from "../../components/Spinner";
import { useToast } from "../../hooks/useToast";
import "../../styles/admin/approvals.css";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function EmployeeApprovals() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const { toasts, toast, removeToast } = useToast();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/pending`);
      setEmployees(res.data);
    } catch (error) {
      toast.error("Failed to load pending employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const approveEmployee = async (id) => {
    setActionId(id + "_approve");
    try {
      const res = await axios.put(`${API_URL}/api/admin/approve/${id}`);
      toast.success(res.data.message || "Employee approved!");
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval failed");
    } finally {
      setActionId(null);
    }
  };

  const rejectEmployee = async (id) => {
    setActionId(id + "_reject");
    try {
      const res = await axios.delete(`${API_URL}/api/admin/reject/${id}`);
      toast.info(res.data.message || "Employee rejected");
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Rejection failed");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="page-title">
        <h2>Employee Approvals</h2>
        <p>Review employee registration requests</p>
      </div>

      <div className="approval-card">
        {loading ? (
          <div className="table-loading"><Spinner size={30} /> <span>Loading...</span></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No Pending Employees</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department || "-"}</td>
                    <td>{emp.designation || "-"}</td>
                    <td className="pending-status">{emp.status}</td>
                    <td>
                      <button
                        className="approve-btn"
                        onClick={() => approveEmployee(emp._id)}
                        disabled={!!actionId}
                      >
                        {actionId === emp._id + "_approve" ? <Spinner size={16} color="#fff" /> : "Approve"}
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => rejectEmployee(emp._id)}
                        disabled={!!actionId}
                      >
                        {actionId === emp._id + "_reject" ? <Spinner size={16} color="#fff" /> : "Reject"}
                      </button>
                    </td>
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

export default EmployeeApprovals;