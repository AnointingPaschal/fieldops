import { STATUS_CONFIG, TASK_TYPE_CONFIG } from '@/data/mockData';

interface TaskCardProps {
  task: any;
  onClick?: () => void;
  compact?: boolean;
}

export default function TaskCard({ task, onClick, compact }: TaskCardProps) {
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const type = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG.delivery;

  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer group ${compact ? 'p-4' : 'p-5'}`}
      style={{ borderLeft: `3px solid ${type.color}` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{type.icon}</span>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: type.color }}>
            {type.label}
          </span>
        </div>
        <span
          className="badge text-xs"
          style={{ background: status.bg, color: status.color }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: status.dot }} />
          {status.label}
        </span>
      </div>

      <h3 className="font-bold text-white text-base mb-1 group-hover:text-primary transition-colors">
        {task.contractor.name}
      </h3>
      {!compact && (
        <p className="text-text-secondary text-sm mb-3 truncate">{task.contractor.address}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          👥 {task.employees.map((e: any) => e.name.split(' ')[0]).join(', ')}
        </span>
        <span className="flex items-center gap-1">
          📦 {task.items.length} item{task.items.length !== 1 ? 's' : ''}
        </span>
        {!compact && (
          <span className="flex items-center gap-1">
            📅 Due {new Date(task.rentalEnd).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {!compact && task.employees.length > 0 && (
        <div className="flex items-center gap-1 mt-3">
          {task.employees.map((emp: any, i: number) => (
            <div
              key={i}
              className="w-7 h-7 rounded-lg border-2 flex items-center justify-center text-[10px] font-black"
              style={{ background: emp.color + '25', borderColor: emp.color + '60', color: emp.color }}
            >
              {emp.initials}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
