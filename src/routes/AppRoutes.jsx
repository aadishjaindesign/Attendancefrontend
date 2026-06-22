import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import EmployeeLayout from "../layouts/EmployeeLayout";
import AdminLayout from "../layouts/AdminLayout";

import EmployeeDashboard from "../pages/employee/Dashboard";
import Attendance from "../pages/employee/Attendance";
import AttendanceHistory from "../pages/employee/AttendanceHistory";
import Leave from "../pages/employee/Leave";
import Profile from "../pages/employee/Profile";
// import History from "../pages/employee/History";
import Settings from "../pages/admin/Settings";
import AttendanceManagement from "../pages/admin/AttendanceManagement";
import ForgotPassword from "../pages/auth/Forgotpassword.jsx";

import AdminDashboard from "../pages/admin/Dashboard";
import Employees from "../pages/admin/Employees";
import EmployeeApprovals from "../pages/admin/EmployeeApprovals";
import Reports from "../pages/admin/Reports";
import LeaveManagement from "../pages/admin/LeaveManagement";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
       <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="history" element={<AttendanceHistory />} />
          <Route path="leave" element={<Leave />} />
          <Route path="profile" element={<Profile />} />
          {/* <Route
            path="history"
            element={<History />}
          /> */}
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route
            path="leaves"
            element={<LeaveManagement />}
          />
          <Route path="employees" element={<Employees />} />
          <Route path="approvals" element={<EmployeeApprovals />} />
          <Route
            path="attendance"
            element={<AttendanceManagement />}
          />
          <Route path="reports" element={<Reports />} />
          <Route
            path="settings"
            element={<Settings />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;