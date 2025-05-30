"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { io } from "socket.io-client";

let socket;

export default function DisplayPage({ params }) {
  const { tv } = params;
  const searchParams = useSearchParams();
  const width = searchParams.get("width") || "100vw";
  const height = searchParams.get("height") || "100vh";
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
        width,
        height,
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

