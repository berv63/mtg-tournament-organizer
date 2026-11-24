import { useRef, useState } from "react";
import { exportData, importData } from "../db.js";

export default function ImportExportControls() {
  const fileInputRef = useRef(null);
  const [error, setError] = useState("");

  async function handleExport() {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mtg-tournament-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    setError("");
    fileInputRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.people) || !Array.isArray(data.sessions)) {
        throw new Error("file is missing people/sessions data");
      }
      if (
        !window.confirm("Importing will replace all current people and session data. Continue?")
      ) {
        return;
      }
      await importData(data);
      window.alert("Import complete. The app will now reload.");
      window.location.reload();
    } catch (err) {
      setError("Could not import file: " + err.message);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleExport}
        className="text-sm font-semibold text-indigo-600 hover:underline"
      >
        Export Data
      </button>
      <button
        onClick={handleImportClick}
        className="text-sm font-semibold text-indigo-600 hover:underline"
      >
        Import Data
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
