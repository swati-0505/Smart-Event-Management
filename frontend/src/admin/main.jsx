// main.jsx
// Admin application entry point.
// Mounts the React app to the DOM.

import React from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import AdminApp from "./AdminApp";

// Styles — order matters:
// 1. admin.css — tokens, base, layout
// 2. admin-animations.css — keyframes + utilities
// 3. admin-components.css — buttons, cards, badges
// 4. admin-toggles.css — BB-8 + Holo toggles
import "./admin.css";
import "./admin-animations.css";
import "./admin-components.css";
import "./admin-toggles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AdminApp />

    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
        },
      }}
    />
  </React.StrictMode>
);