// exportCsv.js
// Reusable CSV export utility — no backend needed.

/**
 * Export array of objects to CSV file.
 * @param {Array} data - Array of objects
 * @param {Array} columns - [{ key, label, transform? }]
 * @param {string} filename - Output filename (without extension)
 */
export function exportToCsv(data, columns, filename = "export") {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No data to export");
  }

  // Header row
  const header = columns.map((c) => escapeCsv(c.label)).join(",");

  // Data rows
  const rows = data.map((item) =>
    columns
      .map((c) => {
        const raw = c.transform ? c.transform(item) : item[c.key];
        return escapeCsv(raw);
      })
      .join(",")
  );

  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });

  downloadBlob(blob, `${filename}-${dateStamp()}.csv`);
}

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Escape quotes and wrap in quotes if contains special chars
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function dateStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}