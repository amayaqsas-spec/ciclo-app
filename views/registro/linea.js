// ============================================
// REGISTRO DE LÍNEAS - Con Firebase
// ============================================

const RegistroLinea = {
    render() {
        const lineas = DB.load('lineas');
        
        return `
            <div class="view active ske-registro">
                <div class="ske-registro-header">
                    <div class="ske-registro-icono">
                        <svg viewBox="0 0 24 24">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                            <line x1="4" y1="22" x2="4" y2="15"/>
                        </svg>
                    </div>
                    <div class="ske-registro-texto">
                        <h2 class="ske-registro-titulo">Registro de Líneas</h2>
                        <p class="ske-registro-subtitulo">${lineas.length} líneas registradas</p>
                    </div>
                    <button class="ske-registro-btn-nuevo" id="btnAddLinea">
                        <svg viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span>Nueva</span>
                    </button>
                </div>

                <div id="lineaList">
                    ${lineas.length === 0 ? `
                        <div class="ske-registro-empty">
                            <p>No hay líneas registradas</p>
                        </div>
                    ` : `
                        <div class="ske-registro-lista">
                            ${lineas.map((linea, index) => `
                                <div class="ske-registro-card">
                                    <div class="ske-registro-card-info">
                                        <strong>${linea.nombre || 'Sin nombre'}</strong>
                                        ${linea.descripcion ? `<p>${linea.descripcion}</p>` : ''}
                                    </div>
                                    <div class="ske-registro-card-acciones">
                                        <button class="ske-registro-btn-editar" data-index="${index}">Editar</button>
                                        <button class="ske-registro-btn-eliminar" data-index="${index}">Eliminar</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddLinea')?.addEventListener('click', () => this.openModal());
        
        document.querySelectorAll('.ske-registro-btn-editar').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(parseInt(btn.dataset.index)));
        });
        
        document.querySelectorAll('.ske-registro-btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => this.eliminar(parseInt(btn.dataset.index)));
        });
    },

    openModal(editIndex = null) {
        const lineas = DB.load('lineas');
        const linea = editIndex !== null ? lineas[editIndex] : null;

        const modalOverlay = App.showModal(`
            <div class="ske-registro-modal-inner">
                <div class="ske-registro-modal-header">
                    <h3>${editIndex !== null ? 'Editar' : 'Nueva'} Línea</h3>
                </div>
                <div class="ske-registro-modal-body">
                    <div class="ske-registro-input-group">
                        <label>Nombre de la Línea *</label>
                        <input type="text" id="lineaNombre" value="${linea?.nombre || ''}" placeholder="Ej: Línea 1">
                    </div>
                    <div class="ske-registro-input-group">
                        <label>Descripción</label>
                        <textarea id="lineaDescripcion" rows="3" placeholder="Detalles adicionales...">${linea?.descripcion || ''}</textarea>
                    </div>
                </div>
                <div class="ske-registro-modal-footer">
                    <button class="ske-registro-btn-modal" id="btnCancel">Cancelar</button>
                    <button class="ske-registro-btn-modal ske-registro-btn-guardar" id="btnSave">
                        ${editIndex !== null ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </div>
        `);

        document.getElementById('btnCancel').addEventListener('click', () => modalOverlay.remove());
        document.getElementById('btnSave').addEventListener('click', () => this.guardar(editIndex, modalOverlay));
    },

    async guardar(editIndex, modalOverlay) {
        const nombre = document.getElementById('lineaNombre').value.trim();
        const descripcion = document.getElementById('lineaDescripcion').value.trim();

        if (!nombre) {
            App.showToast('⚠️ El nombre es obligatorio');
            return;
        }

        const lineas = DB.load('lineas');
        const nuevaLinea = { nombre, descripcion };

        if (editIndex !== null) {
            lineas[editIndex] = nuevaLinea;
        } else {
            lineas.push(nuevaLinea);
        }

        // ✅ Guardar local y en Firebase
        await DB_FIREBASE.sync('lineas', lineas);

        modalOverlay.remove();
        App.showToast(editIndex !== null ? '✅ Línea actualizada' : '✅ Línea guardada');
        
        // Recargar vista
        const container = document.getElementById('viewContainer');
        container.innerHTML = this.render();
        this.init();
    },

    async eliminar(index) {
        if (!confirm('¿Eliminar esta línea?')) return;

        const lineas = DB.load('lineas');
        lineas.splice(index, 1);

        // ✅ Guardar local y en Firebase
        await DB_FIREBASE.sync('lineas', lineas);

        App.showToast('🗑️ Línea eliminada');
        
        // Recargar vista
        const container = document.getElementById('viewContainer');
        container.innerHTML = this.render();
        this.init();
    }
};

export default RegistroLinea;