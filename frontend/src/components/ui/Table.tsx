import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-slate-200 ${className}`}>
        {children}
      </table>
    </div>
  );
}

interface TableHeadProps {
  children: React.ReactNode;
}

export function TableHead({ children }: TableHeadProps) {
  return <thead className="bg-slate-50">{children}</thead>;
}

interface TableBodyProps {
  children: React.ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="bg-white divide-y divide-slate-200">{children}</tbody>;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

export function TableRow({ children, className = '' }: TableRowProps) {
  return <tr className={`hover:bg-slate-50 transition-colors ${className}`}>{children}</tr>;
}

interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeaderCell({ children, className = '' }: TableHeaderCellProps) {
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-6 py-4 text-sm text-slate-700 ${className}`}>
      {children}
    </td>
  );
}