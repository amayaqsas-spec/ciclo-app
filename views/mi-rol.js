// ============================================
// MI-ROL.JS - Calendario con Semana Actual desde Configuración Global
// ============================================

const MiRol = {
    getFechaLocal(fecha) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    render() {
        const userLineaId = DB.get('userLineaId');
        const userTerminalId = DB.get('userTerminalId');
        const userNumeroRol = DB.get('userNumeroRol');

        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const rolesSemanal = DB.load('rolesSemanal');

        const miLinea = lineas.find(l => l.id === userLineaId);
        const miTerminal = terminales.find(t => t.id === userTerminalId);

        let miRol = null;
        let semanaActualNum = 1;
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const hoy = new Date();
        const diaActualNombre = diasSemana[hoy.getDay()];

        // ✅ SEMANA ACTUAL: Leer desde configuración global (Firebase)
        const configGlobal = DB.load('configuracionGlobal');
        const semanaActualConfig = configGlobal.find(c => c.tipo === 'semanaActual');

        if (semanaActualConfig && semanaActualConfig.lineaId === userLineaId) {
            semanaActualNum = semanaActualConfig.numero;
            console.log('📅 Mi Rol - Semana actual desde config global:', semanaActualNum);
        } else {
            console.log('📅 Mi Rol - No hay semana actual configurada');
        }

        // Buscar el rol del usuario
        if (userNumeroRol && rolesSemanal.length > 0) {
            miRol = rolesSemanal.find(r => String(r.numeroRol) === String(userNumeroRol) && r.lineaId === userLineaId);
        }

        return `
            <div class="view active" style="padding: 20px;">
                <!-- HEADER CON INFO DEL PERFIL -->
                <div style="background: var(--surface); padding: 20px; border-radius: 16px; box-shadow: var(--clay-shadow-sm); margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 style="margin: 0; font-size: 22px; color: var(--primary);">📅 Mi Rol</h2>
                        <button id="btnEditarPerfil" style="background: var(--primary); color: white; border: none; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                            ✏️ Editar
                        </button>
                    </div>
                    
                    ${miRol ? `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                            <div style="background: var(--bg-soft); padding: 12px; border-radius: 8px;">
                                <div style="font-size: 11px; color: var(--text-soft); margin-bottom: 4px;">🚌 Línea</div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--text);">${miLinea ? miLinea.nombre : 'N/A'}</div>
                            </div>
                            <div style="background: var(--bg-soft); padding: 12px; border-radius: 8px;">
                                <div style="font-size: 11px; color: var(--text-soft); margin-bottom: 4px;">🚇 Terminal</div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--text);">${miTerminal ? miTerminal.nombre : 'N/A'}</div>
                            </div>
                            <div style="background: var(--bg-soft); padding: 12px; border-radius: 8px;">
                                <div style="font-size: 11px; color: var(--text-soft); margin-bottom: 4px;">🔢 Número de Rol</div>
                                <div style="font-size: 18px; font-weight: 800; color: var(--primary);">#${userNumeroRol || 'N/A'}</div>
                            </div>
                            <div style="background: var(--primary); color: white; padding: 12px; border-radius: 8px;">
                                <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">📆 Semana Actual</div>
                                <div style="font-size: 18px; font-weight: 800;">Semana ${semanaActualNum}</div>
                            </div>
                        </div>

                        <div style="background: var(--bg-soft); padding: 12px; border-radius: 8px; text-align: center; border-left: 4px solid var(--primary);">
                            <div style="font-size: 12px; color: var(--text-soft); margin-bottom: 4px;">Hoy es</div>
                            <div style="font-size: 18px; font-weight: 800; color: var(--primary);">${diaActualNombre} ${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}</div>
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 20px; color: var(--text-soft);">
                            <p style="margin: 0 0 8px 0;">No se encontró tu rol.</p>
                            <p style="font-size: 13px;">Toca "Editar" para configurar tu perfil.</p>
                        </div>
                    `}
                </div>

                <!-- CALENDARIO DE 5 SEMANAS -->
                ${miRol ? `
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        ${miRol.semanas.map(semana => {
                            const esSemanaActual = semana.numero === semanaActualNum;
                            
                            return `
                                <div style="background: var(--surface); padding: 16px; border-radius: 12px; box-shadow: var(--clay-shadow-sm); border: 2px solid ${esSemanaActual ? 'var(--primary)' : 'var(--bg-soft)'};">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: ${esSemanaActual ? 'var(--primary)' : 'var(--text)'};">
                                            ${esSemanaActual ? '📍 ' : ''}Semana ${semana.numero}
                                        </h3>
                                        ${esSemanaActual ? '<span style="background: var(--primary); color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;">ACTUAL</span>' : ''}
                                    </div>

                                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
                                        ${diasSemana.map(dia => {
                                            const diaData = semana.dias[dia] || { posicion: '' };
                                            const esHoy = esSemanaActual && dia === diaActualNombre;
                                            const posicion = diaData.posicion || '-';
                                            
                                            return `
                                                <div style="background: ${esHoy ? 'var(--primary)' : 'var(--bg-soft)'}; padding: 8px 4px; border-radius: 8px; text-align: center; border: 2px solid ${esHoy ? 'var(--accent)' : 'transparent'};">
                                                    <div style="font-size: 9px; font-weight: 700; color: ${esHoy ? 'white' : 'var(--text-soft)'}; margin-bottom: 4px; text-transform: uppercase;">
                                                        ${dia.substring(0, 3)}
                                                    </div>
                                                    <div style="font-size: 14px; font-weight: 800; color: ${esHoy ? 'white' : 'var(--text)'};">
                                                        ${posicion}
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    init() {
        console.log('📅 Mi Rol cargado');

        const btnEditarPerfil = document.getElementById('btnEditarPerfil');
        if (btnEditarPerfil) {
            btnEditarPerfil.addEventListener('click', () => this.abrirModalEditar());
        }
    },

    abrirModalEditar() {
        const userLineaId = DB.get('userLineaId');
        const userTerminalId = DB.get('userTerminalId');
        const userNumeroRol = DB.get('userNumeroRol');

        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona línea</option>' + lineas.map(l => `<option value="${l.id}" ${l.id === userLineaId ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const terminalesFiltradas = terminales.filter(t => t.lineaId === userLineaId);
        const terminalOptions = terminalesFiltradas.length > 0
            ? '<option value="">Selecciona terminal</option>' + terminalesFiltradas.map(t => `<option value="${t.id}" ${t.id === userTerminalId ? 'selected' : ''}>${t.nombre}</option>`).join('')
            : '<option value="">No hay terminales</option>';

        const modalOverlay = App.showModal(`
            <div style="background: var(--surface); padding: 24px; border-radius: 16px; max-width: 90%; width: 400px; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin: 0 0 16px 0; font-size: 20px; color: var(--primary);">✏️ Editar Perfil</h3>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text);">Línea *</label>
                    <select id="editLinea" style="width: 100%; padding: 12px; border: 2px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text);">
                        ${lineaOptions}
                    </select>
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text);">Terminal *</label>
                    <select id="editTerminal" style="width: 100%; padding: 12px; border: 2px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text);">
                        ${terminalOptions}
                    </select>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text);">Número de Rol *</label>
                    <input type="text" id="editNumeroRol" value="${userNumeroRol || ''}" placeholder="Ej. 1234" style="width: 100%; padding: 12px; border: 2px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text); box-sizing: border-box;">
                </div>

                <div style="display: flex; gap: 10px;">
                    <button id="btnCancelarEdit" style="flex: 1; padding: 12px; background: var(--bg-soft); color: var(--text); border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                        Cancelar
                    </button>
                    <button id="btnGuardarEdit" style="flex: 1; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                        💾 Guardar
                    </button>
                </div>
            </div>
        `);

        const selectLinea = document.getElementById('editLinea');
        const selectTerminal = document.getElementById('editTerminal');

        selectLinea.addEventListener('change', () => {
            const lineaId = selectLinea.value;
            const filtradas = terminales.filter(t => t.lineaId === lineaId);
            
            selectTerminal.innerHTML = filtradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + filtradas.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('');
        });

        document.getElementById('btnCancelarEdit').addEventListener('click', () => modalOverlay.remove());
        
        document.getElementById('btnGuardarEdit').addEventListener('click', () => {
            const nuevaLineaId = selectLinea.value;
            const nuevaTerminalId = selectTerminal.value;
            const nuevoNumeroRol = document.getElementById('editNumeroRol').value.trim();

            if (!nuevaLineaId || !nuevaTerminalId || !nuevoNumeroRol) {
                App.showToast('⚠️ Completa todos los campos');
                return;
            }

            DB.set('userLineaId', nuevaLineaId);
            DB.set('userTerminalId', nuevaTerminalId);
            DB.set('userNumeroRol', nuevoNumeroRol);

            App.showToast('✅ Perfil actualizado correctamente');
            modalOverlay.remove();

            setTimeout(() => {
                window.location.reload();
            }, 500);
        });
    }
};

export default MiRol;