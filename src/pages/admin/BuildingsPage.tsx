import React, { useState } from 'react';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { Building } from '../../types/building';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Layers,
  DoorOpen,
} from 'lucide-react';

export const BuildingsPage: React.FC = () => {
  const { buildings, rooms, addBuilding, updateBuilding, toggleBuildingStatus } = useFacilityCare();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [confirmBuilding, setConfirmBuilding] = useState<Building | null>(null);
  const [formData, setFormData] = useState({
    name: '', code: '', floors: 3, totalRooms: 15, description: '', status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const handleOpenAdd = () => {
    setEditingBuilding(null);
    setFormData({ name: '', code: '', floors: 3, totalRooms: 12, description: '', status: 'ACTIVE' });
    setModalOpen(true);
  };

  const handleOpenEdit = (b: Building) => {
    setEditingBuilding(b);
    setFormData({ name: b.name, code: b.code, floors: b.floors, totalRooms: b.totalRooms, description: b.description || '', status: b.status });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBuilding) updateBuilding(editingBuilding.id, formData);
    else addBuilding(formData);
    setModalOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Campus Buildings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure campus structures, floor counts, and facility profiles</p>
        </div>
        <button onClick={handleOpenAdd} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm self-start sm:self-auto rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Register Building
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {buildings.map(building => {
          const buildingRoomCount = rooms.filter(r => r.buildingId === building.id).length;
          const isActive = building.status === 'ACTIVE';
          return (
            <div
              key={building.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-200 p-3 flex flex-col justify-between space-y-2 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                    {building.code}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                    isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {building.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800">{building.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                  {building.description || 'Academic instruction and administrative infrastructure.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-sky-400" /> {building.floors} Floors</span>
                  <span className="flex items-center gap-1"><DoorOpen className="w-3.5 h-3.5 text-sky-400" /> {buildingRoomCount} Rooms</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEdit(building)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors" title="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmBuilding(building)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                      isActive ? 'text-rose-400 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'
                    }`}
                    title={isActive ? 'Deactivate' : 'Activate'}
                  >
                    {isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingBuilding ? 'Edit Building' : 'Register New Building'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Building Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Science Complex" className="input-base" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Building Code</label>
              <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="e.g. SCI" className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Total Floors</label>
              <input type="number" min={1} max={15} required value={formData.floors} onChange={(e) => setFormData({ ...formData, floors: parseInt(e.target.value) || 1 })} className="input-base" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Primary use, key departments, research wings…" className="input-base" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm">{editingBuilding ? 'Save Changes' : 'Register Building'}</button>
          </div>
        </form>
      </Modal>

      {/* Confirm */}
      {confirmBuilding && (
        <ConfirmDialog
          isOpen={!!confirmBuilding}
          onClose={() => setConfirmBuilding(null)}
          onConfirm={() => toggleBuildingStatus(confirmBuilding.id)}
          title={`${confirmBuilding.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} Building`}
          message={`Are you sure you want to ${confirmBuilding.status === 'ACTIVE' ? 'deactivate' : 'activate'} ${confirmBuilding.name}?`}
          confirmLabel={confirmBuilding.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          variant={confirmBuilding.status === 'ACTIVE' ? 'danger' : 'primary'}
        />
      )}
    </div>
  );
};
