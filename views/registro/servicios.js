// ============================================
// SERVICIOS.JS - Módulo de Registro de Servicios
// ============================================

const Servicios = {
    render() {
        const servicios = DB.load('servicios');

        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
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

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const haceGarage = data ? (data.garage === true || data.garage === 'Si' || data.garage === 'Sí') : false;

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Servicio</h3>
            <div class="modal-scroll-content">
                <div class="input-group">
                    <label>Línea</label>
                    <select id="servicioLinea">${lineaOptions}</select>
                </div>
                <div class="input-group">
                    <label>Terminal</label>
                    <select id="servicioTerminal">
                        <option value="">Selecciona línea primero</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Día</label>
                    <select id="servicioSemana">
                        <option value="">Selecciona línea primero</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Nombre del Servicio (Número)</label>
                    <input type="text" id="servicioNombre" value="${data ? data.nombre : ''}" placeholder="Ej. 1234">
                </div>
                
                <!-- Checkbox de Garage: texto al centro, checkbox a la derecha -->
                <div class="input-group">
                    <div class="garage-row">
                        <label class="garage-label">Hace Garage</label>
                        <label class="garage-checkbox">
                            <input type="checkbox" id="servicioGarage" ${haceGarage ? 'checked' : ''}>
                            <span class="garage-checkmark"></span>
                        </label>
                    </div>
                </div>

                <!-- TRENES -->
                <div class="trenes-section">
                    <h4 style="margin-bottom:12px;font-size:14px;color:var(--text);">Trenes</h4>
                    <div id="trenesContainer">
                        ${this.renderTrenesForm(data ? data.trenes : [])}
                    </div>
                    <button class="btn-add-tren" id="btnAddTren" style="margin-top:10px;width:100%;padding:10px;background:var(--bg-soft);border:2px dashed var(--primary-soft);border-radius:var(--radius-xs);color:var(--primary);cursor:pointer;font-weight:600;">
                        + Agregar Tren
                    </button>
                </div>

                <!-- DESCANSO -->
                <div class="input-row" style="margin-top:16px;">
                    <div class="input-group" style="flex:1;">
                        <label>Inicio de Descanso</label>
                        <input type="time" id="servicioDescansoInicio" value="${data ? data.descansoInicio : ''}">
                    </div>
                    <div class="input-group" style="flex:1;">
                        <label>Final de Descanso</label>
                        <input type="time" id="servicioDescansoFinal" value="${data ? data.descansoFinal : ''}">
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        const selectLinea = document.getElementById('servicioLinea');
        const selectTerminal = document.getElementById('servicioTerminal');
        const selectSemana = document.getElementById('servicioSemana');

        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const terminalesFiltradas = terminales.filter(t => t.lineaId === lineaId);
            selectTerminal.innerHTML = terminalesFiltradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + terminalesFiltradas.map(t => 
                    `<option value="${t.id}" ${data && data.terminalId === t.id ? 'selected' : ''}>${t.nombre} - ${t.turno}</option>`
                ).join('');
        };

        const updateSemanas = () => {
            const lineaId = selectLinea.value;
            const semanasFiltradas = semanas.filter(s => s.lineaId === lineaId);
            selectSemana.innerHTML = semanasFiltradas.length === 0
                ? '<option value="">No hay días</option>'
                : '<option value="">Selecciona tipo de día</option>' + semanasFiltradas.map(s => 
                    `<option value="${s.id}" ${data && data.semanaId === s.id ? 'selected' : ''}>${s.tipo}</option>`
                ).join('');
        };

        selectLinea.addEventListener('change', () => {
            updateTerminales();
            updateSemanas();
        });
        updateTerminales();
        updateSemanas();

        // Agregar tren
        document.getElementById('btnAddTren').addEventListener('click', () => {
            this.addTrenField();
        });

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
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

            // Obtener trenes
            const trenes = this.getTrenesFromForm();

            let servicios = DB.load('servicios');

            if (editId) {
                const idx = servicios.findIndex(s => s.id === editId);
                if (idx !== -1) {
                    servicios[idx] = { 
                        ...servicios[idx], 
                        lineaId, 
                        terminalId, 
                        semanaId, 
                        nombre, 
                        garage,
                        trenes,
                        descansoInicio,
                        descansoFinal
                    };
                }
            } else {
                servicios.push({
                    id: DB.generateId(),
                    lineaId,
                    terminalId,
                    semanaId,
                    nombre,
                    garage,
                    trenes,
                    descansoInicio,
                    descansoFinal,
                    createdAt: Date.now()
                });
            }

            DB.save('servicios', servicios);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Servicio actualizado' : 'Servicio guardado');
        });
    },

    renderTrenesForm(trenes) {
        if (trenes.length === 0) {
            return '<p style="color:var(--text-soft);font-size:13px;text-align:center;padding:20px;">No hay trenes registrados. Agrega al menos uno.</p>';
        }

        return trenes.map((tren, idx) => `
            <div class="tren-item" style="background:var(--bg-soft);padding:12px;border-radius:var(--radius-xs);margin-bottom:10px;position:relative;">
                <button class="btn-remove-tren" data-idx="${idx}" style="position:absolute;top:8px;right:8px;background:#ff4444;color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:12px;">×</button>
                <div class="input-row">
                    <div class="input-group" style="flex:1;">
                        <label>Número de Tren</label>
                        <input type="text" class="tren-numero" value="${tren.numero || tren.tren || ''}" placeholder="Ej. 1">
                    </div>
                    <div class="input-group" style="flex:1;">
                        <label>Hora de Salida</label>
                        <input type="time" class="tren-salida" value="${tren.salida || ''}">
                    </div>
                </div>
                <div class="input-group">
                    <label>Hora de Llegada</label>
                    <input type="time" class="tren-llegada" value="${tren.llegada || ''}">
                </div>
            </div>
        `).join('');
    },

    addTrenField() {
        const container = document.getElementById('trenesContainer');
        const trenIndex = container.querySelectorAll('.tren-item').length;
        
        const trenHTML = `
            <div class="tren-item" style="background:var(--bg-soft);padding:12px;border-radius:var(--radius-xs);margin-bottom:10px;position:relative;">
                <button class="btn-remove-tren" data-idx="${trenIndex}" style="position:absolute;top:8px;right:8px;background:#ff4444;color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:12px;">×</button>
                <div class="input-row">
                    <div class="input-group" style="flex:1;">
                        <label>Número de Tren</label>
                        <input type="text" class="tren-numero" placeholder="Ej. 1">
                    </div>
                    <div class="input-group" style="flex:1;">
                        <label>Hora de Salida</label>
                        <input type="time" class="tren-salida">
                    </div>
                </div>
                <div class="input-group">
                    <label>Hora de Llegada</label>
                    <input type="time" class="tren-llegada">
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', trenHTML);
        
        // Agregar evento al botón de eliminar
        const btnRemove = container.querySelector(`.btn-remove-tren[data-idx="${trenIndex}"]`);
        btnRemove.addEventListener('click', () => {
            btnRemove.parentElement.remove();
        });
    },

    getTrenesFromForm() {
        const trenes = [];
        const trenItems = document.querySelectorAll('.tren-item');
        
        trenItems.forEach(item => {
            const numero = item.querySelector('.tren-numero').value.trim();
            const salida = item.querySelector('.tren-salida').value;
            const llegada = item.querySelector('.tren-llegada').value;
            
            if (numero || salida || llegada) {
                trenes.push({
                    numero,
                    salida,
                    llegada
                });
            }
        });
        
        return trenes;
    },

    renderList() {
        const list = document.getElementById('servicioList');
        const servicios = DB.load('servicios');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        if (servicios.length === 0) {
            list.innerHTML = `
                <div class="aviso-empty">
                    <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p>No hay servicios registrados</p>
                </div>
            `;
            return;
        }

        list.innerHTML = servicios.map(s => {
            const linea = lineas.find(l => l.id === s.lineaId);
            const terminal = terminales.find(t => t.id === s.terminalId);
            const semana = semanas.find(w => w.id === s.semanaId);
            const trenesCount = s.trenes ? s.trenes.length : 0;
            
            return `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">Servicio #${s.nombre}</div>
                        <div class="item-date">${s.garage ? 'Con Garage' : 'Sin Garage'}</div>
                    </div>
                    <div class="item-meta">
                        <span class="item-tag">📍 ${linea ? linea.nombre : 'Sin línea'}</span>
                        <span class="item-tag">🚇 ${terminal ? terminal.nombre : 'Sin terminal'}</span>
                        <span class="item-tag">📅 ${semana ? semana.tipo : 'Sin día'}</span>
                    </div>
                    ${trenesCount > 0 ? `<div class="item-desc" style="margin-top:6px;">${trenesCount} tren(es) registrado(s)</div>` : ''}
                    <div class="item-actions">
                        <button class="btn-edit" data-id="${s.id}">Editar</button>
                        <button class="btn-remove" data-id="${s.id}">Eliminar</button>
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