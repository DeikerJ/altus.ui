import React, { useState, useEffect } from 'react'; // Importa useState y useEffect
import { getCategorias, deleteCategoria } from "../services/categoriaService.js";
import { useAuth } from "../context/AuthContext";
import CategoriasForm from "./CategoriasForm";

const CategoriasList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { validateToken, getToken } = useAuth();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (recentlyUpdated) {
      const timer = setTimeout(() => setRecentlyUpdated(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentlyUpdated]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadCategories = async () => {
    if (!validateToken()) return;
    try {
      setLoading(true);
      setError("");

      const token = getToken();
      if (!token) throw new Error("Token unavailable");

      const data = await getCategorias(token);
      setCategories(data || []); // Asigna las categorías obtenidas
    } catch (err) {
      console.error("Error loading categories:", err);
      setError(err.message || "Error loading categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (!validateToken()) return;

    const hasChallenges = item.number_of_challenges > 0;
    const action = hasChallenges ? "deactivate" : "delete";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} the category "${item.name}"?`
    );

    if (confirmed) {
      try {
        setError("");
        const token = getToken();
        if (!token) throw new Error("Token unavailable");

        await deleteCategoria(item.id, token);
        await loadCategories();

        setSuccessMessage(
          hasChallenges ? "Category deactivated successfully" : "Category deleted successfully"
        );
      } catch (err) {
        console.error("Error processing:", err);
        setError(err.message || `Error trying to ${action} the category`);
      }
    }
  };

  const handleFormSuccess = async (savedItem, isEdit = false) => {
    await loadCategories();
    setRecentlyUpdated(savedItem.id);
    setSuccessMessage(isEdit ? "Category updated successfully" : "Category created successfully");
    setShowForm(false);
    setEditingItem(null);
    setError("");
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Loading categories...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Categorias</h1>
        <button
          onClick={handleCreate}
          className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          + New Category
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">✅</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challenges</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No categories registered
                </td>
              </tr>
            ) : (
              categories.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${recentlyUpdated === item.id ? 'bg-green-50 border-l-4 border-green-400' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.text}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${item.number_of_challenges > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {item.number_of_challenges || 0} challenges
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    {item.active && (
                      <button onClick={() => handleDelete(item)} className={`${item.number_of_challenges > 0 ? 'text-orange-600 hover:text-orange-900' : 'text-red-600 hover:text-red-900'}`}>
                        {item.number_of_challenges > 0 ? 'Deactivate' : 'Delete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <CategoriasForm
          item={editingItem}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </>
  );
};

export default CategoriasList;
