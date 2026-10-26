// ============================================
// DOCUMENTOS.JS - Módulo de Documentos (Solo Admin puede subir, sin notificaciones)
// ============================================

const Documentos = {
    getCollection() {
        return window.firebase.firestore().collection('documentos');
    },

    render() {
        const isAdmin = Auth.isAdmin;
        
        return `
            <div class="view active ske-documentos">
                <div class="ske-documentos-header">
                    <div class="ske-documentos-icono">
                        <svg viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                    </div>
                    <div class="ske-documentos-texto">
                        <h2 class="ske-documentos-titulo">Documentos</h2>
                        <p class="ske-documentos-subtitulo">Archivos y enlaces compartidos</p>
                    </div>
                    ${isAdmin ? `
                        <button class="ske-documentos-btn-nuevo" id="btnAddDocumento">
                            <svg viewBox="0 0 24 24">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            <span>Nuevo</span>
                        </button>
                    ` : ''}
                </div>

                <div id="documentoList">
                    <div class="ske-documentos-loading">
                        <div class="spinner" style="border-color:var(--primary-soft); border-top-color:var(--primary); width:32px; height:32px;"></div>
                        <p>Cargando documentos...</p>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const isAdmin = Auth.isAdmin;
        
        if (isAdmin) {
            document.getElementById('btnAddDocumento')?.addEventListener('click', () => this.openModal());
        }
        
        this.cargarDocumentos();
    },

    async cargarDocumentos() {
        const list = document.getElementById('documentoList');
        
        try {
            const snapshot = await this.getCollection().get();
            
            const documentos = [];
            snapshot.forEach(doc => {
                documentos.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('📄 Total de documentos cargados:', documentos.length);
            
            documentos.sort((a, b) => {
                const fechaA = a.fecha || a.createdAt || '';
                const fechaB = b.fecha || b.createdAt || '';
                return fechaB.localeCompare(fechaA);
            });
            
            if (documentos.length === 0) {
                list.innerHTML = `
                    <div class="ske-documentos-empty" style="text-align: center; padding: 40px 20px; color: var(--text-soft);">
                        <div style="font-size: 48px; margin-bottom: 12px;">📂</div>
                        <h3>Sin documentos</h3>
                        <p>No hay documentos registrados aún</p>
                    </div>
                `;
                return;
            }
            
            this.renderizarLista(documentos);
            
        } catch (error) {
            console.error('❌ Error al cargar:', error);
            list.innerHTML = `
                <div class="ske-documentos-empty" style="text-align: center; padding: 40px 20px; color: var(--text-soft);">
                    <div style="font-size: 48px; margin-bottom: 12px;">⚠️</div>
                    <h3>Error de conexión</h3>
                    <p>Verifica tu conexión a internet</p>
                </div>
            `;
        }
    },

    renderizarLista(documentos) {
        const list = document.getElementById('documentoList');
        const isAdmin = Auth.isAdmin;

        let html = `<div class="ske-documentos-lista" style="padding: 8px 12px;">`;

        html += documentos.map(doc => {
            const titulo = doc.titulo || doc.título || 'Sin título';
            const link = doc.url || doc.link || doc.enlace || doc.drive || '';
            const descripcion = doc.descripcion || doc.texto || '';
            
            return `
                <div class="ske-documentos-card" style="
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 14px;
                    border-bottom: 1px solid var(--bg-soft);
                    background: var(--surface);
                    border-radius: 8px;
                    margin-bottom: 8px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 4px;">${titulo}</div>
                            ${descripcion ? `<div style="font-size: 12px; color: var(--text-soft); line-height: 1.4;">${descripcion}</div>` : ''}
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; flex-shrink: 0;">
                            ${link ? `<a href="${link}" target="_blank" style="font-size: 13px; color: var(--primary); text-decoration: none; font-weight: 600; white-space: nowrap; padding: 6px 12px; background: var(--bg-soft); border-radius: 6px;">📎 Ver</a>` : ''}
                            ${isAdmin ? `
                                <span onclick="Documentos.openModal('${doc.id}')" style="font-size: 13px; color: #FF9800; cursor: pointer; font-weight: 600; white-space: nowrap; padding: 6px 12px; background: var(--bg-soft); border-radius: 6px;">✏️ Editar</span>
                                <span onclick="Documentos.eliminarDocumento('${doc.id}')" style="font-size: 13px; color: #c62828; cursor: pointer; font-weight: 600; white-space: nowrap; padding: 6px 12px; background: var(--bg-soft); border-radius: 6px;">🗑️ Eliminar</span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        html += `</div>`;
        html += `<div style="margin-top: 12px; font-size: 12px; color: var(--text-soft); text-align: right; padding: 0 8px 8px 8px;">Total: ${documentos.length} documento${documentos.length !== 1 ? 's' : ''}</div>`;

        list.innerHTML = html;
    },

    openModal(editId = null) {
        if (!Auth.isAdmin) {
            App.showToast('Solo el administrador puede realizar esta acción');
            return;
        }

        const modalOverlay = App.showModal(`
            <div class="ske-documentos-modal-inner">
                <div class="ske-documentos-modal-header">
                    <div class="ske-documentos-modal-icono">
                        <svg viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                    </div>
                    <h3>${editId ? 'Editar' : 'Nuevo'} Documento</h3>
                    <p class="ske-documentos-modal-subtitulo">Completa la información del archivo</p>
                </div>
                <div class="ske-documentos-modal-body">
                    <div class="ske-documentos-input-group">
                        <label>Título del Documento *</label>
                        <input type="text" id="docTitulo" placeholder="Ej: Manual de Usuario">
                    </div>
                    <div class="ske-documentos-input-group">
                        <label>Descripción</label>
                        <textarea id="docDescripcion" rows="3" placeholder="Breve descripción del documento..."></textarea>
                    </div>
                    <div class="ske-documentos-input-group">
                        <label>URL / Enlace de Google Drive *</label>
                        <input type="text" id="docUrl" placeholder="https://drive.google.com/...">
                    </div>
                </div>
                <div class="ske-documentos-modal-footer">
                    <button class="ske-documentos-btn-modal ske-documentos-btn-cancelar" id="btnCancel">Cancelar</button>
                    <button class="ske-documentos-btn-modal ske-documentos-btn-guardar" id="btnSave">
                        <svg viewBox="0 0 24 24">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                            <polyline points="17 21 17 13 7 13 7 21"/>
                            <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        ${editId ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </div>
        `);

        modalOverlay.classList.add('ske-documentos-modal-overlay');
        modalOverlay.querySelector('.modal').classList.add('ske-documentos-modal');

        if (editId) {
            this.getCollection().doc(editId).get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('docTitulo').value = data.titulo || '';
                    document.getElementById('docDescripcion').value = data.descripcion || data.texto || '';
                    document.getElementById('docUrl').value = data.url || data.link || '';
                }
            });
        }

        document.getElementById('btnCancel').addEventListener('click', () => modalOverlay.remove());
        document.getElementById('btnSave').addEventListener('click', () => this.guardarDocumento(editId, modalOverlay));
    },

    async guardarDocumento(editId, modalOverlay) {
        const titulo = document.getElementById('docTitulo').value.trim();
        const descripcion = document.getElementById('docDescripcion').value.trim();
        const url = document.getElementById('docUrl').value.trim();

        if (!titulo) {
            App.showToast('️ El título es obligatorio');
            return;
        }
        if (!url) {
            App.showToast('⚠️ El enlace es obligatorio');
            return;
        }

        try {
            const data = {
                titulo,
                descripcion,
                url,
                tipo: 'google_drive',
                fecha: new Date().toLocaleDateString('es-MX'),
                creadoPor: Auth.currentUser?.email || 'admin'
            };

            if (editId) {
                await this.getCollection().doc(editId).update(data);
                App.showToast('✅ Documento actualizado');
            } else {
                await this.getCollection().add(data);
                App.showToast('✅ Documento guardado');
            }

            modalOverlay.remove();
            
            await this.cargarDocumentos();
            
        } catch (error) {
            console.error('Error al guardar:', error);
            App.showToast(' Error: ' + error.message);
        }
    },

    async eliminarDocumento(docId) {
        if (!confirm('¿Eliminar este documento?')) return;
        
        try {
            await this.getCollection().doc(docId).delete();
            App.showToast('🗑️ Documento eliminado');
            await this.cargarDocumentos();
        } catch (error) {
            App.showToast('❌ Error: ' + error.message);
        }
    }
};

export default Documentos;