// ============================================
// REGISTRO/ESPEJO.JS - Módulo de Espejo con Hora de Salida
// ============================================

const Espejo = {
    render() {
        const espejos = DB.load('espejos');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        return `
            <div class="view active">
                <div style="padding:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <h2 style="margin:0;font-size:22px;">Espejo</h2>
                        <button id="btnAddEspejo" style="background:var(--primary);color:white;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
                            + Nuevo
                        </button>
                    </div>

                    ${espejos.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:var(--text-soft);">
                            <p>No hay espejos registrados</p>
                        </div>
                    ` : `
                        <div style="display:flex;flex-direction:column;gap:16px;">
                            ${espejos.map(e => {
                                const linea = lineas.find(l => l.id === e.lineaId);
                                const terminal = terminales.find(t => t.id === e.terminalId);
                                const semana = semanas.find(s => s.id === e.semanaId);
                                const pares = e.pares || [];

                                return `
                                    <div style="background:var(--surface);padding:16px;border-radius:12px;box-shadow:var(--clay-shadow-sm);">
                                        <div style="font-size:18px;font-weight:700;color:var(--primary);margin-bottom:12px;">
                                            Espejo
                                        </div>
                                        
                                        <div style="font-size:14px;margin-bottom:8px;">
                                            <strong>Línea:</strong> ${linea ? linea.nombre : 'Sin línea'}
                                        </div>
                                        <div style="font-size:14px;margin-bottom:8px;">
                                            <strong>Terminal:</strong> ${terminal ? terminal.nombre : 'Sin terminal'}
                                        </div>
                                        <div style="font-size:14px;margin-bottom:12px;">
                                            <strong>Tipo de Día:</strong> ${semana ? semana.tipo : 'Sin tipo'}
                                        </div>

                                        ${pares.length > 0 ? `
                                            <div style="margin-bottom:12px;">
                                                <strong style="font-size:13px;">Pares (Tren → Espejo | H. Salida):</strong>
                                                ${pares.map((par, idx) => `
                                                    <div style="background:var(--bg-soft);padding:10px;border-radius:6px;margin-top:6px;font-size:13px;display:flex;justify-content:space-between;align-items:center;">
                                                        <div>
                                                            <strong>#${idx + 1}</strong> Tren: ${par.tren || '-'} → Espejo: ${par.espejo || '-'}
                                                        </div>
                                                        <div style="font-weight:700;color:var(--primary);background:var(--surface);padding:4px 8px;border-radius:4px;">
                                                            ${par.horaSalida || '--:--'}
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        ` : ''}

                                        <div style="display:flex;gap:8px;margin-top:12px;">
                                            <button class="btn-edit-espejo" data-id="${e.id}" style="flex:1;background:var(--bg-soft);color:var(--primary);border:none;padding:8px;border-radius:6px;font-weight:600;cursor:pointer;">
                                                Editar
                                            </button>
                                            <button class="btn-delete-espejo" data-id="${e.id}" style="flex:1;background:#ff4444;color:white;border:none;padding:8px;border-radius:6px;font-weight:600;cursor:pointer;">
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
        await DB_FIREBASE.load('espejos');
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');
        await DB_FIREBASE.load('semanas');

        const container = document.getElementById('viewContainer');
        container.innerHTML = this.render();

        document.getElementById('btnAddEspejo')?.addEventListener('click', () => this.openModal());

        document.querySelectorAll('.btn-edit-espejo').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });

        document.querySelectorAll('.btn-delete-espejo').forEach(btn => {
            btn.addEventListener('click', () => this.eliminar(btn.dataset.id));
        });
    },

    async openModal(editId = null) {
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');
        await DB_FIREBASE.load('semanas');

        const espejos = DB.load('espejos');
        const data = editId ? espejos.find(e => e.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        if (lineas.length === 0) {
            App.showToast('Primero registra una línea');
            return;
        }

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const pares = data && data.pares && data.pares.length > 0 ? data.pares : [{ tren: '', espejo: '', horaSalida: '' }];

        const modalOverlay = App.showModal(`
            <div style="background:var(--surface);padding:20px;border-radius:12px;max-width:95%;width:450px;max-height:90vh;overflow-y:auto;">
                <h3 style="margin:0 0 16px 0;">${editId ? 'Editar' : 'Nuevo'} Espejo</h3>
                
                <div style="margin-bottom:12px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Línea *</label>
                    <select id="espejoLinea" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">${lineaOptions}</select>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Terminal *</label>
                    <select id="espejoTerminal" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">
                        <option value="">Selecciona línea primero</option>
                    </select>
                </div>

                <div style="margin-bottom:16px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Tipo de Día *</label>
                    <select id="espejoSemana" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">
                        <option value="">Selecciona línea y terminal primero</option>
                    </select>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:8px;">Pares (Tren → Espejo | H. Salida)</label>
                    <div id="espejoPares">
                        ${pares.map((par, idx) => this.crearHTMLPar(par, idx)).join('')}
                    </div>
                    <button id="btnAgregarPar" style="width:100%;padding:8px;background:var(--bg-soft);border:2px dashed var(--primary-soft);border-radius:6px;color:var(--primary);font-weight:600;cursor:pointer;margin-top:8px;">
                        + Agregar otro par
                    </button>
                </div>

                <div style="display:flex;gap:8px;">
                    <button id="btnCancel" style="flex:1;padding:10px;background:var(--bg-soft);border:none;border-radius:6px;font-weight:600;cursor:pointer;">Cancelar</button>
                    <button id="btnSave" style="flex:1;padding:10px;background:var(--primary);color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;">${editId ? 'Actualizar' : 'Guardar'}</button>
                </div>
            </div>
        `);

        const selectLinea = document.getElementById('espejoLinea');
        const selectTerminal = document.getElementById('espejoTerminal');
        const selectSemana = document.getElementById('espejoSemana');

        // Cascada: Línea → Terminal → Semana
        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const filtradas = terminales.filter(t => t.lineaId === lineaId);
            
            selectTerminal.innerHTML = filtradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + filtradas.map(t => 
                    `<option value="${t.id}" ${data && data.terminalId === t.id ? 'selected' : ''}>${t.nombre}</option>`
                ).join('');
            updateSemanas();
        };

        const updateSemanas = () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            
            let filtradas = semanas.filter(s => s.lineaId === lineaId);
            if (terminalId) {
                filtradas = filtradas.filter(s => s.terminalId === terminalId);
            }
            
            selectSemana.innerHTML = filtradas.length === 0
                ? '<option value="">No hay tipos de día</option>'
                : '<option value="">Selecciona tipo de día</option>' + filtradas.map(s => 
                    `<option value="${s.id}" ${data && data.semanaId === s.id ? 'selected' : ''}>${s.tipo}</option>`
                ).join('');
        };

        selectLinea.addEventListener('change', updateTerminales);
        selectTerminal.addEventListener('change', updateSemanas);
        updateTerminales();

        // Agregar pares dinámicamente
        document.getElementById('btnAgregarPar').addEventListener('click', () => {
            this.agregarPar();
        });

        // Eventos de eliminar pares existentes
        document.querySelectorAll('.btn-remove-par').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.espejo-par').remove();
            });
        });

        document.getElementById('btnCancel').addEventListener('click', () => modalOverlay.remove());
        
        document.getElementById('btnSave').addEventListener('click', async () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const semanaId = selectSemana.value;

            if (!lineaId || !terminalId || !semanaId) {
                App.showToast('Completa línea, terminal y tipo de día');
                return;
            }

            // Recopilar todos los pares con su hora de salida
            const pares = [];
            document.querySelectorAll('.espejo-par').forEach(par => {
                const tren = par.querySelector('.espejo-tren').value.trim();
                const espejo = par.querySelector('.espejo-espejo').value.trim();
                const horaSalida = par.querySelector('.espejo-hora-salida').value;
                
                if (tren || espejo || horaSalida) {
                    pares.push({ tren, espejo, horaSalida });
                }
            });

            if (pares.length === 0) {
                App.showToast('Agrega al menos un par Tren-Espejo');
                return;
            }

            let espejosData = DB.load('espejos');

            if (editId) {
                const idx = espejosData.findIndex(e => e.id === editId);
                if (idx !== -1) {
                    espejosData[idx] = { ...espejosData[idx], lineaId, terminalId, semanaId, pares };
                }
            } else {
                espejosData.push({
                    id: DB.generateId(),
                    lineaId,
                    terminalId,
                    semanaId,
                    pares,
                    createdAt: Date.now()
                });
            }

            await DB_FIREBASE.sync('espejos', espejosData);

            modalOverlay.remove();
            App.showToast(editId ? 'Espejo actualizado' : 'Espejo guardado');

            await this.init();
        });
    },

    crearHTMLPar(par, idx) {
        return `
            <div class="espejo-par" style="background:var(--bg-soft);padding:10px;border-radius:6px;margin-bottom:8px;position:relative;">
                <button class="btn-remove-par" style="position:absolute;top:6px;right:6px;background:#ff4444;color:white;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:14px;">×</button>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <div style="flex:1;min-width:70px;">
                        <label style="display:block;font-size:11px;font-weight:600;color:var(--text-soft);margin-bottom:4px;">Tren</label>
                        <input type="text" class="espejo-tren" value="${par ? par.tren || '' : ''}" placeholder="N°" style="width:100%;padding:6px;border:1px solid var(--bg);border-radius:4px;font-size:13px;box-sizing:border-box;">
                    </div>
                    <div style="flex:1;min-width:70px;">
                        <label style="display:block;font-size:11px;font-weight:600;color:var(--text-soft);margin-bottom:4px;">Espejo</label>
                        <input type="text" class="espejo-espejo" value="${par ? par.espejo || '' : ''}" placeholder="N°" style="width:100%;padding:6px;border:1px solid var(--bg);border-radius:4px;font-size:13px;box-sizing:border-box;">
                    </div>
                    <div style="flex:1;min-width:80px;">
                        <label style="display:block;font-size:11px;font-weight:600;color:var(--text-soft);margin-bottom:4px;">H. Salida</label>
                        <input type="time" class="espejo-hora-salida" value="${par ? par.horaSalida || '' : ''}" style="width:100%;padding:6px;border:1px solid var(--bg);border-radius:4px;font-size:13px;box-sizing:border-box;">
                    </div>
                </div>
            </div>
        `;
    },

    agregarPar() {
        const container = document.getElementById('espejoPares');
        const parIndex = container.querySelectorAll('.espejo-par').length;
        const parHTML = this.crearHTMLPar({ tren: '', espejo: '', horaSalida: '' }, parIndex);
        
        container.insertAdjacentHTML('beforeend', parHTML);
        
        const nuevoPar = container.lastElementChild;
        const btnRemove = nuevoPar.querySelector('.btn-remove-par');
        
        if (btnRemove) {
            btnRemove.addEventListener('click', () => {
                btnRemove.closest('.espejo-par').remove();
            });
        }
    },

    async eliminar(id) {
        if (!confirm('¿Eliminar este espejo?')) return;

        let espejosData = DB.load('espejos').filter(e => e.id !== id);

        await DB_FIREBASE.sync('espejos', espejosData);

        App.showToast('Espejo eliminado');

        await this.init();
    }
};

export default Espejo;