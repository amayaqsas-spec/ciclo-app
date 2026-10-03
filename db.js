// ============================================
// DB.JS - Módulo de Base de Datos Local y Firebase
// ============================================

const DB = {
    // ✅ Obtener un valor del localStorage
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(`ciclo_${key}`);
            if (value === null) return defaultValue;
            return JSON.parse(value);
        } catch (error) {
            console.error(`❌ Error al obtener ${key}:`, error);
            return defaultValue;
        }
    },

    // ✅ Guardar un valor en el localStorage
    set(key, value) {
        try {
            localStorage.setItem(`ciclo_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`❌ Error al guardar ${key}:`, error);
            return false;
        }
    },

    // ✅ Cargar una colección del localStorage
    load(key) {
        try {
            const value = localStorage.getItem(`ciclo_${key}`);
            if (value === null) return [];
            return JSON.parse(value);
        } catch (error) {
            console.error(`❌ Error al cargar ${key}:`, error);
            return [];
        }
    },

    // ✅ Guardar una colección en el localStorage
    save(key, value) {
        try {
            localStorage.setItem(`ciclo_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`❌ Error al guardar ${key}:`, error);
            return false;
        }
    },

    // ✅ Eliminar un valor del localStorage
    remove(key) {
        try {
            localStorage.removeItem(`ciclo_${key}`);
            return true;
        } catch (error) {
            console.error(`❌ Error al eliminar ${key}:`, error);
            return false;
        }
    },

    // ✅ Limpiar toda la base de datos local
    clear() {
        try {
            const keys = Object.keys(localStorage).filter(k => k.startsWith('ciclo_'));
            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('❌ Error al limpiar la base de datos:', error);
            return false;
        }
    },

    // ✅ Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// ✅ Hacer DB disponible globalmente
window.DB = DB;

// ============================================
// DB_FIREBASE - Sincronización en la nube (CON MANEJO DE ERRORES SEGURO)
// ============================================
const DB_FIREBASE = {
    // ✅ Guardar colección en Firebase
    async saveToFirebase(coleccion, datos) {
        try {
            if (!window.firebase || !window.firebase.firestore) {
                console.warn('⚠️ Firebase no disponible');
                return false;
            }
            
            const db = window.firebase.firestore();
            await db.collection('datos_globales').doc(coleccion).set({
                datos: datos,
                updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: Auth.currentUser?.email || 'admin'
            });
            console.log(`✅ ${coleccion} guardado en Firebase:`, datos.length, 'registros');
            return true;
        } catch (error) {
            console.error(`❌ Error al guardar ${coleccion} en Firebase:`, error);
            return false;
        }
    },

    // ✅ Cargar colección desde Firebase
    async loadFromFirebase(coleccion) {
        try {
            if (!window.firebase || !window.firebase.firestore) {
                console.warn('️ Firebase no disponible');
                return [];
            }
            
            const db = window.firebase.firestore();
            const doc = await db.collection('datos_globales').doc(coleccion).get();
            
            if (doc.exists) {
                const data = doc.data();
                console.log(`✅ ${coleccion} cargado desde Firebase:`, data.datos?.length || 0, 'registros');
                return data.datos || [];
            } else {
                console.log(`️ ${coleccion} no existe en Firebase (se usará caché local)`);
                return [];
            }
        } catch (error) {
            console.error(`❌ Error al cargar ${coleccion} desde Firebase:`, error);
            return [];
        }
    },

    // ✅ Sincronizar: guardar local y en Firebase
    async sync(coleccion, datos) {
        // 1. Siempre guardar local primero
        DB.save(coleccion, datos);
        
        // 2. Intentar guardar en Firebase (solo si es admin)
        if (Auth.isAdmin) {
            await this.saveToFirebase(coleccion, datos);
        }
    },

    // ✅ Cargar desde Firebase o local (fallback seguro)
    async load(coleccion) {
        try {
            const datosFirebase = await this.loadFromFirebase(coleccion);
            
            if (datosFirebase && datosFirebase.length > 0) {
                DB.save(coleccion, datosFirebase);
                return datosFirebase;
            } else {
                console.log(`⚠️ Usando datos locales para ${coleccion}`);
                return DB.load(coleccion);
            }
        } catch (error) {
            console.error(`❌ Error crítico en load(${coleccion}):`, error);
            return DB.load(coleccion);
        }
    }
};

// ✅ Hacer DB_FIREBASE disponible globalmente
window.DB_FIREBASE = DB_FIREBASE;