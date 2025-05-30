"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket;

export default function DisplayPage({ params }) {
  const { tv } = params;
  const [media, setMedia] = useState(null);
  const [mediaUrl, setMediaUrl] = useState(null);

  const fetchMedia = () => {
    fetch(`/uploads?tv=${tv}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("uploads API response:", data); // <--- Add this line
        const tvFiles = data.files.filter((file) => file.startsWith(tv + "-"));
        if (tvFiles.length > 0) {
          // Construct S3 URL
          const lastFile = tvFiles[tvFiles.length - 1];
          const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${lastFile}`;
          setMediaUrl(url);
        } else {
          setMediaUrl(null);
        }
      });
  };

  useEffect(() => {
    fetchMedia();
    // Only connect socket once
    if (!socket) {
      // IMPORTANT: Use the correct URL for your server!
      socket = io("https://tv-app-0slp.onrender.com"); // e.g., "http://192.168.1.42:3000"
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

  console.log("mediaUrl:", mediaUrl);
  return (
    <div style={{ width: "100vw", height: "100vh", background: "black", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {mediaUrl ? (
        mediaUrl.endsWith(".mp4") ? (
          <video
            src={mediaUrl}
            autoPlay
            loop
            muted
            controls={false}
            style={{ width: "100vw", height: "100vh", objectFit: "contain", background: "black" }}
          />
        ) : (
          <img
            src={mediaUrl}
            alt={mediaUrl}
            style={{ width: "100vw", height: "100vh", objectFit: "contain", background: "black" }}
          />
        )
      ) : (
        <p style={{ color: "white", fontSize: "2rem" }}>No media uploaded for this TV yet.</p>
      )}
    </div>
  );
}

