import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function AdminLayout({
  currentPage,
  onPageChange,
  children,
  searchQuery,
  onSearchChange,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handlePageChange(page) {
    onPageChange(page);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b0b0b] text-white">
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Navbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <main className="min-h-screen pt-[72px] lg:ml-64">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;