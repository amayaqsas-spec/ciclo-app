// ============================================
// NOTAS.JS - Módulo con Skeuomorphism (SIN REINICIO)
// ============================================

const Notas = {
    render() {
        const notas = DB.load('notas');

        return `
            <div class="view active ske-notas">
                <!-- HEADER SKEUOMÓRFICO -->
                <div class="ske-notas-header">
                    <div class="ske-notas-icono">
                        <svg viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                        </svg>
                    </div>
                    <div class="ske-notas-texto">
                        <h2 class="ske-notas-titulo">Mis Notas</h2>
                        <p class="ske-notas-subtitulo" id="skeNotasContador">${notas.length} nota${notas.length !== 1 ? 's' : ''} guardada${notas.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button class="ske-notas-btn-nuevo" id="btnNuevaNota">
                        <svg viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span>Nueva</span>
                    </button>
                </div>

                <!-- CONTENEDOR DE LISTA -->
                <div id="skeNotasLista">
                    ${notas.length === 0 ? this.renderEmpty() : this.renderLista(notas)}
                </div>

                <!-- MODAL -->
                <div class="ske-notas-modal-overlay" id="modalNota">
                    <div class="ske-notas-modal">
                        <div class="ske-notas-modal-header">
                            <div class="ske-notas-modal-icono">
                                <svg viewBox="0 0 24 24">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                </svg>
                            </div>
                            <h3 id="modalNotaTitulo">Nueva Nota</h3>
                        </div>
                        
                        <div class="ske-notas-modal-body">
                            <div class="ske-notas-input-group">
                                <label>Título *</label>
                                <input type="text" id="notaTitulo" placeholder="Título de la nota">
                            </div>
                            
                            <div class="ske-notas-input-group">
                                <label>Contenido</label>
                                <textarea id="notaTexto" placeholder="Escribe tu nota aquí..." rows="6"></textarea>
                            </div>
                        </div>
                        
                        <div class="ske-notas-modal-footer">
                            <button class="ske-notas-btn-modal ske-notas-btn-cancelar" id="btnCancelarNota">Cancelar</button>
                            <button class="ske-notas-btn-modal ske-notas-btn-guardar" id="btnGuardarNota">
                                <svg viewBox="0 0 24 24">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                    <polyline points="17 21 17 13 7 13 7 21"/>
                                    <polyline points="7 3 7 8 15 8"/>
                                </svg>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ✅ Renderizar estado vacío
    renderEmpty() {
        return `
            <div class="ske-notas-empty">
                <div class="ske-notas-empty-icono">
                    <svg viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                </div>
                <h3>Sin notas</h3>
                <p>Crea tu primera nota para comenzar</p>
            </div>
        `;
    },

    // ✅ Renderizar lista de notas
    renderLista(notas) {
        return `
            <div class="ske-notas-lista">
                ${notas.map((nota, index) => `
                    <div class="ske-notas-card" data-index="${index}">
                        <div class="ske-notas-card-indicador"></div>
                        <div class="ske-notas-card-contenido">
                            <div class="ske-notas-card-header">
                                <div class="ske-notas-card-titulo">
                                    <h3>${nota.titulo || 'Sin título'}</h3>
                                    <span class="ske-notas-card-fecha">${nota.fecha || ''}</span>
                                </div>
                            </div>
                            ${nota.texto ? `<p class="ske-notas-card-texto">${nota.texto}</p>` : ''}
                            <div class="ske-notas-card-acciones">
                                <button class="ske-notas-btn ske-notas-btn-editar" data-index="${index}">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    Editar
                                </button>
                                <button class="ske-notas-btn ske-notas-btn-eliminar" data-index="${index}">
                                    <svg viewBox="0 0 24 24">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // ✅ Actualizar contador
    actualizarContador(notas) {
        const contador = document.getElementById('skeNotasContador');
        if (contador) {
            contador.textContent = `${notas.length} nota${notas.length !== 1 ? 's' : ''} guardada${notas.length !== 1 ? 's' : ''}`;
        }
    },

    // ✅ Actualizar lista sin recargar vista
    actualizarLista(notas) {
        const listaDiv = document.getElementById('skeNotasLista');
        if (listaDiv) {
            listaDiv.innerHTML = notas.length === 0 ? this.renderEmpty() : this.renderLista(notas);
            this.actualizarContador(notas);
            this.bindEventos(notas);
        }
    },

    // ✅ Mostrar toast de forma segura
    showToast(mensaje) {
        try {
            if (window.App && window.App.showToast) {
                window.App.showToast(mensaje);
            } else if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(mensaje);
            } else {
                // Fallback: alert simple
                console.log(mensaje);
            }
        } catch (e) {
            console.log(mensaje);
        }
    },

    // ✅ Bind de eventos
    bindEventos(notas) {
        document.querySelectorAll('.ske-notas-btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                const nota = notas[index];
                
                window._editIndex = index;
                document.getElementById('modalNotaTitulo').textContent = 'Editar Nota';
                document.getElementById('notaTitulo').value = nota.titulo || '';
                document.getElementById('notaTexto').value = nota.texto || '';
                document.getElementById('modalNota').classList.add('show');
            });
        });

        document.querySelectorAll('.ske-notas-btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                
                if (confirm('¿Eliminar esta nota?')) {
                    notas.splice(index, 1);
                    DB.save('notas', notas);
                    this.showToast('🗑️ Nota eliminada');
                    this.actualizarLista(notas);
                }
            });
        });
    },

    init() {
        const notas = DB.load('notas');
        window._editIndex = -1;

        const modal = document.getElementById('modalNota');
        const btnNuevo = document.getElementById('btnNuevaNota');
        const btnCancelar = document.getElementById('btnCancelarNota');
        const btnGuardar = document.getElementById('btnGuardarNota');

        // Botón Nueva
        btnNuevo?.addEventListener('click', () => {
            window._editIndex = -1;
            document.getElementById('modalNotaTitulo').textContent = 'Nueva Nota';
            document.getElementById('notaTitulo').value = '';
            document.getElementById('notaTexto').value = '';
            modal.classList.add('show');
        });

        // Botón Cancelar
        btnCancelar?.addEventListener('click', () => {
            modal.classList.remove('show');
        });

        // Cerrar modal al hacer clic fuera
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });

        // ✅ Botón Guardar - ACTUALIZA DOM DIRECTAMENTE
        btnGuardar?.addEventListener('click', () => {
            try {
                const titulo = document.getElementById('notaTitulo').value.trim();
                const texto = document.getElementById('notaTexto').value.trim();

                if (!titulo) {
                    this.showToast('⚠️ El título es obligatorio');
                    return;
                }

                const hoy = new Date();
                const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

                const nota = {
                    titulo,
                    texto,
                    fecha,
                    createdAt: Date.now()
                };

                const editIndex = window._editIndex;

                if (editIndex >= 0) {
                    notas[editIndex] = { ...notas[editIndex], ...nota };
                    this.showToast('✅ Nota actualizada');
                } else {
                    notas.push(nota);
                    this.showToast('✅ Nota guardada');
                }

                DB.save('notas', notas);
                modal.classList.remove('show');
                
                // ✅ Actualizar DOM directamente - SIN recargar vista
                this.actualizarLista(notas);
                
            } catch (error) {
                console.error('Error al guardar nota:', error);
                this.showToast('❌ Error al guardar');
            }
        });

        // Bind de eventos para editar/eliminar
        this.bindEventos(notas);
    }
};

export default Notas;