import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/employees.css";

function Employees() {

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const API_URL = "https://attendance-9zjv.onrender.com";

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {

     const res = await axios.get(
  `${API_URL}/api/admin/employees`
);

      setEmployees(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      emp.email
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div>

      <div className="page-title">
        <h2>Employees</h2>
        <p>
          Manage all company employees
        </p>
      </div>

      <div className="employee-toolbar">

        <input
          type="text"
          placeholder="Search Employee..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      <div className="employee-card">

        <table>

          <thead>
            <tr>
              <th>Name</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Email</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>

          <tbody>

            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="6">
                  No Employees Found
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp._id}>

                  <td>{emp.name}</td>

                  <td>
                    {emp.employeeId || "-"}
                  </td>

                  <td>
                    {emp.department || "-"}
                  </td>

                  <td>{emp.email}</td>

                  <td
                    className={
                      emp.status === "approved"
                        ? "active-status"
                        : "inactive-status"
                    }
                  >
                    {emp.status}
                  </td>

                  <td>
                    {new Date(
                      emp.createdAt
                    ).toLocaleDateString()}
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

export default Employees;