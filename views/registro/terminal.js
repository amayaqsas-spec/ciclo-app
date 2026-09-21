// ============================================
// TERMINAL.JS - Módulo de Registro de Terminales
// ============================================

const Terminal = {
    render() {
        const terminales = DB.load('terminales');

        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                        Terminales
                    </h2>
                    <button class="btn-add" id="btnAddTerminal">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nuevo
                    </button>
                </div>
                <div id="terminalList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddTerminal').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('terminales').find(t => t.id === editId) : null;
        const lineas = DB.load('lineas');
        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nueva'} Terminal</h3>
            <div class="input-group">
                <label>Línea</label>
                <select id="terminalLinea">${lineaOptions}</select>
            </div>
            <div class="input-group">
                <label>Nombre de Terminal</label>
                <input type="text" id="terminalNombre" value="${data ? data.nombre : ''}" placeholder="Ej. Cuatro Caminos">
            </div>
            <div class="input-group">
                <label>Turno</label>
                <input type="text" id="terminalTurno" value="${data ? data.turno : ''}" placeholder="Ej. 1er Turno, primer turno, 1">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const lineaId = document.getElementById('terminalLinea').value;
            const nombre = document.getElementById('terminalNombre').value.trim();
            const turno = document.getElementById('terminalTurno').value.trim();

            if (!lineaId || !nombre || !turno) {
                App.showToast('Completa todos los campos');
                return;
            }

            let terminales = DB.load('terminales');

            if (editId) {
                const idx = terminales.findIndex(t => t.id === editId);
                if (idx !== -1) {
                    terminales[idx] = { ...terminales[idx], lineaId, nombre, turno };
                }
            } else {
                terminales.push({
                    id: DB.generateId(),
                    lineaId,
                    nombre,
                    turno,
                    createdAt: Date.now()
                });
            }

            DB.save('terminales', terminales);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Terminal actualizada' : 'Terminal guardada');
            
            // ✅ Mensaje emergente informativo
            setTimeout(() => {
                App.showModal(`
                    <h3>ℹ️ Información Importante</h3>
                    <p style="color:var(--text-soft);font-size:13px;line-height:1.6;margin-bottom:16px;">
                        Si hay más turnos por terminal, hay que registrar cada uno por separado.
                    </p>
                    <div class="modal-actions">
                        <button class="btn-primary" id="btnOk" style="background:var(--primary);">Entendido</button>
                    </div>
                `);
                document.getElementById('btnOk').addEventListener('click', () => {
                    const modalEl = document.querySelector('.modal-overlay');
                    if (modalEl) modalEl.remove();
                });
            }, 300);
        });
    },

    renderList() {
        const list = document.getElementById('terminalList');
        const terminales = DB.load('terminales');
        const lineas = DB.load('lineas');

        if (terminales.length === 0) {
            list.innerHTML = `
                <div class="aviso-empty">
                    <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                    <p>No hay terminales registradas</p>
                </div>
            `;
            return;
        }

        list.innerHTML = terminales.map(t => {
            const linea = lineas.find(l => l.id === t.lineaId);
            return `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">${t.nombre}</div>
                        <div class="item-date">${t.turno}</div>
                    </div>
                    <div class="item-desc">${linea ? linea.nombre : 'Sin línea'}</div>
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
                if (confirm('¿Eliminar esta terminal?')) {
                    let data = DB.load('terminales').filter(t => t.id !== btn.dataset.id);
                    DB.save('terminales', data);
                    this.renderList();
                    App.showToast('Terminal eliminada');
                }
            });
        });
    }
};

export default Terminal;