import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/approvals.css";

function EmployeeApprovals() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = "https://attendance-9zjv.onrender.com";

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/admin/pending`
      );

      setEmployees(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const approveEmployee = async (id) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/admin/approve/${id}`
      );

      alert(res.data.message);

      fetchEmployees();
    } catch (error) {
      console.log(error);
    }
  };

  const rejectEmployee = async (id) => {
    try {
      const res = await axios.delete(
        `${API_URL}/api/admin/reject/${id}`
      );

      alert(res.data.message);

      fetchEmployees();
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <h3>Loading Employees...</h3>;
  }

  return (
    <div>
      <div className="page-title">
        <h2>Employee Approvals</h2>

        <p>
          Review employee registration requests
        </p>
      </div>

      <div className="approval-card">

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
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No Pending Employees
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id}>

                  <td>{emp.name}</td>

                  <td>{emp.email}</td>

                  <td>
                    {emp.department || "-"}
                  </td>

                  <td>
                    {emp.designation || "-"}
                  </td>

                  <td className="pending-status">
                    {emp.status}
                  </td>

                  <td>

                    <button
                      className="approve-btn"
                      onClick={() =>
                        approveEmployee(emp._id)
                      }
                    >
                      Approve
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() =>
                        rejectEmployee(emp._id)
                      }
                    >
                      Reject
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

export default EmployeeApprovals;