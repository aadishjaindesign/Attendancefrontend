import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Toast from "../../components/Toast";
import Spinner from "../../components/Spinner";
import { useToast } from "../../hooks/useToast";
import "../../styles/auth/auth.css";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function Login() {
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login successful!");

      setTimeout(() => {
        if (res.data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/employee/dashboard");
        }
      }, 800);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="auth-left">
        <div className="auth-brand">
          <h1>Attendance</h1>
          <p>
            Modern Employee Attendance Management with Geo Location Tracking,
            Leave Management, Employee Approval and Real Time Monitoring.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Login to continue</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="auth-links">
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? <Spinner size={20} color="#fff" /> : "Login"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;