// ============================================
// SEMANA.JS - Módulo de Registro de Días (antes Semana)
// ============================================

const Semana = {
    render() {
        const semanas = DB.load('semanas');

        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Días
                    </h2>
                    <button class="btn-add" id="btnAddSemana">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nuevo
                    </button>
                </div>
                <div id="semanaList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddSemana').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('semanas').find(s => s.id === editId) : null;
        const lineas = DB.load('lineas');
        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Día</h3>
            <div class="input-group">
                <label>Línea</label>
                <select id="semanaLinea">${lineaOptions}</select>
            </div>
            <div class="input-group">
                <label>Tipo de Día</label>
                <input type="text" id="semanaTipo" value="${data ? data.tipo : ''}" placeholder="Ej. Laboral, Sábado, Domingo/Festivos">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const lineaId = document.getElementById('semanaLinea').value;
            const tipo = document.getElementById('semanaTipo').value.trim();

            if (!lineaId || !tipo) {
                App.showToast('Completa todos los campos');
                return;
            }

            let semanas = DB.load('semanas');

            if (editId) {
                const idx = semanas.findIndex(s => s.id === editId);
                if (idx !== -1) {
                    semanas[idx] = { ...semanas[idx], lineaId, tipo };
                }
            } else {
                semanas.push({
                    id: DB.generateId(),
                    lineaId,
                    tipo,
                    createdAt: Date.now()
                });
            }

            DB.save('semanas', semanas);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Día actualizado' : 'Día guardado');
        });
    },

    renderList() {
        const list = document.getElementById('semanaList');
        const semanas = DB.load('semanas');
        const lineas = DB.load('lineas');

        if (semanas.length === 0) {
            list.innerHTML = `
                <div class="aviso-empty">
                    <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <p>No hay días registrados</p>
                </div>
            `;
            return;
        }

        list.innerHTML = semanas.map(s => {
            const linea = lineas.find(l => l.id === s.lineaId);
            return `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">${s.tipo}</div>
                    </div>
                    <div class="item-desc">${linea ? linea.nombre : 'Sin línea'}</div>
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
                if (confirm('¿Eliminar este día?')) {
                    let data = DB.load('semanas').filter(s => s.id !== btn.dataset.id);
                    DB.save('semanas', data);
                    this.renderList();
                    App.showToast('Día eliminado');
                }
            });
        });
    }
};

export default Semana;