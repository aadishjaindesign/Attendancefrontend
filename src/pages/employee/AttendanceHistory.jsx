import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/employee/history.css";

function History() {

  const [records, setRecords] = useState([]);
  const API_URL = "https://attendance-9zjv.onrender.com";

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {

    try {

     const res = await axios.get(
  `${API_URL}/api/attendance/${user._id}`
);
      setRecords(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>

      <div className="page-title">
        <h2>Attendance History</h2>
      </div>

      <div className="history-card">

        <table>

          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {records.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                  }}
                >
                  No Records Found
                </td>
              </tr>
            ) : (
              records.map((item) => (
                <tr key={item._id}>

                  <td>
                    {new Date(
                      item.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {item.checkIn
                      ? new Date(
                          item.checkIn
                        ).toLocaleTimeString()
                      : "--"}
                  </td>

                  <td>
                    {item.checkOut
                      ? new Date(
                          item.checkOut
                        ).toLocaleTimeString()
                      : "--"}
                  </td>

                  <td>
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

export default History;