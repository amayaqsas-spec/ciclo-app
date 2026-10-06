// ============================================
// SEMANA.JS - Módulo de Registro de Tipos de Día con Firebase
// ============================================

const Semana = {
    render() {
        const semanas = DB.load('semanas');
        const lineas = DB.load('lineas');

        console.log('📋 Renderizando semanas:', semanas.length);
        console.log('📋 Líneas disponibles:', lineas.length);

        return `
            <div class="view active ske-registro">
                <div class="ske-registro-header">
                    <div class="ske-registro-icono">
                        <svg viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                    </div>
                    <div class="ske-registro-texto">
                        <h2 class="ske-registro-titulo">Registro de Tipos de Día</h2>
                        <p class="ske-registro-subtitulo">${semanas.length} tipos de día registrados</p>
                    </div>
                    <button class="ske-registro-btn-nuevo" id="btnAddSemana">
                        <svg viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span>Nuevo</span>
                    </button>
                </div>

                <div id="semanaList">
                    ${semanas.length === 0 ? `
                        <div class="ske-registro-empty">
                            <p>No hay tipos de día registrados</p>
                        </div>
                    ` : `
                        <div class="ske-registro-lista">
                            ${semanas.map(s => {
                                const linea = lineas.find(l => l.id === s.lineaId);
                                console.log(`🔍 Tipo de Día: ${s.tipo}, lineaId: "${s.lineaId}", Línea encontrada: ${linea ? linea.nombre : '❌ NO'}`);
                                return `
                                    <div class="ske-registro-card">
                                        <div class="ske-registro-card-info">
                                            <strong>${s.tipo || 'Sin tipo'}</strong>
                                            <p>${linea ? linea.nombre : 'Sin línea asignada'}</p>
                                        </div>
                                        <div class="ske-registro-card-acciones">
                                            <button class="ske-registro-btn-editar" data-id="${s.id}">Editar</button>
                                            <button class="ske-registro-btn-eliminar" data-id="${s.id}">Eliminar</button>
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
        await DB_FIREBASE.load('semanas');
        await DB_FIREBASE.load('lineas');

        console.log('✅ Datos de Semanas cargados en init()');

        // ✅ 2. Renderizar la vista
        const container = document.getElementById('viewContainer');
        container.innerHTML = this.render();

        // ✅ 3. Adjuntar eventos
        document.getElementById('btnAddSemana')?.addEventListener('click', () => this.openModal());

        document.querySelectorAll('.ske-registro-btn-editar').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });

        document.querySelectorAll('.ske-registro-btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => this.eliminar(btn.dataset.id));
        });
    },

    async openModal(editId = null) {
        const semanas = DB.load('semanas');
        const semana = editId ? semanas.find(s => s.id === editId) : null;
        
        // ✅ Asegurar que tenemos las líneas más recientes
        await DB_FIREBASE.load('lineas');
        const lineas = DB.load('lineas');

        console.log('📋 Líneas en modal:', lineas);
        console.log('📋 Semana a editar:', semana);

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}" ${semana && semana.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const modalOverlay = App.showModal(`
            <div class="ske-registro-modal-inner">
                <div class="ske-registro-modal-header">
                    <h3>${editId ? 'Editar' : 'Nuevo'} Tipo de Día</h3>
                </div>
                <div class="ske-registro-modal-body">
                    <div class="ske-registro-input-group">
                        <label>Línea *</label>
                        <select id="semanaLinea" class="ske-registro-select">${lineaOptions}</select>
                    </div>
                    <div class="ske-registro-input-group">
                        <label>Tipo de Día *</label>
                        <input type="text" id="semanaTipo" class="ske-registro-input" value="${semana ? semana.tipo : ''}" placeholder="Ej. Laboral, Sábado, Domingo/Festivos">
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
            const lineaId = document.getElementById('semanaLinea').value;
            const tipo = document.getElementById('semanaTipo').value.trim();

            console.log('💾 Guardando tipo de día:', { lineaId, tipo });

            if (!lineaId || !tipo) {
                App.showToast('⚠️ Completa todos los campos');
                return;
            }

            let semanasData = DB.load('semanas');

            if (editId) {
                const idx = semanasData.findIndex(s => s.id === editId);
                if (idx !== -1) {
                    semanasData[idx] = { ...semanasData[idx], lineaId, tipo };
                }
            } else {
                semanasData.push({
                    id: DB.generateId(),
                    lineaId,
                    tipo,
                    createdAt: Date.now()
                });
            }

            // ✅ Guardar local y en Firebase
            await DB_FIREBASE.sync('semanas', semanasData);

            modalOverlay.remove();
            App.showToast(editId ? '✅ Tipo de día actualizado' : '✅ Tipo de día guardado');

            // ✅ Recargar la vista
            await this.init();
        });
    },

    async eliminar(id) {
        if (!confirm('¿Eliminar este tipo de día?')) return;

        let semanasData = DB.load('semanas').filter(s => s.id !== id);

        // ✅ Guardar local y en Firebase
        await DB_FIREBASE.sync('semanas', semanasData);

        App.showToast('🗑️ Tipo de día eliminado');

        // ✅ Recargar la vista
        await this.init();
    }
};

export default Semana;