'use client';

import { ReactNode } from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    column: keyof T;
    direction: 'asc' | 'desc';
    onSort: (column: keyof T, direction: 'asc' | 'desc') => void;
  };
  actions?: (row: T) => ReactNode;
}

export default function DataTable<T extends { id: number | string }>({
  data,
  columns,
  pagination,
  sorting,
  actions,
}: DataTableProps<T>) {
  const handleSort = (column: keyof T) => {
    if (!sorting) return;
    
    const newDirection = 
      sorting.column === column && sorting.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    sorting.onSort(column, newDirection);
  };

  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#2a2a2a]">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-semibold text-[#999999] uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:text-white' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sorting && sorting.column === column.key && (
                      <span className="text-white">
                        {sorting.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-left text-xs font-semibold text-[#999999] uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-[#999999]">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={String(row.id)} className="hover:bg-[#2a2a2a] transition">
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] ?? '')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && pagination.total > 0 && (
        <div className="px-6 py-4 bg-[#2a2a2a] flex items-center justify-between">
          <div className="text-sm text-[#999999]">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 text-sm bg-[#1a1a1a] hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
            >
              Previous
            </button>
            <span className="text-sm text-[#999999]">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              className="px-4 py-2 text-sm bg-[#1a1a1a] hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

