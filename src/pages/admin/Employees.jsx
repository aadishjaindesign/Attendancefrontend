import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, UserX, Gift } from "lucide-react";
import Toast from "../../components/Toast";
import Spinner from "../../components/Spinner";
import { useToast } from "../../hooks/useToast";
import "../../styles/admin/employees.css";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [removedEmployees, setRemovedEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("active"); // "active" | "removed"
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const { toasts, toast, removeToast } = useToast();

  // Grant Leave Modal
  const [grantModal, setGrantModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [grantForm, setGrantForm] = useState({
    extraLeaves: 1,
    reason: "",
    fromDate: "",
    toDate: "",
  });
  const [grantLoading, setGrantLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchRemovedEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/employees`);
      setEmployees(res.data);
    } catch (error) {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchRemovedEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/employees/removed`);
      setRemovedEmployees(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const removeEmployee = async (id, name) => {
    setActionId(id);
    try {
      await axios.put(`${API_URL}/api/admin/remove/${id}`);
      toast.info(`${name} has been removed. They cannot login anymore.`);
      fetchEmployees();
      fetchRemovedEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Remove failed");
    } finally {
      setActionId(null);
    }
  };

  const openGrantModal = (emp) => {
    setSelectedEmp(emp);
    setGrantForm({ extraLeaves: 1, reason: "", fromDate: "", toDate: "" });
    setGrantModal(true);
  };

  const handleGrantLeave = async () => {
    if (!grantForm.reason) { toast.error("Enter leave reason"); return; }
    if (!grantForm.fromDate || !grantForm.toDate) { toast.error("Enter leave dates"); return; }

    setGrantLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/grant-leave`, {
        employeeId: selectedEmp._id,
        ...grantForm,
      });
      toast.success(res.data.message);
      setGrantModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Grant leave failed");
    } finally {
      setGrantLoading(false);
    }
  };

  const activeFiltered = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase())
  );

  const removedFiltered = removedEmployees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="page-title">
        <h2>Employees</h2>
        <p>Manage all company employees</p>
      </div>

      {/* Tabs */}
      <div className="emp-tabs">
        <button
          className={`emp-tab ${tab === "active" ? "active" : ""}`}
          onClick={() => setTab("active")}
        >
          Active Employees ({employees.length})
        </button>
        <button
          className={`emp-tab ${tab === "removed" ? "active" : ""}`}
          onClick={() => setTab("removed")}
        >
          Removed Employees ({removedEmployees.length})
        </button>
      </div>

      <div className="employee-toolbar">
        <input
          type="text"
          placeholder="Search Employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="employee-card">
        {loading ? (
          <div className="table-loading"><Spinner size={30} /><span>Loading...</span></div>
        ) : tab === "active" ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Email</th>
                <th>Extra Leaves</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeFiltered.length === 0 ? (
                <tr><td colSpan="7" className="no-data">No Employees Found</td></tr>
              ) : (
                activeFiltered.map((emp) => (
                  <tr key={emp._id}>
                    <td>{emp.name}</td>
                    <td>{emp.employeeId || "-"}</td>
                    <td>{emp.department || "-"}</td>
                    <td>{emp.email}</td>
                    <td>
                      <span className="extra-leaves-badge">{emp.extraLeaves || 0}</span>
                    </td>
                    <td>{new Date(emp.createdAt).toLocaleDateString()}</td>
                    <td className="action-btns">
                      <button
                        className="grant-btn"
                        title="Grant Extra Leave"
                        onClick={() => openGrantModal(emp)}
                      >
                        <Gift size={14} /> Grant Leave
                      </button>
                      <button
                        className="remove-emp-btn"
                        title="Remove Employee"
                        onClick={() => removeEmployee(emp._id, emp.name)}
                        disabled={actionId === emp._id}
                      >
                        {actionId === emp._id ? <Spinner size={14} color="#fff" /> : <><UserX size={14} /> Remove</>}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          /* Removed employees table */
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Email</th>
                <th>Removed Date</th>
              </tr>
            </thead>
            <tbody>
              {removedFiltered.length === 0 ? (
                <tr><td colSpan="5" className="no-data">No Removed Employees</td></tr>
              ) : (
                removedFiltered.map((emp) => (
                  <tr key={emp._id} className="removed-row">
                    <td>{emp.name}</td>
                    <td>{emp.employeeId || "-"}</td>
                    <td>{emp.department || "-"}</td>
                    <td>{emp.email}</td>
                    <td>{new Date(emp.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Grant Leave Modal */}
      {grantModal && selectedEmp && (
        <div className="modal-overlay" onClick={() => setGrantModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Grant Extra Leave</h3>
              <button className="modal-close" onClick={() => setGrantModal(false)}>×</button>
            </div>
            <p className="modal-emp-name">Employee: <strong>{selectedEmp.name}</strong></p>

            <div className="modal-form">
              <label>Number of Extra Leaves</label>
              <input
                type="number"
                min="1"
                max="30"
                value={grantForm.extraLeaves}
                onChange={(e) => setGrantForm({ ...grantForm, extraLeaves: e.target.value })}
              />

              <label>Reason</label>
              <input
                placeholder="Reason for granting leave"
                value={grantForm.reason}
                onChange={(e) => setGrantForm({ ...grantForm, reason: e.target.value })}
              />

              <label>From Date</label>
              <input
                type="date"
                value={grantForm.fromDate}
                onChange={(e) => setGrantForm({ ...grantForm, fromDate: e.target.value })}
              />

              <label>To Date</label>
              <input
                type="date"
                value={grantForm.toDate}
                onChange={(e) => setGrantForm({ ...grantForm, toDate: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setGrantModal(false)}>Cancel</button>
              <button className="modal-confirm" onClick={handleGrantLeave} disabled={grantLoading}>
                {grantLoading ? <Spinner size={18} color="#fff" /> : "Grant Leave"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;