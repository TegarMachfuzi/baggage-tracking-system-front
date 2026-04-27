import React from 'react';
import { Plus, FileText, Search, Plane, ChevronRight, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/api/client';
import { ApiResponse, Baggage, Claim, ClaimType, User } from '@/src/types';
import { Badge } from '@/src/components/Badge';
import { Modal } from '@/src/components/Modal';
import { Spinner } from '@/src/components/Spinner';
import { formatDate } from '@/src/utils';
import { toast } from 'sonner';

const CLAIM_TYPES: ClaimType[] = ['LOST', 'DAMAGED', 'DELAYED'];

type Step = 'search' | 'form';

export function UserClaimsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>('search');
  const [barcode, setBarcode] = React.useState('');
  const [searchBarcode, setSearchBarcode] = React.useState('');
  const [form, setForm] = React.useState({ claimType: 'LOST' as ClaimType, description: '' });

  const userStr = localStorage.getItem('user');
  const user: User | null = userStr ? JSON.parse(userStr) : null;
  const passengerId = user?.passengerId;

  const baggageLookup = useQuery({
    queryKey: ['claim-baggage-lookup', searchBarcode],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Baggage>>(`/api/baggage/barcode/${searchBarcode}`);
      return res.data.data;
    },
    enabled: !!searchBarcode,
  });

  const claimsQuery = useQuery({
    queryKey: ['user-claims', passengerId],
    queryFn: async () => {
      if (!passengerId) return [];
      const res = await apiClient.get<ApiResponse<Claim[]>>(`/api/claim/passenger/${passengerId}`);
      return res.data.data;
    },
    enabled: !!passengerId,
  });

  const submitClaim = useMutation({
    mutationFn: async (data: { baggageId: string; passengerId: string; claimType: ClaimType; description: string }) => {
      const res = await apiClient.post<ApiResponse<Claim>>('/api/claim', data);
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['user-claims', passengerId] });
      toast.success(res.responseMessage || 'Claim submitted successfully');
      handleCloseModal();
    },
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setStep('search');
    setBarcode('');
    setSearchBarcode('');
    setForm({ claimType: 'LOST', description: '' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchBarcode(barcode.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baggageLookup.data) return;
    submitClaim.mutate({ baggageId: baggageLookup.data.id, passengerId: passengerId ?? '', ...form });
  };

  const claims = claimsQuery.data ?? [];
  const foundBaggage = baggageLookup.data;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Claims</h1>
          <p className="text-slate-500 mt-1">Submit and track your baggage claims.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-sm"
        >
          <Plus size={18} />
          New Claim
        </button>
      </div>

      {claimsQuery.isLoading && (
        <div className="flex justify-center py-12"><Spinner size={32} /></div>
      )}

      {!claimsQuery.isLoading && claims.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <FileText size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No claims submitted yet.</p>
          <p className="text-slate-400 text-sm mt-1">Click "New Claim" to submit one.</p>
        </div>
      )}

      {!claimsQuery.isLoading && claims.length > 0 && (
        <div className="space-y-3">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge status={claim.claimType} />
                <Badge status={claim.status} />
              </div>
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{claim.description}</p>
              <p className="text-xs text-slate-400 mt-2">
                Submitted {formatDate(claim.createdAt)}
                {claim.resolvedAt && ` · Resolved ${formatDate(claim.resolvedAt)}`}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Submit New Claim">
        {/* Step 1: Search by barcode */}
        {step === 'search' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Enter your baggage barcode to find it first.</p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="e.g. BG-20240001"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!barcode.trim()}
                className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm"
              >
                Search
              </button>
            </form>

            {baggageLookup.isLoading && (
              <div className="flex justify-center py-4"><Spinner /></div>
            )}

            {baggageLookup.isError && searchBarcode && (
              <p className="text-sm text-rose-500 text-center py-2">
                No baggage found for barcode "{searchBarcode}".
              </p>
            )}

            {foundBaggage && (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono font-bold text-slate-900">{foundBaggage.barcode}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <Plane size={13} />
                      {foundBaggage.origin} → {foundBaggage.destination} · {foundBaggage.flightNumber}
                    </p>
                  </div>
                  <Badge status={foundBaggage.status} />
                </div>
                <button
                  onClick={() => setStep('form')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all text-sm"
                >
                  File a Claim for this Baggage
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Claim form */}
        {step === 'form' && foundBaggage && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setStep('search')}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
            >
              <X size={12} /> Change baggage
            </button>

            {/* Readonly baggage info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="font-mono font-bold text-slate-800 text-sm">{foundBaggage.barcode}</p>
                <p className="text-xs text-slate-500">{foundBaggage.origin} → {foundBaggage.destination}</p>
              </div>
              <Badge status={foundBaggage.status} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Claim Type</label>
              <select
                value={form.claimType}
                onChange={(e) => setForm({ ...form, claimType: e.target.value as ClaimType })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {CLAIM_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue with your baggage..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitClaim.isPending}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-70"
            >
              {submitClaim.isPending ? 'Submitting...' : 'Submit Claim'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
