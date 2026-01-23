import { Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';

export default function StatusBadge({ status, small = false }) {
  const statusConfig = {
    pending: {
      label: 'Menunggu Review',
      icon: Clock,
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    },
    under_review: {
      label: 'Sedang Direview',
      icon: Eye,
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    accepted: {
      label: 'Diterima',
      icon: CheckCircle,
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    rejected: {
      label: 'Ditolak',
      icon: XCircle,
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    sanggah: {
      label: 'Masa Sanggah',
      icon: AlertCircle,
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  if (small) {
    return (
      <span
        className={`inline-flex items-center space-x-1 ${config.bg} ${config.text} px-2 py-1 rounded-full text-xs font-semibold`}
      >
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center space-x-2 ${config.bg} ${config.text} border ${config.border} px-4 py-2 rounded-xl font-semibold`}
    >
      <Icon className="w-5 h-5" />
      <span>{config.label}</span>
    </div>
  );
}
