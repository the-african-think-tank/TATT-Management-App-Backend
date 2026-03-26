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

  return <Toaster position={position} />;
}
