import {
  ColorScheme,
  StartScreenPrompt,
  ThemeOption,
} from "@openai/chatkit";

export const WORKFLOW_ID =
  process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID?.trim() ?? "";

export const CREATE_SESSION_ENDPOINT = "/api/create-session";

export const STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: "Study and derive trade setups for TSLA",
    prompt: "Study and derive trade setups for TSLA?",
    icon: "circle-question",
  },
  {
    label: "What do you see that my eyes are missing on TSLA?",
    prompt: "What do you see that my eyes are missing on TSLA?",
    icon: "circle-question",
  },
];

export const PLACEHOLDER_INPUT = "Ask any financial question...";

export const GREETING = "How can I help you today?";

export const DISCLAIMER_TEXT =
  "Not financial advice. AI can make mistakes. Always verify data.";

const TYPOGRAPHY: ThemeOption["typography"] = {
  baseSize: 16,
  fontFamily:
    '"OpenAI Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  fontFamilyMono:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
  fontSources: [
    {
      family: "OpenAI Sans",
      src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-Regular.woff2",
      weight: 400,
      style: "normal",
      display: "swap",
    },
    // add the rest of your font sources here
  ],
};

const LIGHT_THEME: ThemeOption = {
  colorScheme: "light",
  radius: "round",
  density: "compact",
  typography: TYPOGRAPHY,
  color: {
    surface: {
      background: "#ffffff",
      foreground: "#111111",
    },
    grayscale: {
      hue: 0,
      tint: 0,
      shade: -2,
    },
    accent: {
      primary: "#111111",
      level: 1,
    },
  },
};

const DARK_THEME: ThemeOption = {
  colorScheme: "dark",
  radius: "round",
  density: "compact",
  typography: TYPOGRAPHY,
  color: {
    surface: {
      background: "#111111",
      foreground: "#f5f5f5",
    },
    grayscale: {
      hue: 0,
      tint: 0,
      shade: 2,
    },
    accent: {
      primary: "#f5f5f5",
      level: 1,
    },
  },
};

export const getThemeConfig = (theme: ColorScheme): ThemeOption =>
  theme === "dark" ? DARK_THEME : LIGHT_THEME;
