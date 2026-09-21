// ============================================
// REGISTRO/LINEA.JS - Módulo de Línea
// ============================================

const Linea = {
    render() {
        console.log('📋 Renderizando módulo Línea...');
        
        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                        Línea
                    </h2>
                    <button class="btn-add" id="btnAddLinea">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nueva
                    </button>
                </div>
                <div id="lineaList"></div>
            </div>
        `;
    },

    init() {
        console.log('📋 Inicializando módulo Línea...');
        
        // Event listener para botón Nueva
        const btnAdd = document.getElementById('btnAddLinea');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.openModal());
        }
        
        this.renderList();
    },

    openModal(editId = null) {
        console.log('📝 Abriendo modal, editId:', editId);
        
        const data = editId ? DB.load('lineas').find(l => l.id === editId) : null;

        const modalHTML = `
            <h3>${editId ? 'Editar' : 'Nueva'} Línea</h3>
            <div class="input-group">
                <label>Nombre de la Línea</label>
                <input type="text" id="lineaNombre" value="${data ? data.nombre : ''}" placeholder="Ej: Línea 1">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancelModal">Cancelar</button>
                <button class="btn-primary" id="btnSaveModal">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `;

        const modal = App.showModal(modalHTML);
        
        // Agregar event listeners INMEDIATAMENTE
        const btnCancel = document.getElementById('btnCancelModal');
        const btnSave = document.getElementById('btnSaveModal');
        const inputNombre = document.getElementById('lineaNombre');
        
        console.log(' Elementos del modal:', { btnCancel: !!btnCancel, btnSave: !!btnSave, inputNombre: !!inputNombre });
        
        if (btnCancel) {
            btnCancel.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('❌ Cancelar clickeado');
                modal.remove();
            });
        }
        
        if (btnSave) {
            btnSave.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('💾 Guardar clickeado');
                this.saveLinea(editId);
                modal.remove();
            });
        }
        
        // Enter para guardar
        if (inputNombre) {
            inputNombre.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log('⏎ Enter presionado');
                    this.saveLinea(editId);
                    modal.remove();
                }
            });
            inputNombre.focus();
        }
    },

    saveLinea(editId = null) {
        const inputNombre = document.getElementById('lineaNombre');
        const nombre = inputNombre ? inputNombre.value.trim() : '';

        console.log('💾 Guardando línea:', nombre);

        if (!nombre) {
            App.showToast('El nombre es obligatorio');
            return;
        }

        let lineas = DB.load('lineas');
        console.log('📦 Líneas actuales:', lineas.length);

        if (editId) {
            const idx = lineas.findIndex(l => l.id === editId);
            if (idx !== -1) {
                lineas[idx] = { ...lineas[idx], nombre };
                console.log('✅ Línea actualizada en índice:', idx);
            }
        } else {
            const newLinea = {
                id: DB.generateId(),
                nombre,
                createdAt: Date.now()
            };
            lineas.push(newLinea);
            console.log('✅ Nueva línea agregada:', newLinea);
        }

        DB.save('lineas', lineas);
        console.log('💾 Líneas guardadas:', lineas.length);
        
        this.renderList();
        App.showToast(editId ? 'Línea actualizada' : 'Línea guardada');
    },

    renderList() {
        console.log('📋 Renderizando lista de líneas...');
        
        const list = document.getElementById('lineaList');
        if (!list) {
            console.error('❌ No se encontró el elemento lineaList');
            return;
        }
        
        const data = DB.load('lineas');
        console.log('📦 Líneas cargadas:', data.length);

        if (data.length === 0) {
            list.innerHTML = `
                <div class="aviso-empty">
                    <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                        <path d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                    <p>No hay líneas registradas</p>
                </div>
            `;
            return;
        }

        const sortedData = [...data].sort((a, b) => b.createdAt - a.createdAt);

        list.innerHTML = sortedData.map(item => `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-title">${item.nombre}</div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" data-id="${item.id}">Editar</button>
                    <button class="btn-remove" data-id="${item.id}">Eliminar</button>
                </div>
            </div>
        `).join('');

        // Event listeners para botones de editar/eliminar
        list.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.dataset.id;
                console.log('✏️ Editando línea:', id);
                this.openModal(id);
            });
        });
        
        list.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.dataset.id;
                console.log('🗑️ Eliminando línea:', id);
                if (confirm('¿Eliminar esta línea?')) {
                    let lineas = DB.load('lineas').filter(l => l.id !== id);
                    DB.save('lineas', lineas);
                    this.renderList();
                    App.showToast('Línea eliminada');
                }
            });
        });
    }
};

export default Linea;