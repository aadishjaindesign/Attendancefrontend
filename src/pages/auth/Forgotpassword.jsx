import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "../../components/Toast";
import Spinner from "../../components/Spinner";
import { useToast } from "../../hooks/useToast";
import "../../styles/auth/auth.css";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function ForgotPassword() {
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();
  const [step, setStep] = useState(1); // 1=email, 2=token+new pass
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleGetToken = async (e) => {
    e.preventDefault();
    if (!email) { toast.error("Enter your email"); return; }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setGeneratedToken(res.data.resetToken);
      toast.success("Reset token generated! Copy the token below.");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Email not found");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, { email, token, newPassword });
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. Token may be expired.");
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
          <p>Reset your password securely.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Forgot Password</h2>
          <p className="auth-subtitle">
            {step === 1 ? "Enter your registered email" : "Enter the token and new password"}
          </p>

          {step === 1 ? (
            <form onSubmit={handleGetToken}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? <Spinner size={20} color="#fff" /> : "Get Reset Token"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              {generatedToken && (
                <div className="token-display">
                  <p>Your Reset Token:</p>
                  <div className="token-box">{generatedToken}</div>
                  <p className="token-note">Valid for 15 minutes. Copy it above.</p>
                </div>
              )}

              <div className="form-group">
                <label>Enter Token</label>
                <input
                  placeholder="Paste token here"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? <Spinner size={20} color="#fff" /> : "Reset Password"}
              </button>
            </form>
          )}

          <div className="auth-footer">
            Remember password? <Link to="/">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;