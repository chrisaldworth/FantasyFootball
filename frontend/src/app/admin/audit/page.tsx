'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import FilterBar from '@/components/admin/FilterBar';
import { FormSelect, FormInput } from '@/components/admin/FormInput';
import StatusBadge from '@/components/admin/StatusBadge';

interface AuditLog {
  id: number;
  admin_user_id: number;
  admin_username: string;
  action: string;
  resource_type: string;
  resource_id: number | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface AuditLogsResponse {
  items: AuditLog[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(50);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('all');
  const [adminUserId, setAdminUserId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [exporting, setExporting] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      
      if (actionFilter) params.append('action', actionFilter);
      if (resourceTypeFilter !== 'all') params.append('resource_type', resourceTypeFilter);
      if (adminUserId) params.append('admin_user_id', adminUserId);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/audit?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: AuditLogsResponse = await response.json();
        setLogs(data.items);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setActionFilter('');
    setResourceTypeFilter('all');
    setAdminUserId('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ format });
      
      if (actionFilter) params.append('action', actionFilter);
      if (resourceTypeFilter !== 'all') params.append('resource_type', resourceTypeFilter);
      if (adminUserId) params.append('admin_user_id', adminUserId);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/audit/export?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } else {
        alert('Failed to export audit logs');
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      alert('Failed to export audit logs');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, resourceTypeFilter, adminUserId, dateFrom, dateTo]);

  const columns = [
    {
      key: 'created_at' as keyof AuditLog,
      label: 'Time',
      sortable: false,
      render: (value: string) => (
        <span className="text-[#999999] text-sm">
          {new Date(value).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'admin_username' as keyof AuditLog,
      label: 'Admin',
      sortable: false,
      render: (value: string, row: AuditLog) => (
        <div>
          <div className="text-white">{value}</div>
          <div className="text-xs text-[#666666]">ID: {row.admin_user_id}</div>
        </div>
      ),
    },
    {
      key: 'action' as keyof AuditLog,
      label: 'Action',
      sortable: false,
      render: (value: string) => (
        <span className="font-mono text-sm text-[#10b981]">{value}</span>
      ),
    },
    {
      key: 'resource_type' as keyof AuditLog,
      label: 'Resource',
      sortable: false,
      render: (value: string, row: AuditLog) => (
        <div>
          <StatusBadge 
            status={value === 'user' ? 'active' : value === 'league' ? 'premium' : 'inactive'} 
            label={value} 
          />
          {row.resource_id && (
            <div className="text-xs text-[#666666] mt-1">ID: {row.resource_id}</div>
          )}
        </div>
      ),
    },
    {
      key: 'details' as keyof AuditLog,
      label: 'Details',
      sortable: false,
      render: (value: any) => (
        value ? (
          <div className="max-w-xs">
            <pre className="text-xs text-[#999999] overflow-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        ) : (
          <span className="text-[#666666]">-</span>
        )
      ),
    },
    {
      key: 'ip_address' as keyof AuditLog,
      label: 'IP',
      sortable: false,
      render: (value: string | null) => (
        <span className="text-[#999999] text-sm font-mono">{value || '-'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Audit Log</h1>
          <p className="text-[#999999]">Track all admin actions and changes</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] disabled:bg-[#555555] disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#555555] disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            {exporting ? 'Exporting...' : 'Export JSON'}
          </button>
        </div>
      </div>

      <FilterBar onClear={clearFilters}>
        <FormInput
          label="Action"
          type="text"
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by action"
          className="min-w-[200px]"
        />
        <FormSelect
          label="Resource Type"
          value={resourceTypeFilter}
          onChange={(e) => {
            setResourceTypeFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'user', label: 'User' },
            { value: 'league', label: 'League' },
            { value: 'weekly_pick', label: 'Weekly Pick' },
          ]}
          className="min-w-[150px]"
        />
        <FormInput
          label="Admin User ID"
          type="number"
          value={adminUserId}
          onChange={(e) => {
            setAdminUserId(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by admin"
          className="min-w-[120px]"
        />
        <FormInput
          label="Date From"
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
          className="min-w-[150px]"
        />
        <FormInput
          label="Date To"
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
          className="min-w-[150px]"
        />
      </FilterBar>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : (
        <DataTable
          data={logs}
          columns={columns}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
}


