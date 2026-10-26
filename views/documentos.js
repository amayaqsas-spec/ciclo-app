// ============================================
// DOCUMENTOS.JS - Módulo de Documentos
// ============================================

const Documentos = {
    getCollection() {
        return window.firebase.firestore().collection('documentos');
    },

    render() {
        const isAdmin = Auth.isAdmin;
        
        return `
            <div class="view active">
                <div style="padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div>
                            <h2 style="margin: 0; font-size: 22px; color: var(--primary);">📄 Documentos</h2>
                            <p style="margin: 4px 0 0 0; color: var(--text-soft); font-size: 14px;">Archivos y enlaces compartidos</p>
                        </div>
                        ${isAdmin ? `
                            <button id="btnAddDocumento" style="background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2;">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Nuevo
                            </button>
                        ` : ''}
                    </div>

                    <div id="documentoList">
                        <div style="text-align: center; padding: 40px; color: var(--text-soft);">
                            <div class="spinner" style="border-color: var(--primary-soft); border-top-color: var(--primary); width: 32px; height: 32px; margin: 0 auto 16px;"></div>
                            <p>Cargando documentos...</p>
                        </div>
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
                    <div style="text-align: center; padding: 60px 20px; background: var(--surface); border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                        <div style="font-size: 64px; margin-bottom: 16px;">📂</div>
                        <h3 style="margin: 0 0 8px 0; color: var(--text);">Sin documentos</h3>
                        <p style="margin: 0; color: var(--text-soft);">No hay documentos registrados aún</p>
                    </div>
                `;
                return;
            }
            
            this.renderizarLista(documentos);
            
        } catch (error) {
            console.error('❌ Error al cargar:', error);
            list.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; background: var(--surface); border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                    <div style="font-size: 64px; margin-bottom: 16px;">⚠️</div>
                    <h3 style="margin: 0 0 8px 0; color: var(--text);">Error de conexión</h3>
                    <p style="margin: 0; color: var(--text-soft);">Verifica tu conexión a internet</p>
                </div>
            `;
        }
    },

    renderizarLista(documentos) {
        const list = document.getElementById('documentoList');
        const isAdmin = Auth.isAdmin;

        let html = `<div style="display: flex; flex-direction: column; gap: 12px;">`;

        html += documentos.map(doc => {
            const titulo = doc.titulo || doc.título || 'Sin título';
            const link = doc.url || doc.link || doc.enlace || doc.drive || '';
            const descripcion = doc.descripcion || doc.texto || '';
            
            return `
                <div style="background: var(--surface); padding: 16px; border-radius: 12px; box-shadow: var(--clay-shadow-sm); display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px;">${titulo}</div>
                        ${descripcion ? `<div style="font-size: 13px; color: var(--text-soft); line-height: 1.5; margin-bottom: 8px;">${descripcion}</div>` : ''}
                        ${link ? `<a href="${link}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--primary); text-decoration: none; font-weight: 600; padding: 6px 12px; background: var(--bg-soft); border-radius: 6px;">
                            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2;">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            Abrir enlace
                        </a>` : ''}
                    </div>
                    ${isAdmin ? `
                        <div style="display: flex; gap: 8px; flex-shrink: 0;">
                            <button onclick="Documentos.openModal('${doc.id}')" style="background: var(--bg-soft); color: var(--primary); border: none; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">
                                ✏️ Editar
                            </button>
                            <button onclick="Documentos.eliminarDocumento('${doc.id}')" style="background: #ffebee; color: #c62828; border: none; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">
                                🗑️ Eliminar
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        html += `</div>`;
        html += `<div style="margin-top: 16px; font-size: 12px; color: var(--text-soft); text-align: right;">Total: ${documentos.length} documento${documentos.length !== 1 ? 's' : ''}</div>`;

        list.innerHTML = html;
    },

    openModal(editId = null) {
        if (!Auth.isAdmin) {
            App.showToast('Solo el administrador puede realizar esta acción');
            return;
        }

        const modalOverlay = App.showModal(`
            <div style="background: var(--surface); padding: 24px; border-radius: 16px; max-width: 90%; width: 500px; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin: 0 0 8px 0; font-size: 20px; color: var(--primary);">${editId ? '✏️ Editar' : ' Nuevo'} Documento</h3>
                <p style="margin: 0 0 20px 0; color: var(--text-soft); font-size: 13px;">Completa la información del archivo</p>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text);">Título del Documento *</label>
                    <input type="text" id="docTitulo" placeholder="Ej: Manual de Usuario" style="width: 100%; padding: 12px; border: 2px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text); box-sizing: border-box;">
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text);">Descripción</label>
                    <textarea id="docDescripcion" rows="3" placeholder="Breve descripción del documento..." style="width: 100%; padding: 12px; border: 2px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text); resize: vertical; box-sizing: border-box;"></textarea>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text);">URL / Enlace de Google Drive *</label>
                    <input type="text" id="docUrl" placeholder="https://drive.google.com/..." style="width: 100%; padding: 12px; border: 2px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text); box-sizing: border-box;">
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button id="btnCancel" style="flex: 1; padding: 12px; background: var(--bg-soft); color: var(--text); border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                        Cancelar
                    </button>
                    <button id="btnSave" style="flex: 1; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                        ${editId ? '💾 Actualizar' : '✅ Guardar'}
                    </button>
                </div>
            </div>
        `);

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
            App.showToast('⚠️ El título es obligatorio');
            return;
        }
        if (!url) {
            App.showToast('️ El enlace es obligatorio');
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
            App.showToast('❌ Error: ' + error.message);
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