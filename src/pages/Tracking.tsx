import React from 'react';
import { Search, MapPin, History, Plus, Filter, Clock, Map as MapIcon } from 'lucide-react';
import { useTracking } from '@/src/hooks/useTracking';
import { Table } from '@/src/components/Table';
import { Modal } from '@/src/components/Modal';
import { Badge } from '@/src/components/Badge';
import { Tracking, TrackingStatus } from '@/src/types';
import { formatDate, truncateUUID, cn } from '@/src/utils';

export function TrackingPage() {
  const { allTrackingQuery, createCheckpoint } = useTracking();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = React.useState(false);
  
  const [checkpointData, setCheckpointData] = React.useState({
    baggageId: '',
    location: '',
    status: 'CHECKED_IN' as TrackingStatus,
    remarks: '',
  });

  const filteredTracking = allTrackingQuery.data?.filter(t => 
    t.baggageId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    createCheckpoint.mutate(checkpointData, {
      onSuccess: () => {
        setIsCheckpointModalOpen(false);
        setCheckpointData({ baggageId: '', location: '', status: 'CHECKED_IN', remarks: '' });
      }
    });
  };

  const columns: { header: string; accessor: keyof Tracking | ((t: Tracking) => React.ReactNode) }[] = [
    { 
      header: 'Baggage ID', 
      accessor: (t: Tracking) => (
        <span className="font-mono font-bold text-slate-600">{truncateUUID(t.baggageId)}</span>
      )
    },
    { 
      header: 'Location', 
      accessor: (t: Tracking) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-blue-500" />
          <span className="font-semibold text-slate-900">{t.location}</span>
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: (t: Tracking) => <Badge status={t.status} />
    },
    { 
      header: 'Timestamp', 
      accessor: (t: Tracking) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={14} />
          {formatDate(t.timestamp)}
        </div>
      )
    },
    { 
      header: 'Remarks', 
      accessor: (t: Tracking) => (
        <span className="text-xs text-slate-500 italic">{t.remarks || '-'}</span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by Baggage ID or Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
        <button
          onClick={() => setIsCheckpointModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
        >
          <Plus size={20} />
          Add Checkpoint
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
            <MapIcon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Live Tracking Feed</h3>
            <p className="text-sm text-slate-500">Real-time updates from all checkpoints across the network.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 border border-slate-200">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <Table 
        columns={columns} 
        data={filteredTracking} 
        isLoading={allTrackingQuery.isLoading}
        emptyMessage="No tracking events recorded yet."
      />

      {/* Checkpoint Modal */}
      <Modal
        isOpen={isCheckpointModalOpen}
        onClose={() => setIsCheckpointModalOpen(false)}
        title="Add Tracking Checkpoint"
      >
        <form onSubmit={handleAddCheckpoint} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Baggage ID (UUID)</label>
            <input
              type="text"
              required
              value={checkpointData.baggageId}
              onChange={(e) => setCheckpointData({ ...checkpointData, baggageId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              placeholder="Enter full Baggage UUID"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Location</label>
            <input
              type="text"
              required
              value={checkpointData.location}
              onChange={(e) => setCheckpointData({ ...checkpointData, location: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="e.g. Terminal 3, Gate 12"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Status</label>
            <select
              required
              value={checkpointData.status}
              onChange={(e) => setCheckpointData({ ...checkpointData, status: e.target.value as TrackingStatus })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="CHECKED_IN">CHECKED_IN</option>
              <option value="SECURITY_CHECK">SECURITY_CHECK</option>
              <option value="LOADING_TO_AIRCRAFT">LOADING_TO_AIRCRAFT</option>
              <option value="IN_TRANSIT">IN_TRANSIT</option>
              <option value="ARRIVED">ARRIVED</option>
              <option value="CUSTOMS_CHECK">CUSTOMS_CHECK</option>
              <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Remarks</label>
            <textarea
              value={checkpointData.remarks}
              onChange={(e) => setCheckpointData({ ...checkpointData, remarks: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[100px]"
              placeholder="Optional remarks..."
            />
          </div>
          <button
            type="submit"
            disabled={createCheckpoint.isPending}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-70 mt-4"
          >
            Add Checkpoint
          </button>
        </form>
      </Modal>
    </div>
  );
}
