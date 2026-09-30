// ============================================
// AVISOS.JS - Módulo de Documentos
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
        
        // ✅ Marcar todos los documentos como leídos al entrar al módulo
        this.marcarTodosComoLeidos();
        
        if (isAdmin) {
            document.getElementById('btnAddAviso')?.addEventListener('click', () => this.openModal());
        }
        
        this.cargarDocumentos();
    },

    // ✅ Marcar todos como leídos (para la campanita)
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

    // ✅ Cargar documentos SIN orderBy (más confiable)
    async cargarDocumentos() {
        const list = document.getElementById('avisoList');
        
        try {
            const snapshot = await this.getCollection().get();
            
            const documentos = [];
            snapshot.forEach(doc => {
                documentos.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('📄 Total de documentos cargados:', documentos.length);
            
            // ✅ Ordenar en el cliente por fecha (más reciente primero)
            documentos.sort((a, b) => {
                const fechaA = a.fecha || a.createdAt || '';
                const fechaB = b.fecha || b.createdAt || '';
                return fechaB.localeCompare(fechaA);
            });
            
            if (documentos.length === 0) {
                list.innerHTML = `
                    <div class="ske-avisos-empty">
                        <div class="ske-avisos-empty-icono">
                            <svg viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                        </div>
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
                <div class="ske-avisos-empty">
                    <div class="ske-avisos-empty-icono">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <h3>Error de conexión</h3>
                    <p>Verifica tu conexión a internet</p>
                </div>
            `;
        }
    },

    renderizarLista(documentos) {
        const list = document.getElementById('avisoList');
        const isAdmin = Auth.isAdmin;

        list.innerHTML = `<div class="ske-avisos-lista">` + documentos.map(doc => {
            const leido = this.estaLeido(doc.id);
            
            const titulo = doc.titulo || doc.título || 'Sin título';
            const texto = doc.texto || doc.descripcion || doc.descripción || doc.description || '';
            const link = doc.url || doc.link || doc.enlace || doc.enlance || doc.drive || '';
            const fecha = doc.fecha || (doc.timestamp ? new Date(doc.timestamp.toDate ? doc.timestamp.toDate() : doc.timestamp).toLocaleDateString() : '');
            
            return `
                <div class="ske-avisos-card ${!leido ? 'ske-avisos-nuevo' : ''}">
                    <div class="ske-avisos-card-indicador"></div>
                    <div class="ske-avisos-card-contenido">
                        <div class="ske-avisos-card-header">
                            <div class="ske-avisos-card-titulo">
                                <h3>${titulo}</h3>
                                ${!leido && !isAdmin ? '<span class="ske-avisos-badge-nuevo">NUEVO</span>' : ''}
                            </div>
                            <span class="ske-avisos-card-fecha">${fecha}</span>
                        </div>
                        ${texto ? `<div class="ske-avisos-card-desc">${texto}</div>` : ''}
                        <div class="ske-avisos-card-acciones">
                            ${link ? `<a href="${link}" target="_blank" class="ske-avisos-btn ske-avisos-btn-ver">
                                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                Ver Documento
                            </a>` : '<span class="ske-avisos-sin-enlace">Sin enlace</span>'}
                            ${isAdmin ? `
                                <button class="ske-avisos-btn ske-avisos-btn-editar" data-id="${doc.id}">
                                    <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    Editar
                                </button>
                                <button class="ske-avisos-btn ske-avisos-btn-eliminar" data-id="${doc.id}">
                                    <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    Eliminar
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('') + `</div>`;

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

    // ✅ Guardar documento - CORREGIDO
    async guardarDocumento(editId, modalOverlay) {
        const titulo = document.getElementById('docTitulo').value.trim();
        const texto = document.getElementById('docTexto').value.trim();
        const url = document.getElementById('docUrl').value.trim();

        if (!titulo) {
            App.showToast('⚠️ El título es obligatorio');
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
            
            // ✅ Recalcular campanita para todos los usuarios
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