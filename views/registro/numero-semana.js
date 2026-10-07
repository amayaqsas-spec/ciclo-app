// ============================================
// NUMERO-SEMANA.JS - Con botón "Marcar como Actual" para el Admin
// ============================================

const NumeroSemana = {
    render() {
        const numerosSemana = DB.load('numerosSemana');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        // Buscar cuál está marcada como actual en Firebase
        const semanaActualGlobal = DB.get('semanaActualGlobal', null);

        return `
            <div class="view active">
                <div style="padding:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <h2 style="margin:0;font-size:22px;">Número de Semana</h2>
                        <button id="btnAddNumeroSemana" style="background:var(--primary);color:white;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
                            + Nuevo
                        </button>
                    </div>

                    ${numerosSemana.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:var(--text-soft);">
                            <p>No hay números de semana registrados</p>
                        </div>
                    ` : `
                        <div style="display:flex;flex-direction:column;gap:16px;">
                            ${numerosSemana.map(ns => {
                                const linea = lineas.find(l => l.id === ns.lineaId);
                                const terminal = terminales.find(t => t.id === ns.terminalId);
                                const esActual = semanaActualGlobal && 
                                                 semanaActualGlobal.lineaId === ns.lineaId && 
                                                 semanaActualGlobal.terminalId === ns.terminalId &&
                                                 semanaActualGlobal.numero === ns.numero;

                                return `
                                    <div style="background:var(--surface);padding:16px;border-radius:12px;box-shadow:var(--clay-shadow-sm);border: 2px solid ${esActual ? 'var(--primary)' : 'transparent'};">
                                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                            <div style="font-size:18px;font-weight:700;color:var(--primary);">
                                                Semana #${ns.numero}
                                            </div>
                                            ${esActual ? '<span style="background:var(--primary);color:white;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700;">📍 ACTUAL</span>' : ''}
                                        </div>
                                        
                                        <div style="font-size:14px;margin-bottom:8px;">
                                            <strong>Línea:</strong> ${linea ? linea.nombre : 'Sin línea'}
                                        </div>
                                        <div style="font-size:14px;margin-bottom:12px;">
                                            <strong>Terminal:</strong> ${terminal ? terminal.nombre : 'Sin terminal'}
                                        </div>

                                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                            ${Auth.isAdmin ? `
                                                <button class="btn-marcar-actual" data-id="${ns.id}" data-numero="${ns.numero}" data-linea="${ns.lineaId}" data-terminal="${ns.terminalId}" style="flex:1;background:${esActual ? 'var(--primary)' : '#4CAF50'};color:white;border:none;padding:8px;border-radius:6px;font-weight:600;cursor:pointer;font-size:13px;">
                                                    ${esActual ? '✓ Semana Actual' : ' Marcar como Actual'}
                                                </button>
                                            ` : ''}
                                            <button class="btn-edit-numero-semana" data-id="${ns.id}" style="flex:1;background:var(--bg-soft);color:var(--primary);border:none;padding:8px;border-radius:6px;font-weight:600;cursor:pointer;">
                                                Editar
                                            </button>
                                            <button class="btn-delete-numero-semana" data-id="${ns.id}" style="flex:1;background:#ff4444;color:white;border:none;padding:8px;border-radius:6px;font-weight:600;cursor:pointer;">
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
        await DB_FIREBASE.load('numerosSemana');
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');
        await DB_FIREBASE.load('configuracionGlobal'); // ✅ Cargar configuración global

        // Cargar semana actual global desde Firebase
        const configGlobal = DB.load('configuracionGlobal');
        const semanaActualConfig = configGlobal.find(c => c.tipo === 'semanaActual');
        if (semanaActualConfig) {
            DB.set('semanaActualGlobal', semanaActualConfig.valor);
        }

        const container = document.getElementById('viewContainer');
        container.innerHTML = this.render();

        document.getElementById('btnAddNumeroSemana')?.addEventListener('click', () => this.openModal());

        // ✅ Botón "Marcar como Actual" (solo admin)
        document.querySelectorAll('.btn-marcar-actual').forEach(btn => {
            btn.addEventListener('click', async () => {
                const numero = parseInt(btn.dataset.numero);
                const lineaId = btn.dataset.linea;
                const terminalId = btn.dataset.terminal;

                if (!confirm(`¿Marcar la Semana #${numero} como la semana actual para todos los usuarios?`)) return;

                const valorConfig = {
                    tipo: 'semanaActual',
                    numero: numero,
                    lineaId: lineaId,
                    terminalId: terminalId,
                    updatedAt: Date.now()
                };

                // Guardar en localStorage
                DB.set('semanaActualGlobal', valorConfig);

                // ✅ Subir a Firebase para que todos los usuarios lo vean
                let configGlobal = DB.load('configuracionGlobal');
                const idx = configGlobal.findIndex(c => c.tipo === 'semanaActual');
                
                if (idx !== -1) {
                    configGlobal[idx] = valorConfig;
                } else {
                    configGlobal.push(valorConfig);
                }

                await DB_FIREBASE.sync('configuracionGlobal', configGlobal);

                App.showToast(`✅ Semana #${numero} marcada como actual`);
                await this.init();
            });
        });

        document.querySelectorAll('.btn-edit-numero-semana').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });

        document.querySelectorAll('.btn-delete-numero-semana').forEach(btn => {
            btn.addEventListener('click', () => this.eliminar(btn.dataset.id));
        });
    },

    async openModal(editId = null) {
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');

        const numerosSemana = DB.load('numerosSemana');
        const data = editId ? numerosSemana.find(ns => ns.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const semanaOptions = [1, 2, 3, 4, 5].map(n => 
            `<option value="${n}" ${data && data.numero === n ? 'selected' : ''}>Semana ${n}</option>`
        ).join('');

        const modalOverlay = App.showModal(`
            <div style="background:var(--surface);padding:20px;border-radius:12px;max-width:90%;width:400px;">
                <h3 style="margin:0 0 16px 0;">${editId ? 'Editar' : 'Nuevo'} Número de Semana</h3>
                
                <div style="margin-bottom:12px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Línea *</label>
                    <select id="numeroSemanaLinea" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">${lineaOptions}</select>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Terminal *</label>
                    <select id="numeroSemanaTerminal" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">
                        <option value="">Selecciona línea primero</option>
                    </select>
                </div>

                <div style="margin-bottom:16px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Número de Semana *</label>
                    <select id="numeroSemanaNumero" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">
                        ${semanaOptions}
                    </select>
                </div>

                <div style="display:flex;gap:8px;">
                    <button id="btnCancel" style="flex:1;padding:10px;background:var(--bg-soft);border:none;border-radius:6px;font-weight:600;cursor:pointer;">Cancelar</button>
                    <button id="btnSave" style="flex:1;padding:10px;background:var(--primary);color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;">${editId ? 'Actualizar' : 'Guardar'}</button>
                </div>
            </div>
        `);

        const selectLinea = document.getElementById('numeroSemanaLinea');
        const selectTerminal = document.getElementById('numeroSemanaTerminal');

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
            const numero = parseInt(document.getElementById('numeroSemanaNumero').value);

            if (!lineaId || !terminalId || !numero) {
                App.showToast('Completa todos los campos');
                return;
            }

            let numerosSemanaData = DB.load('numerosSemana');

            if (editId) {
                const idx = numerosSemanaData.findIndex(ns => ns.id === editId);
                if (idx !== -1) {
                    numerosSemanaData[idx] = { ...numerosSemanaData[idx], lineaId, terminalId, numero };
                }
            } else {
                numerosSemanaData.push({
                    id: DB.generateId(),
                    lineaId,
                    terminalId,
                    numero,
                    createdAt: Date.now()
                });
            }

            await DB_FIREBASE.sync('numerosSemana', numerosSemanaData);

            modalOverlay.remove();
            App.showToast(editId ? 'Número de semana actualizado' : 'Número de semana guardado');

            await this.init();
        });
    },

    async eliminar(id) {
        if (!confirm('¿Eliminar este número de semana?')) return;

        let numerosSemanaData = DB.load('numerosSemana').filter(ns => ns.id !== id);

        await DB_FIREBASE.sync('numerosSemana', numerosSemanaData);

        App.showToast('Número de semana eliminado');

        await this.init();
    }
};

export default NumeroSemana;