import { useEffect, useRef, useState } from "react";

// Open/close behaviour shared by the custom dropdowns, so the two cannot
// drift apart: an outside click closes, and Escape closes only the innermost
// panel. The Escape listener is captured because a surrounding Modal listens
// for Escape on document too and would otherwise close along with the panel.
export default function useDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event) => {
      if (!containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      event.stopPropagation();
      setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open]);

  return { open, setOpen, containerRef };
}
