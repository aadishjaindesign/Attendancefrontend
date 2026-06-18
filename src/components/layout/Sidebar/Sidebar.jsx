import { NavLink } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h2>AttendPro</h2>
      </div>

      <nav className="sidebar-menu">

        <NavLink
          to="/employee/dashboard"
          className="menu-link"
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/employee/attendance"
          className="menu-link"
        >
          Attendance
        </NavLink>

        <NavLink
          to="/employee/history"
          className="menu-link"
        >
          History
        </NavLink>

        <NavLink
          to="/employee/leave"
          className="menu-link"
        >
          Leave
        </NavLink>

        <NavLink
          to="/employee/profile"
          className="menu-link"
        >
          Profile
        </NavLink>

      </nav>

    </aside>
  );
}

export default Sidebar;