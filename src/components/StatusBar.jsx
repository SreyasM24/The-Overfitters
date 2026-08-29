import { motion, AnimatePresence } from 'framer-motion';

export default function StatusBar({ prediction, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        left: '40px',
        top: '40px', 
        zIndex: 100,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px', // Decreased from 40px
        width: '430px', // Decreased from 480px
      }}
    >
      {/* ── Title block ── */}
      <div>
        <h1
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '34px', // Decreased from 42px
            fontWeight: 700,
            color: '#fff',
            margin: 0,
            lineHeight: 1.2,
            textShadow: '0 0 12px rgba(0, 150, 255, 0.5)',
          }}
        >
          SATELLITE ERROR PREDICTOR
        </h1>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px', // Decreased from 13px
            color: '#00c8ff',
            letterSpacing: '4px',
            marginTop: '10px',
          }}
        >
          NAVIC • EPHEMERIS & CLOCK ERROR ANALYSIS
        </div>
      </div>

      {/* Loading state */}
      {isLoading && !prediction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{
            color: 'rgba(0, 200, 255, 0.7)',
            fontSize: '16px', // Decreased from 18px
            letterSpacing: '2px',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          ◈ Analyzing satellite telemetry…
        </motion.div>
      )}

      {/* ── Comparison Table ── */}
      {prediction && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr',
            gap: '22px 14px', // Decreased from 28px 16px
            width: '430px', 
          }}
        >
          {/* Headers */}
          <div style={headerStyle}>METRIC</div>
          <div style={headerStyle}>LSTM</div>
          <div style={headerStyle}>GRU</div>

          {/* X Error */}
          <div style={labelStyle}>X ERROR</div>
          <div style={valueStyle}>{formatNum(prediction.lstm?.x_error)}<span style={unitStyle}>m</span></div>
          <div style={valueStyle}>{formatNum(prediction.gru?.x_error)}<span style={unitStyle}>m</span></div>

          {/* Y Error */}
          <div style={labelStyle}>Y ERROR</div>
          <div style={valueStyle}>{formatNum(prediction.lstm?.y_error)}<span style={unitStyle}>m</span></div>
          <div style={valueStyle}>{formatNum(prediction.gru?.y_error)}<span style={unitStyle}>m</span></div>

          {/* Z Error */}
          <div style={labelStyle}>Z ERROR</div>
          <div style={valueStyle}>{formatNum(prediction.lstm?.z_error)}<span style={unitStyle}>m</span></div>
          <div style={valueStyle}>{formatNum(prediction.gru?.z_error)}<span style={unitStyle}>m</span></div>

          {/* Clock Error */}
          <div style={labelStyle}>CLOCK ERR</div>
          <div style={valueStyle}>{prediction.lstm?.clock_error}<span style={unitStyle}>s</span></div>
          <div style={valueStyle}>{prediction.gru?.clock_error}<span style={unitStyle}>s</span></div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Helper styles and formatting ──

function formatNum(val) {
  if (val === undefined || val === null) return '--';
  return val >= 0 ? `+${val.toFixed(4)}` : val.toFixed(4);
}

const headerStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontSize: '12px', // Decreased from 15px
  color: 'rgba(100, 200, 255, 0.5)',
  letterSpacing: '1.5px',
  borderBottom: '1px solid rgba(0, 150, 255, 0.2)',
  paddingBottom: '10px', // Decreased from 14px
  marginBottom: '6px', // Decreased from 8px
};

const labelStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontSize: '14px', // Decreased from 17px
  color: '#009dff',
  letterSpacing: '1px',
  display: 'flex',
  alignItems: 'center',
};

const valueStyle = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '20px', // Decreased from 25px
  color: '#ffffff',
  fontWeight: 'bold',
  textShadow: '0 0 6px rgba(255,255,255,0.3)',
};

const unitStyle = {
  fontSize: '11px', // Decreased from 14px
  color: '#556677',
  marginLeft: '6px',
};
