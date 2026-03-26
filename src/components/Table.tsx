import React from 'react';
import { Copy, Check } from 'lucide-react';
import { truncateUUID, cn } from '@/src/utils';
import { toast } from 'sonner';

interface TableProps<T> {
  columns: {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
  }[];
  data: T[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends { id: string }>({ 
  columns, 
  data, 
  onRowClick, 
  isLoading,
  emptyMessage = "No data found"
}: TableProps<T>) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white rounded-xl border border-slate-200">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-bottom border-slate-200">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={cn(
                  "px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr 
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "border-bottom border-slate-100 hover:bg-slate-50 transition-colors group",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((col, idx) => (
                <td key={idx} className={cn("px-6 py-4 text-sm text-slate-700", col.className)}>
                  {typeof col.accessor === 'function' ? (
                    col.accessor(item)
                  ) : (
                    <div className="flex items-center gap-2">
                      {String(item[col.accessor])}
                      {col.accessor === 'id' && (
                        <button
                          onClick={(e) => handleCopy(e, item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 transition-all text-slate-400"
                        >
                          {copiedId === item.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      )}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
