import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeedbackSuccessOverlay({ show, wantsContact, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDone, 600);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
        >
          <motion.div
            initial={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(88, 28, 135, 0.6)' }}
            animate={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(88, 28, 135, 0.3)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            className="absolute inset-0"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative text-center z-10"
          >
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-3">THANK YOU!</h2>
            <p className="text-lg text-white/90">We appreciate your valuable feedback!</p>
            {wantsContact && (
              <p className="text-white/80 mt-3 text-sm">You'll hear from us within 24h!</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}