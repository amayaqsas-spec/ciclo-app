// ============================================
// ACTIVIDADES.JS - Módulo de Actividades
// ============================================

const Actividades = {
    render() {
        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                        Actividades
                    </h2>
                    <button class="btn-add" id="btnAddActividad">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nueva
                    </button>
                </div>
                <div id="actividadesList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddActividad').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('actividades').find(a => a.id === editId) : null;

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nueva'} Actividad</h3>
            <div class="input-group">
                <label>Título</label>
                <input type="text" id="actTitulo" value="${data ? data.titulo : ''}" placeholder="Nombre de la actividad">
            </div>
            <div class="input-group">
                <label>Descripción</label>
                <textarea id="actDesc" rows="3" placeholder="Detalles...">${data ? data.descripcion : ''}</textarea>
            </div>
            <div class="input-group">
                <label>Fecha</label>
                <input type="date" id="actFecha" value="${data ? data.fecha : new Date().toISOString().split('T')[0]}">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const titulo = document.getElementById('actTitulo').value.trim();
            const descripcion = document.getElementById('actDesc').value.trim();
            const fecha = document.getElementById('actFecha').value;

            if (!titulo) {
                App.showToast('El título es obligatorio');
                return;
            }

            let actividades = DB.load('actividades');

            if (editId) {
                const idx = actividades.findIndex(a => a.id === editId);
                if (idx !== -1) {
                    actividades[idx] = { ...actividades[idx], titulo, descripcion, fecha };
                }
            } else {
                actividades.push({
                    id: DB.generateId(),
                    titulo,
                    descripcion,
                    fecha,
                    createdAt: Date.now()
                });
            }

            DB.save('actividades', actividades);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Actividad actualizada' : 'Actividad guardada');
        });
    },

    renderList() {
        const list = document.getElementById('actividadesList');
        const data = DB.load('actividades').sort((a, b) => b.createdAt - a.createdAt);

        if (data.length === 0) {
            list.innerHTML = `<div class="aviso-empty"><svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg><p>No hay actividades registradas</p></div>`;
            return;
        }

        list.innerHTML = data.map(item => `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-title">${item.titulo}</div>
                    <span class="item-date">${item.fecha ? new Date(item.fecha).toLocaleDateString('es') : ''}</span>
                </div>
                ${item.descripcion ? `<div class="item-desc">${item.descripcion}</div>` : ''}
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
                if (confirm('¿Eliminar esta actividad?')) {
                    let data = DB.load('actividades').filter(a => a.id !== btn.dataset.id);
                    DB.save('actividades', data);
                    this.renderList();
                    App.showToast('Actividad eliminada');
                }
            });
        });
    }
};

export default Actividades;