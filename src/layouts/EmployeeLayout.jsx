import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar/Sidebar";
import "./employeeLayout.css";

function EmployeeLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="emp-layout">

      {isOpen && (
        <div
          className="emp-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`emp-sidebar ${
          isOpen ? "emp-sidebar--open" : ""
        }`}
      >
        <div className="emp-sidebar-header">
          <h2 className="emp-logo"> JC Attend</h2>

          <button
            className="emp-close-btn"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        <Sidebar
          closeSidebar={() => setIsOpen(false)}
        />
      </aside>

      <div className="emp-main">

        <header className="emp-header">

          <button
            className="emp-hamburger"
            onClick={() => setIsOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>

          <h3 className="emp-panel-title">
            Employee Panel
          </h3>

          <span className="emp-welcome">
            Welcome, Employee
          </span>

        </header>

        <main className="emp-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default EmployeeLayout;