import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/* ═════════════════════════════════════════════
   Helper: dial angle → "HH:MM" string
   ═════════════════════════════════════════════ */
function angleToTime(angle) {
  const totalMinutes = (angle / 360) * 24 * 60;
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = Math.floor(totalMinutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/* ═════════════════════════════════════════════
   Constants
   ═════════════════════════════════════════════ */
const RING_RADIUS = 175; // px
const SUN_SIZE = 42;
const MOON_SIZE = 34;

/* ═════════════════════════════════════════════
   Time-of-day label
   ═════════════════════════════════════════════ */
function getTimeLabel(angle) {
  const h = ((angle / 360) * 24) % 24;
  if (h >= 5 && h < 7) return 'SUNRISE';
  if (h >= 7 && h < 11) return 'MORNING';
  if (h >= 11 && h < 13) return 'NOON';
  if (h >= 13 && h < 17) return 'AFTERNOON';
  if (h >= 17 && h < 19) return 'SUNSET';
  if (h >= 19 && h < 21) return 'EVENING';
  return 'NIGHT';
}

/* ═════════════════════════════════════════════
   TimeDial component
   ═════════════════════════════════════════════ */
export default function TimeDial({
  timeAngle,
  onTimeChange,
  onConfirm,
  isLoading,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  /* ── Position helpers (clock convention: 0° = top, CW) ── */
  const toScreenPos = (angle) => ({
    x: RING_RADIUS * Math.sin((angle * Math.PI) / 180),
    y: -RING_RADIUS * Math.cos((angle * Math.PI) / 180),
  });

  const sun = toScreenPos(timeAngle);
  const moonAngle = (timeAngle + 180) % 360;
  const moon = toScreenPos(moonAngle);

  /* ── Drag handlers ──────────────────────── */
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    document.body.classList.add('no-select');
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
      angle = ((angle % 360) + 360) % 360;
      onTimeChange(angle);
    },
    [isDragging, onTimeChange]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    document.body.classList.remove('no-select');
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  /* ── Tick marks (every 90° = 6-hour intervals) ── */
  const ticks = [0, 90, 180, 270];
  const tickLabels = ['00:00', '06:00', '12:00', '18:00'];

  const timeString = angleToTime(timeAngle);
  const timeLabel = getTimeLabel(timeAngle);

  /* ── Sun glow color based on time ── */
  const h = ((timeAngle / 360) * 24) % 24;
  const isNight = h < 5 || h > 19;
  const isTwilight = (h >= 5 && h < 7) || (h >= 17 && h < 19);

  const containerSize = (RING_RADIUS + 50) * 2;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: containerSize,
        height: containerSize,
        pointerEvents: 'none',
      }}
    >
      {/* ── Orbit ring (SVG) ─────────────────── */}
      <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
            pointerEvents: 'none',
          }}
          viewBox={`${-RING_RADIUS - 50} ${-RING_RADIUS - 50} ${containerSize} ${containerSize}`}
        >
          <defs>
            <filter id="ringGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer subtle ring */}
          <circle
            cx="0"
            cy="0"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(80, 160, 255, 0.08)"
            strokeWidth="24"
          />

          {/* Main orbit ring */}
          <circle
            cx="0"
            cy="0"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(100, 180, 255, 0.18)"
            strokeWidth="1.5"
            strokeDasharray="5 8"
            filter="url(#ringGlow)"
          />

          {/* Tick marks & labels */}
          {ticks.map((tickAngle, i) => {
            const innerR = RING_RADIUS - 12;
            const outerR = RING_RADIUS + 12;
            const labelR = RING_RADIUS + 30;
            const rad = (tickAngle * Math.PI) / 180;
            return (
              <g key={tickAngle}>
                <line
                  x1={innerR * Math.sin(rad)}
                  y1={-innerR * Math.cos(rad)}
                  x2={outerR * Math.sin(rad)}
                  y2={-outerR * Math.cos(rad)}
                  stroke="rgba(100, 180, 255, 0.3)"
                  strokeWidth="1"
                />
                <text
                  x={labelR * Math.sin(rad)}
                  y={-labelR * Math.cos(rad)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="rgba(255, 255, 255, 0.9)"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="'JetBrains Mono', monospace"
                  style={{
                    filter: 'drop-shadow(0px 0px 4px rgba(0,0,0,0.9)) drop-shadow(0px 0px 2px rgba(0,0,0,1))'
                  }}
                >
                  {tickLabels[i]}
                </text>
              </g>
            );
          })}

          {/* Sun trail glow — arc from sun position */}
          <circle
            cx="0"
            cy="0"
            r={RING_RADIUS}
            fill="none"
            stroke={
              isNight
                ? 'rgba(100, 150, 255, 0.06)'
                : 'rgba(255, 180, 50, 0.08)'
            }
            strokeWidth="3"
          />
        </svg>

        {/* ── Sun handle (draggable) ───────────── */}
        <motion.div
          onPointerDown={handlePointerDown}
          style={{
            position: 'absolute',
            left: `calc(50% + ${sun.x}px - ${SUN_SIZE / 2}px)`,
            top: `calc(50% + ${sun.y}px - ${SUN_SIZE / 2}px)`,
            width: SUN_SIZE,
            height: SUN_SIZE,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, #fff7c0, #ffd54f 40%, #ff8f00)',
            boxShadow: `
              0 0 16px rgba(255, 183, 0, 0.7),
              0 0 40px rgba(255, 143, 0, 0.35),
              0 0 80px rgba(255, 100, 0, 0.15)
            `,
            cursor: isDragging ? 'grabbing' : 'grab',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            userSelect: 'none',
            zIndex: 20,
            touchAction: 'none',
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: isDragging ? 1.12 : 1,
            boxShadow: isDragging
              ? '0 0 24px rgba(255,183,0,0.9), 0 0 60px rgba(255,143,0,0.5), 0 0 100px rgba(255,100,0,0.25)'
              : '0 0 16px rgba(255,183,0,0.7), 0 0 40px rgba(255,143,0,0.35), 0 0 80px rgba(255,100,0,0.15)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          ☀️
        </motion.div>

        {/* ── Moon icon (opposite side) ────────── */}
        <div
          style={{
            position: 'absolute',
            left: `calc(50% + ${moon.x}px - ${MOON_SIZE / 2}px)`,
            top: `calc(50% + ${moon.y}px - ${MOON_SIZE / 2}px)`,
            width: MOON_SIZE,
            height: MOON_SIZE,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #f5f5f5, #b0bec5 60%, #78909c)',
            boxShadow: `
              0 0 12px rgba(200, 220, 255, 0.5),
              0 0 30px rgba(150, 190, 255, 0.2)
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: isNight ? 1 : 0.6,
            transition: 'opacity 0.5s ease',
          }}
        >
          🌙
        </div>

        {/* ── Center: time readout ─────────────── */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontFamily: "'DS-Digital', sans-serif",
              fontSize: '84px', // Segmented digital fonts render smaller visually
              color: '#ffffff',
              textShadow: '0 4px 10px rgba(0, 0, 0, 0.8), 0 0 24px rgba(100, 180, 255, 0.45)',
              letterSpacing: '4px',
              lineHeight: 1,
            }}
          >
            {timeString}
          </div>

          <div
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              // Brighter text color for better contrast against dark backgrounds
              color: isTwilight
                ? '#ffc107' // Bright amber/gold for twilight
                : '#90caf9', // Bright light blue for other times
              letterSpacing: '5px',
              textTransform: 'uppercase',
              marginTop: '12px',
              transition: 'color 0.4s ease',
              // Strong drop shadow guarantees visibility on both bright and dark backgrounds
              textShadow: '0 2px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8)',
            }}
          >
            {timeLabel} — UTC
          </div>
        </div>

        {/* ── Confirm button ───────────────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
          }}
        >
          <motion.button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: isLoading ? 'rgba(150,200,255,0.5)' : '#ffffff',
              background: isLoading
                ? 'rgba(30, 60, 100, 0.3)'
                : 'rgba(30, 60, 120, 0.45)',
              border: `1px solid ${
                isLoading
                  ? 'rgba(80, 150, 255, 0.15)'
                  : 'rgba(80, 150, 255, 0.35)'
              }`,
              borderRadius: '28px',
              padding: '10px 32px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: isLoading
                ? 'none'
                : '0 0 20px rgba(60, 140, 255, 0.15)',
              transition: 'all 0.3s ease',
              outline: 'none',
            }}
            whileHover={
              isLoading ? {} : { scale: 1.06, boxShadow: '0 0 30px rgba(60,140,255,0.3)' }
            }
            whileTap={isLoading ? {} : { scale: 0.95 }}
          >
            {isLoading ? (
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                ◌ Analyzing…
              </motion.span>
            ) : (
              '⬡ Confirm Time'
            )}
          </motion.button>
        </div>
    </div>
  );
}
