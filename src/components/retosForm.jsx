import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { retoService } from '../services/retoServices.js';
import { getCategorias } from '../services/categoriaService.js';

const RetosForm = ({ item, onSuccess, onCancel }) => {
  const { validateToken, user, getToken } = useAuth();
  const [tiposReto, setTiposReto] = useState([]);

  const [formData, setFormData] = useState({
    // aseguramos que siempre sea string
    categoria_id: String(item?.categoria_id ?? ''),
    title: item?.title ?? '',
    description: item?.description ?? '',
    usuario_id: item?.usuario_id ?? user?.id ?? ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const normalizeCategorias = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr
        .map((c) => {
          // normalizamos id (soporta _id o id)
          const id = c.id ?? c._id ?? (c._id && (c._id.$oid ?? c._id)) ?? '';
          const descripcion = c.descripcion ?? c.description ?? c.name ?? c.nombre ?? '';
          // devolvemos como string
          return { id: String(id), descripcion: String(descripcion) };
        })
        // descartamos entradas sin id
        .filter((x) => x.id);
    };

    const fetchCategorias = async () => {
      try {
        const token = typeof getToken === 'function' ? getToken() : null;
        console.log('[RetosForm] token resuelto via getToken():', token);

        const raw = await getCategorias(token);
        // soporte para { data: [...] } o array directo
        const arr =
          Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.results) ? raw.results : [];
        const normalized = normalizeCategorias(arr);

        // NOTA: aquí no filtramos por "activo" para que puedas ver todas las categorías.
        if (mounted) setTiposReto(normalized);
        console.log('[RetosForm] categorias normalizadas:', normalized);
      } catch (err) {
        console.error('[RetosForm] Error cargando categorías:', err);
        if (mounted) setTiposReto([]);
      }
    };

    fetchCategorias();
    return () => { mounted = false; };
  }, [getToken, validateToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // aseguramos string
    setFormData(prev => ({ ...prev, [name]: typeof value === 'string' ? value : String(value) }));
    if (error) setError('');
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (typeof validateToken === 'function' && !validateToken()) return;

    if (!String(formData.categoria_id || '').trim()) {
      setError('La categoría es requerida');
      return;
    }
    if (!formData.title.trim()) {
      setError('El título es requerido');
      return;
    }
    const titlePattern = /^[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
    if (!titlePattern.test(formData.title)) {
      setError('El título solo puede contener letras, números, espacios, apóstrofes y guiones');
      return;
    }
    if (!formData.description.trim()) {
      setError('La descripción es requerida');
      return;
    }
    if (!formData.usuario_id) {
      setError('El ID de usuario es requerido');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Construimos explicitamente el payload igual que tu ejemplo:
      const payload = {
        title: formData.title,
        description: formData.description,
        usuario_id: formData.usuario_id,
        categoria_id: String(formData.categoria_id)
      };

      console.log('[RetosForm] payload a enviar:', payload);

      let savedItem;
      if (item) {
        savedItem = await retoService.update(item.id, payload);
        if (!savedItem) savedItem = { ...item, ...payload };
        onSuccess(savedItem, true);
      } else {
        savedItem = await retoService.create(payload);
        if (!savedItem) savedItem = { id: Date.now().toString(), ...payload };
        onSuccess(savedItem, false);
      }
    } catch (err) {
      console.error('Error al guardar:', err);
      setError(err.response?.data?.message || err.message || 'Error al guardar el reto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSubmitting) handleSubmit();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {item ? 'Editar Reto' : 'Nuevo Reto'}
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
              <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                id="categoria_id"
                name="categoria_id"
                value={String(formData.categoria_id)}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Seleccionar categoría...</option>
                {tiposReto.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.descripcion || cat.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Ej: Reto de programación"
                maxLength="100"
                autoFocus={!item}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Descripción detallada del reto..."
                maxLength="500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetosForm;
