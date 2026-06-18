import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "../../styles/auth/auth.css";

function Login() {
const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const API_URL = "https://attendance-9zjv.onrender.com";

const handleLogin = async (e) => {
e.preventDefault();


try {
  const res = await axios.post(
  `${API_URL}/api/auth/login`,
  {
    email,
    password,
  }
);

  localStorage.setItem("token", res.data.token);
  localStorage.setItem(
    "user",
    JSON.stringify(res.data.user)
  );

  alert("Login Success");

  if (res.data.user.role === "admin") {
    navigate("/admin/dashboard");
  } else {
    navigate("/employee/dashboard");
  }
} catch (err) {
  alert(
    err.response?.data?.message ||
    "Login Failed"
  );
}


};

return ( <div className="auth-container"> <div className="auth-left"> <div className="auth-brand"> <h1>AttendPro</h1>

```
      <p>
        Modern Employee Attendance Management System with
        Geo Location Tracking, Leave Management,
        Employee Approval and Real Time Monitoring.
      </p>
    </div>
  </div>

  <div className="auth-right">
    <div className="auth-card">
      <h2>Welcome Back</h2>

      <p className="auth-subtitle">
        Login to continue
      </p>

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </div>

        <button
          className="auth-btn"
          type="submit"
        >
          Login
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account?{" "}
        <Link to="/register">
          Register
        </Link>
      </div>
    </div>
  </div>
</div>


);
}

export default Login;
