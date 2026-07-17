import React from "react";

/* ---- functional families of the chain: colour gives life, families give meaning ---- */
export const FAM = {
  1: "jade", 2: "jade", 3: "jade",
  4: "violet", 11: "violet", 12: "violet",
  5: "sky", 10: "sky", 14: "sky",
  6: "amber", 7: "amber", 8: "amber",
  9: "coral", 13: "plum", 15: "leaf",
};

/* [tint, mid, deep] */
export const FAMC = {
  jade:   ["#E1F1EA", "#149A7C", "#0B6450"],
  violet: ["#ECE9FA", "#6A57D6", "#5343AC"],
  sky:    ["#E4F0FB", "#2E7BC4", "#1C5E9F"],
  amber:  ["#F8EEDA", "#CE861F", "#9A6A18"],
  coral:  ["#FBE7E1", "#CC4E2E", "#A93C21"],
  plum:   ["#F7E7F0", "#B34983", "#93386A"],
  leaf:   ["#E9F4E6", "#54A25E", "#3C7F45"],
};

export const famOf = (id) => FAMC[FAM[id] || "jade"];

/* ---- 15 crafted duotone icons (24×24), each a small designed object ---- */
function Glyph({ id, c }) {
  const [, m, d] = c;
  const W = "#FFFFFF";
  switch (id) {
    case 1: return (<g>
      <rect x="4" y="13" width="4" height="7" rx="1.3" fill={m} />
      <rect x="10" y="9.5" width="4" height="10.5" rx="1.3" fill={d} />
      <rect x="16" y="6" width="4" height="14" rx="1.3" fill={d} />
      <path d="M5 12 L11 8 L14.4 9.8 L19 5.4" fill="none" stroke={W} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.6 8.4 L19.6 4.9 L16.1 4.9" fill="none" stroke={W} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </g>);
    case 2: return (<g>
      <rect x="4.5" y="5" width="15" height="5" rx="1.6" fill={m} />
      <rect x="5.5" y="10.5" width="13" height="9.5" rx="1.8" fill={d} />
      <rect x="10.9" y="10.5" width="2.2" height="9.5" fill={W} opacity=".9" />
      <rect x="9.2" y="6.4" width="5.6" height="2.2" rx="1.1" fill={W} opacity=".9" />
    </g>);
    case 3: return (<g>
      <path d="M4 5.2 H7.2 L8.2 8" fill="none" stroke={m} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.6 8 H20 L18.4 14.6 A1.8 1.8 0 0 1 16.65 16 H9.6 A1.8 1.8 0 0 1 7.85 14.6 Z" fill={d} />
      <rect x="10.4" y="10" width="6.4" height="2" rx="1" fill={W} opacity=".9" />
      <circle cx="10.4" cy="19" r="2" fill={m} /><circle cx="10.4" cy="19" r=".8" fill={W} />
      <circle cx="16.2" cy="19" r="2" fill={m} /><circle cx="16.2" cy="19" r=".8" fill={W} />
    </g>);
    case 4: return (<g>
      <circle cx="9" cy="8.6" r="3.4" fill={m} />
      <path d="M3.6 20 v-1.6 a5.4 5.4 0 0 1 10.8 0 V20 Z" fill={m} />
      <circle cx="15.6" cy="9.6" r="3.4" fill={d} />
      <path d="M10.2 20 v-1.4 a5.4 5.4 0 0 1 10.2 -0.2 V20 Z" fill={d} />
      <circle cx="15.6" cy="9.6" r="3.4" fill="none" stroke={W} strokeWidth="1.1" />
    </g>);
    case 5: return (<g>
      <path d="M7 3.6 a3.9 3.9 0 0 1 3.9 3.9 c0 2.7 -3.9 6.3 -3.9 6.3 s-3.9 -3.6 -3.9 -6.3 A3.9 3.9 0 0 1 7 3.6 Z" fill={d} />
      <circle cx="7" cy="7.4" r="1.5" fill={W} />
      <path d="M9.6 13.4 C14.6 13 12.4 18.4 17.4 18" fill="none" stroke={m} strokeWidth="2" strokeLinecap="round" strokeDasharray="3.1 3.1" />
      <circle cx="18.6" cy="18" r="2.5" fill={d} /><circle cx="18.6" cy="18" r="1" fill={W} />
    </g>);
    case 6: return (<g>
      <path d="M3.4 10.4 L12 4.2 L20.6 10.4 V11.4 H3.4 Z" fill={d} />
      <rect x="5" y="11.4" width="14" height="8.6" rx="1.2" fill={m} />
      <rect x="9.9" y="13.6" width="4.2" height="6.4" rx="1" fill={W} opacity=".92" />
      <rect x="6.3" y="13.6" width="2.4" height="2.4" rx=".6" fill={d} />
    </g>);
    case 7: return (<g>
      <path d="M14.8 4.2 a5 5 0 0 0 -6.6 6.2 l-4 4 a2.1 2.1 0 0 0 3 3 l4 -4 a5 5 0 0 0 6.2 -6.6 l-3 3 -2.6 -0.6 -0.6 -2.6 Z" fill={d} />
      <circle cx="5.7" cy="18.3" r="1" fill={W} opacity=".9" />
      <path d="M13.4 13.4 l5 5" stroke={m} strokeWidth="3" strokeLinecap="round" />
    </g>);
    case 8: return (<g>
      <circle cx="10.4" cy="10.4" r="5.6" fill={W} stroke={d} strokeWidth="2.4" />
      <path d="M8 10.5 l1.7 1.8 3.1 -3.6" fill="none" stroke={m} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="14.2" y="12.8" width="7.4" height="3.4" rx="1.7" transform="rotate(45 17.9 14.5)" fill={d} />
    </g>);
    case 9: return (<g>
      <path d="M12 3.4 L18.8 5.9 V11.6 C18.8 16.2 15.9 19 12 20.6 C8.1 19 5.2 16.2 5.2 11.6 V5.9 Z" fill={d} />
      <path d="M12 5.6 L16.8 7.4 V11.7 C16.8 15.1 14.7 17.3 12 18.5 Z" fill={m} />
      <rect x="11" y="8" width="2" height="5.4" rx="1" fill={W} />
      <circle cx="12" cy="15.6" r="1.15" fill={W} />
    </g>);
    case 10: return (<g>
      <circle cx="13" cy="12.6" r="7.4" fill={m} />
      <circle cx="13" cy="12.6" r="5.5" fill={W} />
      <rect x="12.2" y="8.4" width="1.7" height="4.9" rx=".85" fill={d} />
      <rect x="12.2" y="11.8" width="4.6" height="1.7" rx=".85" fill={d} />
      <path d="M4.4 6.6 l2.5 -2.5 M3 11 h2.6 M4.4 15.4 l2.2 1.4" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
    </g>);
    case 11: return (<g>
      <rect x="3.4" y="6.4" width="10.6" height="6.6" rx="1.8" transform="rotate(-16 8.7 9.7)" fill={m} />
      <circle cx="6.4" cy="8.4" r="1.15" fill={W} />
      <rect x="9.4" y="10.6" width="11.2" height="7" rx="1.9" transform="rotate(-16 15 14.1)" fill={d} />
      <circle cx="12.6" cy="12.9" r="1.2" fill={W} />
    </g>);
    case 12: return (<g>
      <path d="M6.4 4 H14.6 L18.6 8 V20 H6.4 Z" fill={W} stroke={d} strokeWidth="1.3" />
      <path d="M14.6 4 L18.6 8 H14.6 Z" fill={d} />
      <rect x="8.6" y="14.2" width="7.6" height="1.7" rx=".85" fill={m} opacity=".55" />
      <rect x="8.6" y="17" width="5.2" height="1.7" rx=".85" fill={m} opacity=".55" />
      <rect x="3.6" y="9.6" width="16.8" height="3.2" rx="1.6" fill={m} />
    </g>);
    case 13: return (<g>
      <path d="M4.4 5.6 h15.2 a2.2 2.2 0 0 1 2.2 2.2 v6.6 a2.2 2.2 0 0 1 -2.2 2.2 H12 l-4.2 3.6 v-3.6 H4.4 a2.2 2.2 0 0 1 -2.2 -2.2 V7.8 a2.2 2.2 0 0 1 2.2 -2.2 Z" transform="translate(0.8 0)" fill={m} />
      <rect x="10.4" y="8.2" width="5" height="5" rx="1.2" transform="rotate(45 12.9 10.7)" fill={W} />
      <circle cx="18.6" cy="6.4" r="1.5" fill={d} />
    </g>);
    case 14: return (<g>
      <path d="M12 3.6 L19.4 7.6 L12 11.6 L4.6 7.6 Z" fill={m} />
      <path d="M4.6 7.6 L12 11.6 V20.4 L4.6 16.4 Z" fill={d} />
      <path d="M19.4 7.6 L12 11.6 V20.4 L19.4 16.4 Z" fill={d} opacity=".72" />
      <path d="M8.3 5.6 L15.7 9.6" stroke={W} strokeWidth="1.2" strokeLinecap="round" opacity=".85" />
    </g>);
    case 15: return (<g>
      <path d="M12 20.6 C6 17.4 5.4 9.4 12 3.8 C18.6 9.4 18 17.4 12 20.6 Z" fill={m} />
      <path d="M12 20.6 C18 17.4 18.6 9.4 12 3.8 Z" fill={d} />
      <path d="M12 6.6 V19 M12 10.2 L9 12.4 M12 13.6 L15 15.6" fill="none" stroke={W} strokeWidth="1.3" strokeLinecap="round" opacity=".9" />
    </g>);
    default: return null;
  }
}

/* Icon chip: tinted rounded square + glyph — the Odoo-style designed object */
export function ModIcon({ id, size = 34, radius = 10, chip = true }) {
  const c = famOf(id);
  return (
    <span style={{ width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: chip ? c[0] : "transparent",
      display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 24 24" aria-hidden="true">
        <Glyph id={id} c={c} />
      </svg>
    </span>
  );
}
