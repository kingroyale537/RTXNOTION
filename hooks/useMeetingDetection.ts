// hooks/useMeetingDetection.ts
// Hook for detecting ongoing meetings and microphone audio activity on PC/Mac to trigger the floating AI Meeting Note pill popup.

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useMeetingDetection() {
  const [meetingDetected, setMeetingDetected] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dismissMeeting = useCallback(() => {
    setMeetingDetected(false);
  }, []);

  const triggerMeetingDetected = useCallback(() => {
    setMeetingDetected(true);
  }, []);

  const startDetection = useCallback(async () => {
    if (typeof window === "undefined" || isMonitoring) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let consecutiveSpeechFrames = 0;
      setIsMonitoring(true);

      const checkVolume = () => {
        if (!audioContextRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Speech volume threshold (indicates speaking / audio output near mic)
        if (average > 25) {
          consecutiveSpeechFrames += 1;
          // ~2.5 seconds of sustained audio activity
          if (consecutiveSpeechFrames > 50 && !meetingDetected) {
            setMeetingDetected(true);
          }
        } else {
          consecutiveSpeechFrames = Math.max(0, consecutiveSpeechFrames - 1);
        }

        timerRef.current = setTimeout(checkVolume, 50);
      };

      checkVolume();
    } catch {
      // Permission denied or microphone unavailable
      setIsMonitoring(false);
    }
  }, [isMonitoring, meetingDetected]);

  const stopDetection = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  useEffect(() => {
    // Auto-start listening on mount or simulate after initial delay if active
    const timeout = setTimeout(() => {
      // Auto-trigger meeting detection pill for initial demonstration after 5s
      setMeetingDetected(true);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      stopDetection();
    };
  }, [stopDetection]);

  return {
    meetingDetected,
    isMonitoring,
    dismissMeeting,
    triggerMeetingDetected,
    startDetection,
    stopDetection,
  };
}
