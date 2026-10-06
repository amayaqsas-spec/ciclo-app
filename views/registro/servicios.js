// ============================================
// SERVICIOS.JS - Diseño Simple y Funcional
// ============================================

const Servicios = {
    render() {
        const servicios = DB.load('servicios');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        return `
            <div class="view active">
                <div style="padding:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <h2 style="margin:0;font-size:22px;">Servicios</h2>
                        <button id="btnAddServicio" style="background:var(--primary);color:white;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
                            + Nuevo
                        </button>
                    </div>

                    ${servicios.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:var(--text-soft);">
                            <p>No hay servicios registrados</p>
                        </div>
                    ` : `
                        <div style="display:flex;flex-direction:column;gap:16px;">
                            ${servicios.map(s => {
                                const linea = lineas.find(l => l.id === s.lineaId);
                                const terminal = terminales.find(t => t.id === s.terminalId);
                                const semana = semanas.find(w => w.id === s.semanaId);
                                const trenes = s.trenes || [];
                                const haceGarage = s.garage === true || s.garage === 'Si' || s.garage === 'Sí';

                                return `
                                    <div style="background:var(--surface);padding:16px;border-radius:12px;box-shadow:var(--clay-shadow-sm);">
                                        <div style="font-size:18px;font-weight:700;color:var(--primary);margin-bottom:12px;">
                                            Servicio #${s.nombre || 'N/A'} ${haceGarage ? '✓' : ''}
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

                                        ${trenes.length > 0 ? `
                                            <div style="margin-bottom:12px;">
                                                <strong style="font-size:13px;">Trenes:</strong>
                                                ${trenes.map((tren, idx) => `
                                                    <div style="background:var(--bg-soft);padding:8px;border-radius:6px;margin-top:6px;font-size:13px;">
                                                        <div><strong>Tren #${tren.numero || idx + 1}</strong> ${tren.garage ? '(Garage)' : ''}</div>
                                                        <div>Salida: ${tren.salida || '--:--'} | Llegada: ${tren.llegada || '--:--'}</div>
                                                        ${tren.vueltas ? `<div>Vueltas: ${tren.vueltas}</div>` : ''}
                                                    </div>
                                                `).join('')}
                                            </div>
                                        ` : ''}

                                        ${(s.descansoInicio || s.descansoFinal) ? `
                                            <div style="font-size:13px;margin-bottom:12px;color:#E65100;">
                                                <strong>Descanso:</strong> ${s.descansoInicio || '--:--'} → ${s.descansoFinal || '--:--'}
                                            </div>
                                        ` : ''}

                                        <div style="display:flex;gap:8px;margin-top:12px;">
                                            <button class="btn-edit-servicio" data-id="${s.id}" style="flex:1;background:var(--bg-soft);color:var(--primary);border:none;padding:8px;border-radius:6px;font-weight:600;cursor:pointer;">
                                                Editar
                                            </button>
                                            <button class="btn-delete-servicio" data-id="${s.id}" style="flex:1;background:#ff4444;color:white;border:none;padding:8px;border-radius:6px;font-weight:600;cursor:pointer;">
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
        await DB_FIREBASE.load('servicios');
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');
        await DB_FIREBASE.load('semanas');

        const container = document.getElementById('viewContainer');
        container.innerHTML = this.render();

        document.getElementById('btnAddServicio')?.addEventListener('click', () => this.openModal());

        document.querySelectorAll('.btn-edit-servicio').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });

        document.querySelectorAll('.btn-delete-servicio').forEach(btn => {
            btn.addEventListener('click', () => this.eliminar(btn.dataset.id));
        });
    },

    async openModal(editId = null) {
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');
        await DB_FIREBASE.load('semanas');

        const servicios = DB.load('servicios');
        const data = editId ? servicios.find(s => s.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const haceGarage = data ? (data.garage === true || data.garage === 'Si' || data.garage === 'Sí') : false;

        const modalOverlay = App.showModal(`
            <div style="background:var(--surface);padding:20px;border-radius:12px;max-width:90%;width:400px;">
                <h3 style="margin:0 0 16px 0;">${editId ? 'Editar' : 'Nuevo'} Servicio</h3>
                
                <div style="margin-bottom:12px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Línea *</label>
                    <select id="servicioLinea" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">${lineaOptions}</select>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Terminal *</label>
                    <select id="servicioTerminal" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">
                        <option value="">Selecciona línea primero</option>
                    </select>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Tipo de Día *</label>
                    <select id="servicioSemana" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">
                        <option value="">Selecciona línea y terminal primero</option>
                    </select>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Número de Servicio *</label>
                    <input type="text" id="servicioNombre" value="${data ? data.nombre : ''}" placeholder="Ej. 1234" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">
                </div>

                <div style="margin-bottom:12px;">
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                        <input type="checkbox" id="servicioGarage" ${haceGarage ? 'checked' : ''}>
                        <span style="font-size:13px;">Hace Garage</span>
                    </label>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Trenes</label>
                    <div id="trenesContainer">
                        ${this.renderTrenesForm(data ? data.trenes : [])}
                    </div>
                    <button id="btnAddTren" style="width:100%;padding:8px;background:var(--bg-soft);border:2px dashed var(--primary-soft);border-radius:6px;color:var(--primary);font-weight:600;cursor:pointer;margin-top:8px;">
                        + Agregar Tren
                    </button>
                </div>

                <div style="display:flex;gap:8px;margin-bottom:16px;">
                    <div style="flex:1;">
                        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Inicio Descanso</label>
                        <input type="time" id="servicioDescansoInicio" value="${data ? data.descansoInicio : ''}" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">
                    </div>
                    <div style="flex:1;">
                        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Final Descanso</label>
                        <input type="time" id="servicioDescansoFinal" value="${data ? data.descansoFinal : ''}" style="width:100%;padding:8px;border:1px solid var(--bg-soft);border-radius:6px;">
                    </div>
                </div>

                <div style="display:flex;gap:8px;">
                    <button id="btnCancel" style="flex:1;padding:10px;background:var(--bg-soft);border:none;border-radius:6px;font-weight:600;cursor:pointer;">Cancelar</button>
                    <button id="btnSave" style="flex:1;padding:10px;background:var(--primary);color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;">${editId ? 'Actualizar' : 'Guardar'}</button>
                </div>
            </div>
        `);

        const selectLinea = document.getElementById('servicioLinea');
        const selectTerminal = document.getElementById('servicioTerminal');
        const selectSemana = document.getElementById('servicioSemana');

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

        document.getElementById('btnAddTren').addEventListener('click', () => this.addTrenField());

        document.querySelectorAll('.btn-remove-tren').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.parentElement.remove();
            });
        });

        document.getElementById('btnCancel').addEventListener('click', () => modalOverlay.remove());
        
        document.getElementById('btnSave').addEventListener('click', async () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const semanaId = selectSemana.value;
            const nombre = document.getElementById('servicioNombre').value.trim();
            const garage = document.getElementById('servicioGarage').checked;
            const descansoInicio = document.getElementById('servicioDescansoInicio').value;
            const descansoFinal = document.getElementById('servicioDescansoFinal').value;

            if (!lineaId || !terminalId || !semanaId || !nombre) {
                App.showToast('Completa los campos obligatorios');
                return;
            }

            const trenes = this.getTrenesFromForm();

            let serviciosData = DB.load('servicios');

            if (editId) {
                const idx = serviciosData.findIndex(s => s.id === editId);
                if (idx !== -1) {
                    serviciosData[idx] = { 
                        ...serviciosData[idx], 
                        lineaId, terminalId, semanaId, nombre, garage, trenes, descansoInicio, descansoFinal
                    };
                }
            } else {
                serviciosData.push({
                    id: DB.generateId(),
                    lineaId, terminalId, semanaId, nombre, garage, trenes, descansoInicio, descansoFinal,
                    createdAt: Date.now()
                });
            }

            await DB_FIREBASE.sync('servicios', serviciosData);

            modalOverlay.remove();
            App.showToast(editId ? 'Servicio actualizado' : 'Servicio guardado');

            await this.init();
        });
    },

    renderTrenesForm(trenes) {
        if (!trenes || trenes.length === 0) {
            return '<p style="color:var(--text-soft);font-size:13px;text-align:center;padding:12px;">No hay trenes. Agrega uno.</p>';
        }
        return trenes.map((tren, idx) => this.crearHTMLTren(tren, idx)).join('');
    },

    crearHTMLTren(tren, idx) {
        const tieneGarage = tren && tren.garage;
        return `
            <div class="tren-item" style="background:var(--bg-soft);padding:10px;border-radius:6px;margin-bottom:8px;position:relative;">
                <button class="btn-remove-tren" style="position:absolute;top:6px;right:6px;background:#ff4444;color:white;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:14px;">×</button>
                <div style="display:flex;gap:8px;margin-bottom:6px;">
                    <input type="text" class="tren-numero" value="${tren ? tren.numero || '' : ''}" placeholder="N° Tren" style="flex:1;padding:6px;border:1px solid var(--bg);border-radius:4px;font-size:13px;">
                    <input type="number" class="tren-vueltas" value="${tren ? tren.vueltas || '' : ''}" placeholder="Vueltas" min="1" style="width:70px;padding:6px;border:1px solid var(--bg);border-radius:4px;font-size:13px;">
                </div>
                <div style="display:flex;gap:8px;margin-bottom:6px;">
                    <input type="time" class="tren-salida" value="${tren ? tren.salida || '' : ''}" style="flex:1;padding:6px;border:1px solid var(--bg);border-radius:4px;font-size:13px;">
                    <input type="time" class="tren-llegada" value="${tren ? tren.llegada || '' : ''}" style="flex:1;padding:6px;border:1px solid var(--bg);border-radius:4px;font-size:13px;">
                </div>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
                    <input type="checkbox" class="tren-garage-checkbox" ${tieneGarage ? 'checked' : ''}>
                    Hace Garage
                </label>
            </div>
        `;
    },

    addTrenField() {
        const container = document.getElementById('trenesContainer');
        const mensajeVacio = container.querySelector('p');
        if (mensajeVacio) mensajeVacio.remove();
        
        const trenIndex = container.querySelectorAll('.tren-item').length;
        const trenHTML = this.crearHTMLTren(null, trenIndex);
        
        container.insertAdjacentHTML('beforeend', trenHTML);
        
        const nuevoTren = container.lastElementChild;
        const btnRemove = nuevoTren.querySelector('.btn-remove-tren');
        
        if (btnRemove) {
            btnRemove.addEventListener('click', () => {
                btnRemove.parentElement.remove();
            });
        }
    },

    getTrenesFromForm() {
        const trenes = [];
        const trenItems = document.querySelectorAll('.tren-item');
        
        trenItems.forEach(item => {
            const numero = item.querySelector('.tren-numero').value.trim();
            const vueltas = item.querySelector('.tren-vueltas').value.trim();
            const salida = item.querySelector('.tren-salida').value;
            const llegada = item.querySelector('.tren-llegada').value;
            const garageCheckbox = item.querySelector('.tren-garage-checkbox');
            const garage = garageCheckbox ? garageCheckbox.checked : false;
            
            if (numero || salida || llegada) {
                trenes.push({ numero, vueltas: vueltas ? parseInt(vueltas) : 1, salida, llegada, garage });
            }
        });
        
        return trenes;
    },

    async eliminar(id) {
        if (!confirm('¿Eliminar este servicio?')) return;

        let serviciosData = DB.load('servicios').filter(s => s.id !== id);

        await DB_FIREBASE.sync('servicios', serviciosData);

        App.showToast('Servicio eliminado');

        await this.init();
    }
};

export default Servicios;