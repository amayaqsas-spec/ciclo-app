// ============================================
// REGISTRO/RESERVAS.JS - Módulo de Reservas
// ============================================

const Reservas = {
    render() {
        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><polyline points="16 2 16 6 20 6"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
                        Reservas
                    </h2>
                    <button class="btn-add" id="btnAddReserva">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nueva
                    </button>
                </div>
                <div id="reservaList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddReserva').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('reservas').find(r => r.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        if (lineas.length === 0) {
            App.showToast('Primero debes registrar una línea');
            return;
        }

        const lineaOptions = lineas.map(l => 
            `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`
        ).join('');

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nueva'} Reserva</h3>
            <div class="input-group">
                <label>Línea</label>
                <select id="reservaLinea">
                    ${lineaOptions}
                </select>
            </div>
            <div class="input-group">
                <label>Terminal</label>
                <select id="reservaTerminal">
                    <option value="">Selecciona una línea primero</option>
                </select>
            </div>
            <div class="input-group">
                <label>Semana</label>
                <select id="reservaSemana">
                    <option value="">Selecciona línea y terminal primero</option>
                </select>
            </div>
            <div class="input-group">
                <label>Turno</label>
                <select id="reservaTurno">
                    <option value="">Selecciona terminal primero</option>
                </select>
            </div>
            <div class="input-group">
                <label>Tipo de Reserva</label>
                <input type="text" id="reservaTipo" value="${data ? data.tipo : ''}" placeholder="Ej: Reserva Especial">
            </div>
            <div class="input-group">
                <label>Hora de Entrada</label>
                <input type="time" id="reservaEntrada" value="${data ? data.entrada : ''}">
            </div>
            <div class="input-group">
                <label>Hora de Salida</label>
                <input type="time" id="reservaSalida" value="${data ? data.salida : ''}">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        const selectLinea = document.getElementById('reservaLinea');
        const selectTerminal = document.getElementById('reservaTerminal');
        const selectSemana = document.getElementById('reservaSemana');
        const selectTurno = document.getElementById('reservaTurno');

        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const terminalesFiltradas = terminales.filter(t => t.lineaId === lineaId);
            
            selectTerminal.innerHTML = terminalesFiltradas.length === 0 
                ? '<option value="">No hay terminales</option>'
                : terminalesFiltradas.map(t => 
                    `<option value="${t.id}" ${data && data.terminalId === t.id ? 'selected' : ''}>${t.nombre}</option>`
                ).join('');
            
            updateSemanas();
        };

        const updateSemanas = () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const semanasFiltradas = semanas.filter(s => s.lineaId === lineaId && s.terminalId === terminalId);
            
            selectSemana.innerHTML = semanasFiltradas.length === 0
                ? '<option value="">No hay semanas</option>'
                : semanasFiltradas.map(s => 
                    `<option value="${s.id}" ${data && data.semanaId === s.id ? 'selected' : ''}>${s.tipo}</option>`
                ).join('');
        };

        const updateTurnos = () => {
            const terminalId = selectTerminal.value;
            const terminal = terminales.find(t => t.id === terminalId);
            
            if (terminal) {
                selectTurno.innerHTML = `<option value="${terminal.turno}" ${data && data.turno === terminal.turno ? 'selected' : ''}>${terminal.turno}</option>`;
            } else {
                selectTurno.innerHTML = '<option value="">Selecciona terminal primero</option>';
            }
        };

        selectLinea.addEventListener('change', updateTerminales);
        selectTerminal.addEventListener('change', () => { updateSemanas(); updateTurnos(); });
        
        updateTerminales();
        updateTurnos();

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const lineaId = document.getElementById('reservaLinea').value;
            const terminalId = document.getElementById('reservaTerminal').value;
            const semanaId = document.getElementById('reservaSemana').value;
            const turno = document.getElementById('reservaTurno').value;
            const tipo = document.getElementById('reservaTipo').value.trim();
            const entrada = document.getElementById('reservaEntrada').value;
            const salida = document.getElementById('reservaSalida').value;

            if (!tipo || !entrada || !salida) {
                App.showToast('Completa todos los campos');
                return;
            }

            let reservas = DB.load('reservas');

            if (editId) {
                const idx = reservas.findIndex(r => r.id === editId);
                if (idx !== -1) {
                    reservas[idx] = { ...reservas[idx], lineaId, terminalId, semanaId, turno, tipo, entrada, salida };
                }
            } else {
                reservas.push({
                    id: DB.generateId(),
                    lineaId,
                    terminalId,
                    semanaId,
                    turno,
                    tipo,
                    entrada,
                    salida,
                    createdAt: Date.now()
                });
            }

            DB.save('reservas', reservas);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Reserva actualizada' : 'Reserva guardada');
        });
    },

    renderList() {
        const list = document.getElementById('reservaList');
        const data = DB.load('reservas').sort((a, b) => b.createdAt - a.createdAt);
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        if (data.length === 0) {
            list.innerHTML = `<div class="aviso-empty"><svg viewBox="0 0 24 24"><path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><polyline points="16 2 16 6 20 6"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg><p>No hay reservas registradas</p></div>`;
            return;
        }

        list.innerHTML = data.map(item => {
            const linea = lineas.find(l => l.id === item.lineaId);
            const terminal = terminales.find(t => t.id === item.terminalId);
            const semana = semanas.find(s => s.id === item.semanaId);
            return `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">${item.tipo}</div>
                    </div>
                    <div class="item-meta">
                        <span class="item-tag">Línea: ${linea ? linea.nombre : 'N/A'}</span>
                        <span class="item-tag">Terminal: ${terminal ? terminal.nombre : 'N/A'}</span>
                        <span class="item-tag">Semana: ${semana ? semana.tipo : 'N/A'}</span>
                        <span class="item-tag">Turno: ${item.turno}</span>
                    </div>
                    <div class="item-meta">
                        <span class="item-tag">Entrada: ${item.entrada}</span>
                        <span class="item-tag">Salida: ${item.salida}</span>
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
                if (confirm('¿Eliminar esta reserva?')) {
                    let data = DB.load('reservas').filter(r => r.id !== btn.dataset.id);
                    DB.save('reservas', data);
                    this.renderList();
                    App.showToast('Reserva eliminada');
                }
            });
        });
    }
};

export default Reservas;