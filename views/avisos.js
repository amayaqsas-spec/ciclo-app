// ============================================
// AVISOS.JS - Módulo de Documentos (con migración automática)
// ============================================

const Avisos = {
    render() {
        const isAdmin = Auth.isAdmin;
        
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
        
        // ✅ MIGRACIÓN AUTOMÁTICA: Mover documentos de formato UID a compartido
        this.migrarDocumentos();
        
        if (!isAdmin) {
            this.marcarTodosComoLeidos();
        }
        
        if (isAdmin) {
            document.getElementById('btnAddAviso')?.addEventListener('click', () => this.openModal());
        }
        
        this.renderList();
    },

    // ✅ FUNCIÓN DE MIGRACIÓN AUTOMÁTICA
    migrarDocumentos() {
        let todosAvisos = [];
        const idsVistos = new Set();
        const clavesAEliminar = [];
        
        // Recorrer todo el localStorage buscando documentos
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            if (key && key.includes('avisos') && !key.startsWith('firebase')) {
                try {
                    const datos = JSON.parse(localStorage.getItem(key));
                    
                    if (Array.isArray(datos)) {
                        datos.forEach(aviso => {
                            if (!idsVistos.has(aviso.id)) {
                                todosAvisos.push(aviso);
                                idsVistos.add(aviso.id);
                            }
                        });
                    }
                    
                    // Marcar para eliminar si NO es la clave compartida
                    if (key !== 'ciclo_avisos') {
                        clavesAEliminar.push(key);
                    }
                } catch(e) {}
            }
        }
        
        // Si hay documentos para migrar
        if (todosAvisos.length > 0) {
            // Guardar en formato compartido
            localStorage.setItem('ciclo_avisos', JSON.stringify(todosAvisos));
            
            // Eliminar claves viejas con UID
            clavesAEliminar.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log(`✅ Migrados ${todosAvisos.length} documento(s) al formato compartido`);
        }
    },

    // ✅ FUNCIÓN: Busca documentos en CUALQUIER formato
    obtenerTodosLosAvisos() {
        let todosAvisos = [];
        const idsVistos = new Set();
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            if (key && key.includes('avisos') && !key.startsWith('firebase')) {
                try {
                    const datos = JSON.parse(localStorage.getItem(key));
                    if (Array.isArray(datos)) {
                        datos.forEach(aviso => {
                            if (!idsVistos.has(aviso.id)) {
                                todosAvisos.push(aviso);
                                idsVistos.add(aviso.id);
                            }
                        });
                    }
                } catch(e) {}
            }
        }
        
        return todosAvisos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    },

    // ✅ Siempre guarda en formato compartido
    guardarAvisosCompartidos(avisos) {
        localStorage.setItem('ciclo_avisos', JSON.stringify(avisos));
    },

    marcarTodosComoLeidos() {
        const avisos = this.obtenerTodosLosAvisos();
        let hayCambios = false;
        
        avisos.forEach(aviso => {
            if (!aviso.leido) {
                aviso.leido = true;
                hayCambios = true;
            }
        });
        
        if (hayCambios) {
            this.guardarAvisosCompartidos(avisos);
            DB.set('avisosNoLeidos', 0);
        }
    },

    calcularNoLeidos() {
        const avisos = this.obtenerTodosLosAvisos();
        const noLeidos = avisos.filter(a => !a.leido).length;
        DB.set('avisosNoLeidos', noLeidos);
        return noLeidos;
    },

    openModal(editId = null) {
        if (!Auth.isAdmin) {
            App.showToast('Solo el administrador puede realizar esta acción');
            return;
        }

        const data = editId ? this.obtenerTodosLosAvisos().find(a => a.id === editId) : null;
        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Documento</h3>
            <div class="modal-scroll-content">
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

            let avisos = this.obtenerTodosLosAvisos();

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
                    leido: false,
                    fecha: new Date().toLocaleDateString(),
                    createdAt: Date.now()
                });
            }

            this.guardarAvisosCompartidos(avisos);
            this.calcularNoLeidos();
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Documento actualizado' : 'Documento guardado');
        });
    },

    renderList() {
        const list = document.getElementById('avisoList');
        const data = this.obtenerTodosLosAvisos();
        const isAdmin = Auth.isAdmin;

        console.log('📋 Documentos cargados:', data.length);

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
            <div class="item-card ${!item.leido ? 'aviso-nuevo' : ''}">
                <div class="item-header">
                    <div class="item-title">
                        ${item.titulo}
                        ${!item.leido && !isAdmin ? '<span class="badge-nuevo">NUEVO</span>' : ''}
                    </div>
                    <div class="item-date">${item.fecha || ''}</div>
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

        if (isAdmin) {
            list.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', () => this.openModal(btn.dataset.id));
            });
            list.querySelectorAll('.btn-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (confirm('¿Eliminar este documento?')) {
                        let avisos = this.obtenerTodosLosAvisos().filter(a => a.id !== btn.dataset.id);
                        this.guardarAvisosCompartidos(avisos);
                        this.calcularNoLeidos();
                        this.renderList();
                        App.showToast('Documento eliminado');
                    }
                });
            });
        }
    }
};

export default Avisos;