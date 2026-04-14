"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: "0.9rem",
          background: "#0f0f0f",
          color: "#fff",
          fontSize: "13px",
        },
      }}
    />
  );
}
