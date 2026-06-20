import { NavLink } from "react-router-dom";
import "./sidebar.css";

function Sidebar({ closeSidebar }) {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h2> JC Attend</h2>
      </div>

      <nav className="sidebar-menu">

        <NavLink
          to="/employee/dashboard"
          className={({ isActive }) =>
            isActive ? "menu-link active" : "menu-link"
          }
          onClick={closeSidebar}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/employee/attendance"
          className={({ isActive }) =>
            isActive ? "menu-link active" : "menu-link"
          }
          onClick={closeSidebar}
        >
          Attendance
        </NavLink>

        <NavLink
          to="/employee/history"
          className={({ isActive }) =>
            isActive ? "menu-link active" : "menu-link"
          }
          onClick={closeSidebar}
        >
          History
        </NavLink>

        <NavLink
          to="/employee/leave"
          className={({ isActive }) =>
            isActive ? "menu-link active" : "menu-link"
          }
          onClick={closeSidebar}
        >
          Leave
        </NavLink>

        <NavLink
          to="/employee/profile"
          className={({ isActive }) =>
            isActive ? "menu-link active" : "menu-link"
          }
          onClick={closeSidebar}
        >
          Profile
        </NavLink>

      </nav>

    </aside>
  );
}

export default Sidebar;