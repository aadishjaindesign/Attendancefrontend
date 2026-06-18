import { useEffect, useState } from "react";
import "../../styles/employee/profile.css";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user")
    );

    setUser(storedUser);
  }, []);

  return (
    <div>
      <div className="page-title">
        <h2>My Profile</h2>
        <p>View your profile information</p>
      </div>

      <div className="profile-card">
        <div className="profile-grid">

          <div className="profile-item">
            <label>Employee ID</label>
            <span>
              {user?.employeeId || "-"}
            </span>
          </div>

          <div className="profile-item">
            <label>Full Name</label>
            <span>
              {user?.name || "-"}
            </span>
          </div>

          <div className="profile-item">
            <label>Email</label>
            <span>
              {user?.email || "-"}
            </span>
          </div>

          <div className="profile-item">
            <label>Phone</label>
            <span>
              {user?.phone || "-"}
            </span>
          </div>

          <div className="profile-item">
            <label>Department</label>
            <span>
              {user?.department || "-"}
            </span>
          </div>

          <div className="profile-item">
            <label>Designation</label>
            <span>
              {user?.designation || "-"}
            </span>
          </div>

          <div className="profile-item">
            <label>Status</label>
            <span
              className={
                user?.status === "approved"
                  ? "active-profile"
                  : "pending-profile"
              }
            >
              {user?.status || "-"}
            </span>
          </div>

          <div className="profile-item">
            <label>Joining Date</label>
            <span>
              {user?.createdAt
                ? new Date(
                    user.createdAt
                  ).toLocaleDateString()
                : "-"}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;