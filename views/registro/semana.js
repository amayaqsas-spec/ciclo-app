// ============================================
// REGISTRO/SEMANA.JS - Módulo de Semana
// ============================================

const Semana = {
    render() {
        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Semana
                    </h2>
                    <button class="btn-add" id="btnAddSemana">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nueva
                    </button>
                </div>
                <div id="semanaList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddSemana').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('semanas').find(s => s.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        if (lineas.length === 0) {
            App.showToast('Primero debes registrar una línea');
            return;
        }

        const lineaOptions = lineas.map(l => 
            `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`
        ).join('');

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nueva'} Semana</h3>
            <div class="input-group">
                <label>Línea</label>
                <select id="semanaLinea">
                    ${lineaOptions}
                </select>
            </div>
            <div class="input-group">
                <label>Terminal</label>
                <select id="semanaTerminal">
                    <option value="">Selecciona una línea primero</option>
                </select>
            </div>
            <div class="input-group">
                <label>Tipo de Semana</label>
                <input type="text" id="semanaTipo" value="${data ? data.tipo : ''}" placeholder="Ej: Semana A">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        // Actualizar terminales cuando cambia la línea
        const selectLinea = document.getElementById('semanaLinea');
        const selectTerminal = document.getElementById('semanaTerminal');
        
        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const terminalesFiltradas = terminales.filter(t => t.lineaId === lineaId);
            
            if (terminalesFiltradas.length === 0) {
                selectTerminal.innerHTML = '<option value="">No hay terminales para esta línea</option>';
            } else {
                selectTerminal.innerHTML = terminalesFiltradas.map(t => 
                    `<option value="${t.id}" ${data && data.terminalId === t.id ? 'selected' : ''}>${t.nombre} - ${t.turno}</option>`
                ).join('');
            }
        };

        selectLinea.addEventListener('change', updateTerminales);
        updateTerminales();

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const lineaId = document.getElementById('semanaLinea').value;
            const terminalId = document.getElementById('semanaTerminal').value;
            const tipo = document.getElementById('semanaTipo').value.trim();

            if (!tipo) {
                App.showToast('El tipo de semana es obligatorio');
                return;
            }

            let semanas = DB.load('semanas');

            if (editId) {
                const idx = semanas.findIndex(s => s.id === editId);
                if (idx !== -1) {
                    semanas[idx] = { ...semanas[idx], lineaId, terminalId, tipo };
                }
            } else {
                semanas.push({
                    id: DB.generateId(),
                    lineaId,
                    terminalId,
                    tipo,
                    createdAt: Date.now()
                });
            }

            DB.save('semanas', semanas);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Semana actualizada' : 'Semana guardada');
        });
    },

    renderList() {
        const list = document.getElementById('semanaList');
        const data = DB.load('semanas').sort((a, b) => b.createdAt - a.createdAt);
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        if (data.length === 0) {
            list.innerHTML = `<div class="aviso-empty"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><p>No hay semanas registradas</p></div>`;
            return;
        }

        list.innerHTML = data.map(item => {
            const linea = lineas.find(l => l.id === item.lineaId);
            const terminal = terminales.find(t => t.id === item.terminalId);
            return `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">${item.tipo}</div>
                    </div>
                    <div class="item-meta">
                        <span class="item-tag">Línea: ${linea ? linea.nombre : 'N/A'}</span>
                        <span class="item-tag">Terminal: ${terminal ? terminal.nombre : 'N/A'}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" data-id="${item.id}">Editar</button>
                        <button class="btn-remove" data-id="${item.id}">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });
        list.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar esta semana?')) {
                    let data = DB.load('semanas').filter(s => s.id !== btn.dataset.id);
                    DB.save('semanas', data);
                    this.renderList();
                    App.showToast('Semana eliminada');
                }
            });
        });
    }
};

export default Semana;