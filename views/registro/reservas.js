// ============================================
// RESERVAS.JS - Módulo de Registro de Reservas
// ============================================

const Reservas = {
    render() {
        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        Reservas
                    </h2>
                    <button class="btn-add" id="btnAddReserva">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nuevo
                    </button>
                </div>
                <div id="reservaList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddReserva').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('reservas').find(r => r.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nueva'} Reserva</h3>
            <div style="max-height: 65vh; overflow-y: auto; padding: 5px;">
                <div class="input-group">
                    <label>Línea</label>
                    <select id="reservaLinea">${lineaOptions}</select>
                </div>
                <div class="input-group">
                    <label>Terminal</label>
                    <select id="reservaTerminal">
                        <option value="">Selecciona línea primero</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Tipo de Día</label>
                    <select id="reservaSemana">
                        <option value="">Selecciona línea primero</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Tipo de Reserva</label>
                    <input type="text" id="reservaTipo" value="${data ? data.tipo : ''}" placeholder="Ej. MA, CA, RA, CC">
                </div>
                <div style="display: flex; gap: 10px;">
                    <div class="input-group" style="flex: 1;">
                        <label>Hora Entrada</label>
                        <input type="time" id="reservaEntrada" value="${data ? data.entrada : ''}">
                    </div>
                    <div class="input-group" style="flex: 1;">
                        <label>Hora Salida</label>
                        <input type="time" id="reservaSalida" value="${data ? data.salida : ''}">
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        const selectLinea = document.getElementById('reservaLinea');
        const selectTerminal = document.getElementById('reservaTerminal');
        const selectSemana = document.getElementById('reservaSemana');

        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const terminalesFiltradas = terminales.filter(t => t.lineaId === lineaId);
            selectTerminal.innerHTML = terminalesFiltradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + terminalesFiltradas.map(t => 
                    `<option value="${t.id}" ${data && data.terminalId === t.id ? 'selected' : ''}>${t.nombre} - ${t.turno}</option>`
                ).join('');
            
            updateSemanas();
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

        selectLinea.addEventListener('change', updateTerminales);
        updateTerminales();

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const semanaId = selectSemana.value;
            const tipo = document.getElementById('reservaTipo').value.trim();
            const entrada = document.getElementById('reservaEntrada').value;
            const salida = document.getElementById('reservaSalida').value;

            if (!lineaId || !terminalId || !semanaId || !tipo) {
                App.showToast('Completa todos los campos obligatorios');
                return;
            }

            let reservas = DB.load('reservas');

            if (editId) {
                const idx = reservas.findIndex(r => r.id === editId);
                if (idx !== -1) {
                    reservas[idx] = { ...reservas[idx], lineaId, terminalId, semanaId, tipo, entrada, salida };
                }
            } else {
                reservas.push({
                    id: DB.generateId(),
                    lineaId,
                    terminalId,
                    semanaId,
                    tipo,
                    entrada: entrada || '',
                    salida: salida || '',
                    createdAt: Date.now()
                });
            }

            DB.save('reservas', reservas);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Reserva actualizada' : 'Reserva guardada');
        });
    },

    renderList() {
        const list = document.getElementById('reservaList');
        const reservas = DB.load('reservas');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        if (reservas.length === 0) {
            list.innerHTML = `
                <div class="aviso-empty">
                    <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p>No hay reservas registradas</p>
                </div>
            `;
            return;
        }

        list.innerHTML = reservas.map(r => {
            const linea = lineas.find(l => l.id === r.lineaId);
            const terminal = terminales.find(t => t.id === r.terminalId);
            const semana = semanas.find(s => s.id === r.semanaId);
            return `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">${r.tipo}</div>
                        <div class="item-date">${linea ? linea.nombre : 'Sin línea'}</div>
                    </div>
                    <div class="item-meta">
                        <span class="item-tag">📍 ${terminal ? terminal.nombre : 'Sin terminal'}</span>
                        <span class="item-tag"> ${semana ? semana.tipo : 'Sin día'}</span>
                    </div>
                    <div class="item-meta" style="margin-top:6px;">
                        <span class="item-tag"> Entrada: ${r.entrada || '--:--'}</span>
                        <span class="item-tag">🕐 Salida: ${r.salida || '--:--'}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" data-id="${r.id}">Editar</button>
                        <button class="btn-remove" data-id="${r.id}">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });
        list.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar esta reserva?')) {
                    let data = DB.load('reservas').filter(r => r.id !== btn.dataset.id);
                    DB.save('reservas', data);
                    this.renderList();
                    App.showToast('Reserva eliminada');
                }
            });
        });
    }
};

export default Reservas;