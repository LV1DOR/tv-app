"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { io } from "socket.io-client";

let socket;

export default function DisplayPage({ params }) {
  const { tv } = params;
  const [dimensions, setDimensions] = useState({ width: "100vw", height: "100vh" });
  const [mediaUrl, setMediaUrl] = useState(null);

  const fetchMedia = () => {
    fetch(`/uploads?tv=${tv}`)
      .then((res) => res.json())
      .then((data) => {
        const tvFiles = data.files.filter((file) => file.startsWith(tv + "-"));
        if (tvFiles.length > 0) {
          const lastFile = tvFiles[tvFiles.length - 1];
          const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${lastFile}`;
          setMediaUrl(url);
        } else {
          setMediaUrl(null);
        }
      });
  };

  useEffect(() => {
    // Fetch dimensions from the API
    fetch(`/api/tv-settings?tv=${tv}`)
      .then(res => res.json())
      .then(data => {
        if (data.width && data.height) setDimensions(data);
      });
    fetchMedia();
    if (!socket) {
      socket = io("https://tv-app-0slp.onrender.com");
    }
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
    <div
      style={{
        width: dimensions.width + (isNaN(dimensions.width) ? "" : "px"),
        height: dimensions.height + (isNaN(dimensions.height) ? "" : "px"),
        background: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {mediaUrl ? (
        mediaUrl.endsWith(".mp4") ? (
          <video
            src={mediaUrl}
            autoPlay
            loop
            muted
            controls={false}
            style={{ width: "100%", height: "100%", objectFit: "contain", background: "black" }}
          />
        ) : (
          <img
            src={mediaUrl}
            alt={mediaUrl}
            style={{ width: "100%", height: "100%", objectFit: "contain", background: "black" }}
          />
        )
      ) : (
        <p style={{ color: "white", fontSize: "2rem" }}>No media uploaded for this TV yet.</p>
      )}
    </div>
  );
}

