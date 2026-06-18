import { NavLink } from "react-router-dom";
import "./adminSidebar.css";

function AdminSidebar({ closeSidebar }) {
  return (
    <nav className="admin-menu">

      <NavLink
        to="/admin/dashboard"
        className={({ isActive }) => isActive ? "admin-link active" : "admin-link"}
        onClick={closeSidebar}
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/admin/approvals"
        className={({ isActive }) => isActive ? "admin-link active" : "admin-link"}
        onClick={closeSidebar}
      >
        Approvals
      </NavLink>

      <NavLink
        to="/admin/employees"
        className={({ isActive }) => isActive ? "admin-link active" : "admin-link"}
        onClick={closeSidebar}
      >
        Employees
      </NavLink>

      <NavLink
        to="/admin/attendance"
        className={({ isActive }) => isActive ? "admin-link active" : "admin-link"}
        onClick={closeSidebar}
      >
        Attendance
      </NavLink>

      <NavLink
        to="/admin/leaves"
        className={({ isActive }) => isActive ? "admin-link active" : "admin-link"}
        onClick={closeSidebar}
      >
        Leaves
      </NavLink>

      <NavLink
        to="/admin/reports"
        className={({ isActive }) => isActive ? "admin-link active" : "admin-link"}
        onClick={closeSidebar}
      >
        Reports
      </NavLink>

      <NavLink
        to="/admin/settings"
        className={({ isActive }) => isActive ? "admin-link active" : "admin-link"}
        onClick={closeSidebar}
      >
        Settings
      </NavLink>

    </nav>
  );
}

export default AdminSidebar;