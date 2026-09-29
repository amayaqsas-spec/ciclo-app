// ============================================
// TIEMPO-EXTRA.JS - Módulo con Skeuomorphism
// ============================================

const TiempoExtra = {
    render() {
        const items = DB.load('tiempoExtra');
        const pendientes = items.filter(i => !i.cobrado).length;
        const cobrados = items.filter(i => i.cobrado).length;

        return `
            <div class="view active ske-te">
                <!-- HEADER SKEUOMÓRFICO -->
                <div class="ske-te-header">
                    <div class="ske-te-header-icono">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div class="ske-te-header-texto">
                        <h2 class="ske-te-titulo">Tiempo Extra</h2>
                        <p class="ske-te-subtitulo">Registra tus horas adicionales</p>
                    </div>
                    <button class="ske-te-btn-nuevo" id="btnNuevoTE">
                        <svg viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span>Nuevo</span>
                    </button>
                </div>

                <!-- ESTADÍSTICAS -->
                <div id="skeTeStats">
                    ${items.length > 0 ? `
                        <div class="ske-te-stats">
                            <div class="ske-te-stat-card ske-te-stat-pendiente">
                                <div class="ske-te-stat-numero">${pendientes}</div>
                                <div class="ske-te-stat-label">Pendientes</div>
                            </div>
                            <div class="ske-te-stat-card ske-te-stat-cobrado">
                                <div class="ske-te-stat-numero">${cobrados}</div>
                                <div class="ske-te-stat-label">Cobrados</div>
                            </div>
                            <div class="ske-te-stat-card ske-te-stat-total">
                                <div class="ske-te-stat-numero">${items.length}</div>
                                <div class="ske-te-stat-label">Total</div>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- LISTA -->
                <div id="skeTeLista">
                    ${items.length === 0 ? this.renderEmpty() : this.renderLista(items)}
                </div>

                <!-- MODAL -->
                <div class="ske-te-modal-overlay" id="modalTE">
                    <div class="ske-te-modal">
                        <div class="ske-te-modal-header">
                            <div class="ske-te-modal-icono">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </div>
                            <h3 id="modalTETitulo">Nuevo Tiempo Extra</h3>
                        </div>
                        
                        <div class="ske-te-modal-body">
                            <!-- ✅ CAMPO TIPO CONVERTIDO EN SELECT -->
                            <div class="ske-te-input-group">
                                <label>Tipo *</label>
                                <select id="teTipo">
                                    <option value="">Selecciona un tipo...</option>
                                    <option value="Servicio">Servicio</option>
                                    <option value="110">110</option>
                                    <option value="Suplementario">Suplementario</option>
                                </select>
                            </div>
                            
                            <div class="ske-te-input-group">
                                <label>Fecha *</label>
                                <input type="date" id="teFecha">
                            </div>
                            
                            <div class="ske-te-input-group">
                                <label>Servicio</label>
                                <input type="text" id="teServicio" placeholder="Número de servicio">
                            </div>
                            
                            <div class="ske-te-input-group">
                                <label>Nota</label>
                                <textarea id="teNota" placeholder="Detalles adicionales" rows="3"></textarea>
                            </div>
                        </div>
                        
                        <div class="ske-te-modal-footer">
                            <button class="ske-te-btn-modal ske-te-btn-cancelar" id="btnCancelarTE">Cancelar</button>
                            <button class="ske-te-btn-modal ske-te-btn-guardar" id="btnGuardarTE">
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

    renderEmpty() {
        return `
            <div class="ske-te-empty">
                <div class="ske-te-empty-icono">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                </div>
                <h3>Sin registros</h3>
                <p>Agrega tu primer tiempo extra</p>
            </div>
        `;
    },

    renderLista(items) {
        return `
            <div class="ske-te-lista">
                ${items.map((item, index) => `
                    <div class="ske-te-card ${item.cobrado ? 'ske-te-cobrado' : 'ske-te-pendiente'}" data-index="${index}">
                        <div class="ske-te-card-indicador"></div>
                        <div class="ske-te-card-contenido">
                            <div class="ske-te-card-header">
                                <div class="ske-te-card-titulo">
                                    <h3>${item.tipo || 'Tiempo Extra'}</h3>
                                    ${item.servicio ? `<span class="ske-te-card-servicio">Serv ${item.servicio}</span>` : ''}
                                </div>
                                <span class="ske-te-card-fecha">${item.fecha || ''}</span>
                            </div>
                            ${item.nota ? `<p class="ske-te-card-nota">${item.nota}</p>` : ''}
                            <div class="ske-te-card-acciones">
                                <button class="ske-te-btn ske-te-btn-cobrar ${item.cobrado ? 'ske-te-btn-cobrado-activo' : ''}" data-index="${index}">
                                    <svg viewBox="0 0 24 24">
                                        ${item.cobrado 
                                            ? '<polyline points="20 6 9 17 4 12"/>' 
                                            : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'}
                                    </svg>
                                    ${item.cobrado ? 'Cobrado' : 'Marcar cobrado'}
                                </button>
                                <button class="ske-te-btn ske-te-btn-editar" data-index="${index}">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    Editar
                                </button>
                                <button class="ske-te-btn ske-te-btn-eliminar" data-index="${index}">
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

    actualizarStats(items) {
        const pendientes = items.filter(i => !i.cobrado).length;
        const cobrados = items.filter(i => i.cobrado).length;
        const statsDiv = document.getElementById('skeTeStats');
        
        if (statsDiv) {
            if (items.length > 0) {
                statsDiv.innerHTML = `
                    <div class="ske-te-stats">
                        <div class="ske-te-stat-card ske-te-stat-pendiente">
                            <div class="ske-te-stat-numero">${pendientes}</div>
                            <div class="ske-te-stat-label">Pendientes</div>
                        </div>
                        <div class="ske-te-stat-card ske-te-stat-cobrado">
                            <div class="ske-te-stat-numero">${cobrados}</div>
                            <div class="ske-te-stat-label">Cobrados</div>
                        </div>
                        <div class="ske-te-stat-card ske-te-stat-total">
                            <div class="ske-te-stat-numero">${items.length}</div>
                            <div class="ske-te-stat-label">Total</div>
                        </div>
                    </div>
                `;
            } else {
                statsDiv.innerHTML = '';
            }
        }
    },

    actualizarLista(items) {
        const listaDiv = document.getElementById('skeTeLista');
        if (listaDiv) {
            listaDiv.innerHTML = items.length === 0 ? this.renderEmpty() : this.renderLista(items);
            this.actualizarStats(items);
            this.bindEventos(items);
        }
    },

    showToast(mensaje) {
        try {
            if (window.App && window.App.showToast) {
                window.App.showToast(mensaje);
            } else if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(mensaje);
            } else {
                console.log(mensaje);
            }
        } catch (e) {
            console.log(mensaje);
        }
    },

    bindEventos(items) {
        document.querySelectorAll('.ske-te-btn-cobrar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                items[index].cobrado = !items[index].cobrado;
                DB.save('tiempoExtra', items);
                this.showToast(items[index].cobrado ? '✅ Marcado como cobrado' : '↩️ Marcado como pendiente');
                this.actualizarLista(items);
            });
        });

        document.querySelectorAll('.ske-te-btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                const item = items[index];
                
                window._teEditIndex = index;
                document.getElementById('modalTETitulo').textContent = 'Editar Tiempo Extra';
                document.getElementById('teTipo').value = item.tipo || '';
                document.getElementById('teFecha').value = item.fecha || '';
                document.getElementById('teServicio').value = item.servicio || '';
                document.getElementById('teNota').value = item.nota || '';
                document.getElementById('modalTE').classList.add('show');
            });
        });

        document.querySelectorAll('.ske-te-btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                
                if (confirm('¿Eliminar este registro de tiempo extra?')) {
                    items.splice(index, 1);
                    DB.save('tiempoExtra', items);
                    this.showToast('🗑️ Registro eliminado');
                    this.actualizarLista(items);
                }
            });
        });
    },

    init() {
        const items = DB.load('tiempoExtra');
        window._teEditIndex = -1;

        const modal = document.getElementById('modalTE');
        const btnNuevo = document.getElementById('btnNuevoTE');
        const btnCancelar = document.getElementById('btnCancelarTE');
        const btnGuardar = document.getElementById('btnGuardarTE');

        const tipoSelect = document.getElementById('teTipo');
        const fechaInput = document.getElementById('teFecha');
        const servicioInput = document.getElementById('teServicio');
        const notaInput = document.getElementById('teNota');

        btnNuevo?.addEventListener('click', () => {
            window._teEditIndex = -1;
            document.getElementById('modalTETitulo').textContent = 'Nuevo Tiempo Extra';
            tipoSelect.value = '';
            fechaInput.value = new Date().toISOString().split('T')[0];
            servicioInput.value = '';
            notaInput.value = '';
            modal.classList.add('show');
        });

        btnCancelar?.addEventListener('click', () => {
            modal.classList.remove('show');
        });

        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });

        btnGuardar?.addEventListener('click', () => {
            try {
                const tipo = tipoSelect.value.trim();
                const fecha = fechaInput.value;
                const servicio = servicioInput.value.trim();
                const nota = notaInput.value.trim();

                if (!tipo) {
                    this.showToast('⚠️ Selecciona un tipo');
                    return;
                }

                if (!fecha) {
                    this.showToast('⚠️ La fecha es obligatoria');
                    return;
                }

                const item = {
                    tipo,
                    fecha,
                    servicio,
                    nota,
                    cobrado: false,
                    createdAt: Date.now()
                };

                const editIndex = window._teEditIndex;

                if (editIndex >= 0) {
                    items[editIndex] = { ...items[editIndex], ...item };
                    this.showToast('✅ Registro actualizado');
                } else {
                    items.push(item);
                    this.showToast('✅ Registro agregado');
                }

                DB.save('tiempoExtra', items);
                modal.classList.remove('show');
                
                this.actualizarLista(items);
                
            } catch (error) {
                console.error('Error al guardar:', error);
                this.showToast('❌ Error al guardar');
            }
        });

        this.bindEventos(items);
    }
};

export default TiempoExtra;