"use client";
import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "admin123"; // Change this!

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState("");
  const [tv, setTv] = useState("");
  const [width, setWidth] = useState("1080");
  const [height, setHeight] = useState("1920");
  const [selectedFile, setSelectedFile] = useState(null);
  const [displayUrl, setDisplayUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [tvList, setTvList] = useState([]);

  // Fetch TV list on load and after changes
  useEffect(() => {
    if (authenticated) {
      fetch("/api/tv-settings")
        .then(res => res.json())
        .then(data => setTvList(Object.keys(data)));
    }
  }, [authenticated, tv]);

  // When selecting a TV, load its settings
  useEffect(() => {
    if (tv) {
      fetch(`/api/tv-settings?tv=${tv}`)
        .then(res => res.json())
        .then(data => {
          if (data.width) setWidth(data.width);
          if (data.height) setHeight(data.height);
        });
    }
  }, [tv]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
        <form
          onSubmit={e => {
            e.preventDefault();
            if (input === ADMIN_PASSWORD) setAuthenticated(true);
            else alert("Wrong password!");
          }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full"
        >
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Admin Login</h2>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter admin password"
            className="border p-3 w-full rounded mb-4"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded w-full font-semibold hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
    if (!tv) {
      alert("Please enter a TV name.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await fetch(`/api/upload?tv=${tv}`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);
    if (res.ok) {
      alert("File uploaded successfully!");
    } else {
      alert("File upload failed.");
    }
  };

  const handleGenerate = () => {
    if (!tv) return;
    setDisplayUrl(
      `https://tv-app-0slp.onrender.com/display/${tv}`
    );
  };

  const handleSaveResolution = async () => {
    if (!tv) return;
    await fetch("/api/tv-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tv, width, height }),
    });
    alert("Resolution saved!");
    // Refresh TV list
    fetch("/api/tv-settings")
      .then(res => res.json())
      .then(data => setTvList(Object.keys(data)));
  };

  const handleDeleteTv = async (tvToDelete) => {
    if (!window.confirm(`Delete TV "${tvToDelete}"? This cannot be undone.`)) return;
    await fetch("/api/tv-settings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tv: tvToDelete }),
    });
    setTvList(tvList.filter(item => item !== tvToDelete));
    if (tv === tvToDelete) {
      setTv("");
      setWidth("1080");
      setHeight("1920");
      setDisplayUrl("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Admin Panel</h1>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Select TV</label>
            <div className="flex space-x-2 mb-2">
              <select
                className="border p-3 rounded flex-1"
                value={tv}
                onChange={e => setTv(e.target.value)}
              >
                <option value="">-- Select TV --</option>
                {tvList.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              {tv && (
                <button
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
                  onClick={() => handleDeleteTv(tv)}
                  title="Delete this TV"
                  type="button"
                >
                  Delete
                </button>
              )}
            </div>
            <input
              type="text"
              value={tv}
              onChange={e => setTv(e.target.value)}
              className="border p-3 w-full rounded mt-2"
              placeholder="Or enter new TV name"
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={e => setWidth(e.target.value)}
                className="border p-3 w-full rounded"
                min={1}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Height (px)</label>
              <input
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                className="border p-3 w-full rounded"
                min={1}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Upload Media</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <div className="mt-2 text-green-600 text-sm">
                Selected: {selectedFile.name}
              </div>
            )}
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded w-full font-semibold hover:bg-blue-600 transition"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button
            className="bg-purple-500 text-white px-4 py-2 rounded w-full font-semibold hover:bg-purple-600 transition"
            onClick={handleGenerate}
            style={{ marginTop: 8 }}
          >
            Generate Display Link
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded w-full font-semibold hover:bg-green-600 transition"
            onClick={handleSaveResolution}
            style={{ marginTop: 8 }}
          >
            Save Resolution
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded w-full font-semibold hover:bg-red-700 transition"
            onClick={async () => {
              if (!tv) return;
              if (!window.confirm(`Remove all media for "${tv}"?`)) return;
              const res = await fetch("/api/media", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tv }),
              });
              if (res.ok) {
                alert("Media removed for this TV.");
              } else {
                alert("Failed to remove media.");
              }
            }}
            style={{ marginTop: 8 }}
          >
            Remove Media for this TV
          </button>
          {displayUrl && (
            <div className="mt-4 p-3 bg-blue-50 rounded text-center">
              <strong>Display Link:</strong>
              <div>
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline break-all"
                >
                  {displayUrl}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}