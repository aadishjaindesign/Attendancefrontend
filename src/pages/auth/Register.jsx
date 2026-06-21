import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "../../components/Toast";
import Spinner from "../../components/Spinner";
import { useToast } from "../../hooks/useToast";
import "../../styles/auth/auth.css";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function Register() {
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    employeeId: "",
    department: "",
    designation: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        employeeId: form.employeeId,
        department: form.department,
        designation: form.designation,
      });

      toast.success("Registration successful! Wait for admin approval.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="auth-left">
        <div className="auth-brand">
          <h1>JC Attendance</h1>
          <p>Register your employee account and wait for admin approval before accessing the system.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Account</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} disabled={loading} required />
              <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} disabled={loading} required />
            </div>

            <div className="form-group">
              <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} disabled={loading} />
              <input name="employeeId" placeholder="Employee ID" value={form.employeeId} onChange={handleChange} disabled={loading} />
            </div>

            <div className="form-group">
              <input name="department" placeholder="Department" value={form.department} onChange={handleChange} disabled={loading} />
              <input name="designation" placeholder="Designation" value={form.designation} onChange={handleChange} disabled={loading} />
            </div>

            <div className="form-group">
              <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} disabled={loading} required />
              <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} disabled={loading} required />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? <Spinner size={20} color="#fff" /> : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;