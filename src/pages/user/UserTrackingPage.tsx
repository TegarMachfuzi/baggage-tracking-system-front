import React from 'react';
import { Search, MapPin, Clock, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/api/client';
import { ApiResponse, Tracking, Baggage } from '@/src/types';
import { Badge } from '@/src/components/Badge';
import { Spinner } from '@/src/components/Spinner';
import { formatDate } from '@/src/utils';

export function UserTrackingPage() {
  const [barcode, setBarcode] = React.useState('');
  const [searchBarcode, setSearchBarcode] = React.useState('');

  const baggageQuery = useQuery({
    queryKey: ['user-baggage-barcode', searchBarcode],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Baggage>>(`/api/baggage/barcode/${searchBarcode}`);
      return res.data.data;
    },
    enabled: !!searchBarcode,
  });

  const trackingQuery = useQuery({
    queryKey: ['user-tracking-barcode', searchBarcode],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Tracking[]>>(`/api/tracking/barcode/${searchBarcode}`);
      return res.data.data;
    },
    enabled: !!searchBarcode,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchBarcode(barcode.trim());
  };

  const baggage = baggageQuery.data;
  const history = trackingQuery.data ?? [];
  const isLoading = baggageQuery.isLoading || trackingQuery.isLoading;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Track Your Baggage</h1>
        <p className="text-slate-500 mt-1">Enter your baggage barcode to see the current status and history.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Enter barcode (e.g. BG-20240001)"
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!barcode.trim()}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-sm"
        >
          Search
        </button>
      </form>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size={32} />
        </div>
      )}

      {!isLoading && searchBarcode && baggageQuery.isError && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Package size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No baggage found for barcode <span className="font-mono font-bold text-slate-700">"{searchBarcode}"</span></p>
        </div>
      )}

      {!isLoading && baggage && (
        <div className="space-y-4">
          {/* Baggage Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Barcode</p>
                <p className="font-mono font-bold text-slate-900 text-lg">{baggage.barcode}</p>
                <p className="text-sm text-slate-500 mt-1">{baggage.origin} → {baggage.destination} · Flight {baggage.flightNumber}</p>
              </div>
              <Badge status={baggage.status} />
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-blue-500" />
              Tracking History ({history.length})
            </h3>

            {history.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No tracking events yet.</p>
            ) : (
              <div className="space-y-0">
                {history.map((event, idx) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${idx === 0 ? 'bg-blue-500' : 'bg-slate-300'}`} />
                      {idx < history.length - 1 && <div className="w-0.5 bg-slate-200 flex-1 my-1" />}
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge status={event.status} />
                        <span className="text-xs text-slate-400">{formatDate(event.timestamp)}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 mt-1 flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        {event.location}
                      </p>
                      {event.remarks && (
                        <p className="text-xs text-slate-400 mt-0.5">{event.remarks}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
