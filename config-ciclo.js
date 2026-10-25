// ============================================
// CONFIG-CICLO.JS - Configuración Centralizada del Ciclo
// ============================================

// Configuración por defecto
const CICLO_CONFIG_DEFAULT = {
    fechaInicio: '2026-10-11',  // Fecha de inicio del ciclo (YYYY-MM-DD)
    semanaInicial: 1,            // Semana por la que empieza el ciclo
    totalSemanas: 5              // Total de semanas del ciclo
};

// Inicializar configuración global
window.CICLO_CONFIG = {
    ...CICLO_CONFIG_DEFAULT,
    ...DB.get('cicloConfig', {})  // Sobrescribir con valores guardados por el admin
};

// Función para obtener configuración
function getCicloConfig() {
    return window.CICLO_CONFIG;
}

// Función para actualizar configuración (solo admin)
function setCicloConfig(nuevaConfig) {
    window.CICLO_CONFIG = {
        ...CICLO_CONFIG_DEFAULT,
        ...nuevaConfig
    };
    DB.set('cicloConfig', nuevaConfig);
    console.log('✅ Configuración del ciclo actualizada:', window.CICLO_CONFIG);
}

// Función para calcular semana actual basada en la configuración
function calcularSemanaActual() {
    const config = getCicloConfig();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const [year, month, day] = config.fechaInicio.split('-').map(Number);
    const fechaInicio = new Date(year, month - 1, day);
    fechaInicio.setHours(0, 0, 0, 0);

    const diferenciaDias = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 0) {
        return config.semanaInicial;
    }

    const semanasTranscurridas = Math.floor(diferenciaDias / 7);
    const semanaActual = ((semanasTranscurridas + config.semanaInicial - 1) % config.totalSemanas) + 1;

    return semanaActual;
}

// Hacer funciones disponibles globalmente
window.getCicloConfig = getCicloConfig;
window.setCicloConfig = setCicloConfig;
window.calcularSemanaActual = calcularSemanaActual;

console.log('⚙️ [Config Ciclo] Configuración cargada:', window.CICLO_CONFIG);