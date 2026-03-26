import React from 'react';
import { Plus, Search, User, Mail, Phone, Plane, Trash2, Edit2, ChevronRight, Briefcase } from 'lucide-react';
import { usePassengers } from '@/src/hooks/usePassengers';
import { Table } from '@/src/components/Table';
import { Modal } from '@/src/components/Modal';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { Passenger } from '@/src/types';
import { useBaggage } from '@/src/hooks/useBaggage';
import { Badge } from '@/src/components/Badge';

export function Passengers() {
  const { passengersQuery, createPassenger, updatePassenger, deletePassenger } = usePassengers();
  const { baggageQuery } = useBaggage();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  
  const [selectedPassenger, setSelectedPassenger] = React.useState<Passenger | null>(null);
  const [formData, setFormData] = React.useState<Omit<Passenger, 'id'>>({
    name: '',
    email: '',
    phone: '',
    bookingRef: '',
    flightInfo: '',
  });

  const filteredPassengers = passengersQuery.data?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createPassenger.mutate(formData, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setFormData({ name: '', email: '', phone: '', bookingRef: '', flightInfo: '' });
      }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPassenger) {
      updatePassenger.mutate({ id: selectedPassenger.id, data: formData }, {
        onSuccess: () => setIsEditModalOpen(false)
      });
    }
  };

  const handleDelete = () => {
    if (selectedPassenger) {
      deletePassenger.mutate(selectedPassenger.id);
    }
  };

  const openEdit = (e: React.MouseEvent, p: Passenger) => {
    e.stopPropagation();
    setSelectedPassenger(p);
    setFormData({ ...p });
    setIsEditModalOpen(true);
  };

  const openDelete = (e: React.MouseEvent, p: Passenger) => {
    e.stopPropagation();
    setSelectedPassenger(p);
    setIsDeleteConfirmOpen(true);
  };

  const openDetail = (p: Passenger) => {
    setSelectedPassenger(p);
    setIsDetailModalOpen(true);
  };

  const passengerBaggage = baggageQuery.data?.filter(b => b.passengerId === selectedPassenger?.id) || [];

  const columns: { header: string; accessor: keyof Passenger | ((p: Passenger) => React.ReactNode) }[] = [
    { 
      header: 'Name', 
      accessor: (p: Passenger) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 font-bold text-xs">
            {p.name.charAt(0)}
          </div>
          <span className="font-bold text-slate-900">{p.name}</span>
        </div>
      )
    },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { 
      header: 'Booking Ref', 
      accessor: (p: Passenger) => (
        <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">
          {p.bookingRef}
        </span>
      )
    },
    { header: 'Flight Info', accessor: 'flightInfo' },
    { 
      header: 'Actions', 
      accessor: (p: Passenger) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => openEdit(e, p)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={(e) => openDelete(e, p)}
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
            placeholder="Search passengers by name or email..."
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
          Add Passenger
        </button>
      </div>

      <Table 
        columns={columns} 
        data={filteredPassengers} 
        isLoading={passengersQuery.isLoading}
        onRowClick={openDetail}
        emptyMessage="No passengers found matching your search."
      />

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isCreateModalOpen || isEditModalOpen} 
        onClose={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
        title={isCreateModalOpen ? "Add New Passenger" : "Edit Passenger"}
      >
        <form onSubmit={isCreateModalOpen ? handleCreate : handleUpdate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="+123456789"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Booking Ref</label>
              <input
                type="text"
                required
                value={formData.bookingRef}
                onChange={(e) => setFormData({ ...formData, bookingRef: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                placeholder="ABC123"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Flight Info</label>
              <input
                type="text"
                required
                value={formData.flightInfo}
                onChange={(e) => setFormData({ ...formData, flightInfo: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="GA123"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createPassenger.isPending || updatePassenger.isPending}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70 mt-4"
          >
            {isCreateModalOpen ? "Create Passenger" : "Save Changes"}
          </button>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Passenger Details"
        className="max-w-2xl"
      >
        {selectedPassenger && (
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/20">
                {selectedPassenger.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{selectedPassenger.name}</h3>
                <p className="text-slate-500 flex items-center gap-2 mt-1">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-600">
                    {selectedPassenger.bookingRef}
                  </span>
                  • {selectedPassenger.flightInfo}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  {selectedPassenger.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  {selectedPassenger.phone}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase size={18} className="text-blue-500" />
                Linked Baggage ({passengerBaggage.length})
              </h4>
              <div className="space-y-3">
                {passengerBaggage.length > 0 ? (
                  passengerBaggage.map(bag => (
                    <div key={bag.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                          <Plane size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{bag.barcode}</p>
                          <p className="text-xs text-slate-500">{bag.origin} → {bag.destination}</p>
                        </div>
                      </div>
                      <Badge status={bag.status} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400">No baggage found for this passenger</p>
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
        onConfirm={handleDelete}
        title="Delete Passenger"
        message={`Are you sure you want to delete ${selectedPassenger?.name}? This action cannot be undone and will remove all associated records.`}
      />
    </div>
  );
}
