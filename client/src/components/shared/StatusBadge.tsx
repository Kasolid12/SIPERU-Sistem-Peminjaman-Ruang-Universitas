import type { StatusBooking } from '../../types';
import { STATUS_LABELS, STATUS_COLORS } from '../../types';

interface StatusBadgeProps {
  status: StatusBooking;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  const px = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full text-xs font-medium ${px}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span
        className="rounded-full"
        style={{ width: 6, height: 6, backgroundColor: colors.dot }}
      />
      {label}
    </span>
  );
}