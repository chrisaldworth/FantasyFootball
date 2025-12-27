'use client';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'premium' | 'admin' | 'super_admin' | string;
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'premium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'admin':
      case 'super_admin':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-[#2a2a2a] text-[#999999] border-[#2a2a2a]';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}>
      {label || status}
    </span>
  );
}

