"use client";

import { useState } from "react";

const ADMIN_PASSWORD = "admin123"; // Change this!

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState("");
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [tv, setTv] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#eee" }}>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (input === ADMIN_PASSWORD) setAuthenticated(true);
            else alert("Wrong password!");
          }}
        >
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter admin password"
            style={{ padding: 8, fontSize: 18 }}
          />
          <button type="submit" style={{ marginLeft: 8, padding: 8, fontSize: 18 }}>Login</button>
        </form>
      </div>
    );
  }

  const handleSubmit = () => {
    const url = `http://${ip}:${port}/display/${tv}`;
    alert(`Access the TV display page at: ${url}`);
  };

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
    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await fetch(`/api/upload?tv=${tv}`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("File uploaded successfully!");
    } else {
      alert("File upload failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4 text-center text-blue-700">Admin Panel</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Host IP Address:</label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="border p-2 w-full"
              placeholder="e.g., 192.168.1.100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Port:</label>
            <input
              type="text"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="border p-2 w-full"
              placeholder="e.g., 3000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">TV Name:</label>
            <input
              type="text"
              value={tv}
              onChange={(e) => setTv(e.target.value)}
              className="border p-2 w-full"
              placeholder="e.g., tv1"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Generate URL
          </button>
        </div>
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {selectedFile && (
          <div className="mb-4 text-center">
            <span className="text-green-600">Selected: {selectedFile.name}</span>
          </div>
        )}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          onClick={handleUpload}
        >
          Upload
        </button>
      </div>
    </div>
  );
}