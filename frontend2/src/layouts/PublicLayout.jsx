import React from "react";
import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/navigation/PublicNavbar";
import Footer from "../components/navigation/Footer";

export default function PublicLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PublicNavbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
