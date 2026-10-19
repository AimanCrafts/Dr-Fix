import { useMemo, useState } from "react";
import "../css/trend-chart.css";

/**
 * TrendChart (admin/jsx/TrendChart.jsx)
 * -------------------------------------
 * Simple animated point/line graph for the admin dashboard.
 *
 * Animation: the line draws itself left to right, the area under it fades
 * in, and the points pop in one after another. Hover (or tap) a point to
 * see its value. Pure SVG, no chart library needed.
 */

const SAMPLE_DATA = [
  { label: "Nov", value: 42 },
  { label: "Dec", value: 58 },
  { label: "Jan", value: 51 },
  { label: "Feb", value: 73 },
  { label: "Mar", value: 64 },
  { label: "Apr", value: 88 },
  { label: "May", value: 79 },
  { label: "Jun", value: 61 },
  { label: "Jul", value: 95 },
  { label: "Aug", value: 83 },
  { label: "Sep", value: 112 },
  { label: "Oct", value: 104 },
];

const W = 800;
const H = 300;
const PAD = { top: 24, right: 28, bottom: 40, left: 44 };

// Smooth curve through the points (Catmull-Rom -> cubic Bezier).
function smoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function TrendChart({ data = SAMPLE_DATA }) {
  const [active, setActive] = useState(null);
  const [replayKey, setReplayKey] = useState(0);

  const { points, linePath, areaPath, ticks } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value));
    const top = Math.ceil(max / 20) * 20;
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;

    const pts = data.map((d, i) => ({
      ...d,
      x: PAD.left + (i * innerW) / (data.length - 1),
      y: PAD.top + innerH - (d.value / top) * innerH,
    }));

    const line = smoothPath(pts);
    const baseY = PAD.top + innerH;
    const area = `${line} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;

    const tickValues = [0, top / 4, top / 2, (top * 3) / 4, top].map((v) =>
      Math.round(v),
    );
    const tickList = tickValues.map((v) => ({
      value: v,
      y: PAD.top + innerH - (v / top) * innerH,
    }));

    return { points: pts, linePath: line, areaPath: area, ticks: tickList };
  }, [data]);

  const hovered = active !== null ? points[active] : null;

  return (
    <section className="card trend-chart" aria-label="Bookings trend">
      <div className="trend-chart__header">
        <div>
          <h2>Bookings Trend</h2>
          <p>Last 12 months</p>
        </div>
        <button
          type="button"
          className="trend-chart__replay"
          onClick={() => setReplayKey((k) => k + 1)}
        >
          Replay
        </button>
      </div>

      <div className="trend-chart__body">
        <svg
          key={replayKey}
          viewBox={`0 0 ${W} ${H}`}
          className="trend-chart__svg"
          role="img"
          aria-label="Line graph of bookings per month"
          onMouseLeave={() => setActive(null)}
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--df-orange)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--df-orange)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* grid + y labels */}
          {ticks.map((t) => (
            <g key={t.value}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={t.y}
                y2={t.y}
                className="trend-chart__grid"
              />
              <text x={PAD.left - 10} y={t.y + 4} className="trend-chart__ylabel">
                {t.value}
              </text>
            </g>
          ))}

          {/* x labels */}
          {points.map((p) => (
            <text
              key={p.label}
              x={p.x}
              y={H - 14}
              className="trend-chart__xlabel"
            >
              {p.label}
            </text>
          ))}

          {/* area + line */}
          <path d={areaPath} fill="url(#trendFill)" className="trend-chart__area" />
          <path
            d={linePath}
            pathLength="1"
            className="trend-chart__line"
            fill="none"
          />

          {/* hover guide */}
          {hovered && (
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={PAD.top}
              y2={H - PAD.bottom}
              className="trend-chart__guide"
            />
          )}

          {/* points */}
          {points.map((p, i) => (
            <g key={p.label}>
              <circle
                cx={p.x}
                cy={p.y}
                r={active === i ? 7 : 5}
                className="trend-chart__point"
                style={{ animationDelay: `${0.25 + i * 0.12}s` }}
              />
              {/* larger invisible target for easy hover/tap */}
              <circle
                cx={p.x}
                cy={p.y}
                r="16"
                fill="transparent"
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
              />
            </g>
          ))}
        </svg>

        {hovered && (
          <div
            className="trend-chart__tooltip"
            style={{
              left: `${(hovered.x / W) * 100}%`,
              top: `${(hovered.y / H) * 100}%`,
            }}
          >
            <strong>{hovered.value}</strong>
            <span>{hovered.label}</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default TrendChart;
