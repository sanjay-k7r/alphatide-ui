import type {
  ChatKitOptions,
  ColorScheme,
  StartScreenPrompt,
} from "@openai/chatkit";

export const APP_VERSION = "0.9.1";

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

type ChatKitTheme = ChatKitOptions["theme"];

export const getThemeConfig = (theme: ColorScheme): ChatKitTheme => ({
  colorScheme: theme,
});
