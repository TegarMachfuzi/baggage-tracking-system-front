import React from 'react';
import { 
  Plus, 
  Search, 
  AlertCircle, 
  Trash2, 
  Edit2, 
  Clock, 
  CheckCircle2,
  XCircle,
  HelpCircle,
  Filter
} from 'lucide-react';
import { useClaims } from '@/src/hooks/useClaims';
import { useBaggage } from '@/src/hooks/useBaggage';
import { usePassengers } from '@/src/hooks/usePassengers';
import { Table } from '@/src/components/Table';
import { Modal } from '@/src/components/Modal';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { Badge } from '@/src/components/Badge';
import { Claim, ClaimStatus, ClaimType } from '@/src/types';
import { formatDate, truncateUUID, cn } from '@/src/utils';

const CLAIM_STATUSES: ClaimStatus[] = ['SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
const CLAIM_TYPES: ClaimType[] = ['LOST', 'DAMAGED', 'DELAYED'];

export function Claims() {
  const { claimsQuery, createClaim, updateClaimStatus, deleteClaim } = useClaims();
  const { baggageQuery } = useBaggage();
  const { passengersQuery } = usePassengers();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  
  const [selectedClaim, setSelectedClaim] = React.useState<Claim | null>(null);
  const [formData, setFormData] = React.useState({
    baggageId: '',
    passengerId: '',
    claimType: 'LOST' as ClaimType,
    description: '',
  });

  const filteredClaims = claimsQuery.data?.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createClaim.mutate(formData, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setFormData({ baggageId: '', passengerId: '', claimType: 'LOST', description: '' });
      }
    });
  };

  const handleStatusUpdate = (status: ClaimStatus) => {
    if (selectedClaim) {
      updateClaimStatus.mutate({ id: selectedClaim.id, status }, {
        onSuccess: () => setIsStatusModalOpen(false)
      });
    }
  };

  const handleDelete = () => {
    if (selectedClaim) {
      deleteClaim.mutate(selectedClaim.id);
    }
  };

  const openDetail = (c: Claim) => {
    setSelectedClaim(c);
    setIsDetailModalOpen(true);
  };

  const openStatusUpdate = (e: React.MouseEvent, c: Claim) => {
    e.stopPropagation();
    setSelectedClaim(c);
    setIsStatusModalOpen(true);
  };

  const columns: { header: string; accessor: keyof Claim | ((c: Claim) => React.ReactNode) }[] = [
    { 
      header: 'Claim ID', 
      accessor: (c: Claim) => (
        <span className="font-mono font-bold text-slate-600">{truncateUUID(c.id)}</span>
      )
    },
    { 
      header: 'Baggage', 
      accessor: (c: Claim) => {
        const b = baggageQuery.data?.find(b => b.id === c.baggageId);
        return b ? b.barcode : truncateUUID(c.baggageId);
      }
    },
    { 
      header: 'Passenger', 
      accessor: (c: Claim) => {
        const p = passengersQuery.data?.find(p => p.id === c.passengerId);
        return p ? p.name : truncateUUID(c.passengerId);
      }
    },
    { 
      header: 'Type', 
      accessor: (c: Claim) => <Badge status={c.claimType} />
    },
    { 
      header: 'Status', 
      accessor: (c: Claim) => (
        <button 
          onClick={(e) => openStatusUpdate(e, c)}
          className="hover:opacity-80 transition-opacity"
        >
          <Badge status={c.status} />
        </button>
      )
    },
    { 
      header: 'Created At', 
      accessor: (c: Claim) => (
        <span className="text-xs text-slate-500">{formatDate(c.createdAt)}</span>
      )
    },
    { 
      header: 'Actions', 
      accessor: (c: Claim) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedClaim(c); setIsDeleteConfirmOpen(true); }}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    },
  ];

  const getStatusIcon = (status: ClaimStatus) => {
    switch (status) {
      case 'SUBMITTED': return <Clock className="text-slate-400" size={20} />;
      case 'IN_PROGRESS': return <HelpCircle className="text-blue-400" size={20} />;
      case 'RESOLVED': return <CheckCircle2 className="text-emerald-400" size={20} />;
      case 'REJECTED': return <XCircle className="text-rose-400" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search claims by ID or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all"
        >
          <Plus size={20} />
          File New Claim
        </button>
      </div>

      <Table 
        columns={columns} 
        data={filteredClaims} 
        isLoading={claimsQuery.isLoading}
        onRowClick={openDetail}
        emptyMessage="No claims found."
      />

      {/* Create Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="File New Claim"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Baggage</label>
            <select
              required
              value={formData.baggageId}
              onChange={(e) => {
                const bag = baggageQuery.data?.find(b => b.id === e.target.value);
                setFormData({ ...formData, baggageId: e.target.value, passengerId: bag?.passengerId || '' });
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">Select Baggage</option>
              {baggageQuery.data?.map(b => (
                <option key={b.id} value={b.id}>{b.barcode} ({b.flightNumber})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Claim Type</label>
            <div className="grid grid-cols-3 gap-2">
              {CLAIM_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, claimType: type })}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-bold transition-all border",
                    formData.claimType === type 
                      ? "bg-blue-50 border-blue-200 text-blue-600" 
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px]"
              placeholder="Describe the issue in detail..."
            />
          </div>
          <button
            type="submit"
            disabled={createClaim.isPending}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-500/20 transition-all disabled:opacity-70 mt-4"
          >
            Submit Claim
          </button>
        </form>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Claim Status"
        className="max-w-sm"
      >
        <div className="grid grid-cols-1 gap-2">
          {CLAIM_STATUSES.map(status => (
            <button
              key={status}
              onClick={() => handleStatusUpdate(status)}
              className={cn(
                "w-full px-4 py-3 rounded-xl text-left font-semibold transition-all border",
                selectedClaim?.status === status 
                  ? "bg-blue-50 border-blue-200 text-blue-600" 
                  : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status)}
                  {status.replace(/_/g, ' ')}
                </div>
                <Badge status={status} className="ml-2" />
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Claim Details"
        className="max-w-xl"
      >
        {selectedClaim && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Claim #{truncateUUID(selectedClaim.id)}</h3>
                <p className="text-slate-500 flex items-center gap-2 mt-1">
                  Filed on {formatDate(selectedClaim.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge status={selectedClaim.claimType} className="text-sm px-4 py-1" />
                <Badge status={selectedClaim.status} className="text-sm px-4 py-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baggage ID</p>
                <p className="text-sm font-mono font-bold text-slate-700">{selectedClaim.baggageId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passenger ID</p>
                <p className="text-sm font-mono font-bold text-slate-700">{selectedClaim.passengerId}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Description</h4>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-600 text-sm leading-relaxed">
                {selectedClaim.description}
              </div>
            </div>

            {selectedClaim.resolvedAt && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                <CheckCircle2 size={20} />
                <div>
                  <p className="text-sm font-bold">Resolved</p>
                  <p className="text-xs opacity-80">{formatDate(selectedClaim.resolvedAt)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Claim"
        message="Are you sure you want to delete this claim? This action is permanent and will remove the record from the system."
      />
    </div>
  );
}
