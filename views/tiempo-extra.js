// ============================================
// TIEMPO-EXTRA.JS - Módulo Tiempo Extra
// ============================================

const TiempoExtra = {
    tipos: ['Tiempo Extra', 'Suplementario', '110'],

    render() {
        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Tiempo Extra
                    </h2>
                    <button class="btn-add btn-add-te" id="btnAddTE">
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

        const tipoOptions = this.tipos.map(t => 
            `<option value="${t}" ${data && data.tipo === t ? 'selected' : ''}>${t}</option>`
        ).join('');

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Tiempo Extra</h3>
            <div class="input-group">
                <label>Tipo</label>
                <select id="teTipo">
                    ${tipoOptions}
                </select>
            </div>
            <div class="input-group">
                <label>Fecha</label>
                <input type="date" id="teFecha" value="${data ? data.fecha : ''}">
            </div>
            <div class="input-group">
                <label>Nota</label>
                <input type="text" id="teNota" value="${data ? data.nota : ''}" placeholder="Ej: 2 horas extra">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary btn-save-te" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const tipo = document.getElementById('teTipo').value;
            const fecha = document.getElementById('teFecha').value;
            const nota = document.getElementById('teNota').value.trim();

            if (!fecha || !nota) {
                App.showToast('Completa todos los campos');
                return;
            }

            let tiempoExtra = DB.load('tiempoExtra');

            if (editId) {
                const idx = tiempoExtra.findIndex(t => t.id === editId);
                if (idx !== -1) {
                    tiempoExtra[idx] = { ...tiempoExtra[idx], tipo, fecha, nota };
                }
            } else {
                tiempoExtra.push({
                    id: DB.generateId(),
                    tipo,
                    fecha,
                    nota,
                    cobrado: false,
                    createdAt: Date.now()
                });
            }

            DB.save('tiempoExtra', tiempoExtra);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Registro actualizado' : 'Registro guardado');
        });
    },

    toggleCobrado(id) {
        let tiempoExtra = DB.load('tiempoExtra');
        const idx = tiempoExtra.findIndex(t => t.id === id);
        
        if (idx !== -1) {
            tiempoExtra[idx].cobrado = !tiempoExtra[idx].cobrado;
            DB.save('tiempoExtra', tiempoExtra);
            this.renderList();
            App.showToast(tiempoExtra[idx].cobrado ? 'Marcado como cobrado ✓' : 'Marcado como pendiente');
        }
    },

    renderList() {
        const list = document.getElementById('teList');
        const data = DB.load('tiempoExtra').sort((a, b) => b.createdAt - a.createdAt);

        if (data.length === 0) {
            list.innerHTML = `<div class="aviso-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><p>No hay registros de tiempo extra</p></div>`;
            return;
        }

        list.innerHTML = data.map(item => {
            const estadoClass = item.cobrado ? 'cobrado' : 'pendiente';
            const estadoText = item.cobrado ? 'Cobrado' : 'Pendiente';
            const estadoIcon = item.cobrado ? '✓' : '○';
            
            return `
                <div class="item-card te-card ${estadoClass}">
                    <div class="item-header">
                        <div class="item-title">
                            <span class="te-tipo">${item.tipo}</span>
                            <span class="te-estado">${estadoIcon} ${estadoText}</span>
                        </div>
                    </div>
                    <div class="item-meta">
                        <span class="item-tag">📅 ${item.fecha}</span>
                        <span class="item-tag te-nota">📝 ${item.nota}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit btn-edit-te" data-id="${item.id}">Editar</button>
                        <button class="btn-cobrar" data-id="${item.id}">${item.cobrado ? 'Desmarcar' : 'Cobrar'}</button>
                        <button class="btn-remove" data-id="${item.id}">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.btn-edit-te').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });

        list.querySelectorAll('.btn-cobrar').forEach(btn => {
            btn.addEventListener('click', () => this.toggleCobrado(btn.dataset.id));
        });

        list.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar este registro?')) {
                    let data = DB.load('tiempoExtra').filter(t => t.id !== btn.dataset.id);
                    DB.save('tiempoExtra', data);
                    this.renderList();
                    App.showToast('Registro eliminado');
                }
            });
        });
    }
};

// Exponer el módulo globalmente para que Home pueda acceder a openModal
window.TiempoExtraModule = TiempoExtra;

export default TiempoExtra;