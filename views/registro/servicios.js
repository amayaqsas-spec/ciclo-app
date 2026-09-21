// ============================================
// SERVICIOS.JS - Módulo de Registro de Servicios
// ============================================

const Servicios = {
    render() {
        const servicios = DB.load('servicios');

        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Servicios
                    </h2>
                    <button class="btn-add" id="btnAddServicio">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nuevo
                    </button>
                </div>
                <div id="servicioList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddServicio').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('servicios').find(s => s.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const terminalOptions = terminales.length > 0
            ? '<option value="">Selecciona una terminal</option>' + terminales.map(t => `<option value="${t.id}" ${data && data.terminalId === t.id ? 'selected' : ''}>${t.nombre}</option>`).join('')
            : '<option value="">Primero registra una terminal</option>';

        const semanaOptions = semanas.length > 0
            ? '<option value="">Selecciona un día</option>' + semanas.map(s => `<option value="${s.id}" ${data && data.semanaId === s.id ? 'selected' : ''}>${s.tipo}</option>`).join('')
            : '<option value="">Primero registra un día</option>';

        const haceGarage = data ? (data.garage === true || data.garage === 'Si' || data.garage === 'Sí') : false;

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Servicio</h3>
            <div class="input-group">
                <label>Línea</label>
                <select id="servicioLinea">${lineaOptions}</select>
            </div>
            <div class="input-group">
                <label>Terminal</label>
                <select id="servicioTerminal">${terminalOptions}</select>
            </div>
            <div class="input-group">
                <label>Día</label>
                <select id="servicioSemana">${semanaOptions}</select>
            </div>
            <div class="input-group">
                <label>Nombre del Servicio (Número)</label>
                <input type="text" id="servicioNombre" value="${data ? data.nombre : ''}" placeholder="Ej. 1234">
            </div>
            
            <!-- ✅ Checkbox de Garage: texto al centro, checkbox a la derecha -->
            <div class="input-group">
                <div class="garage-row">
                    <label class="garage-label">Hace Garage</label>
                    <label class="garage-checkbox">
                        <input type="checkbox" id="servicioGarage" ${haceGarage ? 'checked' : ''}>
                        <span class="garage-checkmark"></span>
                    </label>
                </div>
            </div>

            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const lineaId = document.getElementById('servicioLinea').value;
            const terminalId = document.getElementById('servicioTerminal').value;
            const semanaId = document.getElementById('servicioSemana').value;
            const nombre = document.getElementById('servicioNombre').value.trim();
            const garage = document.getElementById('servicioGarage').checked;

            if (!lineaId || !terminalId || !semanaId || !nombre) {
                App.showToast('Completa todos los campos');
                return;
            }

            let servicios = DB.load('servicios');

            if (editId) {
                const idx = servicios.findIndex(s => s.id === editId);
                if (idx !== -1) {
                    servicios[idx] = { ...servicios[idx], lineaId, terminalId, semanaId, nombre, garage };
                }
            } else {
                servicios.push({
                    id: DB.generateId(),
                    lineaId,
                    terminalId,
                    semanaId,
                    nombre,
                    garage,
                    trenes: [],
                    descansoInicio: '',
                    descansoFinal: '',
                    createdAt: Date.now()
                });
            }

            DB.save('servicios', servicios);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Servicio actualizado' : 'Servicio guardado');
        });
    },

    renderList() {
        const list = document.getElementById('servicioList');
        const servicios = DB.load('servicios');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        if (servicios.length === 0) {
            list.innerHTML = `
                <div class="aviso-empty">
                    <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p>No hay servicios registrados</p>
                </div>
            `;
            return;
        }

        list.innerHTML = servicios.map(s => {
            const linea = lineas.find(l => l.id === s.lineaId);
            const terminal = terminales.find(t => t.id === s.terminalId);
            const semana = semanas.find(w => w.id === s.semanaId);
            return `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">Servicio #${s.nombre}</div>
                        <div class="item-date">${s.garage ? 'Con Garage' : 'Sin Garage'}</div>
                    </div>
                    <div class="item-desc">
                        ${linea ? linea.nombre : 'Sin línea'} • ${terminal ? terminal.nombre : 'Sin terminal'} • ${semana ? semana.tipo : 'Sin día'}
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" data-id="${s.id}">Editar</button>
                        <button class="btn-remove" data-id="${s.id}">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });
        list.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar este servicio?')) {
                    let data = DB.load('servicios').filter(s => s.id !== btn.dataset.id);
                    DB.save('servicios', data);
                    this.renderList();
                    App.showToast('Servicio eliminado');
                }
            });
        });
    }
};

export default Servicios;