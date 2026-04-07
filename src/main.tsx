import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@rainbow-me/rainbowkit/styles.css";

// Suppress CDP 401 console noise — stale session on init triggers refreshAccessToken → signOut → 401
// These are expected when a previous session has expired and are not actionable errors.
const _origConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const msg = args.map((a) => (a instanceof Error ? a.message : String(a ?? ""))).join(" ");
  if (msg.includes("401") || msg.includes("Unauthorized")) return;
  _origConsoleError(...args);
};

createRoot(document.getElementById("root")!).render(<App />);
