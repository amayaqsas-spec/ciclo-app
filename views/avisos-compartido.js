// ============================================
// AVISOS-COMPARTIDO.JS - Documentos compartidos (sin Firebase extra)
// ============================================

const AvisosCompartido = {
    // ✅ CLAVE FIJA en localStorage (sin UID)
    CLAVE: 'ciclo_documentos_compartidos',

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
        
        // ✅ Migrar documentos viejos al nuevo formato
        this.migrarDocumentosViejos();
        
        if (!isAdmin) {
            this.marcarComoLeidos();
        }
        
        if (isAdmin) {
            document.getElementById('btnAddAviso')?.addEventListener('click', () => this.openModal());
        }
        
        this.renderList();
    },

    // ✅ MIGRACIÓN: Mover documentos del formato viejo al nuevo
    migrarDocumentosViejos() {
        // Buscar documentos en claves viejas (con UID)
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            if (key && key.includes('avisos') && key !== this.CLAVE && !key.startsWith('firebase')) {
                try {
                    const datos = JSON.parse(localStorage.getItem(key));
                    
                    if (Array.isArray(datos) && datos.length > 0) {
                        // Obtener documentos existentes
                        const existentes = this.obtenerDocumentos();
                        const idsExistentes = new Set(existentes.map(d => d.id));
                        
                        // Agregar los que no existen
                        let nuevos = 0;
                        datos.forEach(doc => {
                            if (!idsExistentes.has(doc.id)) {
                                existentes.push(doc);
                                nuevos++;
                            }
                        });
                        
                        // Guardar en el nuevo formato
                        this.guardarDocumentos(existentes);
                        
                        // Eliminar la clave vieja
                        localStorage.removeItem(key);
                        
                        console.log(`✅ Migrados ${nuevos} documento(s) desde ${key}`);
                    }
                } catch(e) {}
            }
        }
    },

    // ✅ LEER directamente de localStorage (sin UID)
    obtenerDocumentos() {
        try {
            const datos = localStorage.getItem(this.CLAVE);
            return datos ? JSON.parse(datos) : [];
        } catch(e) {
            return [];
        }
    },

    // ✅ GUARDAR directamente en localStorage (sin UID)
    guardarDocumentos(documentos) {
        localStorage.setItem(this.CLAVE, JSON.stringify(documentos));
    },

    // ✅ Verificar si está leído
    estaLeido(docId) {
        const leidos = DB.get('docsLeidos', []);
        return leidos.includes(docId);
    },

    // ✅ Marcar como leídos
    marcarComoLeidos() {
        const documentos = this.obtenerDocumentos();
        const leidos = DB.get('docsLeidos', []);
        let hayNuevos = false;
        
        documentos.forEach(doc => {
            if (!leidos.includes(doc.id)) {
                leidos.push(doc.id);
                hayNuevos = true;
            }
        });
        
        if (hayNuevos) {
            DB.set('docsLeidos', leidos);
            
            // Actualizar contador de no leídos
            const noLeidos = documentos.filter(d => !leidos.includes(d.id)).length;
            DB.set('avisosNoLeidos', noLeidos);
        }
    },

    // ✅ Abrir modal
    openModal(editId = null) {
        if (!Auth.isAdmin) {
            App.showToast('Solo el administrador puede realizar esta acción');
            return;
        }

        const doc = editId ? this.obtenerDocumentos().find(d => d.id === editId) : null;
        
        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Documento</h3>
            <div class="modal-scroll-content">
                <div class="input-group">
                    <label>Título del Documento</label>
                    <input type="text" id="docTitulo" value="${doc ? doc.titulo : ''}" placeholder="Ej: Aviso de cambio de turno">
                </div>
                <div class="input-group">
                    <label>Descripción</label>
                    <textarea id="docTexto" rows="3" placeholder="Detalles del documento...">${doc ? doc.texto : ''}</textarea>
                </div>
                <div class="input-group">
                    <label>Enlace (Google Drive, PDF, etc.)</label>
                    <input type="text" id="docLink" value="${doc ? doc.link : ''}" placeholder="https://drive.google.com/...">
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const titulo = document.getElementById('docTitulo').value.trim();
            const texto = document.getElementById('docTexto').value.trim();
            const link = document.getElementById('docLink').value.trim();

            if (!titulo) {
                App.showToast('El título es obligatorio');
                return;
            }

            let documentos = this.obtenerDocumentos();

            if (editId) {
                const idx = documentos.findIndex(d => d.id === editId);
                if (idx !== -1) {
                    documentos[idx] = { ...documentos[idx], titulo, texto, link };
                }
            } else {
                documentos.push({
                    id: DB.generateId(),
                    titulo,
                    texto,
                    link,
                    leido: false,
                    fecha: new Date().toLocaleDateString(),
                    createdAt: Date.now()
                });
            }

            this.guardarDocumentos(documentos);
            
            // Actualizar contador
            const noLeidos = documentos.filter(d => !this.estaLeido(d.id)).length;
            DB.set('avisosNoLeidos', noLeidos);
            
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Documento actualizado' : 'Documento guardado');
        });
    },

    // ✅ Renderizar lista
    renderList() {
        const list = document.getElementById('avisoList');
        const documentos = this.obtenerDocumentos().sort((a, b) => b.createdAt - a.createdAt);
        const isAdmin = Auth.isAdmin;

        if (documentos.length === 0) {
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

        list.innerHTML = documentos.map(doc => {
            const leido = this.estaLeido(doc.id);
            return `
                <div class="item-card ${!leido ? 'aviso-nuevo' : ''}">
                    <div class="item-header">
                        <div class="item-title">
                            ${doc.titulo}
                            ${!leido && !isAdmin ? '<span class="badge-nuevo">NUEVO</span>' : ''}
                        </div>
                        <div class="item-date">${doc.fecha || ''}</div>
                    </div>
                    ${doc.texto ? `<div class="item-desc">${doc.texto}</div>` : ''}
                    <div class="item-actions">
                        ${doc.link ? `<a href="${doc.link}" target="_blank" class="btn-pdf">📄 Ver Documento</a>` : ''}
                        ${isAdmin ? `
                            <button class="btn-edit" data-id="${doc.id}">Editar</button>
                            <button class="btn-remove" data-id="${doc.id}">Eliminar</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Eventos para admin
        if (isAdmin) {
            list.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', () => this.openModal(btn.dataset.id));
            });
            list.querySelectorAll('.btn-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (confirm('¿Eliminar este documento?')) {
                        let documentos = this.obtenerDocumentos().filter(d => d.id !== btn.dataset.id);
                        this.guardarDocumentos(documentos);
                        this.renderList();
                        App.showToast('Documento eliminado');
                    }
                });
            });
        }
    }
};

export default AvisosCompartido;