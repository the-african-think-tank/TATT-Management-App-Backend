"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  const [position, setPosition] = useState<"top-right" | "bottom-center">("top-right");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPosition("bottom-center");
      } else {
        setPosition("top-right");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Toaster 
      position={position} 
      toastOptions={{
        className: 'font-sans font-bold uppercase tracking-tight text-xs rounded-2xl border-2 border-tatt-lime bg-tatt-black text-white px-6 py-4 shadow-2xl',
        duration: 4000,
        style: {
          background: '#0a0a0a',
          color: '#ffffff',
          borderRadius: '20px',
          border: '2px solid #D9FF00',
          fontSize: '11px',
          fontWeight: '900',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          padding: '16px 24px',
        },
        success: {
          iconTheme: {
            primary: '#D9FF00',
            secondary: '#000000',
          },
        },
        error: {
          iconTheme: {
            primary: '#ff4b4b',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
}
