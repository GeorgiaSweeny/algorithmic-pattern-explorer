/*
========================================
YARN COLOUR PALETTES — preset data
========================================
Each colour needs:
  id     — index into PatternDocument.grid (0 = background)
  name   — yarn colour name shown in the UI
  hex    — display colour
  symbol — used in chart view for black-and-white printing
*/

export const DEFAULT_PALETTE = [
   { id: 0, name: "Cream",  hex: "#F5F0E8", symbol: "□" },
   { id: 1, name: "Navy",   hex: "#1B2A4A", symbol: "■" },
];

export const PALETTES = [
   {
      id: "classic",
      name: "Classic",
      colours: [
         { id: 0, name: "Cream",      hex: "#F5F0E8", symbol: "□" },
         { id: 1, name: "Navy",       hex: "#1B2A4A", symbol: "■" },
      ],
   },
   {
      id: "nordic",
      name: "Nordic",
      colours: [
         { id: 0, name: "White",      hex: "#FFFFFF",  symbol: "□" },
         { id: 1, name: "Red",        hex: "#B83232",  symbol: "■" },
         { id: 2, name: "Forest",     hex: "#2D5A3D",  symbol: "▨" },
      ],
   },
   {
      id: "autumn",
      name: "Autumn",
      colours: [
         { id: 0, name: "Oat",        hex: "#E8D5B0",  symbol: "□" },
         { id: 1, name: "Rust",       hex: "#8B3A2A",  symbol: "■" },
         { id: 2, name: "Mustard",    hex: "#C5852A",  symbol: "▨" },
         { id: 3, name: "Sage",       hex: "#7A8C6A",  symbol: "▤" },
      ],
   },
   {
      id: "monochrome",
      name: "Monochrome",
      colours: [
         { id: 0, name: "Ivory",      hex: "#F2EFE9",  symbol: "□" },
         { id: 1, name: "Charcoal",   hex: "#3D3D3D",  symbol: "■" },
      ],
   },
];
