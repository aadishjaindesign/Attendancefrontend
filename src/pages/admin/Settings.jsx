import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import Toast from "../../components/Toast";
import Spinner from "../../components/Spinner";
import { useToast } from "../../hooks/useToast";
import "../../styles/admin/settings.css";

const API_URL = "https://attendance-backend-ym0q.onrender.com";

function Settings() {
  const { toasts, toast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    officeAddress: "",
    latitude: "",
    longitude: "",
    allowedRadius: 100,
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [holidays, setHolidays] = useState([]);
  const [holidayForm, setHolidayForm] = useState({
    title: "",
    fromDate: "",
    toDate: "",
    description: "",
  });
  const [holidayLoading, setHolidayLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchHolidays();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/settings`);
      if (res.data) setForm(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchHolidays = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/holidays`);
      setHolidays(res.data);
    } catch (error) { console.error(error); }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.post(`${API_URL}/api/settings`, form);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const admin = JSON.parse(localStorage.getItem("user") || "{}");
    setPwLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/change-password`, {
        userId: admin._id,
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
    } finally {
      setPwLoading(false);
    }
  };

  const addHoliday = async () => {
    if (!holidayForm.title || !holidayForm.fromDate || !holidayForm.toDate) {
      toast.error("Fill all holiday fields");
      return;
    }
    setHolidayLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/holidays`, holidayForm);
      toast.success(res.data.message || "Holiday added & attendance auto-marked");
      setHolidayForm({ title: "", fromDate: "", toDate: "", description: "" });
      fetchHolidays();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add holiday");
    } finally {
      setHolidayLoading(false);
    }
  };

  const deleteHoliday = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/holidays/${id}`);
      toast.info("Holiday deleted");
      fetchHolidays();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="page-title">
        <h2>System Settings</h2>
        <p>Configure office location, holidays and account settings</p>
      </div>

      {/* Office Settings */}
      <div className="settings-card">
        <h3 className="settings-section-title">Office Configuration</h3>

        <div className="form-group">
          <label>Company Name</label>
          <input name="companyName" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Office Address</label>
          <textarea rows="3" name="officeAddress" value={form.officeAddress} onChange={(e) => setForm({ ...form, officeAddress: e.target.value })} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Office Latitude</label>
            <input name="latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="e.g. 28.6139" />
          </div>
          <div className="form-group">
            <label>Office Longitude</label>
            <input name="longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="e.g. 77.2090" />
          </div>
        </div>

        <div className="form-group">
          <label>Allowed Radius (meters)</label>
          <input type="number" name="allowedRadius" value={form.allowedRadius} onChange={(e) => setForm({ ...form, allowedRadius: e.target.value })} />
        </div>

        <button className="save-btn" onClick={saveSettings} disabled={saving}>
          {saving ? <Spinner size={18} color="#fff" /> : "Save Settings"}
        </button>
      </div>

      {/* Holiday Management */}
      <div className="settings-card">
        <h3 className="settings-section-title">Holiday Management</h3>
        <p className="settings-hint">Jab holiday add karoge, sab employees ki attendance automatically lag jayegi.</p>

        <div className="form-row">
          <div className="form-group">
            <label>Holiday Title</label>
            <input placeholder="e.g. Diwali" value={holidayForm.title} onChange={(e) => setHolidayForm({ ...holidayForm, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <input placeholder="Optional description" value={holidayForm.description} onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>From Date</label>
            <input type="date" value={holidayForm.fromDate} onChange={(e) => setHolidayForm({ ...holidayForm, fromDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label>To Date</label>
            <input type="date" value={holidayForm.toDate} onChange={(e) => setHolidayForm({ ...holidayForm, toDate: e.target.value })} />
          </div>
        </div>

        <button className="save-btn" onClick={addHoliday} disabled={holidayLoading}>
          {holidayLoading ? <Spinner size={18} color="#fff" /> : "Add Holiday & Auto-Mark Attendance"}
        </button>

        {/* Holiday List */}
        {holidays.length > 0 && (
          <div className="holiday-list">
            <h4>Upcoming / Past Holidays</h4>
            {holidays.map((h) => (
              <div key={h._id} className="holiday-item">
                <div className="holiday-info">
                  <span className="holiday-title">{h.title}</span>
                  <span className="holiday-dates">
                    {new Date(h.fromDate).toLocaleDateString()} → {new Date(h.toDate).toLocaleDateString()}
                  </span>
                  {h.description && <span className="holiday-desc">{h.description}</span>}
                </div>
                <button className="delete-holiday-btn" onClick={() => deleteHoliday(h._id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="settings-card">
        <h3 className="settings-section-title">Change Password</h3>

        <div className="form-group">
          <label>Current Password</label>
          <input type="password" placeholder="Current password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input type="password" placeholder="New password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input type="password" placeholder="Confirm new password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
        </div>

        <button className="save-btn" onClick={handleChangePassword} disabled={pwLoading}>
          {pwLoading ? <Spinner size={18} color="#fff" /> : "Change Password"}
        </button>
      </div>
    </div>
  );
}

export default Settings;