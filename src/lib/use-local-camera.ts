"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Local-only camera self-view. This app's voice pipeline (Vapi) carries audio
 * only, so this never sends video anywhere - it's purely a mirror the
 * candidate can see themselves in, same as most interview-practice tools.
 */
export function useLocalCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const toggleCamera = useCallback(async () => {
    if (cameraOn) {
      stopStream();
      setCameraOn(false);
      return;
    }

    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
    } catch (err) {
      console.error("[use-local-camera] failed to start camera", err);
      setError("Couldn't access your camera. Check browser permissions and try again.");
      setCameraOn(false);
    }
  }, [cameraOn, stopStream]);

  useEffect(() => stopStream, [stopStream]);

  return { videoRef, cameraOn, error, toggleCamera };
}
