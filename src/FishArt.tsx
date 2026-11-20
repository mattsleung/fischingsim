import type { Fish } from "./fish";

// Original geometric illustration; the species silhouette and markings derive from its data.
export function FishArt({ fish }: { fish: Fish }) {
  const ray = fish.name === "Lantern Ray";
  return (
    <svg
      viewBox="0 0 400 220"
      role="img"
      aria-label={`Illustration of ${fish.name}`}
      className="fish-art"
      style={{ color: fish.color }}
    >
      <ellipse
        cx="200"
        cy="176"
        rx="102"
        ry="8"
        fill="currentColor"
        opacity=".1"
      />
      <g stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path
          d={
            ray
              ? "M78 108L190 27L304 108L190 159Z"
              : "M73 110L18 65L30 117L18 157L88 130Z"
          }
          fill="currentColor"
          opacity=".55"
        />
        <path
          d="M155 85L173 41L217 76L247 86M168 141L201 174L220 142"
          fill="currentColor"
          opacity=".65"
        />
        <path
          d={
            ray
              ? "M91 109Q170 62 298 105Q259 150 169 147Q122 142 91 109Z"
              : "M67 116Q120 50 236 78Q292 88 328 115Q292 151 236 152Q122 166 67 116Z"
          }
          fill="currentColor"
        />
        <path
          d="M81 119Q189 99 319 116Q274 153 216 148Q137 154 81 119Z"
          fill="#142e40"
          opacity=".5"
          stroke="none"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M${122 + i * 27} ${87 - i * 2}q-15 27 1 51`}
            fill="none"
            stroke="#142c3a"
            strokeWidth="8"
            opacity=".25"
          />
        ))}
        <path
          d="M226 99L187 122L229 139"
          fill="#eff7de"
          opacity=".3"
          strokeWidth="1"
        />
        <path
          d="M275 98Q263 118 277 137"
          fill="none"
          stroke="#142c3a"
          opacity=".5"
        />
        <circle
          cx="293"
          cy="108"
          r="7"
          fill="#112334"
          stroke="#e9eacb"
          strokeWidth="2"
        />
        <circle cx="295" cy="106" r="2" fill="#fff" stroke="none" />
        <path d="M316 122l12-4" stroke="#173345" />
      </g>
      {fish.difficulty > 5 &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <circle
            key={i}
            cx={140 + i * 22}
            cy={94 + (i % 2) * 8}
            r="2"
            fill="#f7edb9"
          />
        ))}
    </svg>
  );
}
