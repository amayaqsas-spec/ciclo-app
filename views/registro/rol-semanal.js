// ============================================
// ROL-SEMANAL.JS - Módulo de Rol Semanal con Rotación de 5 Semanas
// ============================================

const RolSemanal = {
    render() {
        const roles = DB.load('rolesSemanal');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        return `
            <div class="view active">
                <div style="padding:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <h2 style="margin:0;font-size:22px;">Rol Semanal</h2>
                        <button id="btnAddRol" style="background:var(--primary);color:white;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
                            + Nuevo
                        </button>
                    </div>

                    ${roles.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:var(--text-soft);">
                            <p>No hay roles semanales registrados</p>
                        </div>
                    ` : `
                        <div style="display:flex;flex-direction:column;gap:16px;">
                            ${roles.map(r => {
                                const linea = lineas.find(l => l.id === r.lineaId);
                                const terminal = terminales.find(t => t.id === r.terminalId);
                                
                                // Calcular semana y día actual
                                const hoy = new Date();
                                hoy.setHours(0, 0, 0, 0);
                                const fechaInicio = new Date(r.fechaInicio);
                                fechaInicio.setHours(0, 0, 0, 0);
                                const diasTranscurridos = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24));
                                const semanaActual = Math.floor(diasTranscurridos / 7) % 5 + 1;
                                const diaActual = diasTranscurridos % 7;
                                const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                                
                                const semanaData = r.semanas.find(s => s.numero === semanaActual);
                                const diaData = semanaData ? semanaData.dias[diasSemana[diaActual]] : null;

                                return `
                                    <div style="background:var(--surface);padding:16px;border-radius:12px;box-shadow:var(--clay-shadow-sm);">
                                        <div style="font-size:18px;font-weight:700;color:var(--primary);margin-bottom:12px;">
                                            Rol #${r.numeroRol || 'N/A'}
                                        </div>
                                        
                                        <div style="font-size:14px;margin-bottom:8px;">
                                            <strong>Línea:</strong> ${linea ? linea.nombre : 'Sin línea'}
                                        </div>
                                        <div style="font-size:14px;margin-bottom:8px;">
                                            <strong>Terminal:</strong> ${terminal ? terminal.nombre : 'Sin terminal'}
                                        </div>
                                        <div style="font-size:14px;margin-bottom:12px;">
                                            <strong>Inicio:</strong> ${fechaInicio.toLocaleDateString('es-MX')}
                                        </div>

                                        <div style="background:var(--bg-soft);padding:12px;border-radius:8px;margin-bottom:12px;">
                                            <div style="font-size:13px;font-weight:700;color:var(--primary);margin-bottom:8px;">
                                                📅 HOY: ${diasSemana[diaActual]} - Semana ${semanaActual}
                                            </div>
                                            ${diaData ? `
                                                <div style="font-size:16px;font-weight:700;color:var(--text);">
                                                    Posición: ${diaData.posicion || 'N/A'}
                                                </div>
                                            ` : '<div style="font-size:13px;color:var(--text-soft);">Sin datos para hoy</div>'}
                                        </div>

                                        <div style="font-size:12px;color:var(--text-soft);margin-bottom:12px;">
                                            Semanas registradas: ${r.semanas.length}
                                        </div>

                                        <div style="display:flex;gap:8px;">
                                            <button class="btn-edit-rol" data-id="${r.id}" style="flex:1;background:var(--bg-soft);color:var(--primary);border:none;padding:8px;border-radius:6px;font-weight:600;cursor:pointer;">
                                                Editar
                                            </button>
                                            <button class="btn-delete-rol" data-id="${r.id}" style="flex:1;background:#ff4444;color:white;border:none;padding:8px;border-radius:6px;font-weight:600;cursor:pointer;">
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    async init() {
        await DB_FIREBASE.load('rolesSemanal');
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');

        const container = document.getElementById('viewContainer');
        container.innerHTML = this.render();

        document.getElementById('btnAddRol')?.addEventListener('click', () => this.openModal());

        document.querySelectorAll('.btn-edit-rol').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });

        document.querySelectorAll('.btn-delete-rol').forEach(btn => {
            btn.addEventListener('click', () => this.eliminar(btn.dataset.id));
        });
    },

    async openModal(editId = null) {
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');

        const roles = DB.load('rolesSemanal');
        const data = editId ? roles.find(r => r.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const posiciones = ['1', '2', '3', 'Ra', 'CC', 'CB', 'MA'];

        // Inicializar 5 semanas si no existen
        const semanas = data && data.semanas ? data.semanas : Array.from({length: 5}, (_, i) => ({
            numero: i + 1,
            dias: diasSemana.reduce((acc, dia) => {
                acc[dia] = { posicion: '' };
                return acc;
            }, {})
        }));

        const modalOverlay = App.showModal(`
            <div style="background:var(--surface);padding:20px;border-radius:12px;max-width:95%;width:500px;max-height:90vh;overflow-y:auto;">
                <h3 style="margin:0 0 16px 0;">${editId ? 'Editar' : 'Nuevo'} Rol Semanal</h3>
                
                <div style="margin-bottom:12px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Línea *</label>
                    <select id="rolLinea" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">${lineaOptions}</select>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Terminal *</label>
                    <select id="rolTerminal" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">
                        <option value="">Selecciona línea primero</option>
                    </select>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Número de Rol *</label>
                    <input type="text" id="rolNumero" value="${data ? data.numeroRol : ''}" placeholder="Ej. 1234" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">
                </div>

                <div style="margin-bottom:16px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Fecha de Inicio (Semana 1) *</label>
                    <input type="date" id="rolFechaInicio" value="${data ? data.fechaInicio : ''}" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">
                </div>

                <div style="margin-bottom:16px;">
                    <label style="display:block;font-size:14px;font-weight:700;margin-bottom:12px;color:var(--primary);">📅 5 Semanas de Rotación</label>
                    <div id="semanasContainer">
                        ${semanas.map((semana, idx) => this.crearHTMLSemana(semana, idx, diasSemana, posiciones)).join('')}
                    </div>
                </div>

                <div style="display:flex;gap:8px;">
                    <button id="btnCancel" style="flex:1;padding:10px;background:var(--bg-soft);border:none;border-radius:6px;font-weight:600;cursor:pointer;">Cancelar</button>
                    <button id="btnSave" style="flex:1;padding:10px;background:var(--primary);color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;">${editId ? 'Actualizar' : 'Guardar'}</button>
                </div>
            </div>
        `);

        const selectLinea = document.getElementById('rolLinea');
        const selectTerminal = document.getElementById('rolTerminal');

        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const filtradas = terminales.filter(t => t.lineaId === lineaId);
            
            selectTerminal.innerHTML = filtradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + filtradas.map(t => 
                    `<option value="${t.id}" ${data && data.terminalId === t.id ? 'selected' : ''}>${t.nombre}</option>`
                ).join('');
        };

        selectLinea.addEventListener('change', updateTerminales);
        updateTerminales();

        document.getElementById('btnCancel').addEventListener('click', () => modalOverlay.remove());
        
        document.getElementById('btnSave').addEventListener('click', async () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const numeroRol = document.getElementById('rolNumero').value.trim();
            const fechaInicio = document.getElementById('rolFechaInicio').value;

            if (!lineaId || !terminalId || !numeroRol || !fechaInicio) {
                App.showToast('Completa todos los campos obligatorios');
                return;
            }

            // Recopilar las 5 semanas
            const semanasData = [];
            for (let i = 1; i <= 5; i++) {
                const semanaDiv = document.getElementById(`semana-${i}`);
                const dias = {};
                
                diasSemana.forEach(dia => {
                    const posicionSelect = semanaDiv.querySelector(`#semana-${i}-${dia}-posicion`);
                    
                    dias[dia] = {
                        posicion: posicionSelect ? posicionSelect.value : ''
                    };
                });

                semanasData.push({
                    numero: i,
                    dias: dias
                });
            }

            let rolesData = DB.load('rolesSemanal');

            if (editId) {
                const idx = rolesData.findIndex(r => r.id === editId);
                if (idx !== -1) {
                    rolesData[idx] = { 
                        ...rolesData[idx], 
                        lineaId, 
                        terminalId, 
                        numeroRol,
                        fechaInicio,
                        semanas: semanasData
                    };
                }
            } else {
                rolesData.push({
                    id: DB.generateId(),
                    lineaId,
                    terminalId,
                    numeroRol,
                    fechaInicio,
                    semanas: semanasData,
                    createdAt: Date.now()
                });
            }

            await DB_FIREBASE.sync('rolesSemanal', rolesData);

            modalOverlay.remove();
            App.showToast(editId ? 'Rol semanal actualizado' : 'Rol semanal guardado');

            await this.init();
        });
    },

    crearHTMLSemana(semana, idx, diasSemana, posiciones) {
        const diasHTML = diasSemana.map(dia => {
            const diaData = semana.dias[dia] || { posicion: '' };
            return `
                <div style="background:var(--bg-soft);padding:10px;border-radius:6px;margin-bottom:8px;">
                    <div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:6px;">${dia}</div>
                    <select id="semana-${semana.numero}-${dia}-posicion" style="width:100%;padding:6px;border:1px solid var(--bg);border-radius:4px;font-size:12px;">
                        <option value="">Selecciona posición</option>
                        ${posiciones.map(p => `<option value="${p}" ${diaData.posicion === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </div>
            `;
        }).join('');

        return `
            <div id="semana-${semana.numero}" style="margin-bottom:16px;">
                <div style="font-size:14px;font-weight:700;color:var(--primary);margin-bottom:10px;">Semana ${semana.numero}</div>
                ${diasHTML}
            </div>
        `;
    },

    async eliminar(id) {
        if (!confirm('¿Eliminar este rol semanal?')) return;

        let rolesData = DB.load('rolesSemanal').filter(r => r.id !== id);

        await DB_FIREBASE.sync('rolesSemanal', rolesData);

        App.showToast('Rol semanal eliminado');

        await this.init();
    }
};

export default RolSemanal;