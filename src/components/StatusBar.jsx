import { motion, AnimatePresence } from 'framer-motion';

/* ═════════════════════════════════════════════
   Field definitions for the telemetry readout
   ═════════════════════════════════════════════ */
function formatFields(prediction) {
  if (!prediction) return [];
  return [
    {
      label: 'TIMESTAMP',
      value: prediction.timestamp,
      unit: '',
    },
    {
      label: 'X_ERROR',
      value: prediction.x_error >= 0
        ? `+${prediction.x_error.toFixed(4)}`
        : prediction.x_error.toFixed(4),
      unit: 'm',
    },
    {
      label: 'Y_ERROR',
      value: prediction.y_error >= 0
        ? `+${prediction.y_error.toFixed(4)}`
        : prediction.y_error.toFixed(4),
      unit: 'm',
    },
    {
      label: 'Z_ERROR',
      value: prediction.z_error >= 0
        ? `+${prediction.z_error.toFixed(4)}`
        : prediction.z_error.toFixed(4),
      unit: 'm',
    },
    {
      label: 'SAT CLOCK ERR',
      value: prediction.satellite_clock_error.toExponential(1),
      unit: 's',
    },
  ];
}

/* ═════════════════════════════════════════════
   StatusBar component
   ═════════════════════════════════════════════ */
export default function StatusBar({ prediction, isLoading }) {
  const fields = formatFields(prediction);

  return (
    <motion.div
      key="statusbar"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '560px',
        zIndex: 100,
        padding: '60px 40px 40px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        fontFamily: "'JetBrains Mono', monospace",
        pointerEvents: 'none',
      }}
    >
      {/* ── Title block ──────────────────────────── */}
      <div style={{ marginBottom: '60px' }}>
        <h1
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '22px',
            fontWeight: 700,
            color: 'rgba(200, 230, 255, 0.9)',
            letterSpacing: '8px',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Satellite Error Predictor
        </h1>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px',
            color: 'rgba(100, 160, 255, 0.35)',
            letterSpacing: '3px',
            marginTop: '6px',
          }}
        >
          ISRO • GEO/MEO ORBIT ANALYSIS
        </div>
      </div>

      {/* ── Data Area ────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <AnimatePresence>
          {/* Loading state */}
          {isLoading && !prediction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: 'easeInOut',
              }}
              style={{
                color: 'rgba(0, 200, 255, 0.7)',
                fontSize: '13px',
                letterSpacing: '2px',
              }}
            >
              ◈ Analyzing satellite telemetry…
            </motion.div>
          )}

          {/* Data fields */}
          {fields.map((field, i) => (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.08,
                type: 'spring',
                stiffness: 250,
                damping: 20,
              }}
              style={{
                textAlign: 'left',
              }}
            >
              {/* Label */}
              <div
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'rgba(0, 200, 255, 0.55)',
                  letterSpacing: '3px',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                }}
              >
                {field.label}
              </div>

              {/* Value */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 + 0.15 }}
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#dceeff',
                  textShadow: '0 0 8px rgba(0, 150, 255, 0.2)',
                }}
              >
                {field.value}
                {field.unit && (
                  <span
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '13px',
                      color: 'rgba(150, 200, 255, 0.45)',
                      marginLeft: '6px',
                    }}
                  >
                    {field.unit}
                  </span>
                )}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
