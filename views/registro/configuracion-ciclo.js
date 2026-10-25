// ============================================
// CONFIGURACION-CICLO.JS - Módulo para que el admin cambie la semana de inicio
// ============================================

const ConfiguracionCiclo = {
    render() {
        const config = getCicloConfig();
        const isAdmin = Auth.isAdmin;
        
        if (!isAdmin) {
            return `
                <div class="view active">
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-soft);">
                        <p>Solo el administrador puede cambiar la configuración del ciclo.</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="view active">
                <div style="padding: 20px;">
                    <h2 style="margin: 0 0 20px 0; font-size: 22px;">⚙️ Configuración del Ciclo</h2>
                    
                    <div style="background: var(--surface); padding: 20px; border-radius: 12px; box-shadow: var(--clay-shadow-sm); margin-bottom: 20px;">
                        <h3 style="margin: 0 0 16px 0; font-size: 16px; color: var(--primary);">Configuración Actual</h3>
                        
                        <div style="display: grid; gap: 16px;">
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Fecha de Inicio del Ciclo</label>
                                <input type="date" id="configFechaInicio" value="${config.fechaInicio}" style="width: 100%; padding: 10px; border: 1px solid var(--bg-soft); border-radius: 6px; font-size: 14px;">
                            </div>
                            
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Semana de Inicio</label>
                                <select id="configSemanaInicial" style="width: 100%; padding: 10px; border: 1px solid var(--bg-soft); border-radius: 6px; font-size: 14px;">
                                    <option value="1" ${config.semanaInicial === 1 ? 'selected' : ''}>Semana 1</option>
                                    <option value="2" ${config.semanaInicial === 2 ? 'selected' : ''}>Semana 2</option>
                                    <option value="3" ${config.semanaInicial === 3 ? 'selected' : ''}>Semana 3</option>
                                    <option value="4" ${config.semanaInicial === 4 ? 'selected' : ''}>Semana 4</option>
                                    <option value="5" ${config.semanaInicial === 5 ? 'selected' : ''}>Semana 5</option>
                                </select>
                            </div>
                            
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Total de Semanas del Ciclo</label>
                                <input type="number" id="configTotalSemanas" value="${config.totalSemanas}" min="1" max="10" style="width: 100%; padding: 10px; border: 1px solid var(--bg-soft); border-radius: 6px; font-size: 14px;">
                            </div>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 12px; background: var(--bg-soft); border-radius: 8px; font-size: 13px; color: var(--text-soft);">
                            <strong> Semana actual calculada:</strong> ${calcularSemanaActual()}
                        </div>
                        
                        <button id="btnGuardarConfig" style="width: 100%; margin-top: 16px; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;">
                            💾 Guardar Configuración
                        </button>
                        
                        <button id="btnRestaurarDefault" style="width: 100%; margin-top: 8px; padding: 12px; background: var(--bg-soft); color: var(--text); border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                            🔄 Restaurar Valores por Defecto
                        </button>
                    </div>
                    
                    <div style="background: var(--surface); padding: 16px; border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: var(--text-soft);">ℹ️ Información</h3>
                        <p style="margin: 0; font-size: 13px; color: var(--text-soft); line-height: 1.5;">
                            Esta configuración afecta a todos los usuarios. Cuando cambies la semana de inicio, 
                            el sistema recalculará automáticamente en qué semana del ciclo se encuentra cada usuario.
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const isAdmin = Auth.isAdmin;
        if (!isAdmin) return;

        const btnGuardar = document.getElementById('btnGuardarConfig');
        const btnRestaurar = document.getElementById('btnRestaurarDefault');

        if (btnGuardar) {
            btnGuardar.addEventListener('click', () => {
                const fechaInicio = document.getElementById('configFechaInicio').value;
                const semanaInicial = parseInt(document.getElementById('configSemanaInicial').value);
                const totalSemanas = parseInt(document.getElementById('configTotalSemanas').value);

                if (!fechaInicio) {
                    App.showToast('️ La fecha de inicio es obligatoria');
                    return;
                }

                setCicloConfig({
                    fechaInicio,
                    semanaInicial,
                    totalSemanas
                });

                App.showToast('✅ Configuración guardada. Recarga la app para ver los cambios.');
                
                // Recargar después de 1 segundo
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            });
        }

        if (btnRestaurar) {
            btnRestaurar.addEventListener('click', () => {
                if (confirm('¿Restaurar valores por defecto?')) {
                    DB.remove('cicloConfig');
                    window.CICLO_CONFIG = { ...CICLO_CONFIG_DEFAULT };
                    App.showToast('🔄 Valores restaurados');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            });
        }
    }
};

export default ConfiguracionCiclo;