import { STATUS_CONFIG } from '../../constants/status';

/**
 * StatusBadge — reusable status pill
 * @param {{ status: string, size?: 'sm' | 'md' | 'lg' }} props
 */
const StatusBadge = ({ status, size = 'md' }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs gap-1',
        md: 'px-3 py-1 text-xs gap-1.5',
        lg: 'px-4 py-1.5 text-sm gap-2',
    }[size];

    return (
        <span className={`inline-flex items-center rounded-full font-semibold border border-current/20 shadow-sm
                          ${cfg.bg} ${cfg.text} ${sizeClasses}`}>
            {/* Dot — pulse only when status is still active */}
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />

            <span>{cfg.label}</span>
        </span>
    );
};

export default StatusBadge;

