import React from "react";
import { Outlet } from "react-router-dom";
import UserNavbar from "../components/navigation/UserNavbar";
import Footer from "../components/navigation/Footer";

export default function UserLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <UserNavbar />
      <main style={{ flex: 1, backgroundColor: "var(--bg-secondary)", padding: "2rem 0" }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
