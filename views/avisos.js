// ============================================
// AVISOS.JS - Módulo de Documentos / Avisos
// ============================================

const Avisos = {
    render() {
        const isAdmin = Auth.isAdmin; // Verificar si es administrador
        
        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                        Documentos
                    </h2>
                    ${isAdmin ? `
                        <button class="btn-add" id="btnAddAviso">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Nuevo
                        </button>
                    ` : ''}
                </div>
                <div id="avisoList"></div>
            </div>
        `;
    },

    init() {
        const isAdmin = Auth.isAdmin;
        
        // Solo el administrador puede ver el botón de agregar
        if (isAdmin) {
            document.getElementById('btnAddAviso')?.addEventListener('click', () => this.openModal());
        }
        
        this.renderList();
    },

    openModal(editId = null) {
        // Verificar que solo el administrador pueda abrir el modal
        if (!Auth.isAdmin) {
            App.showToast('❌ Solo el administrador puede realizar esta acción');
            return;
        }

        const data = editId ? DB.load('avisos').find(a => a.id === editId) : null;
        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Documento</h3>
            <div class="input-group">
                <label>Título del Documento</label>
                <input type="text" id="avisoTitulo" value="${data ? data.titulo : ''}" placeholder="Ej: Aviso de cambio de turno">
            </div>
            <div class="input-group">
                <label>Descripción</label>
                <textarea id="avisoTexto" rows="3" placeholder="Detalles del documento...">${data ? data.texto : ''}</textarea>
            </div>
            <div class="input-group">
                <label>Enlace (Google Drive, PDF, etc.)</label>
                <input type="text" id="avisoLink" value="${data ? data.link : ''}" placeholder="https://...">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const titulo = document.getElementById('avisoTitulo').value.trim();
            const texto = document.getElementById('avisoTexto').value.trim();
            const link = document.getElementById('avisoLink').value.trim();

            if (!titulo) {
                App.showToast('El título es obligatorio');
                return;
            }

            let avisos = DB.load('avisos');

            if (editId) {
                const idx = avisos.findIndex(a => a.id === editId);
                if (idx !== -1) {
                    avisos[idx] = { ...avisos[idx], titulo, texto, link };
                }
            } else {
                avisos.push({
                    id: DB.generateId(),
                    titulo,
                    texto,
                    link,
                    leido: false, // Nuevo documento = no leído por los usuarios
                    fecha: new Date().toLocaleDateString(),
                    createdAt: Date.now()
                });
            }

            DB.save('avisos', avisos);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Documento actualizado' : 'Documento guardado');
        });
    },

    renderList() {
        const list = document.getElementById('avisoList');
        const data = DB.load('avisos').sort((a, b) => b.createdAt - a.createdAt);
        const isAdmin = Auth.isAdmin;

        if (data.length === 0) {
            list.innerHTML = `
                <div class="aviso-empty">
                    <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    <p>No hay documentos registrados</p>
                </div>
            `;
            return;
        }

        list.innerHTML = data.map(item => `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-title">${item.titulo}</div>
                    <div class="item-date">${item.fecha}</div>
                </div>
                ${item.texto ? `<div class="item-desc">${item.texto}</div>` : ''}
                <div class="item-actions">
                    ${item.link ? `<a href="${item.link}" target="_blank" class="btn-pdf">📄 Ver Documento</a>` : ''}
                    ${isAdmin ? `
                        <button class="btn-edit" data-id="${item.id}">Editar</button>
                        <button class="btn-remove" data-id="${item.id}">Eliminar</button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        // Solo el administrador puede editar y eliminar
        if (isAdmin) {
            list.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', () => this.openModal(btn.dataset.id));
            });
            list.querySelectorAll('.btn-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (confirm('¿Eliminar este documento?')) {
                        let data = DB.load('avisos').filter(a => a.id !== btn.dataset.id);
                        DB.save('avisos', data);
                        this.renderList();
                        App.showToast('Documento eliminado');
                    }
                });
            });
        }
    }
};

export default Avisos;