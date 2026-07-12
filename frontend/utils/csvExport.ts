/**
 * Reusable utility to export data sets to CSV format in the browser.
 */
export function exportToCSV(headers: string[], rows: string[][], filename: string) {
  // Convert rows to safe CSV cells (escaping quotes and commas)
  const formatCell = (cell: string) => {
    if (cell === null || cell === undefined) return "";
    const stringVal = String(cell);
    if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n")) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const csvRows = [
    headers.map(formatCell).join(","),
    ...rows.map((row) => row.map(formatCell).join(",")),
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
