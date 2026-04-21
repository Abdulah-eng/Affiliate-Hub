"use client";

import { useCallback, useRef } from 'react';

export function useNotificationSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playNotification = useCallback(() => {
    try {
      // Initialize AudioContext on first play (required by browsers to be tied to user interaction)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      
      // If context is suspended (often happens requiring user gesture), try to resume it
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create a pleasant "pop/bell" sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime); // 800Hz starting pitch
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1); // Slide up to 1200Hz

      // Volume envelope (quick attack, quick release)
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio context failed to play notification:", e);
    }
  }, []);

  return playNotification;
}
