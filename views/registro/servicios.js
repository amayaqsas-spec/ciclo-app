// ============================================
// REGISTRO/SERVICIOS.JS - Módulo de Servicios
// ============================================

const Servicios = {
    render() {
        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                        Servicios
                    </h2>
                    <button class="btn-add" id="btnAddServicio">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nuevo
                    </button>
                </div>
                <div id="servicioList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddServicio').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('servicios').find(s => s.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        if (lineas.length === 0) {
            App.showToast('Primero debes registrar una línea');
            return;
        }

        const lineaOptions = lineas.map(l => 
            `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`
        ).join('');

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Servicio</h3>
            <div class="input-group">
                <label>Línea</label>
                <select id="servicioLinea">
                    ${lineaOptions}
                </select>
            </div>
            <div class="input-group">
                <label>Terminal</label>
                <select id="servicioTerminal">
                    <option value="">Selecciona una línea primero</option>
                </select>
            </div>
            <div class="input-group">
                <label>Turno</label>
                <select id="servicioTurno">
                    <option value="">Selecciona terminal primero</option>
                </select>
            </div>
            <div class="input-group">
                <label>Semana</label>
                <select id="servicioSemana">
                    <option value="">Selecciona línea y terminal primero</option>
                </select>
            </div>
            <div class="input-group">
                <label>Servicio</label>
                <input type="text" id="servicioNombre" value="${data ? data.nombre : ''}" placeholder="Ej: Servicio Express">
            </div>
            
            <h4 style="margin:12px 0 8px;color:var(--text);font-size:13px;">Primer Tren</h4>
            <div class="input-group">
                <label>Número de Tren</label>
                <input type="text" id="tren1Numero" value="${data && data.trenes && data.trenes[0] ? data.trenes[0].numero : ''}" placeholder="Ej: 1, 12, 15...">
            </div>
            <div class="input-group">
                <label>Hora de Salida</label>
                <input type="time" id="tren1Salida" value="${data && data.trenes && data.trenes[0] ? data.trenes[0].salida : ''}">
            </div>
            <div class="input-group">
                <label>Hora de Llegada</label>
                <input type="time" id="tren1Llegada" value="${data && data.trenes && data.trenes[0] ? data.trenes[0].llegada : ''}">
            </div>

            <h4 style="margin:12px 0 8px;color:var(--text);font-size:13px;">Segundo Tren</h4>
            <div class="input-group">
                <label>Número de Tren</label>
                <input type="text" id="tren2Numero" value="${data && data.trenes && data.trenes[1] ? data.trenes[1].numero : ''}" placeholder="Ej: 1, 12, 15...">
            </div>
            <div class="input-group">
                <label>Hora de Salida</label>
                <input type="time" id="tren2Salida" value="${data && data.trenes && data.trenes[1] ? data.trenes[1].salida : ''}">
            </div>
            <div class="input-group">
                <label>Hora de Llegada</label>
                <input type="time" id="tren2Llegada" value="${data && data.trenes && data.trenes[1] ? data.trenes[1].llegada : ''}">
            </div>

            <div id="trenesAdicionales"></div>
            
            <button class="btn-secondary" id="btnAgregarTren" style="margin-top:10px;width:100%;">
                + Agregar otro tren
            </button>

            <h4 style="margin:12px 0 8px;color:var(--text);font-size:13px;">Descanso</h4>
            <div class="input-group">
                <label>Inicio de Descanso</label>
                <input type="time" id="descansoInicio" value="${data ? data.descansoInicio : ''}">
            </div>
            <div class="input-group">
                <label>Final de Descanso</label>
                <input type="time" id="descansoFinal" value="${data ? data.descansoFinal : ''}">
            </div>

            <div class="input-group">
                <label style="display:flex;align-items:center;gap:8px;">
                    <input type="checkbox" id="haceGarage" ${data && data.haceGarage ? 'checked' : ''}>
                    Hace Garage
                </label>
            </div>

            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        const selectLinea = document.getElementById('servicioLinea');
        const selectTerminal = document.getElementById('servicioTerminal');
        const selectTurno = document.getElementById('servicioTurno');
        const selectSemana = document.getElementById('servicioSemana');

        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const terminalesFiltradas = terminales.filter(t => t.lineaId === lineaId);
            
            selectTerminal.innerHTML = terminalesFiltradas.length === 0 
                ? '<option value="">No hay terminales</option>'
                : terminalesFiltradas.map(t => 
                    `<option value="${t.id}" ${data && data.terminalId === t.id ? 'selected' : ''}>${t.nombre}</option>`
                ).join('');
            
            updateSemanas();
        };

        const updateSemanas = () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const semanasFiltradas = semanas.filter(s => s.lineaId === lineaId && s.terminalId === terminalId);
            
            selectSemana.innerHTML = semanasFiltradas.length === 0
                ? '<option value="">No hay semanas</option>'
                : semanasFiltradas.map(s => 
                    `<option value="${s.id}" ${data && data.semanaId === s.id ? 'selected' : ''}>${s.tipo}</option>`
                ).join('');
        };

        const updateTurnos = () => {
            const terminalId = selectTerminal.value;
            const terminal = terminales.find(t => t.id === terminalId);
            
            if (terminal) {
                selectTurno.innerHTML = `<option value="${terminal.turno}" ${data && data.turno === terminal.turno ? 'selected' : ''}>${terminal.turno}</option>`;
            } else {
                selectTurno.innerHTML = '<option value="">Selecciona terminal primero</option>';
            }
        };

        selectLinea.addEventListener('change', updateTerminales);
        selectTerminal.addEventListener('change', () => { updateSemanas(); updateTurnos(); });
        
        updateTerminales();
        updateTurnos();

        // Trenes adicionales
        let trenesExtra = data && data.trenes ? data.trenes.slice(2) : [];
        const contenedorTrenes = document.getElementById('trenesAdicionales');

        const renderTrenesExtra = () => {
            contenedorTrenes.innerHTML = trenesExtra.map((tren, idx) => `
                <h4 style="margin:12px 0 8px;color:var(--text);font-size:13px;">Tren Adicional ${idx + 1}</h4>
                <div class="input-group">
                    <label>Número de Tren</label>
                    <input type="text" class="tren-extra-numero" value="${tren.numero || ''}" placeholder="Ej: 1, 12, 15...">
                </div>
                <div class="input-group">
                    <label>Hora de Salida</label>
                    <input type="time" class="tren-extra-salida" value="${tren.salida || ''}">
                </div>
                <div class="input-group">
                    <label>Hora de Llegada</label>
                    <input type="time" class="tren-extra-llegada" value="${tren.llegada || ''}">
                </div>
            `).join('');
        };

        renderTrenesExtra();

        document.getElementById('btnAgregarTren').addEventListener('click', () => {
            trenesExtra.push({ numero: '', salida: '', llegada: '' });
            renderTrenesExtra();
        });

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const lineaId = document.getElementById('servicioLinea').value;
            const terminalId = document.getElementById('servicioTerminal').value;
            const turno = document.getElementById('servicioTurno').value;
            const semanaId = document.getElementById('servicioSemana').value;
            const nombre = document.getElementById('servicioNombre').value.trim();
            const tren1Numero = document.getElementById('tren1Numero').value.trim();
            const tren1Salida = document.getElementById('tren1Salida').value;
            const tren1Llegada = document.getElementById('tren1Llegada').value;
            const tren2Numero = document.getElementById('tren2Numero').value.trim();
            const tren2Salida = document.getElementById('tren2Salida').value;
            const tren2Llegada = document.getElementById('tren2Llegada').value;
            const descansoInicio = document.getElementById('descansoInicio').value;
            const descansoFinal = document.getElementById('descansoFinal').value;
            const haceGarage = document.getElementById('haceGarage').checked;

            if (!nombre) {
                App.showToast('El nombre del servicio es obligatorio');
                return;
            }

            const trenes = [
                { numero: tren1Numero, salida: tren1Salida, llegada: tren1Llegada },
                { numero: tren2Numero, salida: tren2Salida, llegada: tren2Llegada }
            ];

            // Agregar trenes extra
            const numerosExtra = contenedorTrenes.querySelectorAll('.tren-extra-numero');
            const salidasExtra = contenedorTrenes.querySelectorAll('.tren-extra-salida');
            const llegadasExtra = contenedorTrenes.querySelectorAll('.tren-extra-llegada');
            
            salidasExtra.forEach((salida, idx) => {
                trenes.push({
                    numero: numerosExtra[idx] ? numerosExtra[idx].value : '',
                    salida: salida.value,
                    llegada: llegadasExtra[idx].value
                });
            });

            let servicios = DB.load('servicios');

            if (editId) {
                const idx = servicios.findIndex(s => s.id === editId);
                if (idx !== -1) {
                    servicios[idx] = { 
                        ...servicios[idx], 
                        lineaId, terminalId, turno, semanaId, nombre, 
                        trenes, descansoInicio, descansoFinal, haceGarage 
                    };
                }
            } else {
                servicios.push({
                    id: DB.generateId(),
                    lineaId, terminalId, turno, semanaId, nombre,
                    trenes, descansoInicio, descansoFinal, haceGarage,
                    createdAt: Date.now()
                });
            }

            DB.save('servicios', servicios);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Servicio actualizado' : 'Servicio guardado');
        });
    },

    renderList() {
        const list = document.getElementById('servicioList');
        const data = DB.load('servicios').sort((a, b) => b.createdAt - a.createdAt);
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        if (data.length === 0) {
            list.innerHTML = `<div class="aviso-empty"><svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg><p>No hay servicios registrados</p></div>`;
            return;
        }

        list.innerHTML = data.map(item => {
            const linea = lineas.find(l => l.id === item.lineaId);
            const terminal = terminales.find(t => t.id === item.terminalId);
            const semana = semanas.find(s => s.id === item.semanaId);
            
            const trenesInfo = item.trenes 
                ? item.trenes.map(t => `Tren #${t.numero || '-'}: ${t.salida || '-'} - ${t.llegada || '-'}`).join(' | ')
                : '';
            
            return `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">${item.nombre}</div>
                    </div>
                    <div class="item-meta">
                        <span class="item-tag">Línea: ${linea ? linea.nombre : 'N/A'}</span>
                        <span class="item-tag">Terminal: ${terminal ? terminal.nombre : 'N/A'}</span>
                        <span class="item-tag">Semana: ${semana ? semana.tipo : 'N/A'}</span>
                        <span class="item-tag">Turno: ${item.turno}</span>
                    </div>
                    <div class="item-meta">
                        <span class="item-tag">${trenesInfo}</span>
                    </div>
                    <div class="item-meta">
                        <span class="item-tag">Descanso: ${item.descansoInicio || '-'} - ${item.descansoFinal || '-'}</span>
                        <span class="item-tag">Garage: ${item.haceGarage ? 'Sí' : 'No'}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" data-id="${item.id}">Editar</button>
                        <button class="btn-remove" data-id="${item.id}">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });
        list.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar este servicio?')) {
                    let data = DB.load('servicios').filter(s => s.id !== btn.dataset.id);
                    DB.save('servicios', data);
                    this.renderList();
                    App.showToast('Servicio eliminado');
                }
            });
        });
    }
};

export default Servicios;