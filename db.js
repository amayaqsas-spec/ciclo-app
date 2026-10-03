// ============================================
// DB.JS - Módulo de Base de Datos Local
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
            console.error(` Error al guardar ${key}:`, error);
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
    }
};

// ============================================
// DB_FIREBASE - Sincronización en la nube
// ============================================
const DB_FIREBASE = {
    // ✅ Guardar colección en Firebase
    async saveToFirebase(coleccion, datos) {
        try {
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
            const db = window.firebase.firestore();
            const doc = await db.collection('datos_globales').doc(coleccion).get();
            
            if (doc.exists) {
                const data = doc.data();
                console.log(`✅ ${coleccion} cargado desde Firebase:`, data.datos?.length || 0, 'registros');
                return data.datos || [];
            } else {
                console.log(`⚠️ ${coleccion} no existe en Firebase`);
                return [];
            }
        } catch (error) {
            console.error(`❌ Error al cargar ${coleccion} desde Firebase:`, error);
            return [];
        }
    },

    // ✅ Sincronizar: guardar local y en Firebase
    async sync(coleccion, datos) {
        // Guardar local
        DB.save(coleccion, datos);
        
        // Guardar en Firebase (solo si es admin)
        if (Auth.isAdmin) {
            await this.saveToFirebase(coleccion, datos);
        }
    },

    // ✅ Cargar desde Firebase o local (fallback)
    async load(coleccion) {
        // Intentar cargar desde Firebase
        const datosFirebase = await this.loadFromFirebase(coleccion);
        
        if (datosFirebase.length > 0) {
            // Guardar localmente para cache
            DB.save(coleccion, datosFirebase);
            return datosFirebase;
        } else {
            // Fallback a datos locales
            console.log(`⚠️ Usando datos locales para ${coleccion}`);
            return DB.load(coleccion);
        }
    }
};

// Hacer DB_FIREBASE disponible globalmente
window.DB_FIREBASE = DB_FIREBASE;

export default DB;