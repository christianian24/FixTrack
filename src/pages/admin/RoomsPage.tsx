import React, { useState } from 'react';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { Room, RoomType } from '../../types/room';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  DoorOpen,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const RoomsPage: React.FC = () => {
  const { rooms, buildings, addRoom, updateRoom, toggleRoomStatus } = useFacilityCare();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [confirmRoom, setConfirmRoom] = useState<Room | null>(null);

  const [formData, setFormData] = useState({
    buildingId: buildings[0]?.id || '',
    name: '',
    code: '',
    floor: 1,
    roomType: 'Classroom' as RoomType,
    capacity: 40,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const filteredRooms = rooms.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.buildingName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBuilding = selectedBuilding === 'ALL' || r.buildingId === selectedBuilding;

    return matchesSearch && matchesBuilding;
  });

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      buildingId: buildings[0]?.id || '',
      name: '',
      code: '',
      floor: 1,
      roomType: 'Classroom',
      capacity: 40,
      status: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (r: Room) => {
    setEditingRoom(r);
    setFormData({
      buildingId: r.buildingId,
      name: r.name,
      code: r.code,
      floor: r.floor,
      roomType: r.roomType,
      capacity: r.capacity || 30,
      status: r.status
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBld = buildings.find(b => b.id === formData.buildingId);
    const buildingName = targetBld?.name || 'Campus Building';

    if (editingRoom) {
      updateRoom(editingRoom.id, {
        ...formData,
        buildingName
      });
    } else {
      addRoom({
        ...formData,
        buildingName
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-sky-600" /> Campus Rooms & Facilities
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Classrooms, laboratories, auditoriums, and facilities inventory
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Register Room
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search room name, code, or building..."
            className="input-base pl-9 text-sm"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="select-base text-sm sm:w-64"
          >
            <option value="ALL">All Buildings ({rooms.length} total)</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Room Code</th>
                <th className="py-3 px-4">Room Name</th>
                <th className="py-3 px-4">Building</th>
                <th className="py-3 px-4">Floor</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                    No rooms found matching your search.
                  </td>
                </tr>
              ) : (
                filteredRooms.map(room => (
                  <tr key={room.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        {room.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-800 font-medium">
                      {room.name}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {room.buildingName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-xs">
                      Floor {room.floor}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                        {room.roomType}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-xs">
                      {room.capacity ? `${room.capacity} seats` : '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        room.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${room.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {room.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(room)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="Edit Room"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmRoom(room)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                            room.status === 'ACTIVE'
                              ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={room.status === 'ACTIVE' ? 'Deactivate Room' : 'Activate Room'}
                        >
                          {room.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRoom ? 'Edit Room Record' : 'Register New Campus Room'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Associated Building
            </label>
            <select
              value={formData.buildingId}
              onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
              className="select-base text-sm"
            >
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Room Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Physics Lab 102"
                className="input-base text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Room Code
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SCI-102"
                className="input-base text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Floor
              </label>
              <input
                type="number"
                min={1}
                max={15}
                required
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                className="input-base text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Room Type
              </label>
              <select
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value as RoomType })}
                className="select-base text-sm"
              >
                <option value="Classroom">Classroom</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Faculty Office">Faculty Office</option>
                <option value="Comfort Room">Comfort Room</option>
                <option value="Hallway/Corridor">Hallway/Corridor</option>
                <option value="Library">Library</option>
                <option value="Gymnasium/Sports">Gymnasium</option>
                <option value="Cafeteria">Cafeteria</option>
                <option value="Utility Room">Utility Room</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Capacity
              </label>
              <input
                type="number"
                min={0}
                max={500}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                className="input-base text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-sm"
            >
              {editingRoom ? 'Save Changes' : 'Register Room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      {confirmRoom && (
        <ConfirmDialog
          isOpen={!!confirmRoom}
          onClose={() => setConfirmRoom(null)}
          onConfirm={() => toggleRoomStatus(confirmRoom.id)}
          title={`${confirmRoom.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} Room`}
          message={`Are you sure you want to ${
            confirmRoom.status === 'ACTIVE' ? 'deactivate' : 'activate'
          } ${confirmRoom.name}?`}
          confirmLabel={confirmRoom.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          variant={confirmRoom.status === 'ACTIVE' ? 'danger' : 'primary'}
        />
      )}
    </div>
  );
};
