import React from 'react';
import { 
  Plus, 
  Search, 
  Briefcase, 
  Plane, 
  Trash2, 
  Edit2, 
  History,
  ArrowRight,
  Filter,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { useBaggage } from '@/src/hooks/useBaggage';
import { usePassengers } from '@/src/hooks/usePassengers';
import { useTracking, useBaggageHistory, useTrackingLocations } from '@/src/hooks/useTracking';
import { Table } from '@/src/components/Table';
import { Modal } from '@/src/components/Modal';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { Badge } from '@/src/components/Badge';
import { Baggage, BaggageStatus, TrackingStatus } from '@/src/types';
import { formatDate, truncateUUID, cn } from '@/src/utils';

const BAGGAGE_STATUSES: BaggageStatus[] = [
  'CHECKED_IN',
  'IN_TRANSIT',
  'LOADING_TO_AIRCRAFT',
  'ARRIVED',
  'LOST',
  'DAMAGED'
];

export function BaggagePage() {
  const { baggageQuery, createBaggage, updateBaggage, updateStatus, deleteBaggage } = useBaggage();
  const { passengersQuery } = usePassengers();
  const { createCheckpoint } = useTracking();
  const { data: defaultLocations } = useTrackingLocations();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = React.useState(false);
  
  const [selectedBaggage, setSelectedBaggage] = React.useState<Baggage | null>(null);
  const [formData, setFormData] = React.useState({
    passengerId: '',
    flightNumber: '',
    origin: '',
    destination: '',
  });

  const [checkpointData, setCheckpointData] = React.useState({
    location: '',
    status: 'CHECKED_IN' as TrackingStatus,
    remarks: '',
  });

  // Auto-fill location when status changes
  const handleCheckpointStatusChange = (status: TrackingStatus) => {
    setCheckpointData(prev => ({
      ...prev,
      status,
      location: defaultLocations?.[status] ?? prev.location,
    }));
  };

  const { data: history, isLoading: isLoadingHistory } = useBaggageHistory(selectedBaggage?.id || '');

  const filteredBaggage = baggageQuery.data?.filter(b => 
    b.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createBaggage.mutate(formData as any, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setFormData({ passengerId: '', flightNumber: '', origin: '', destination: '' });
      }
    });
  };

  const handleStatusUpdate = (status: BaggageStatus) => {
    if (selectedBaggage) {
      updateStatus.mutate({ id: selectedBaggage.id, status }, {
        onSuccess: () => setIsStatusModalOpen(false)
      });
    }
  };

  const handleAddCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBaggage) {
      createCheckpoint.mutate({
        baggageId: selectedBaggage.id,
        ...checkpointData
      }, {
        onSuccess: () => {
          setIsCheckpointModalOpen(false);
          setCheckpointData({ location: defaultLocations?.['CHECKED_IN'] ?? '', status: 'CHECKED_IN', remarks: '' });
        }
      });
    }
  };

  const openDetail = (b: Baggage) => {
    setSelectedBaggage(b);
    setIsDetailModalOpen(true);
  };

  const openStatusUpdate = (e: React.MouseEvent, b: Baggage) => {
    e.stopPropagation();
    setSelectedBaggage(b);
    setIsStatusModalOpen(true);
  };

  const columns: { header: string; accessor: keyof Baggage | ((b: Baggage) => React.ReactNode) }[] = [
    { 
      header: 'Barcode', 
      accessor: (b: Baggage) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-900">{b.barcode}</span>
        </div>
      )
    },
    { 
      header: 'Passenger', 
      accessor: (b: Baggage) => {
        const p = passengersQuery.data?.find(p => p.id === b.passengerId);
        return p ? p.name : truncateUUID(b.passengerId);
      }
    },
    { 
      header: 'Flight', 
      accessor: (b: Baggage) => (
        <span className="font-bold text-blue-600">{b.flightNumber}</span>
      )
    },
    { 
      header: 'Route', 
      accessor: (b: Baggage) => (
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          {b.origin} <ArrowRight size={14} className="text-slate-400" /> {b.destination}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: (b: Baggage) => (
        <button 
          onClick={(e) => openStatusUpdate(e, b)}
          className="hover:opacity-80 transition-opacity"
        >
          <Badge status={b.status} />
        </button>
      )
    },
    { 
      header: 'Last Updated', 
      accessor: (b: Baggage) => (
        <span className="text-xs text-slate-500">{formatDate(b.lastUpdated)}</span>
      )
    },
    { 
      header: 'Actions', 
      accessor: (b: Baggage) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedBaggage(b); setIsCheckpointModalOpen(true); }}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-500 transition-colors"
            title="Add Checkpoint"
          >
            <History size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedBaggage(b); setIsDeleteConfirmOpen(true); }}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
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
            placeholder="Search by barcode or flight number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus size={20} />
          Register Baggage
        </button>
      </div>

      <Table 
        columns={columns} 
        data={filteredBaggage} 
        isLoading={baggageQuery.isLoading}
        onRowClick={openDetail}
        emptyMessage="No baggage records found."
      />

      {/* Create Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="Register New Baggage"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Passenger</label>
            <select
              required
              value={formData.passengerId}
              onChange={(e) => setFormData({ ...formData, passengerId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">Select Passenger</option>
              {passengersQuery.data?.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.passportNumber})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Flight Number</label>
            <input
              type="text"
              required
              value={formData.flightNumber}
              onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="GA123"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Origin</label>
              <input
                type="text"
                required
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="CGK"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Destination</label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="DPS"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createBaggage.isPending}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70 mt-4"
          >
            Register Baggage
          </button>
        </form>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Baggage Status"
        className="max-w-sm"
      >
        <div className="grid grid-cols-1 gap-2">
          {BAGGAGE_STATUSES.map(status => (
            <button
              key={status}
              onClick={() => handleStatusUpdate(status)}
              className={cn(
                "w-full px-4 py-3 rounded-xl text-left font-semibold transition-all border",
                selectedBaggage?.status === status 
                  ? "bg-blue-50 border-blue-200 text-blue-600" 
                  : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
              )}
            >
              <div className="flex items-center justify-between">
                {status.replace(/_/g, ' ')}
                <Badge status={status} className="ml-2" />
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Checkpoint Modal */}
      <Modal
        isOpen={isCheckpointModalOpen}
        onClose={() => setIsCheckpointModalOpen(false)}
        title="Add Tracking Checkpoint"
      >
        <form onSubmit={handleAddCheckpoint} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Status</label>
            <select
              required
              value={checkpointData.status}
              onChange={(e) => handleCheckpointStatusChange(e.target.value as TrackingStatus)}
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

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Baggage Tracking History"
        className="max-w-2xl"
      >
        {selectedBaggage && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{selectedBaggage.barcode}</h3>
                <p className="text-slate-500 flex items-center gap-2 mt-1">
                  {selectedBaggage.flightNumber} • {selectedBaggage.origin} → {selectedBaggage.destination}
                </p>
              </div>
              <Badge status={selectedBaggage.status} className="text-sm px-4 py-1" />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
              
              <div className="space-y-8">
                {isLoadingHistory ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : history && history.length > 0 ? (
                  history.map((track, idx) => (
                    <div key={track.id} className="relative pl-12">
                      <div className={cn(
                        "absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm z-10",
                        idx === 0 ? "bg-blue-500 ring-4 ring-blue-100" : "bg-slate-300"
                      )} />
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-slate-900">{track.location}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(track.timestamp)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge status={track.status} />
                          {track.remarks && <p className="text-xs text-slate-500 italic">"{track.remarks}"</p>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 ml-12">
                    <p className="text-sm text-slate-400">No tracking history available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => selectedBaggage && deleteBaggage.mutate(selectedBaggage.id)}
        title="Delete Baggage Record"
        message={`Are you sure you want to delete baggage ${selectedBaggage?.barcode}? This will also remove all tracking history.`}
      />
    </div>
  );
}
