// ============================================
// TAREAS.JS - Módulo de Tareas
// ============================================

const Tareas = {
    render() {
        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Tareas
                    </h2>
                    <button class="btn-add" id="btnAddTarea">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nueva
                    </button>
                </div>
                <div id="tareasList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddTarea').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('tareas').find(t => t.id === editId) : null;

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nueva'} Tarea</h3>
            <div class="input-group">
                <label>Título</label>
                <input type="text" id="tarTitulo" value="${data ? data.titulo : ''}" placeholder="Título de la tarea">
            </div>
            <div class="input-group">
                <label>Descripción</label>
                <textarea id="tarDesc" rows="3" placeholder="Detalles...">${data ? data.descripcion : ''}</textarea>
            </div>
            <div class="input-group">
                <label>Prioridad</label>
                <select id="tarPrioridad">
                    <option value="alta" ${data && data.prioridad === 'alta' ? 'selected' : ''}>Alta</option>
                    <option value="media" ${data && data.prioridad === 'media' ? 'selected' : ''}>Media</option>
                    <option value="baja" ${data && data.prioridad === 'baja' ? 'selected' : ''}>Baja</option>
                </select>
            </div>
            <div class="input-group">
                <label>Fecha límite</label>
                <input type="date" id="tarFecha" value="${data ? data.fecha : ''}">
            </div>
            <div class="input-group">
                <label style="display:flex;align-items:center;gap:8px;">
                    <input type="checkbox" id="tarCompletada" ${data && data.completada ? 'checked' : ''}>
                    Marcar como completada
                </label>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const titulo = document.getElementById('tarTitulo').value.trim();
            const descripcion = document.getElementById('tarDesc').value.trim();
            const prioridad = document.getElementById('tarPrioridad').value;
            const fecha = document.getElementById('tarFecha').value;
            const completada = document.getElementById('tarCompletada').checked;

            if (!titulo) {
                App.showToast('El título es obligatorio');
                return;
            }

            let tareas = DB.load('tareas');

            if (editId) {
                const idx = tareas.findIndex(t => t.id === editId);
                if (idx !== -1) {
                    tareas[idx] = { ...tareas[idx], titulo, descripcion, prioridad, fecha, completada, updatedAt: Date.now() };
                }
            } else {
                tareas.push({
                    id: DB.generateId(),
                    titulo,
                    descripcion,
                    prioridad,
                    fecha,
                    completada,
                    createdAt: Date.now()
                });
            }

            DB.save('tareas', tareas);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Tarea actualizada' : 'Tarea guardada');
        });
    },

    renderList() {
        const list = document.getElementById('tareasList');
        const data = DB.load('tareas').sort((a, b) => {
            if (a.completada !== b.completada) return a.completada ? 1 : -1;
            return b.createdAt - a.createdAt;
        });

        if (data.length === 0) {
            list.innerHTML = `<div class="aviso-empty"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><p>No hay tareas pendientes</p></div>`;
            return;
        }

        const priorityClass = { alta: 'urgent', media: 'medium', baja: 'low' };

        list.innerHTML = data.map(item => `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-title" style="${item.completada ? 'text-decoration:line-through;opacity:0.6;' : ''}">${item.titulo}</div>
                    ${item.fecha ? `<span class="item-date">${new Date(item.fecha).toLocaleDateString('es')}</span>` : ''}
                </div>
                ${item.descripcion ? `<div class="item-desc">${item.descripcion}</div>` : ''}
                <div class="item-meta">
                    <span class="item-tag ${priorityClass[item.prioridad] || 'low'}">${item.prioridad || 'baja'}</span>
                    ${item.completada ? '<span class="item-tag done">Completada</span>' : ''}
                </div>
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
                if (confirm('¿Eliminar esta tarea?')) {
                    let data = DB.load('tareas').filter(t => t.id !== btn.dataset.id);
                    DB.save('tareas', data);
                    this.renderList();
                    App.showToast('Tarea eliminada');
                }
            });
        });
    }
};

export default Tareas;