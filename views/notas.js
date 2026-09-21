// ============================================
// NOTAS.JS - Módulo de Notas (Simple)
// ============================================

const Notas = {
    render() {
        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                        Notas
                    </h2>
                    <button class="btn-add" id="btnAddNota">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nueva
                    </button>
                </div>
                <div id="notasList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddNota').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('notas').find(n => n.id === editId) : null;
        const fechaHoy = new Date().toISOString().split('T')[0];

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nueva'} Nota</h3>
            <div class="input-group">
                <label>Fecha</label>
                <input type="date" id="notaFecha" value="${data ? data.fecha : fechaHoy}">
            </div>
            <div class="input-group">
                <label>Descripción</label>
                <textarea id="notaDescripcion" rows="3" placeholder="Escribe tu nota aquí...">${data ? data.descripcion : ''}</textarea>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const fecha = document.getElementById('notaFecha').value;
            const descripcion = document.getElementById('notaDescripcion').value.trim();

            if (!fecha || !descripcion) {
                App.showToast('Completa la fecha y la descripción');
                return;
            }

            let notas = DB.load('notas');

            if (editId) {
                const idx = notas.findIndex(n => n.id === editId);
                if (idx !== -1) {
                    notas[idx] = { ...notas[idx], fecha, descripcion };
                }
            } else {
                notas.push({
                    id: DB.generateId(),
                    fecha,
                    descripcion,
                    createdAt: Date.now()
                });
            }

            DB.save('notas', notas);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Nota actualizada' : 'Nota guardada');
        });
    },

    renderList() {
        const list = document.getElementById('notasList');
        const data = DB.load('notas').sort((a, b) => b.createdAt - a.createdAt);

        if (data.length === 0) {
            list.innerHTML = `
                <div class="aviso-empty">
                    <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    <p>No hay notas registradas</p>
                </div>
            `;
            return;
        }

        list.innerHTML = data.map(item => `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-title">📅 ${item.fecha}</div>
                </div>
                <div class="item-desc" style="margin-top:6px; white-space: pre-wrap;">${item.descripcion}</div>
                <div class="item-actions">
                    <button class="btn-edit" data-id="${item.id}">Editar</button>
                    <button class="btn-remove" data-id="${item.id}">Eliminar</button>
                </div>
            </div>
        `).join('');

        list.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });

        list.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar esta nota?')) {
                    let data = DB.load('notas').filter(n => n.id !== btn.dataset.id);
                    DB.save('notas', data);
                    this.renderList();
                    App.showToast('Nota eliminada');
                }
            });
        });
    }
};

export default Notas;