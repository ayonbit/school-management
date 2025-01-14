/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-redial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        ayonSky: "#C3EBFA",
        ayonSkyLight: "#EDF9FD",
        ayonPurple:"#CFCEFF",
        ayonPurpleLight:"#F1F0FF",
        ayonYellow : "#FAE27C",
        ayonYellowLight : "#FEFCE8",
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;
