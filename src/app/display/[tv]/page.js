"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket;

export default function DisplayPage({ params }) {
  const { tv } = params;
  const [media, setMedia] = useState(null);

  const fetchMedia = () => {
    fetch(`/uploads?tv=${tv}`)
      .then((res) => res.json())
      .then((data) => {
        const tvFiles = data.files.filter((file) => file.startsWith(tv + "-"));
        if (tvFiles.length > 0) {
          setMedia(tvFiles[tvFiles.length - 1]);
        } else {
          setMedia(null);
        }
      });
  };

  useEffect(() => {
    fetchMedia();
    // Only connect socket once
    if (!socket) {
      // IMPORTANT: Use the correct URL for your server!
      socket = io("http://<10.2.255.232>:3000"); // e.g., "http://192.168.1.42:3000"
    }
    // Listen for mediaUploaded events for this TV
    socket.on("mediaUploaded", (data) => {
      if (data.filename.startsWith(tv + "-")) {
        fetchMedia();
      }
    });
    return () => {
      if (socket) socket.off("mediaUploaded");
    };
  }, [tv]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "black", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {media ? (
        media.endsWith(".mp4") ? (
          <video
            src={`/uploads/${media}`}
            autoPlay
            loop
            muted
            controls={false}
            style={{ width: "100vw", height: "100vh", objectFit: "contain", background: "black" }}
          />
        ) : (
          <img
            src={`/uploads/${media}`}
            alt={media}
            style={{ width: "100vw", height: "100vh", objectFit: "contain", background: "black" }}
          />
        )
      ) : (
        <p style={{ color: "white", fontSize: "2rem" }}>No media uploaded for this TV yet.</p>
      )}
    </div>
  );
}

