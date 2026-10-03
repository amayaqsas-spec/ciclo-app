// ============================================
// TERMINAL.JS - Módulo de Registro de Terminales con Firebase
// ============================================

const Terminal = {
    render() {
        // ✅ Usar datos de localStorage (que ya están actualizados)
        const terminales = DB.load('terminales');
        const lineas = DB.load('lineas');

        console.log('📋 Renderizando terminales:', terminales.length);
        console.log('📋 Líneas disponibles:', lineas.length);

        return `
            <div class="view active ske-registro">
                <div class="ske-registro-header">
                    <div class="ske-registro-icono">
                        <svg viewBox="0 0 24 24">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                    </div>
                    <div class="ske-registro-texto">
                        <h2 class="ske-registro-titulo">Registro de Terminales</h2>
                        <p class="ske-registro-subtitulo">${terminales.length} terminales registradas</p>
                    </div>
                    <button class="ske-registro-btn-nuevo" id="btnAddTerminal">
                        <svg viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span>Nueva</span>
                    </button>
                </div>

                <div id="terminalList">
                    ${terminales.length === 0 ? `
                        <div class="ske-registro-empty">
                            <p>No hay terminales registradas</p>
                        </div>
                    ` : `
                        <div class="ske-registro-lista">
                            ${terminales.map(t => {
                                const linea = lineas.find(l => l.id === t.lineaId);
                                console.log(`🔍 Terminal: ${t.nombre}, lineaId: ${t.lineaId}, Línea encontrada: ${linea ? linea.nombre : '❌ NO'}`);
                                return `
                                    <div class="ske-registro-card">
                                        <div class="ske-registro-card-info">
                                            <strong>${t.nombre || 'Sin nombre'}</strong>
                                            <p>${linea ? linea.nombre : 'Sin línea asignada'}</p>
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
        // ✅ 1. Cargar datos desde Firebase (actualiza localStorage)
        await DB_FIREBASE.load('terminales');
        await DB_FIREBASE.load('lineas');

        console.log('✅ Datos cargados en init()');

        // ✅ 2. Renderizar la vista
        const container = document.getElementById('viewContainer');
        container.innerHTML = this.render();

        // ✅ 3. Attachar eventos
        document.getElementById('btnAddTerminal')?.addEventListener('click', () => this.openModal());

        document.querySelectorAll('.ske-registro-btn-editar').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });

        document.querySelectorAll('.ske-registro-btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => this.eliminar(btn.dataset.id));
        });
    },

    async openModal(editId = null) {
        const terminales = DB.load('terminales');
        const terminal = editId ? terminales.find(t => t.id === editId) : null;
        
        // ✅ Cargar líneas desde Firebase
        await DB_FIREBASE.load('lineas');
        const lineas = DB.load('lineas');

        console.log('📋 Líneas en modal:', lineas);

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}" ${terminal && terminal.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const modalOverlay = App.showModal(`
            <div class="ske-registro-modal-inner">
                <div class="ske-registro-modal-header">
                    <h3>${editId ? 'Editar' : 'Nueva'} Terminal</h3>
                </div>
                <div class="ske-registro-modal-body">
                    <div class="ske-registro-input-group">
                        <label>Línea *</label>
                        <select id="terminalLinea" class="ske-registro-select">${lineaOptions}</select>
                    </div>
                    <div class="ske-registro-input-group">
                        <label>Nombre de Terminal *</label>
                        <input type="text" id="terminalNombre" class="ske-registro-input" value="${terminal ? terminal.nombre : ''}" placeholder="Ej. Cuatro Caminos">
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

        document.getElementById('btnCancel').addEventListener('click', () => modalOverlay.remove());
        document.getElementById('btnSave').addEventListener('click', async () => {
            const lineaId = document.getElementById('terminalLinea').value;
            const nombre = document.getElementById('terminalNombre').value.trim();

            console.log('💾 Guardando terminal:', { lineaId, nombre });

            if (!lineaId || !nombre) {
                App.showToast('⚠️ Completa todos los campos');
                return;
            }

            let terminales = DB.load('terminales');

            if (editId) {
                const idx = terminales.findIndex(t => t.id === editId);
                if (idx !== -1) {
                    terminales[idx] = { ...terminales[idx], lineaId, nombre };
                }
            } else {
                terminales.push({
                    id: DB.generateId(),
                    lineaId,
                    nombre,
                    createdAt: Date.now()
                });
            }

            console.log(' Terminales a guardar:', terminales);

            // ✅ Guardar local y en Firebase
            await DB_FIREBASE.sync('terminales', terminales);

            modalOverlay.remove();
            App.showToast(editId ? '✅ Terminal actualizada' : '✅ Terminal guardada');

            // ✅ Recargar la vista
            await this.init();
        });
    },

    async eliminar(id) {
        if (!confirm('¿Eliminar esta terminal?')) return;

        let terminales = DB.load('terminales').filter(t => t.id !== id);

        // ✅ Guardar local y en Firebase
        await DB_FIREBASE.sync('terminales', terminales);

        App.showToast('️ Terminal eliminada');

        // ✅ Recargar la vista
        await this.init();
    }
};

export default Terminal;