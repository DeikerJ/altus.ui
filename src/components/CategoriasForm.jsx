import { useState, useEffect } from "react";
import { createCategoria, updateCategoria, deleteCategoria } from "../services/categoriaService";
import { useAuth } from "../context/AuthContext";

const CategoriasForm = ({ item, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    text: "",
    active: true
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { validateToken, getToken } = useAuth();

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        text: item.text || "",
        active: item.active ?? true
      });
    } else {
      setFormData({
        name: "",
        text: "",
        active: true
      });
    }
  }, [item]);

  useEffect(() => {
    if (!getToken()) setError("Not authorized: please log in again.");
  }, []); // eslint-disable-line

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (isSubmitting) return;
    setError("");

    if (!validateToken()) return;

    if (!formData.name.trim() || !formData.text.trim()) {
      setError("All fields are required");
      return;
    }

    if (formData.text.trim().length < 20) {
      setError("Description must be at least 20 characters");
      return;
    }

    const pattern = /^[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
    if (!pattern.test(formData.name) || !pattern.test(formData.text)) {
      setError("Fields can only contain letters, numbers, spaces, apostrophes, and hyphens");
      return;
    }

    // Quitamos la validación que impedía guardar si solo cambiabas 'active'
    if (item) {
      const sameName = (item.name || "").trim() === formData.name.trim();
      const sameText = (item.text || "").trim() === formData.text.trim();
      const sameActive = item.active === formData.active;
      if (sameName && sameText && sameActive) {
        setError("No changes to save");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        text: formData.text.trim(),
        active: formData.active
      };

      const token = getToken();
      if (!token) throw new Error("Token unavailable");

      let savedItem;
      if (item) {
        savedItem = await updateCategoria(item.id, payload, token);
        onSuccess && onSuccess(savedItem, true);
      } else {
        savedItem = await createCategoria(payload, token);
        onSuccess && onSuccess(savedItem, false);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Error saving category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!window.confirm(`Are you sure you want to delete category "${item.name}"?`)) return;

    if (!validateToken()) return;

    if (item.active) {
      alert("You must deactivate the category before deleting it.");
      return;
    }

    setIsDeleting(true);
    try {
      const token = getToken();
      await deleteCategoria(item.id, token);
      onSuccess && onSuccess(null, true, true);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Error deleting category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {item ? "Edit Category" : "New Category"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <div className="flex items-center">
                <span className="mr-2">❌</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Category name"
                maxLength="100"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <input
                type="text"
                id="text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Category description (min 20 chars)"
                maxLength="300"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="text-sm text-gray-700">Active</label>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            {item && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
            <div className="flex space-x-3 ml-auto">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-md"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriasForm;
