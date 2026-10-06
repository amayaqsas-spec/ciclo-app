// ============================================
// TURNO.JS - Módulo de Registro de Turnos con Firebase y Skeuomorfismo
// ============================================

const Turno = {
    render() {
        const turnos = DB.load('turnos');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        console.log('📋 Renderizando turnos:', turnos.length);
        console.log('📋 Líneas disponibles:', lineas.length);
        console.log('📋 Terminales disponibles:', terminales.length);

        return `
            <div class="view active ske-registro">
                <div class="ske-registro-header">
                    <div class="ske-registro-icono">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div class="ske-registro-texto">
                        <h2 class="ske-registro-titulo">Registro de Turnos</h2>
                        <p class="ske-registro-subtitulo">${turnos.length} turnos registrados</p>
                    </div>
                    <button class="ske-registro-btn-nuevo" id="btnAddTurno">
                        <svg viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span>Nuevo</span>
                    </button>
                </div>

                <div id="turnoList">
                    ${turnos.length === 0 ? `
                        <div class="ske-registro-empty">
                            <p>No hay turnos registrados</p>
                        </div>
                    ` : `
                        <div class="ske-registro-lista">
                            ${turnos.map(t => {
                                const linea = lineas.find(l => l.id === t.lineaId);
                                const terminal = terminales.find(term => term.id === t.terminalId);
                                
                                console.log(`🔍 Turno: ${t.nombre}, Línea: ${linea ? linea.nombre : '❌'}, Terminal: ${terminal ? terminal.nombre : '❌'}`);
                                
                                return `
                                    <div class="ske-registro-card">
                                        <div class="ske-registro-card-info">
                                            <strong>${t.nombre || 'Sin nombre'}</strong>
                                            <p>
                                                <span style="color:var(--primary);">📍 ${linea ? linea.nombre : 'Sin línea'}</span> | 
                                                <span>🚇 ${terminal ? terminal.nombre : 'Sin terminal'}</span>
                                            </p>
                                        </div>
                                        <div class="ske-registro-card-acciones">
                                            <button class="ske-registro-btn-editar" data-id="${t.id}">Editar</button>
                                            <button class="ske-registro-btn-eliminar" data-id="${t.id}">Eliminar</button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    async init() {
        // ✅ 1. Cargar datos desde Firebase (actualiza caché local)
        await DB_FIREBASE.load('turnos');
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');

        console.log('✅ Datos de Turnos cargados en init()');

        // ✅ 2. Renderizar la vista
        const container = document.getElementById('viewContainer');
        container.innerHTML = this.render();

        // ✅ 3. Adjuntar eventos
        document.getElementById('btnAddTurno')?.addEventListener('click', () => this.openModal());

        document.querySelectorAll('.ske-registro-btn-editar').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });

        document.querySelectorAll('.ske-registro-btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => this.eliminar(btn.dataset.id));
        });
    },

    async openModal(editId = null) {
        const turnos = DB.load('turnos');
        const turno = editId ? turnos.find(t => t.id === editId) : null;
        
        // ✅ Asegurar que tenemos las líneas y terminales más recientes
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');
        
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        console.log('📋 Líneas en modal:', lineas);
        console.log('📋 Terminales en modal:', terminales);

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}" ${turno && turno.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const modalOverlay = App.showModal(`
            <div class="ske-registro-modal-inner">
                <div class="ske-registro-modal-header">
                    <h3>${editId ? 'Editar' : 'Nuevo'} Turno</h3>
                </div>
                <div class="ske-registro-modal-body">
                    <div class="ske-registro-input-group">
                        <label>Línea *</label>
                        <select id="turnoLinea" class="ske-registro-select">${lineaOptions}</select>
                    </div>
                    <div class="ske-registro-input-group">
                        <label>Terminal *</label>
                        <select id="turnoTerminal" class="ske-registro-select">
                            <option value="">Selecciona línea primero</option>
                        </select>
                    </div>
                    <div class="ske-registro-input-group">
                        <label>Nombre del Turno *</label>
                        <input type="text" id="turnoNombre" class="ske-registro-input" value="${turno ? turno.nombre : ''}" placeholder="Ej. 1er Turno, Matutino, 1">
                    </div>
                </div>
                <div class="ske-registro-modal-footer">
                    <button class="ske-registro-btn-modal" id="btnCancel">Cancelar</button>
                    <button class="ske-registro-btn-modal ske-registro-btn-guardar" id="btnSave">
                        ${editId ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </div>
        `);

        const selectLinea = document.getElementById('turnoLinea');
        const selectTerminal = document.getElementById('turnoTerminal');

        // ✅ Lógica en cascada: Al cambiar la línea, actualizar las terminales
        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const terminalesFiltradas = terminales.filter(t => t.lineaId === lineaId);
            
            console.log('🔄 Terminales filtradas para lineaId', lineaId, ':', terminalesFiltradas);

            selectTerminal.innerHTML = terminalesFiltradas.length === 0
                ? '<option value="">No hay terminales para esta línea</option>'
                : '<option value="">Selecciona terminal</option>' + terminalesFiltradas.map(t => 
                    `<option value="${t.id}" ${turno && turno.terminalId === t.id ? 'selected' : ''}>${t.nombre}</option>`
                ).join('');
        };

        selectLinea.addEventListener('change', updateTerminales);
        
        // Ejecutar al abrir el modal para pre-seleccionar si es edición
        updateTerminales();

        document.getElementById('btnCancel').addEventListener('click', () => modalOverlay.remove());
        
        document.getElementById('btnSave').addEventListener('click', async () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const nombre = document.getElementById('turnoNombre').value.trim();

            console.log('💾 Guardando turno:', { lineaId, terminalId, nombre });

            if (!lineaId || !terminalId || !nombre) {
                App.showToast('⚠️ Completa todos los campos');
                return;
            }

            let turnosData = DB.load('turnos');

            if (editId) {
                const idx = turnosData.findIndex(t => t.id === editId);
                if (idx !== -1) {
                    turnosData[idx] = { ...turnosData[idx], lineaId, terminalId, nombre };
                }
            } else {
                turnosData.push({
                    id: DB.generateId(),
                    lineaId,
                    terminalId,
                    nombre,
                    createdAt: Date.now()
                });
            }

            // ✅ Guardar local y en Firebase
            await DB_FIREBASE.sync('turnos', turnosData);

            modalOverlay.remove();
            App.showToast(editId ? '✅ Turno actualizado' : '✅ Turno guardado');

            // ✅ Recargar la vista
            await this.init();
        });
    },

    async eliminar(id) {
        if (!confirm('¿Eliminar este turno?')) return;

        let turnosData = DB.load('turnos').filter(t => t.id !== id);

        // ✅ Guardar local y en Firebase
        await DB_FIREBASE.sync('turnos', turnosData);

        App.showToast('🗑️ Turno eliminado');

        // ✅ Recargar la vista
        await this.init();
    }
};

export default Turno;