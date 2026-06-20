import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

function Register() {
const navigate = useNavigate();

// RENDER BACKEND
const API_URL =
"https://attendance-backend-ym0q.onrender.com";

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
setForm({
...form,
[e.target.name]: e.target.value,
});
};

const handleSubmit = async (e) => {
e.preventDefault();


if (form.password !== form.confirmPassword) {
  alert("Passwords do not match");
  return;
}

try {
  console.log(
    "Sending Request To:",
    `${API_URL}/api/auth/register`
  );

  const res = await axios.post(
    `${API_URL}/api/auth/register`,
    {
      name: form.name,
      email: form.email,
      password: form.password,
      role: "employee",
      phone: form.phone,
      employeeId: form.employeeId,
      department: form.department,
      designation: form.designation,
    }
  );

  console.log("SUCCESS:", res.data);

  alert("Registration Successful ✔");

  navigate("/");
} catch (err) {
  console.log("FULL ERROR:", err);
  console.log(
    "ERROR RESPONSE:",
    err.response?.data
  );

  alert(
    err.response?.data?.message ||
      err.message ||
      "Registration Failed"
  );
}


};

return ( <div className="auth-container"> <div className="auth-left"> <div className="auth-brand"> <h1>JC Attend</h1>


      <p>
        Register your employee account and wait for
        admin approval before accessing the system.
      </p>
    </div>
  </div>

  <div className="auth-right">
    <div className="auth-card">
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            name="employeeId"
            placeholder="Employee ID"
            value={form.employeeId}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
          />

          <input
            name="designation"
            placeholder="Designation"
            value={form.designation}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <button
          className="auth-btn"
          type="submit"
        >
          Create Account
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?{" "}
        <Link to="/">Login</Link>
      </div>
    </div>
  </div>
</div>


);
}

export default Register;
