import React, { useState } from 'react';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { FacilityCategory } from '../../types/category';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PriorityBadge } from '../../components/common/Badge';
import {
  FolderTree,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Tag
} from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { categories, addCategory, updateCategory, toggleCategoryStatus } = useFacilityCare();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FacilityCategory | null>(null);
  const [confirmCategory, setConfirmCategory] = useState<FacilityCategory | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconName: 'Wrench',
    defaultPriorityHint: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      iconName: 'Wrench',
      defaultPriorityHint: 'MEDIUM',
      status: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: FacilityCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description,
      iconName: cat.iconName,
      defaultPriorityHint: cat.defaultPriorityHint,
      status: cat.status
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      addCategory(formData);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-sky-600" /> Facility Categories ({categories.length})
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Standardized taxonomy for facility equipment, fixtures, and triage baselines
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const isActive = category.status === 'ACTIVE';
          return (
            <div
              key={category.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-200 p-5 flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                    <Tag className="w-4 h-4" />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                    isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {category.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-800">{category.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[32px] leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Default:</span>
                  <PriorityBadge priority={category.defaultPriorityHint} size="sm" />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(category)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmCategory(category)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                      isActive ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                    }`}
                    title={isActive ? 'Deactivate' : 'Activate'}
                  >
                    {isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Facility Category' : 'Create Facility Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Electrical or HVAC"
              className="input-base text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Fixtures, hardware, or campus systems under this classification..."
              className="textarea-base text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Default Priority Baseline
              </label>
              <select
                value={formData.defaultPriorityHint}
                onChange={(e) => setFormData({ ...formData, defaultPriorityHint: e.target.value as any })}
                className="select-base text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="select-base text-sm"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
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
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      {confirmCategory && (
        <ConfirmDialog
          isOpen={!!confirmCategory}
          onClose={() => setConfirmCategory(null)}
          onConfirm={() => {
            toggleCategoryStatus(confirmCategory.id);
            setConfirmCategory(null);
          }}
          title={`${confirmCategory.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} Category`}
          message={`Are you sure you want to ${
            confirmCategory.status === 'ACTIVE' ? 'deactivate' : 'activate'
          } category "${confirmCategory.name}"?`}
          confirmLabel={confirmCategory.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          variant={confirmCategory.status === 'ACTIVE' ? 'danger' : 'primary'}
        />
      )}
    </div>
  );
};
