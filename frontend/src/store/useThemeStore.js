import { create } from "zustand";

const THEME_COLORS = {
  light: {
    background: "0 0% 100%",
    foreground: "222.2 84% 4.9%",
    card: "0 0% 100%",
    "card-foreground": "222.2 84% 4.9%",
    popover: "0 0% 100%",
    "popover-foreground": "222.2 84% 4.9%",
    muted: "221.2 63.6% 97.5%",
    "muted-foreground": "215.4 16.3% 46.9%",
    accent: "221.2 83.2% 53.3%",
    "accent-foreground": "210 40% 98%",
    destructive: "0 84.2% 60.2%",
    "destructive-foreground": "210 40% 98%",
    border: "214.3 31.8% 91.4%",
    input: "214.3 31.8% 91.4%",
    ring: "221.2 83.2% 53.3%",
    primary: "221.2 83.2% 53.3%",
    "primary-foreground": "210 40% 98%",
    secondary: "222.2 47.4% 11.2%",
    "secondary-foreground": "210 40% 98%",
  },
  dark: {
    background: "222.2 84% 4.9%",
    foreground: "210 40% 98%",
    card: "222.2 84% 4.9%",
    "card-foreground": "210 40% 98%",
    popover: "222.2 84% 4.9%",
    "popover-foreground": "210 40% 98%",
    muted: "217.2 32.6% 17.5%",
    "muted-foreground": "215 20.3% 65.1%",
    accent: "217.2 91.2% 59.8%",
    "accent-foreground": "222.2 47.4% 11.2%",
    destructive: "0 62.8% 30.6%",
    "destructive-foreground": "210 40% 98%",
    border: "217.2 32.6% 17.5%",
    input: "217.2 32.6% 17.5%",
    ring: "212.7 26.8% 83.9%",
    primary: "217.2 91.2% 59.8%",
    "primary-foreground": "222.2 47.4% 11.2%",
    secondary: "212.7 26.8% 83.9%",
    "secondary-foreground": "222.2 84% 4.9%",
  },
  cupcake: {
    background: "12 100% 95%",
    foreground: "0 0% 20%",
    card: "12 100% 98%",
    "card-foreground": "0 0% 20%",
    popover: "12 100% 98%",
    "popover-foreground": "0 0% 20%",
    muted: "12 75% 85%",
    "muted-foreground": "0 0% 60%",
    accent: "240 100% 73%",
    "accent-foreground": "0 0% 20%",
    destructive: "0 84.2% 60.2%",
    "destructive-foreground": "210 40% 98%",
    border: "12 75% 90%",
    input: "12 75% 90%",
    ring: "358 75% 59%",
    primary: "358 75% 59%",
    "primary-foreground": "0 0% 100%",
    secondary: "240 100% 73%",
    "secondary-foreground": "0 0% 20%",
  },
  forest: {
    background: "120 40% 15%",
    foreground: "120 20% 90%",
    card: "120 40% 18%",
    "card-foreground": "120 20% 90%",
    popover: "120 40% 18%",
    "popover-foreground": "120 20% 90%",
    muted: "120 30% 35%",
    "muted-foreground": "120 15% 70%",
    accent: "180 100% 50%",
    "accent-foreground": "120 40% 15%",
    destructive: "0 84.2% 60.2%",
    "destructive-foreground": "210 40% 98%",
    border: "120 30% 35%",
    input: "120 30% 35%",
    ring: "180 100% 50%",
    primary: "120 50% 40%",
    "primary-foreground": "120 20% 95%",
    secondary: "180 100% 50%",
    "secondary-foreground": "120 40% 15%",
  },
  dracula: {
    background: "231 15% 18%",
    foreground: "60 30% 96%",
    card: "231 15% 20%",
    "card-foreground": "60 30% 96%",
    popover: "231 15% 20%",
    "popover-foreground": "60 30% 96%",
    muted: "231 15% 35%",
    "muted-foreground": "60 30% 75%",
    accent: "265 89% 78%",
    "accent-foreground": "231 15% 18%",
    destructive: "0 84.2% 60.2%",
    "destructive-foreground": "210 40% 98%",
    border: "231 15% 35%",
    input: "231 15% 35%",
    ring: "265 89% 78%",
    primary: "265 89% 78%",
    "primary-foreground": "231 15% 18%",
    secondary: "357 100% 60%",
    "secondary-foreground": "60 30% 96%",
  },
  nord: {
    background: "218 27% 20%",
    foreground: "217 32% 92%",
    card: "218 27% 23%",
    "card-foreground": "217 32% 92%",
    popover: "218 27% 23%",
    "popover-foreground": "217 32% 92%",
    muted: "218 27% 40%",
    "muted-foreground": "217 32% 75%",
    accent: "192 84% 60%",
    "accent-foreground": "218 27% 20%",
    destructive: "0 84.2% 60.2%",
    "destructive-foreground": "210 40% 98%",
    border: "218 27% 40%",
    input: "218 27% 40%",
    ring: "192 84% 60%",
    primary: "192 84% 60%",
    "primary-foreground": "218 27% 20%",
    secondary: "200 100% 50%",
    "secondary-foreground": "217 32% 92%",
  },
  sunset: {
    background: "10 30% 15%",
    foreground: "30 100% 90%",
    card: "10 30% 18%",
    "card-foreground": "30 100% 90%",
    popover: "10 30% 18%",
    "popover-foreground": "30 100% 90%",
    muted: "10 30% 40%",
    "muted-foreground": "30 100% 75%",
    accent: "345 100% 62%",
    "accent-foreground": "10 30% 15%",
    destructive: "0 84.2% 60.2%",
    "destructive-foreground": "210 40% 98%",
    border: "10 30% 40%",
    input: "10 30% 40%",
    ring: "345 100% 62%",
    primary: "30 100% 60%",
    "primary-foreground": "10 30% 15%",
    secondary: "345 100% 62%",
    "secondary-foreground": "30 100% 90%",
  },
};

export const useThemeStore = create((set) => {
  const THEMES = ["light", "dark", "cupcake", "forest", "dracula", "nord", "sunset"];
  const initialTheme = localStorage.getItem("chat-theme") || "light";

  // Apply theme immediately on init
  applyTheme(initialTheme);

  return {
    theme: initialTheme,
    themes: THEMES,
    setTheme: (theme) => {
      if (THEMES.includes(theme)) {
        localStorage.setItem("chat-theme", theme);
        applyTheme(theme);
        set({ theme });
        console.log("Theme changed to:", theme);
      }
    },
  };
});

function applyTheme(theme) {
  const html = document.documentElement;
  const colors = THEME_COLORS[theme] || THEME_COLORS.light;

  // Set all CSS variables
  Object.entries(colors).forEach(([key, value]) => {
    html.style.setProperty(`--${key}`, value);
  });

  // Handle dark mode class
  if (theme === "dark" || theme === "dracula" || theme === "nord" || theme === "forest") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }

  console.log("Theme applied:", theme);
}