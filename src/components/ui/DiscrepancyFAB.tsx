'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { triggerNav } from '@/lib/navigation';

export default function DiscrepancyFAB() {
  const router = useRouter();
  const [count, setCount] = useState(0);

  const load = async () => {
    const { count: c } = await supabase
      .from('task_item_recovery')
      .select('*', { count: 'exact', head: true })
      .or('quantity_damaged.gt.0,quantity_missing.gt.0');
    setCount(c || 0);
  };

  useEffect(() => { load(); }, []);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => { triggerNav(); router.push('/supervisor/discrepancies'); }}
          className="fixed bottom-24 right-4 md:bottom-8 md:right-5 z-40 flex items-center gap-2 bg-fail text-white font-bold text-[13px] px-4 py-3 rounded-2xl shadow-lg"
          style={{ boxShadow: '0 4px 20px rgba(220,38,38,0.35)' }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{count} Discrepanc{count === 1 ? 'y' : 'ies'}</span>
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-2.5 h-2.5 rounded-full bg-white/80"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
