import React from 'react';
import type { WorkStatus } from '@/types';

interface BadgeProps {
  status: WorkStatus;
}

const statusStyles: Record<WorkStatus, string> = {
  draft: 'bg-amber-100 text-amber-800 border-amber-200',
  submitted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const statusLabels: Record<WorkStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
};

export function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export default Badge;