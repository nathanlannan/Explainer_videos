// Series design tokens. The single source for colours, type and layout rules.
// Mirrored in style_guide.md. Contrast ratios were checked with shared/style/contrast.py.
export const C = {
  paper: '#F3EEE4',      // background
  paperDeep: '#E9E1D2',  // panels, board
  wood: '#E6C9A0',       // hinoki
  woodDark: '#C9A577',   // end grain / shading accents
  ink: '#1B1B1B',        // sumi: all text and lines
  inkSoft: '#4A4642',    // secondary text (AA on paper)
  accent: '#B8432F',     // shu vermilion: ONLY attention / error, always with a ✕ icon or label
  ghost: '#7D8EA0',      // blue-grey: ghosted next-step previews (translucent)
  ok: '#1B1B1B',         // "agrees" is shown in ink + ✓, never colour alone
};
export const FONT = {
  latin: "'Noto Sans', 'Noto Sans CJK JP', sans-serif",
  jp: "'Noto Serif CJK JP', serif",
  hand: "'Noto Serif CJK JP', serif",
};
export const SIZE = { title: 84, h2: 56, label: 40, gloss: 36, small: 36 }; // px @1080p; label min 36, title min 48
export const SAFE = { x: 96, y: 54, w: 1920, h: 1080 };                      // 5% title-safe margin
export const LINE = {
  centre: [24, 7, 4, 7],   // dash-dot pattern for centre lines (px at 1080p, scaled in 3D)
  inkW: 4,                 // drawn line weight, px (heavier than real ink, for legibility)
};
export const FPS = 30;
