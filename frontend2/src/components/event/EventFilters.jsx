import React from "react";
import { Search, Filter } from "lucide-react";

export default function EventFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories = [],
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
        background: "var(--bg-elevated)",
        padding: "1rem 1.25rem",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border-color)",
      }}
    >
      <div style={{ position: "relative", flex: "1 1 250px" }}>
        <Search
          size={18}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
          }}
        />
        <input
          type="text"
          placeholder="Search events by title, location or category..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="form-input"
          style={{ paddingLeft: "2.5rem" }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <Filter size={16} style={{ color: "var(--text-muted)" }} />
        <button
          onClick={() => onCategoryChange("ALL")}
          className={`btn btn-sm ${selectedCategory === "ALL" ? "btn-primary" : "btn-secondary"}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`btn btn-sm ${selectedCategory === cat ? "btn-primary" : "btn-secondary"}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
