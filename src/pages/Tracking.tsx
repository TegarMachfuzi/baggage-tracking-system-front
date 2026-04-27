import React from 'react';
import { Search, MapPin, History, Plus, Filter, Clock, Map as MapIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTracking, useTrackingLocations } from '@/src/hooks/useTracking';
import { apiClient } from '@/src/api/client';
import { Table } from '@/src/components/Table';
import { Modal } from '@/src/components/Modal';
import { Badge } from '@/src/components/Badge';
import { ApiResponse, Tracking, TrackingStatus } from '@/src/types';
import { formatDate, truncateUUID, cn } from '@/src/utils';

export function TrackingPage() {
  const { createCheckpoint } = useTracking();
  const { data: defaultLocations } = useTrackingLocations();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [inputValue, setInputValue] = React.useState('');
  const [searchValue, setSearchValue] = React.useState('');
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = React.useState(false);

  // Detect if input looks like a UUID or a barcode
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchValue);

  const baggageHistoryQuery = useQuery({
    queryKey: ['tracking-admin', searchValue],
    queryFn: async () => {
      if (!searchValue) return [];
      const endpoint = isUUID
        ? `/api/tracking/baggage/${searchValue}`
        : `/api/tracking/barcode/${searchValue}`;
      const response = await apiClient.get<ApiResponse<Tracking[]>>(endpoint);
      return response.data.data;
    },
    enabled: !!searchValue,
  });

  const [checkpointData, setCheckpointData] = React.useState({
    barcode: '',
    location: '',
    status: 'CHECKED_IN' as TrackingStatus,
    remarks: '',
  });
  const [barcodeError, setBarcodeError] = React.useState('');

  // Auto-fill location when status changes
  const handleStatusChange = (status: TrackingStatus) => {
    setCheckpointData(prev => ({
      ...prev,
      status,
      location: defaultLocations?.[status] ?? prev.location,
    }));
  };

  const filteredTracking = baggageHistoryQuery.data?.filter(t =>
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchValue(inputValue.trim());
  };

  const handleAddCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setBarcodeError('');
    try {
      const res = await apiClient.get<{ data: { id: string } }>(`/api/baggage/barcode/${checkpointData.barcode}`);
      const baggageId = res.data.data.id;
      createCheckpoint.mutate({ baggageId, location: checkpointData.location, status: checkpointData.status, remarks: checkpointData.remarks }, {
        onSuccess: () => {
          setIsCheckpointModalOpen(false);
          setCheckpointData({ barcode: '', location: defaultLocations?.['CHECKED_IN'] ?? '', status: 'CHECKED_IN', remarks: '' });
        }
      });
    } catch {
      setBarcodeError('Baggage not found for this barcode.');
    }
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
        <form onSubmit={handleSearch} className="flex flex-1 max-w-2xl gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Enter Baggage ID or Barcode..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-sm"
          >
            Search
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </form>
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
        isLoading={baggageHistoryQuery.isLoading}
        emptyMessage={searchValue ? "No tracking events found." : "Enter a Baggage ID or Barcode to view tracking history."}
      />

      {/* Checkpoint Modal */}
      <Modal
        isOpen={isCheckpointModalOpen}
        onClose={() => setIsCheckpointModalOpen(false)}
        title="Add Tracking Checkpoint"
      >
        <form onSubmit={handleAddCheckpoint} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Barcode</label>
            <input
              type="text"
              required
              value={checkpointData.barcode}
              onChange={(e) => { setCheckpointData({ ...checkpointData, barcode: e.target.value }); setBarcodeError(''); }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              placeholder="e.g. BAG20260427OC7W1P"
            />
            {barcodeError && <p className="text-xs text-red-500 ml-1">{barcodeError}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Status</label>
            <select
              required
              value={checkpointData.status}
              onChange={(e) => handleStatusChange(e.target.value as TrackingStatus)}
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
