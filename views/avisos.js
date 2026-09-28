// ============================================
// AVISOS.JS - Versión de DIAGNÓSTICO COMPLETO
// ============================================

const Avisos = {
    getCollection() {
        return window.firebase.firestore().collection('avisos');
    },

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
                
                <!-- PANEL DE DIAGNÓSTICO -->
                <div id="diagnosticoPanel" style="background:#fff3cd;border:2px solid #ffc107;border-radius:12px;padding:12px;margin:10px;font-size:12px;color:#856404;">
                    <strong> Diagnóstico:</strong>
                    <div id="diagnosticoTexto" style="margin-top:8px;">Iniciando...</div>
                </div>
                
                <div id="avisoList">
                    <div style="text-align:center; padding:40px; color:var(--text-soft);">
                        <div class="spinner" style="border-color:var(--primary-soft); border-top-color:var(--primary); width:32px; height:32px; margin:0 auto 10px;"></div>
                        Cargando documentos...
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const isAdmin = Auth.isAdmin;
        
        if (isAdmin) {
            document.getElementById('btnAddAviso')?.addEventListener('click', () => this.openModal());
        }
        
        this.cargarDocumentos();
    },

    async cargarDocumentos() {
        const diagnostico = document.getElementById('diagnosticoTexto');
        const list = document.getElementById('avisoList');
        
        try {
            // Verificar que Firebase esté disponible
            if (!window.firebase) {
                diagnostico.innerHTML = '❌ Firebase no está cargado';
                return;
            }
            
            if (!window.firebase.firestore) {
                diagnostico.innerHTML = '❌ Firestore no está disponible';
                return;
            }
            
            if (!Auth.currentUser) {
                diagnostico.innerHTML = '❌ No hay usuario autenticado';
                return;
            }
            
            diagnostico.innerHTML = `✅ Firebase OK. Usuario: ${Auth.currentUser.email}<br>⏳ Conectando a Firestore...`;
            
            // Intentar leer la colección
            const snapshot = await this.getCollection().get();
            
            const documentos = [];
            snapshot.forEach(doc => {
                documentos.push({ id: doc.id, ...doc.data() });
            });
            
            diagnostico.innerHTML = `✅ Conectado. Documentos: <strong>${documentos.length}</strong>`;
            
            if (documentos.length === 0) {
                list.innerHTML = `
                    <div class="aviso-empty">
                        <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                        <p>No hay documentos en Firestore</p>
                    </div>
                `;
                return;
            }
            
            // Mostrar primeros 3 documentos para diagnóstico
            const preview = documentos.slice(0, 3).map(d => `• ${d.titulo || 'Sin título'}`).join('<br>');
            diagnostico.innerHTML += `<br><small>Primeros: ${preview}</small>`;
            
            // Marcar como leídos
            if (!Auth.isAdmin) {
                this.marcarComoLeidos(documentos);
            }
            
            this.renderizarLista(documentos);
            
        } catch (error) {
            console.error('Error completo:', error);
            diagnostico.innerHTML = `❌ Error: ${error.code || ''}<br>${error.message}`;
            list.innerHTML = `
                <div class="aviso-empty">
                    <p style="color:#dc3545;"><strong>Error al cargar documentos</strong></p>
                    <p style="font-size:11px;color:var(--text-soft);word-break:break-all;margin-top:10px;">${error.message}</p>
                </div>
            `;
        }
    },

    renderizarLista(documentos) {
        const list = document.getElementById('avisoList');
        const isAdmin = Auth.isAdmin;

        list.innerHTML = documentos.map(doc => {
            const leido = this.estaLeido(doc.id);
            
            const titulo = doc.titulo || doc.título || 'Sin título';
            const texto = doc.texto || doc.descripcion || '';
            const link = doc.url || doc.link || doc.enlace || '';
            const fecha = doc.fecha || '';
            
            return `
                <div class="item-card ${!leido ? 'aviso-nuevo' : ''}">
                    <div class="item-header">
                        <div class="item-title">
                            ${titulo}
                            ${!leido && !isAdmin ? '<span class="badge-nuevo">NUEVO</span>' : ''}
                        </div>
                        <div class="item-date">${fecha}</div>
                    </div>
                    ${texto ? `<div class="item-desc">${texto}</div>` : ''}
                    <div class="item-actions">
                        ${link ? `<a href="${link}" target="_blank" class="btn-pdf">📄 Ver Documento</a>` : ''}
                        ${isAdmin ? `
                            <button class="btn-edit" data-id="${doc.id}">Editar</button>
                            <button class="btn-remove" data-id="${doc.id}">Eliminar</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        if (isAdmin) {
            list.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', () => this.openModal(btn.dataset.id));
            });
            list.querySelectorAll('.btn-remove').forEach(btn => {
                btn.addEventListener('click', () => this.eliminarDocumento(btn.dataset.id));
            });
        }
    },

    estaLeido(docId) {
        const leidos = DB.get('docsLeidos', []);
        return leidos.includes(docId);
    },

    marcarComoLeidos(documentos) {
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
            const noLeidos = documentos.filter(d => !leidos.includes(d.id)).length;
            DB.set('avisosNoLeidos', noLeidos);
        }
    },

    openModal(editId = null) {
        if (!Auth.isAdmin) {
            App.showToast('Solo el administrador puede realizar esta acción');
            return;
        }

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Documento</h3>
            <div class="modal-scroll-content">
                <div class="input-group">
                    <label>Título *</label>
                    <input type="text" id="docTitulo" placeholder="Ej: Calendario de Pagos">
                </div>
                <div class="input-group">
                    <label>Descripción</label>
                    <textarea id="docTexto" rows="3" placeholder="Detalles..."></textarea>
                </div>
                <div class="input-group">
                    <label>URL / Enlace *</label>
                    <input type="text" id="docUrl" placeholder="https://drive.google.com/...">
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        if (editId) {
            this.getCollection().doc(editId).get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('docTitulo').value = data.titulo || '';
                    document.getElementById('docTexto').value = data.texto || '';
                    document.getElementById('docUrl').value = data.url || '';
                }
            });
        }

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => this.guardarDocumento(editId, modal));
    },

    async guardarDocumento(editId, modal) {
        const titulo = document.getElementById('docTitulo').value.trim();
        const texto = document.getElementById('docTexto').value.trim();
        const url = document.getElementById('docUrl').value.trim();

        if (!titulo || !url) {
            App.showToast('Título y URL son obligatorios');
            return;
        }

        try {
            const data = {
                titulo,
                texto,
                url,
                tipo: 'google_drive',
                uploadedBy: Auth.currentUser.email,
                timestamp: window.firebase.firestore.FieldValue.serverTimestamp(),
                fecha: new Date().toLocaleDateString()
            };

            if (editId) {
                await this.getCollection().doc(editId).update(data);
            } else {
                await this.getCollection().add(data);
            }

            modal.remove();
            App.showToast(editId ? 'Actualizado' : 'Guardado');
            await this.cargarDocumentos();
            
        } catch (error) {
            console.error('Error al guardar:', error);
            App.showToast('Error: ' + error.message);
        }
    },

    async eliminarDocumento(docId) {
        if (!confirm('¿Eliminar este documento?')) return;
        
        try {
            await this.getCollection().doc(docId).delete();
            App.showToast('Eliminado');
            await this.cargarDocumentos();
        } catch (error) {
            App.showToast('Error: ' + error.message);
        }
    }
};

export default Avisos;