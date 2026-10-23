// ============================================
// AVISOS.JS - Módulo de Documentos (Vista Móvil Optimizada)
// ============================================

const Avisos = {
    getCollection() {
        return window.firebase.firestore().collection('avisos');
    },

    render() {
        const isAdmin = Auth.isAdmin;
        
        return `
            <div class="view active ske-avisos">
                <!-- HEADER SKEUOMÓRFICO -->
                <div class="ske-avisos-header">
                    <div class="ske-avisos-icono">
                        <svg viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                    </div>
                    <div class="ske-avisos-texto">
                        <h2 class="ske-avisos-titulo">Documentos</h2>
                        <p class="ske-avisos-subtitulo">Gestiona y comparte archivos</p>
                    </div>
                    ${isAdmin ? `
                        <button class="ske-avisos-btn-nuevo" id="btnAddAviso">
                            <svg viewBox="0 0 24 24">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            <span>Nuevo</span>
                        </button>
                    ` : ''}
                </div>

                <!-- CONTENEDOR DE LISTA -->
                <div id="avisoList">
                    <div class="ske-avisos-loading">
                        <div class="spinner" style="border-color:var(--primary-soft); border-top-color:var(--primary); width:32px; height:32px;"></div>
                        <p>Cargando documentos...</p>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const isAdmin = Auth.isAdmin;
        
        this.marcarTodosComoLeidos();
        
        if (isAdmin) {
            document.getElementById('btnAddAviso')?.addEventListener('click', () => this.openModal());
        }
        
        this.cargarDocumentos();
    },

    async marcarTodosComoLeidos() {
        try {
            const leidos = DB.get('docsLeidos', []);
            const snapshot = await this.getCollection().get();
            
            const todosIds = [];
            snapshot.forEach((doc) => {
                todosIds.push(doc.id);
            });
            
            const nuevosLeidos = [...new Set([...leidos, ...todosIds])];
            DB.set('docsLeidos', nuevosLeidos);
            DB.set('avisosNoLeidos', 0);
            
            const bellBadge = document.getElementById('bellBadge');
            const btnNotificaciones = document.getElementById('btnNotificaciones');
            if (bellBadge) bellBadge.style.display = 'none';
            if (btnNotificaciones) btnNotificaciones.classList.remove('has-notifications');
            
            console.log('✅ Documentos marcados como leídos:', todosIds.length);
        } catch (error) {
            console.error('Error al marcar como leídos:', error);
        }
    },

    async cargarDocumentos() {
        const list = document.getElementById('avisoList');
        
        try {
            const snapshot = await this.getCollection().get();
            
            const documentos = [];
            snapshot.forEach(doc => {
                documentos.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(' Total de documentos cargados:', documentos.length);
            
            documentos.sort((a, b) => {
                const fechaA = a.fecha || a.createdAt || '';
                const fechaB = b.fecha || b.createdAt || '';
                return fechaB.localeCompare(fechaA);
            });
            
            if (documentos.length === 0) {
                list.innerHTML = `
                    <div class="ske-avisos-empty" style="text-align: center; padding: 40px 20px; color: var(--text-soft);">
                        <div style="font-size: 48px; margin-bottom: 12px;">📂</div>
                        <h3>Sin documentos</h3>
                        <p>No hay documentos registrados aún</p>
                    </div>
                `;
                return;
            }
            
            if (!Auth.isAdmin) {
                this.marcarComoLeidos(documentos);
            }
            
            this.renderizarLista(documentos);
            
        } catch (error) {
            console.error('❌ Error al cargar:', error);
            list.innerHTML = `
                <div class="ske-avisos-empty" style="text-align: center; padding: 40px 20px; color: var(--text-soft);">
                    <div style="font-size: 48px; margin-bottom: 12px;">⚠️</div>
                    <h3>Error de conexión</h3>
                    <p>Verifica tu conexión a internet</p>
                </div>
            `;
        }
    },

    // ✅ VISTA MÓVIL OPTIMIZADA - SIN COLUMNA TIPO
    renderizarLista(documentos) {
        const list = document.getElementById('avisoList');
        const isAdmin = Auth.isAdmin;

        let html = `<div class="ske-avisos-lista">`;

        html += documentos.map(doc => {
            const leido = this.estaLeido(doc.id);
            const titulo = doc.titulo || doc.título || 'Sin título';
            const texto = doc.texto || doc.descripcion || doc.descripción || doc.description || '';
            const link = doc.url || doc.link || doc.enlace || doc.enlance || doc.drive || '';
            const fecha = doc.fecha || (doc.timestamp ? new Date(doc.timestamp.toDate ? doc.timestamp.toDate() : doc.timestamp).toLocaleDateString('es-MX') : 'Sin fecha');
            
            // Determinar icono según tipo
            let icono = '📄';
            const nombreLower = titulo.toLowerCase();
            if (nombreLower.includes('pdf')) icono = '📕';
            else if (nombreLower.includes('jpg') || nombreLower.includes('png') || nombreLower.includes('img')) icono = '🖼️';
            else if (nombreLower.includes('xls') || nombreLower.includes('excel')) icono = '📗';
            else if (nombreLower.includes('doc') || nombreLower.includes('word')) icono = '📘';
            else if (link.includes('drive')) icono = '📁';

            return `
                <div class="ske-avisos-card ${!leido && !isAdmin ? 'ske-avisos-nuevo' : ''}" style="
                    background: var(--surface);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                    border-left: 4px solid ${!leido && !isAdmin ? 'var(--primary)' : 'var(--bg-soft)'};
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                ">
                    <!-- Header: Icono + Nombre + Fecha -->
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px;">
                        <div style="display: flex; align-items: flex-start; gap: 12px; flex: 1; overflow: hidden;">
                            <div style="font-size: 32px; flex-shrink: 0;">${icono}</div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                    <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${titulo}</h3>
                                    ${!leido && !isAdmin ? '<span class="ske-avisos-badge-nuevo" style="font-size: 9px; padding: 2px 6px; border-radius: 4px; background: var(--primary); color: white; font-weight: 700; flex-shrink: 0;">NUEVO</span>' : ''}
                                </div>
                                ${texto ? `<p style="margin: 0; font-size: 12px; color: var(--text-soft); line-height: 1.4;">${texto}</p>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Fecha -->
                    <div style="font-size: 12px; color: var(--text-soft); margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--bg-soft);">
                        📅 ${fecha}
                    </div>
                    
                    <!-- Botones -->
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        ${link ? `<a href="${link}" target="_blank" class="ske-avisos-btn ske-avisos-btn-ver" style="flex: 1; min-width: 100px; padding: 10px 16px; font-size: 13px; border-radius: 8px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; background: var(--primary); color: white; border: none; cursor: pointer; font-weight: 600;">️ Ver</a>` : ''}
                        ${isAdmin ? `
                            <button class="ske-avisos-btn ske-avisos-btn-editar" data-id="${doc.id}" style="flex: 1; min-width: 80px; padding: 10px 16px; font-size: 13px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 4px; background: #FF9800; color: white; border: none; cursor: pointer; font-weight: 600;">✏️ Editar</button>
                            <button class="ske-avisos-btn ske-avisos-btn-eliminar" data-id="${doc.id}" style="flex: 1; min-width: 80px; padding: 10px 16px; font-size: 13px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 4px; background: #c62828; color: white; border: none; cursor: pointer; font-weight: 600;">🗑️ Eliminar</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        html += `</div>`;
        html += `<div style="margin-top: 12px; font-size: 12px; color: var(--text-soft); text-align: right; padding: 0 8px;">Total: ${documentos.length} documento${documentos.length !== 1 ? 's' : ''}</div>`;

        list.innerHTML = html;

        if (isAdmin) {
            list.querySelectorAll('.ske-avisos-btn-editar').forEach(btn => {
                btn.addEventListener('click', () => this.openModal(btn.dataset.id));
            });
            list.querySelectorAll('.ske-avisos-btn-eliminar').forEach(btn => {
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

        const modalOverlay = App.showModal(`
            <div class="ske-avisos-modal-inner">
                <div class="ske-avisos-modal-header">
                    <div class="ske-avisos-modal-icono">
                        <svg viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                    </div>
                    <h3>${editId ? 'Editar' : 'Nuevo'} Documento</h3>
                    <p class="ske-avisos-modal-subtitulo">Completa la información del archivo</p>
                </div>
                <div class="ske-avisos-modal-body">
                    <div class="ske-avisos-input-group">
                        <label>Título del Documento *</label>
                        <input type="text" id="docTitulo" placeholder="Ej: Calendario de Pagos">
                    </div>
                    <div class="ske-avisos-input-group">
                        <label>Descripción</label>
                        <textarea id="docTexto" rows="3" placeholder="Detalles adicionales..."></textarea>
                    </div>
                    <div class="ske-avisos-input-group">
                        <label>URL / Enlace *</label>
                        <input type="text" id="docUrl" placeholder="https://drive.google.com/...">
                    </div>
                </div>
                <div class="ske-avisos-modal-footer">
                    <button class="ske-avisos-btn-modal ske-avisos-btn-cancelar" id="btnCancel">Cancelar</button>
                    <button class="ske-avisos-btn-modal ske-avisos-btn-guardar" id="btnSave">
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

        modalOverlay.classList.add('ske-avisos-modal-overlay');
        modalOverlay.querySelector('.modal').classList.add('ske-avisos-modal');

        if (editId) {
            this.getCollection().doc(editId).get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('docTitulo').value = data.titulo || '';
                    document.getElementById('docTexto').value = data.texto || '';
                    document.getElementById('docUrl').value = data.url || data.link || '';
                }
            });
        }

        document.getElementById('btnCancel').addEventListener('click', () => modalOverlay.remove());
        document.getElementById('btnSave').addEventListener('click', () => this.guardarDocumento(editId, modalOverlay));
    },

    async guardarDocumento(editId, modalOverlay) {
        const titulo = document.getElementById('docTitulo').value.trim();
        const texto = document.getElementById('docTexto').value.trim();
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
                texto,
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
            
            if (window.App && window.App.inicializarCampanita) {
                setTimeout(() => {
                    window.App.inicializarCampanita();
                }, 1000);
            }
            
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

export default Avisos;
