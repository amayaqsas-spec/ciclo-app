// ============================================
// REGISTRO/TERMINAL.JS - Módulo de Terminal
// ============================================

const Terminal = {
    render() {
        const lineas = DB.load('lineas');
        const lineaOptions = lineas.length > 0 
            ? lineas.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        Terminal
                    </h2>
                    <button class="btn-add" id="btnAddTerminal">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nueva
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

        if (lineas.length === 0) {
            App.showToast('Primero debes registrar una línea');
            return;
        }

        const lineaOptions = lineas.map(l => 
            `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`
        ).join('');

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nueva'} Terminal</h3>
            <div class="input-group">
                <label>Línea</label>
                <select id="terminalLinea">
                    ${lineaOptions}
                </select>
            </div>
            <div class="input-group">
                <label>Nombre de la Terminal</label>
                <input type="text" id="terminalNombre" value="${data ? data.nombre : ''}" placeholder="Ej: Terminal Norte">
            </div>
            <div class="input-group">
                <label>Turno</label>
                <input type="text" id="terminalTurno" value="${data ? data.turno : ''}" placeholder="Ej: Matutino">
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

            if (!nombre || !turno) {
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
        });
    },

    renderList() {
        const list = document.getElementById('terminalList');
        const data = DB.load('terminales').sort((a, b) => b.createdAt - a.createdAt);
        const lineas = DB.load('lineas');

        if (data.length === 0) {
            list.innerHTML = `<div class="aviso-empty"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><p>No hay terminales registradas</p></div>`;
            return;
        }

        list.innerHTML = data.map(item => {
            const linea = lineas.find(l => l.id === item.lineaId);
            return `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">${item.nombre}</div>
                    </div>
                    <div class="item-meta">
                        <span class="item-tag">Línea: ${linea ? linea.nombre : 'N/A'}</span>
                        <span class="item-tag">Turno: ${item.turno}</span>
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