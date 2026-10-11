// ============================================
// NUMERO-SEMANA.JS - Configuración de Fecha de Inicio del Ciclo
// ============================================

const NumeroSemana = {
    render() {
        const configGlobal = DB.load('configuracionGlobal');
        const configInicio = configGlobal.find(c => c.tipo === 'inicioCiclo');
        
        const fechaInicio = configInicio ? configInicio.fechaInicio : '';
        const semanaInicial = configInicio ? configInicio.semanaInicial : 1;

        return `
            <div class="view active" style="padding: 20px;">
                <div style="background: var(--surface); padding: 20px; border-radius: 16px; box-shadow: var(--clay-shadow-sm); margin-bottom: 20px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 22px; color: var(--primary);">📅 Configuración del Ciclo</h2>
                    <p style="color: var(--text-soft); font-size: 14px; margin-bottom: 20px;">
                        Configura la fecha de inicio del ciclo de 5 semanas. El sistema calculará automáticamente la semana actual para todos los usuarios.
                    </p>

                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text);">
                            📆 Fecha de Inicio del Ciclo (Domingo de la Semana 1)
                        </label>
                        <input type="date" id="fechaInicioCiclo" value="${fechaInicio}" 
                            style="width: 100%; padding: 12px; border: 2px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text);">
                        <p style="font-size: 11px; color: var(--text-soft); margin-top: 4px;">
                            Selecciona el domingo que marca el inicio de tu ciclo de 5 semanas.
                        </p>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text);">
                            🔢 Número de Semana Inicial
                        </label>
                        <select id="semanaInicial" 
                            style="width: 100%; padding: 12px; border: 2px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text);">
                            <option value="1" ${semanaInicial === 1 ? 'selected' : ''}>Semana 1</option>
                            <option value="2" ${semanaInicial === 2 ? 'selected' : ''}>Semana 2</option>
                            <option value="3" ${semanaInicial === 3 ? 'selected' : ''}>Semana 3</option>
                            <option value="4" ${semanaInicial === 4 ? 'selected' : ''}>Semana 4</option>
                            <option value="5" ${semanaInicial === 5 ? 'selected' : ''}>Semana 5</option>
                        </select>
                        <p style="font-size: 11px; color: var(--text-soft); margin-top: 4px;">
                            ¿Qué número de semana representa la fecha de inicio seleccionada? (Normalmente es la 1).
                        </p>
                    </div>

                    <button id="btnGuardarConfig" 
                        style="width: 100%; padding: 14px; background: var(--primary); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(155, 127, 212, 0.3);">
                        💾 Guardar Configuración
                    </button>

                    ${configInicio ? `
                        <div style="margin-top: 20px; padding: 12px; background: var(--bg-soft); border-radius: 8px; border-left: 4px solid var(--primary);">
                            <div style="font-size: 12px; color: var(--text-soft); margin-bottom: 4px;">Configuración activa:</div>
                            <div style="font-size: 14px; font-weight: 700; color: var(--text);">
                                Inicio: ${configInicio.fechaInicio} | Semana base: ${configInicio.semanaInicial}
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div style="background: var(--surface); padding: 20px; border-radius: 16px; box-shadow: var(--clay-shadow-sm);">
                    <h3 style="margin: 0 0 12px 0; font-size: 18px; color: var(--primary);">ℹ️ ¿Cómo funciona el cálculo automático?</h3>
                    <div style="color: var(--text-soft); font-size: 13px; line-height: 1.6;">
                        <p style="margin: 0 0 8px 0;">1. El sistema toma la fecha de inicio que configures aquí.</p>
                        <p style="margin: 0 0 8px 0;">2. Calcula cuántas semanas han pasado desde esa fecha hasta hoy.</p>
                        <p style="margin: 0 0 8px 0;">3. Aplica la fórmula matemática para que el ciclo de 5 semanas se repita infinitamente (1, 2, 3, 4, 5, 1, 2...).</p>
                        <p style="margin: 0;">4. <strong>No necesitas cambiar nada manualmente</strong> cuando termine la semana 5.</p>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        await DB_FIREBASE.load('configuracionGlobal');

        const btnGuardar = document.getElementById('btnGuardarConfig');
        if (btnGuardar) {
            btnGuardar.addEventListener('click', async () => {
                const fechaInicio = document.getElementById('fechaInicioCiclo').value;
                const semanaInicial = parseInt(document.getElementById('semanaInicial').value);

                if (!fechaInicio) {
                    App.showToast('⚠️ Selecciona una fecha de inicio');
                    return;
                }

                // Verificar que sea domingo (0 = Domingo en JS)
                const fecha = new Date(fechaInicio + 'T00:00:00'); // Forzar zona horaria local
                if (fecha.getDay() !== 0) {
                    App.showToast('⚠️ La fecha de inicio debe ser un DOMINGO');
                    return;
                }

                btnGuardar.innerHTML = '<div class="spinner"></div> Guardando...';
                btnGuardar.disabled = true;

                const configGlobal = DB.load('configuracionGlobal');
                const existingIndex = configGlobal.findIndex(c => c.tipo === 'inicioCiclo');

                const configData = {
                    tipo: 'inicioCiclo',
                    fechaInicio: fechaInicio,
                    semanaInicial: semanaInicial,
                    updatedAt: new Date().toISOString()
                };

                if (existingIndex >= 0) {
                    configGlobal[existingIndex] = configData;
                } else {
                    configGlobal.push(configData);
                }

                await DB_FIREBASE.save('configuracionGlobal', configGlobal);
                App.showToast('✅ Configuración guardada. El sistema calculará la semana automáticamente.');
                
                setTimeout(() => window.location.reload(), 1000);
            });
        }
    }
};

export default NumeroSemana;