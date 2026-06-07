type Listener = () => void;
const listeners = new Set<Listener>();
export const onNavStart  = (fn: Listener) => { listeners.add(fn); return () => listeners.delete(fn); };
export const triggerNav  = () => listeners.forEach(fn => fn());
