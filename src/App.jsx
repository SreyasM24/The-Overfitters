import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import EarthScene from './components/EarthScene';
import TimeDial from './components/TimeDial';
import StatusBar from './components/StatusBar';
import { getMockPrediction } from './utils/mockPrediction';

/* ═════════════════════════════════════════════
   Helper: dial angle → "HH:MM"
   ═════════════════════════════════════════════ */
function angleToTimeStr(angle) {
  const totalMin = (angle / 360) * 24 * 60;
  const h = Math.floor(totalMin / 60) % 24;
  const m = Math.floor(totalMin % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/* ═════════════════════════════════════════════
   Helper: dial angle → sun direction [x, y, z]

   Mapping:
     dial  0° → 00:00 midnight → sun behind Earth
     dial 90° → 06:00 sunrise  → sun at east (right)
     dial180° → 12:00 noon     → sun behind camera (full daylight)
     dial270° → 18:00 sunset   → sun at west (left)
   ═════════════════════════════════════════════ */
function angleToSunDir(dialAngle) {
  const rad = ((dialAngle - 90) * Math.PI) / 180;
  return [Math.cos(rad), 0, Math.sin(rad)];
}

/* ═════════════════════════════════════════════
   App root
   ═════════════════════════════════════════════ */
export default function App() {
  const [timeAngle, setTimeAngle] = useState(90); // start at 06:00 (sunrise)
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const sunDirection = angleToSunDir(timeAngle);

  /* ── Confirm handler ─────────────────────── */
  const handleConfirm = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    setPrediction(null); // clear old data for loading animation

    const timeStr = angleToTimeStr(timeAngle);

    // Simulate ~1.2 s analysis delay, then populate with mock data
    setTimeout(() => {
      const data = getMockPrediction(timeStr);
      setPrediction(data);
      setIsLoading(false);
    }, 1200);
  }, [timeAngle, isLoading]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* ── 3D Earth canvas (full viewport, z=0) ── */}
      <EarthScene 
        sunDirection={sunDirection} 
        dialOverlay={
          <TimeDial
            timeAngle={timeAngle}
            onTimeChange={setTimeAngle}
            onConfirm={handleConfirm}
            isLoading={isLoading}
          />
        }
      />



      {/* ── Telemetry status bar ───────────────── */}
      <StatusBar prediction={prediction} isLoading={isLoading} />
    </div>
  );
}
