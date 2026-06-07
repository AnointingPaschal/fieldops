'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { onNavStart } from '@/lib/navigation';

export default function NavigationProgress() {
  const pathname     = usePathname();
  const prevPath     = useRef(pathname);
  const [pct, setPct]     = useState(0);
  const [show, setShow]   = useState(false);
  const timers = useRef<NodeJS.Timeout[]>([]);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const start = () => {
    clear();
    setShow(true);
    setPct(0);
    timers.current.push(setTimeout(() => setPct(30),  50));
    timers.current.push(setTimeout(() => setPct(55), 400));
    timers.current.push(setTimeout(() => setPct(72), 900));
    timers.current.push(setTimeout(() => setPct(85), 1600));
  };

  const finish = () => {
    clear();
    setPct(100);
    timers.current.push(setTimeout(() => { setShow(false); setPct(0); }, 450));
  };

  // Listen for navigation triggers from buttons
  useEffect(() => {
    const unsub = onNavStart(start);
    return () => { unsub(); };
  }, []);

  // Finish when route actually changes
  useEffect(() => {
    if (pathname !== prevPath.current) { finish(); prevPath.current = pathname; }
  }, [pathname]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { delay: 0.1 } }}
          className="fixed top-0 left-0 right-0 z-[200] h-0.5 bg-sky/20 pointer-events-none"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-sky to-sky-light rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          {/* Shimmer */}
          <motion.div
            className="absolute top-0 right-0 h-full w-24 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
