// ============================================
// TIEMPO-EXTRA.JS - Módulo de Tiempo Extra
// ============================================

const TiempoExtra = {
    render() {
        const tiempoExtra = DB.load('tiempoExtra');

        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Tiempo Extra
                    </h2>
                    <button class="btn-add" id="btnAddTE">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nuevo
                    </button>
                </div>
                <div id="teList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddTE').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('tiempoExtra').find(t => t.id === editId) : null;
        const fechaHoy = new Date().toISOString().split('T')[0];

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Tiempo Extra</h3>
            <div class="input-group">
                <label>Fecha</label>
                <input type="date" id="teFecha" value="${data ? data.fecha : fechaHoy}">
            </div>
            <div class="input-group">
                <label>Tipo</label>
                <select id="teTipo">
                    <option value="Tiempo Extra" ${data && data.tipo === 'Tiempo Extra' ? 'selected' : ''}>Tiempo Extra</option>
                    <option value="Descanso Laborado" ${data && data.tipo === 'Descanso Laborado' ? 'selected' : ''}>Descanso Laborado</option>
                    <option value="Retención" ${data && data.tipo === 'Retención' ? 'selected' : ''}>Retención</option>
                </select>
            </div>
            <div class="input-group">
                <label>Nota</label>
                <input type="text" id="teNota" value="${data ? data.nota : ''}" placeholder="Ej. Serv 12, Ma, CB">
            </div>
            <div class="input-group">
                <label>
                    <input type="checkbox" id="teCobrado" ${data && data.cobrado ? 'checked' : ''}>
                    Ya está cobrado
                </label>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const fecha = document.getElementById('teFecha').value;
            const tipo = document.getElementById('teTipo').value;
            const nota = document.getElementById('teNota').value.trim();
            const cobrado = document.getElementById('teCobrado').checked;

            if (!fecha || !tipo || !nota) {
                App.showToast('Completa todos los campos');
                return;
            }

            let tiempoExtra = DB.load('tiempoExtra');

            if (editId) {
                const idx = tiempoExtra.findIndex(t => t.id === editId);
                if (idx !== -1) {
                    tiempoExtra[idx] = { ...tiempoExtra[idx], fecha, tipo, nota, cobrado };
                }
            } else {
                tiempoExtra.push({
                    id: DB.generateId(),
                    fecha,
                    tipo,
                    nota,
                    cobrado,
                    createdAt: Date.now()
                });
            }

            DB.save('tiempoExtra', tiempoExtra);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Tiempo extra actualizado' : 'Tiempo extra guardado');
        });
    },

    renderList() {
        const list = document.getElementById('teList');
        const data = DB.load('tiempoExtra').sort((a, b) => b.createdAt - a.createdAt);

        if (data.length === 0) {
            list.innerHTML = `
                <div class="aviso-empty">
                    <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p>No hay tiempo extra registrado</p>
                </div>
            `;
            return;
        }

        list.innerHTML = data.map(item => `
            <div class="item-card ${item.cobrado ? 'item-cobrado' : ''}">
                <div class="item-header">
                    <div class="item-title">${item.tipo}</div>
                    <div class="item-date">${item.fecha}</div>
                </div>
                <div class="item-desc">${item.nota}</div>
                <div class="item-actions">
                    <button class="btn-toggle-cobro" data-id="${item.id}">
                        ${item.cobrado ? '↩️ Marcar pendiente' : '✅ Marcar cobrado'}
                    </button>
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
                if (confirm('¿Eliminar este tiempo extra?')) {
                    let data = DB.load('tiempoExtra').filter(t => t.id !== btn.dataset.id);
                    DB.save('tiempoExtra', data);
                    this.renderList();
                    App.showToast('Tiempo extra eliminado');
                }
            });
        });
        list.querySelectorAll('.btn-toggle-cobro').forEach(btn => {
            btn.addEventListener('click', () => {
                let data = DB.load('tiempoExtra');
                const idx = data.findIndex(t => t.id === btn.dataset.id);
                if (idx !== -1) {
                    data[idx].cobrado = !data[idx].cobrado;
                    DB.save('tiempoExtra', data);
                    this.renderList();
                    App.showToast(data[idx].cobrado ? 'Marcado como cobrado' : 'Marcado como pendiente');
                }
            });
        });
    }
};

export default TiempoExtra;