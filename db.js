// ============================================
// DB.JS - Almacenamiento Local (localStorage)
// ============================================

const DB = {
    // Guardar array en localStorage
    save(key, data) {
        localStorage.setItem('ciclo_' + key, JSON.stringify(data));
    },

    // Obtener array de localStorage
    load(key) {
        try {
            const val = localStorage.getItem('ciclo_' + key);
            return val ? JSON.parse(val) : [];
        } catch {
            return [];
        }
    },

    // Guardar valor simple
    set(key, value) {
        localStorage.setItem('ciclo_' + key, typeof value === 'string' ? value : JSON.stringify(value));
    },

    // Obtener valor simple (CORREGIDO)
    get(key, defaultValue = null) {
        let val = null;
        try {
            val = localStorage.getItem('ciclo_' + key);
            if (val === null) return defaultValue;
            return JSON.parse(val);
        } catch {
            return val !== null ? val : defaultValue;
        }
    },

    // Eliminar
    remove(key) {
        localStorage.removeItem('ciclo_' + key);
    },

    // Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Inicializar colecciones si no existen
if (DB.load('actividades').length === 0) DB.save('actividades', []);
if (DB.load('notas').length === 0) DB.save('notas', []);
if (DB.load('tareas').length === 0) DB.save('tareas', []);
if (DB.load('ciclos').length === 0) DB.save('ciclos', []);

// Hacer DB disponible globalmente
window.DB = DB;