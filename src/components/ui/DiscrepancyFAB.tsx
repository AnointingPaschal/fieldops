'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { fetchDiscrepancyCount } from '@/lib/api';
import { triggerNav } from '@/lib/navigation';

export default function DiscrepancyFAB() {
  const router   = useRouter();
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchDiscrepancyCount().then(setCount);
  }, [pathname]);

  // Only show for supervisors (path starts with /supervisor)
  if (!pathname.startsWith('/supervisor')) return null;
  if (pathname.includes('/discrepancies')) return null;
  if (count === 0) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { triggerNav(); router.push('/supervisor/discrepancies'); }}
        className="fixed right-4 z-[60] flex items-center gap-2 bg-fail text-white font-bold text-[12px] rounded-full shadow-lg px-3.5 py-2.5"
        style={{ bottom: '80px' }}  /* above mobile bottom nav (~64px) */
        title={`${count} item discrepancies`}
      >
        <AlertTriangle className="w-4 h-4" />
        <span>{count} discrepanc{count === 1 ? 'y' : 'ies'}</span>
        <motion.span
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 bg-white rounded-full"
        />
      </motion.button>
    </AnimatePresence>
  );
}
