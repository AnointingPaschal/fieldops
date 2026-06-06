import { STATUS_CONFIG, TASK_TYPE_CONFIG } from '@/data/mockData';
import { ChevronRight } from 'lucide-react';

interface TaskCardProps { task: any; onClick?: () => void; compact?: boolean; }

export default function TaskCard({ task, onClick, compact }: TaskCardProps) {
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const type   = TASK_TYPE_CONFIG[task.type]  || TASK_TYPE_CONFIG.delivery;

  return (
    <div onClick={onClick}
      className="bg-white border border-slate-100 rounded-2xl shadow-card hover:shadow-card-md hover:border-primary/20 transition-all cursor-pointer group overflow-hidden"
      style={{ borderLeft: `3px solid ${type.color}` }}>
      <div className={compact ? 'p-4' : 'p-5'}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">{type.icon}</span>
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: type.color }}>{type.label}</span>
          </div>
          <span className="badge text-[10px]" style={{ background: status.bg, color: status.color }}>
            <span className="w-1 h-1 rounded-full" style={{ background: status.dot }} />
            {status.label}
          </span>
        </div>
        <h3 className="font-bold text-text-primary text-[15px] group-hover:text-primary transition-colors mb-0.5">
          {task.contractor.name}
        </h3>
        {!compact && <p className="text-text-muted text-xs mb-3 truncate">{task.contractor.address}</p>}
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span>👥 {task.employees.map((e: any) => e.name.split(' ')[0]).join(', ')}</span>
          <span>📦 {task.items.length} items</span>
        </div>
      </div>
    </div>
  );
}
