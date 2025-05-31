"use client";
import { useState, useEffect } from "react";
import "@fontsource/inter/variable.css";

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
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-md space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-indigo-600">Admin Panel</h1>
        <input
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          placeholder="TV Name"
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            placeholder="Width"
            type="number"
          />
          <input
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            placeholder="Height"
            type="number"
          />
        </div>
        <input
          type="file"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
        />
        <button className="w-full bg-indigo-500 text-white font-semibold py-2 rounded-lg shadow hover:bg-indigo-600 transition">
          Upload
        </button>
        <button className="w-full bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-300 transition">
          Save Resolution
        </button>
        <button className="w-full bg-red-500 text-white font-semibold py-2 rounded-lg hover:bg-red-600 transition">
          Remove Media
        </button>
      </div>
    </div>
  );
}