// ============================================
// TURNO.JS - Módulo de Registro de Turnos
// ============================================

const Turno = {
    render() {
        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Turnos
                    </h2>
                    <button class="btn-add" id="btnAddTurno">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nuevo
                    </button>
                </div>
                <div id="turnoList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddTurno').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('turnos').find(t => t.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Turno</h3>
            <div class="modal-scroll-content">
                <div class="input-group">
                    <label>Línea</label>
                    <select id="turnoLinea">${lineaOptions}</select>
                </div>
                <div class="input-group">
                    <label>Terminal</label>
                    <select id="turnoTerminal">
                        <option value="">Selecciona línea primero</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Nombre del Turno</label>
                    <input type="text" id="turnoNombre" value="${data ? data.nombre : ''}" placeholder="Ej. 1er Turno, primer turno, 1">
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        const selectLinea = document.getElementById('turnoLinea');
        const selectTerminal = document.getElementById('turnoTerminal');

        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const terminalesFiltradas = terminales.filter(t => t.lineaId === lineaId);
            selectTerminal.innerHTML = terminalesFiltradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + terminalesFiltradas.map(t => 
                    `<option value="${t.id}" ${data && data.terminalId === t.id ? 'selected' : ''}>${t.nombre}</option>`
                ).join('');
        };

        selectLinea.addEventListener('change', updateTerminales);
        updateTerminales();

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const nombre = document.getElementById('turnoNombre').value.trim();

            if (!lineaId || !terminalId || !nombre) {
                App.showToast('Completa todos los campos');
                return;
            }

            let turnos = DB.load('turnos');

            if (editId) {
                const idx = turnos.findIndex(t => t.id === editId);
                if (idx !== -1) {
                    turnos[idx] = { ...turnos[idx], lineaId, terminalId, nombre };
                }
            } else {
                turnos.push({
                    id: DB.generateId(),
                    lineaId,
                    terminalId,
                    nombre,
                    createdAt: Date.now()
                });
            }

            DB.save('turnos', turnos);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Turno actualizado' : 'Turno guardado');
        });
    },

    renderList() {
        const list = document.getElementById('turnoList');
        const turnos = DB.load('turnos');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        if (turnos.length === 0) {
            list.innerHTML = `
                <div class="aviso-empty">
                    <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p>No hay turnos registrados</p>
                </div>
            `;
            return;
        }

        list.innerHTML = turnos.map(t => {
            const linea = lineas.find(l => l.id === t.lineaId);
            const terminal = terminales.find(term => term.id === t.terminalId);
            return `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">${t.nombre}</div>
                    </div>
                    <div class="item-meta">
                        <span class="item-tag">📍 ${linea ? linea.nombre : 'Sin línea'}</span>
                        <span class="item-tag">🚇 ${terminal ? terminal.nombre : 'Sin terminal'}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" data-id="${t.id}">Editar</button>
                        <button class="btn-remove" data-id="${t.id}">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });
        list.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar este turno?')) {
                    let data = DB.load('turnos').filter(t => t.id !== btn.dataset.id);
                    DB.save('turnos', data);
                    this.renderList();
                    App.showToast('Turno eliminado');
                }
            });
        });
    }
};

export default Turno;