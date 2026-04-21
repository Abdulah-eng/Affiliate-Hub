"use client";

import { useCallback, useRef, useEffect } from 'react';

export function useNotificationSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const interactionHappened = useRef(false);

  // Initialize AudioContext only after a user gesture
  useEffect(() => {
    const handleInteraction = () => {
      interactionHappened.current = true;
      
      // We don't create it here yet, just mark that it's allowed
      // This prevents the warning on page load
      
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const playNotification = useCallback(() => {
    try {
      // Only attempt to create/play if an interaction has happened
      if (!interactionHappened.current) {
        console.warn("AudioContext blocked: No user interaction yet.");
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create a pleasant "pop/bell" sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1); 

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Quiet fail to avoid UI crashes
      console.warn("Audio context play blocked or failed:", e);
    }
  }, []);

  return playNotification;
}
