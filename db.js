// ============================================
// DB.JS - Almacenamiento Local (localStorage) con aislamiento por usuario
// ============================================

const DB = {
    // ✅ Función interna para obtener la clave única por usuario
    _getKey(key) {
        // Intentamos obtener el usuario actual de Firebase
        const user = window.firebase?.auth()?.currentUser;
        const userId = user ? user.uid : 'guest'; // Si no hay usuario logueado, usa 'guest'
        return `ciclo_${userId}_${key}`;
    },

    // Guardar array en localStorage
    save(key, data) {
        localStorage.setItem(this._getKey(key), JSON.stringify(data));
    },

    // Obtener array de localStorage
    load(key) {
        try {
            const val = localStorage.getItem(this._getKey(key));
            return val ? JSON.parse(val) : [];
        } catch {
            return [];
        }
    },

    // Guardar valor simple
    set(key, value) {
        localStorage.setItem(this._getKey(key), typeof value === 'string' ? value : JSON.stringify(value));
    },

    // Obtener valor simple
    get(key, defaultValue = null) {
        let val = null;
        try {
            val = localStorage.getItem(this._getKey(key));
            if (val === null) return defaultValue;
            return JSON.parse(val);
        } catch {
            return val !== null ? val : defaultValue;
        }
    },

    // Eliminar una clave específica
    remove(key) {
        localStorage.removeItem(this._getKey(key));
    },

    // ✅ Limpiar TODOS los datos del usuario actual (se usa al cerrar sesión)
    clearUserData() {
        const user = window.firebase?.auth()?.currentUser;
        const userId = user ? user.uid : 'guest';
        const prefix = `ciclo_${userId}_`;
        
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        }
    },

    // Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Inicializar colecciones si no existen (ahora usan el prefijo correcto del usuario)
if (DB.load('actividades').length === 0) DB.save('actividades', []);
if (DB.load('notas').length === 0) DB.save('notas', []);
if (DB.load('tareas').length === 0) DB.save('tareas', []);
if (DB.load('ciclos').length === 0) DB.save('ciclos', []);

// Hacer DB disponible globalmente
window.DB = DB;