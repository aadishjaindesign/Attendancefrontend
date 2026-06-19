import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/settings.css";

function Settings() {
  const API_URL = "https://attendance-backend-ym0q.onrender.com";

  const [form, setForm] = useState({
    companyName: "",
    officeAddress: "",
    latitude: "",
    longitude: "",
    allowedRadius: 100,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {

     const res = await axios.get(
  `${API_URL}/api/settings`
);

      if (res.data) {
        setForm(res.data);
      }

    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const saveSettings = async () => {
    try {

    await axios.post(
  `${API_URL}/api/settings`,
  form
);

      alert(
        "Settings Saved Successfully"
      );

    } catch (error) {

      console.log(error);

    }
  };

  return (
    <div>

      <div className="page-title">
        <h2>System Settings</h2>
      </div>

      <div className="settings-card">

        <div className="form-group">
          <label>Company Name</label>

          <input
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Office Address</label>

          <textarea
            rows="3"
            name="officeAddress"
            value={form.officeAddress}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Office Latitude</label>

          <input
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Office Longitude</label>

          <input
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Allowed Radius</label>

          <input
            type="number"
            name="allowedRadius"
            value={form.allowedRadius}
            onChange={handleChange}
          />
        </div>

        <button
          className="save-btn"
          onClick={saveSettings}
        >
          Save Settings
        </button>

      </div>

    </div>
  );
}

export default Settings;