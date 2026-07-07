import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Okara is canal-colony farmland — wheat & dairy country.
        wheat: "#E3B23C",
        canal: "#0F3D3E",   // deep teal-green, used for accents/buttons only
        husk: "#FFFFFF",    // page background — white per brief
        char: "#1A1A1A",    // near-black body text
        brick: "#B24C33",   // alert/accent
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
