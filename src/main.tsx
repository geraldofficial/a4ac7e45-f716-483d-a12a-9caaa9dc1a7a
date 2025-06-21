import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import error suppression and debugging utilities
import "./utils/simpleErrorSuppression";
import "./lib/safeUtils";

// Ensure proper error handling for module loading
const root = document.getElementById("root");

if (!root) {
  console.error("Root element not found");
  document.body.innerHTML =
    '<div style="padding: 20px; text-align: center;">Application failed to load. Please refresh the page.</div>';
} else {
  try {
    const reactRoot = ReactDOM.createRoot(root);
    reactRoot.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (error) {
    console.error("Failed to render app:", error);
    root.innerHTML =
      '<div style="padding: 20px; text-align: center;">Application failed to load. Please refresh the page.</div>';
  }
}
