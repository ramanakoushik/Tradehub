"use client";

import { RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UndoButton() {
  const [visible, setVisible] = useState(false);

  // Mocking an undo trigger for the demo
  useEffect(() => {
    const handleAction = () => {
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };
    
    // In a real app, this would subscribe to a store or event emitter
    window.addEventListener('tradehub-action', handleAction);
    return () => window.removeEventListener('tradehub-action', handleAction);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60]"
      >
        <button 
          onClick={() => {
            alert("Action undone!");
            setVisible(false);
          }}
          className="btn-neo bg-black text-white px-8 py-3 flex items-center gap-3 active:translate-y-0"
        >
          <RotateCcw size={20} />
          <span>Oops! Action performed. <u>Undo?</u></span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
