// RobotMascot.jsx
// Animated boxy robot — pure SVG with CSS animations.

import "./RobotMascot.css";

function RobotMascot({ size = 200 }) {
  return (
    <div className="robot-wrap" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 220"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Body gradient — warm boxy feel */}
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5c48a" />
            <stop offset="50%" stopColor="#e8a86a" />
            <stop offset="100%" stopColor="#c98850" />
          </linearGradient>
          <linearGradient id="headGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f7cd95" />
            <stop offset="50%" stopColor="#e5a566" />
            <stop offset="100%" stopColor="#c8854a" />
          </linearGradient>
          <linearGradient id="darkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d2b1f" />
            <stop offset="100%" stopColor="#2a1d14" />
          </linearGradient>
          <radialGradient id="eyeGrad" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#4a4a4a" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          {/* Glow around robot */}
          <radialGradient id="glow" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#f5c48a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f5c48a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ground glow */}
        <ellipse cx="100" cy="205" rx="60" ry="10" fill="url(#glow)" />

        {/* Shadow under robot */}
        <ellipse
          cx="100"
          cy="202"
          rx="38"
          ry="5"
          fill="#000000"
          opacity="0.15"
          className="robot-shadow"
        />

        {/* ============ ANTENNA (wiggle) ============ */}
        <g className="robot-antenna">
          <path
            d="M 100 42 Q 100 25 105 18"
            stroke="#3d2b1f"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="105" cy="17" r="3" fill="#f5c48a" />
        </g>

        {/* ============ HEAD (boxy cube) ============ */}
        <g className="robot-head">
          <rect
            x="52"
            y="42"
            width="96"
            height="82"
            rx="12"
            fill="url(#headGrad)"
            stroke="#a86832"
            strokeWidth="1.5"
          />
          {/* Head top highlight */}
          <rect
            x="58"
            y="48"
            width="84"
            height="20"
            rx="8"
            fill="#ffffff"
            opacity="0.15"
          />

          {/* Eyes */}
          <g className="robot-eyes">
            <ellipse
              className="robot-eye"
              cx="82"
              cy="86"
              rx="9"
              ry="11"
              fill="url(#eyeGrad)"
            />
            <ellipse
              className="robot-eye"
              cx="118"
              cy="86"
              rx="9"
              ry="11"
              fill="url(#eyeGrad)"
            />
            {/* Eye shine */}
            <circle cx="79" cy="82" r="2.5" fill="#ffffff" opacity="0.9" />
            <circle cx="115" cy="82" r="2.5" fill="#ffffff" opacity="0.9" />
          </g>

          {/* Mouth */}
          <rect
            x="92"
            y="106"
            width="16"
            height="3"
            rx="1.5"
            fill="#3d2b1f"
          />

          {/* Cheek blush */}
          <ellipse
            cx="68"
            cy="102"
            rx="6"
            ry="3"
            fill="#e07a5f"
            opacity="0.4"
          />
          <ellipse
            cx="132"
            cy="102"
            rx="6"
            ry="3"
            fill="#e07a5f"
            opacity="0.4"
          />

          {/* Head side panel (right) */}
          <rect
            x="144"
            y="78"
            width="10"
            height="18"
            rx="3"
            fill="#a86832"
            opacity="0.7"
          />
        </g>

        {/* ============ NECK ============ */}
        <rect x="94" y="124" width="12" height="8" fill="#5a3d28" />

        {/* ============ BODY ============ */}
        <g className="robot-body">
          <rect
            x="62"
            y="132"
            width="76"
            height="58"
            rx="10"
            fill="url(#bodyGrad)"
            stroke="#a86832"
            strokeWidth="1.5"
          />

          {/* Body top highlight */}
          <rect
            x="68"
            y="138"
            width="64"
            height="12"
            rx="6"
            fill="#ffffff"
            opacity="0.15"
          />

          {/* Chest panel */}
          <rect
            x="86"
            y="156"
            width="28"
            height="16"
            rx="4"
            fill="#a86832"
            opacity="0.6"
          />
          <circle cx="94" cy="164" r="2" fill="#3d2b1f" />
          <circle cx="100" cy="164" r="2" fill="#3d2b1f" />
          <circle cx="106" cy="164" r="2" fill="#3d2b1f" />
        </g>

        {/* ============ LEFT ARM (waving) ============ */}
        <g className="robot-arm-left">
          <rect
            x="42"
            y="138"
            width="16"
            height="34"
            rx="6"
            fill="url(#bodyGrad)"
            stroke="#a86832"
            strokeWidth="1.5"
          />
          {/* Hand */}
          <circle
            cx="50"
            cy="176"
            r="8"
            fill="url(#bodyGrad)"
            stroke="#a86832"
            strokeWidth="1.5"
          />
        </g>

        {/* ============ RIGHT ARM (waving) ============ */}
        <g className="robot-arm-right">
          <rect
            x="142"
            y="138"
            width="16"
            height="34"
            rx="6"
            fill="url(#bodyGrad)"
            stroke="#a86832"
            strokeWidth="1.5"
          />
          {/* Hand */}
          <circle
            cx="150"
            cy="176"
            r="8"
            fill="url(#bodyGrad)"
            stroke="#a86832"
            strokeWidth="1.5"
          />
        </g>

        {/* ============ LEGS ============ */}
        <g className="robot-legs">
          <rect
            x="78"
            y="188"
            width="16"
            height="14"
            rx="4"
            fill="url(#bodyGrad)"
            stroke="#a86832"
            strokeWidth="1.5"
          />
          <rect
            x="106"
            y="188"
            width="16"
            height="14"
            rx="4"
            fill="url(#bodyGrad)"
            stroke="#a86832"
            strokeWidth="1.5"
          />
        </g>
      </svg>
    </div>
  );
}

export default RobotMascot;