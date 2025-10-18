import type {
  ChatKitOptions,
  ColorScheme,
  StartScreenPrompt,
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

type ChatKitTheme = NonNullable<ChatKitOptions["theme"]>;

const TYPOGRAPHY: ChatKitTheme["typography"] = {
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
    {
      family: "OpenAI Sans",
      src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-Medium.woff2",
      weight: 500,
      style: "normal",
      display: "swap",
    },
    {
      family: "OpenAI Sans",
      src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-SemiBold.woff2",
      weight: 600,
      style: "normal",
      display: "swap",
    },
    {
      family: "OpenAI Sans",
      src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-Bold.woff2",
      weight: 700,
      style: "normal",
      display: "swap",
    },
  ],
};

const BASE_THEME: Omit<ChatKitTheme, "colorScheme"> = {
  radius: "round",
  density: "compact",
  typography: TYPOGRAPHY,
};

const THEME_COLORS: Record<ColorScheme, NonNullable<ChatKitTheme["color"]>> = {
  light: {
    surface: {
      background: "#f7f8fa",
      foreground: "#090b11",
    },
    accent: {
      primary: "#355cff",
      level: 2,
    },
    grayscale: {
      hue: 220,
      tint: 3,
    },
  },
  dark: {
    surface: {
      background: "#15161c",
      foreground: "#f3f4f8",
    },
    accent: {
      primary: "#4f6bff",
      level: 1,
    },
    grayscale: {
      hue: 220,
      tint: 8,
      shade: 1,
    },
  },
};

export const getThemeConfig = (theme: ColorScheme): ChatKitTheme => ({
  ...BASE_THEME,
  color: THEME_COLORS[theme],
  colorScheme: theme,
});
