import { useState, useEffect, useCallback } from 'react';
import { retoService } from '../services/retoServices.js';
import { getCategorias } from '../services/categoriaService.js';
import { useAuth } from '../context/AuthContext';
import RetosForm from './RetosForm';  // Corregido: importación en mayúscula

const RetosList = () => {
  const { validateToken, getToken } = useAuth();
  const [retos, setRetos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState(null);

  const normalizeArray = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.retos)) return raw.retos;
    if (Array.isArray(raw.results)) return raw.results;
    return [];
  };

  const buildCategoriaMap = (catsArr) => {
    const map = new Map();
    (catsArr || []).forEach((c) => {
      const id = c?.id ?? c?._id ?? c?._id?.$oid ?? '';
      const name = c?.descripcion ?? c?.description ?? c?.name ?? c?.nombre ?? '';
      if (id) map.set(String(id), name || String(id));
    });
    return map;
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (typeof validateToken === 'function' && !validateToken()) {
        setRetos([]);
        setCategorias([]);
        setLoading(false);
        return;
      }

      const token = (typeof getToken === 'function' ? getToken() : null) || localStorage.getItem('authToken') || localStorage.getItem('token') || null;

      let catsRaw = [];
      try {
        const rawCats = await getCategorias(token);
        catsRaw = normalizeArray(rawCats);
        setCategorias(catsRaw);
      } catch (catErr) {
        console.warn('Error cargando categorías:', catErr);
        setCategorias([]);
        catsRaw = [];
      }

      const catMap = buildCategoriaMap(catsRaw);

      const rawRetos = await retoService.getAll();
      const retosArr = normalizeArray(rawRetos);

      const normalized = retosArr.map((r) => {
        const id = r?.id ?? r?._id ?? r?._id?.$oid ?? '';
        const categoriaId = String(r?.categoria_id ?? r?.categoria ?? r?.categoriaId ?? '');
        const title = r?.title ?? r?.titulo ?? r?.name ?? '';
        const description = r?.description ?? r?.descripcion ?? '';
        const activo = typeof r?.activo === 'boolean' ? r.activo : r?.active ?? r?.estado ?? true;
        return {
          ...r,
          id: String(id),
          categoria_id: categoriaId,
          title,
          description,
          activo,
          categoria_nombre: catMap.get(categoriaId) ?? r?.categoria_descripcion ?? r?.categoria_nombre ?? '—'
        };
      });

      setRetos(normalized);
    } catch (err) {
      console.error('Error cargando retos:', err);
      setError(err?.message || 'Error al cargar los retos');
      setRetos([]);
    } finally {
      setLoading(false);
    }
  }, [getToken, validateToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (recentlyUpdated) {
      const t = setTimeout(() => setRecentlyUpdated(null), 2000);
      return () => clearTimeout(t);
    }
  }, [recentlyUpdated]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleToggleActive = async (item) => {
    try {
      if (typeof validateToken === 'function' && !validateToken()) return;

      const id = String(item.id ?? item._id ?? item._id?.$oid ?? '');
      if (!id) return setError('ID inválido');

      const newState = !item.activo;
      const confirmed = window.confirm(`${newState ? 'Activar' : 'Desactivar'} el reto "${item.title}"?`);
      if (!confirmed) return;

      await retoService.update(id, { ...item, activo: newState });
      await loadData();
      setSuccessMessage(newState ? 'Reto activado' : 'Reto desactivado');
      setRecentlyUpdated(id);
    } catch (err) {
      console.error(err);
      setError('Error al actualizar estado');
    }
  };

  const handleDelete = async (item) => {
    try {
      if (typeof validateToken === 'function' && !validateToken()) return;

      const id = String(item.id ?? item._id ?? item._id?.$oid ?? '');
      if (!id) return setError('ID inválido');

      if (item.activo) {
        setError('No puedes eliminar un reto activo. Primero desactívalo.');
        return;
      }

      const confirmed = window.confirm(`¿Eliminar el reto "${item.title}"? Esta acción no se puede deshacer.`);
      if (!confirmed) return;

      await retoService.delete(id);
      await loadData();
      setSuccessMessage('Reto eliminado exitosamente');
    } catch (err) {
      console.error(err);
      setError('Error al eliminar reto');
    }
  };

  const handleFormSuccess = async (savedItem, isEdit = false) => {
    await loadData();
    if (savedItem?.id) setRecentlyUpdated(String(savedItem.id));
    setSuccessMessage(isEdit ? 'Reto actualizado exitosamente' : 'Reto creado exitosamente');
    setShowForm(false);
    setEditingItem(null);
    setError('');
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const getCategoriaName = (item) => {
    if (!item) return '—';
    if (item.categoria_nombre) return item.categoria_nombre;
    const cat = categorias.find(c => String(c.id ?? c._id ?? c._id?.$oid ?? '') === String(item.categoria_id));
    return cat?.descripcion ?? cat?.description ?? cat?.name ?? cat?.nombre ?? 'Categoría no encontrada';
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div>Cargando retos...</div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Retos</h1>
        <button onClick={handleCreate} className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-md">+ Nuevo Reto</button>
      </div>

      {successMessage && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">✅ {successMessage}</div>}
      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">❌ {error}</div>}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {retos.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No hay retos registrados</td></tr>
            ) : retos.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{getCategoriaName(item)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${item.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                  <button onClick={() => handleToggleActive(item)} className={`mr-3 px-3 py-1 text-sm rounded ${item.activo ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>
                    {item.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  {!item.activo && <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900">Eliminar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <RetosForm item={editingItem} tiposReto={categorias} categorias={categorias} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />}
    </div>
  );
};

export default RetosList;
