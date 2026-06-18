import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/layout/AdminSidebar/AdminSidebar";
import "./adminLayout.css";

function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="adm-layout">

      {/* Overlay — mobile pe sidebar ke peeche */}
      {isOpen && (
        <div
          className="adm-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`adm-sidebar ${isOpen ? "adm-sidebar--open" : ""}`}>

        <div className="adm-sidebar-header">
          <h2 className="adm-logo">AttendPro</h2>
          <button
            className="adm-close-btn"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* closeSidebar prop pass karo */}
        <AdminSidebar closeSidebar={() => setIsOpen(false)} />

      </aside>

      {/* Main area */}
      <div className="adm-main">

        {/* Header */}
        <header className="adm-header">

          <button
            className="adm-hamburger"
            onClick={() => setIsOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>

          <h3 className="adm-panel-title">Admin Panel</h3>

          <span className="adm-welcome">Welcome, Admin</span>

        </header>

        {/* Page content */}
        <main className="adm-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;