import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { createVendor, deleteVendor, updateVendor } from '../services/api';
import VendorFormModal from '../components/VendorFormModal';
import VendorTable from '../components/VendorTable';

export default function Vendors() {
  const { vendors, vendorsLoading, vendorsError, refreshVendors } = useAppContext();
  const { showToast } = useToast();
  const [modalMode, setModalMode] = useState(null); // null | 'add' | vendor object for edit
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleAdd = () => {
    setFormError(null);
    setModalMode('add');
  };

  const handleEdit = (vendor) => {
    setFormError(null);
    setModalMode(vendor);
  };

  const handleDelete = async (vendor) => {
    if (!window.confirm(`Delete vendor "${vendor.name}"?`)) return;
    try {
      await deleteVendor(vendor._id);
      showToast(`Vendor "${vendor.name}" deleted`, 'success');
      refreshVendors();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setFormError(null);
    const isEdit = modalMode !== 'add';
    try {
      if (isEdit) {
        await updateVendor(modalMode._id, payload);
      } else {
        await createVendor(payload);
      }
      setModalMode(null);
      showToast(`Vendor "${payload.name}" ${isEdit ? 'updated' : 'created'}`, 'success');
      refreshVendors();
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Vendor Management</h2>
          <p className="mt-1 text-sm text-slate-500">Add, edit, and monitor the vendors available for routing.</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Add Vendor
        </button>
      </div>

      {vendorsError && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{vendorsError}</p>}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        {vendorsLoading ? (
          <p className="p-6 text-center text-sm text-slate-500">Loading vendors…</p>
        ) : (
          <VendorTable vendors={vendors} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      {modalMode && (
        <VendorFormModal
          vendor={modalMode === 'add' ? null : modalMode}
          onClose={() => setModalMode(null)}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={formError}
        />
      )}
    </div>
  );
}
