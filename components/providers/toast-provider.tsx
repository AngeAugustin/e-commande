"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: "0.9rem",
          background: "#0a3d2e",
          color: "#fff",
          fontSize: "13px",
        },
        success: {
          iconTheme: {
            primary: "#e0451a",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
