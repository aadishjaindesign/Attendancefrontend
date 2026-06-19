import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/leaves.css";

function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const API_URL = "https://attendance-backend-ym0q.onrender.com";

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
     const res = await axios.get(
  `${API_URL}/api/leave/all`
);

      setLeaves(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const approveLeave = async (id) => {
    try {
     await axios.put(
  `${API_URL}/api/leave/approve/${id}`
);

      fetchLeaves();
    } catch (error) {
      console.log(error);
    }
  };

  const rejectLeave = async (id) => {
    try {
      await axios.put(
  `${API_URL}/api/leave/reject/${id}`
);

      fetchLeaves();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="page-title">
        <h2>Leave Requests</h2>
        <p>Manage employee leave requests</p>
      </div>

      <div className="leave-card">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {leaves.length === 0 ? (
              <tr>
                <td colSpan="7">
                  No Leave Requests Found
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>
                    {leave.employee?.name}
                  </td>

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

                  <td>{leave.reason}</td>

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

                  <td>
                    {leave.status ===
                    "Pending" ? (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() =>
                            approveLeave(
                              leave._id
                            )
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() =>
                            rejectLeave(
                              leave._id
                            )
                          }
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      "-"
                    )}
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

export default LeaveManagement;