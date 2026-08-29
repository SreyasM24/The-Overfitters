/**
 * Generate mock satellite error prediction data.
 *
 * ┌───────────────────────────────────────────────────┐
 * │  SWAP POINT: Replace the body of this function    │
 * │  with a real fetch() call when the ML backend     │
 * │  is ready.                                        │
 * │                                                   │
 * │  Example:                                         │
 * │    const res = await fetch(`/api/predict?t=${t}`)│
 * │    return await res.json();                       │
 * └───────────────────────────────────────────────────┘
 *
 * @param {string} timeString  – "HH:MM" in 24-hour format
 * @returns {object} prediction payload
 */
export function getMockPrediction(timeString) {
  // Deterministic pseudo-random seeded by the time string
  const seed = timeString
    .split('')
    .reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 1), 0);

  const seededRandom = (offset) => {
    const x = Math.sin(seed * 9301 + offset * 49297) * 49297;
    return x - Math.floor(x);
  };

  const hours = parseInt(timeString.split(':')[0], 10);
  const minutes = parseInt(timeString.split(':')[1], 10);

  // Build an ISO timestamp for today at the selected time
  const now = new Date();
  const timestamp = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  ).toISOString().slice(0, 19);

  return {
    timestamp,
    lstm: {
      x_error: parseFloat(((seededRandom(1) - 0.5) * 0.01).toFixed(4)),
      y_error: parseFloat(((seededRandom(2) - 0.5) * 0.01).toFixed(4)),
      z_error: parseFloat(((seededRandom(3) - 0.5) * 0.005).toFixed(4)),
      clock_error: parseFloat((seededRandom(4) * 5e-9).toExponential(1)),
    },
    gru: {
      x_error: parseFloat(((seededRandom(5) - 0.5) * 0.008).toFixed(4)),
      y_error: parseFloat(((seededRandom(6) - 0.5) * 0.009).toFixed(4)),
      z_error: parseFloat(((seededRandom(7) - 0.5) * 0.004).toFixed(4)),
      clock_error: parseFloat((seededRandom(8) * 4e-9).toExponential(1)),
    }
  };
}
