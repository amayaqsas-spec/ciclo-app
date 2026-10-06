// ============================================
// RESERVAS.JS - Módulo de Registro de Reservas con Firebase y Skeuomorfismo
// ============================================

const Reservas = {
    render() {
        const reservas = DB.load('reservas');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const turnos = DB.load('turnos');
        const semanas = DB.load('semanas');

        console.log('📋 Renderizando reservas:', reservas.length);

        return `
            <div class="view active ske-registro">
                <div class="ske-registro-header">
                    <div class="ske-registro-icono">
                        <svg viewBox="0 0 24 24">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                    </div>
                    <div class="ske-registro-texto">
                        <h2 class="ske-registro-titulo">Registro de Reservas</h2>
                        <p class="ske-registro-subtitulo">${reservas.length} reservas registradas</p>
                    </div>
                    <button class="ske-registro-btn-nuevo" id="btnAddReserva">
                        <svg viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span>Nueva</span>
                    </button>
                </div>

                <div id="reservaList">
                    ${reservas.length === 0 ? `
                        <div class="ske-registro-empty">
                            <p>No hay reservas registradas</p>
                        </div>
                    ` : `
                        <div class="ske-registro-lista">
                            ${reservas.map(r => {
                                const linea = lineas.find(l => l.id === r.lineaId);
                                const terminal = terminales.find(t => t.id === r.terminalId);
                                const turno = turnos.find(t => t.id === r.turnoId);
                                const semana = semanas.find(s => s.id === r.semanaId);

                                console.log(`🔍 Reserva: ${r.tipo} | Línea: ${linea ? linea.nombre : '❌'} | Terminal: ${terminal ? terminal.nombre : '❌'}`);

                                return `
                                    <div class="ske-registro-card">
                                        <div class="ske-registro-card-info">
                                            <strong>${r.tipo || 'Sin tipo'}</strong>
                                            <p>
                                                <span style="color:var(--primary);">📍 ${linea ? linea.nombre : 'Sin línea'}</span> | 
                                                <span>🚇 ${terminal ? terminal.nombre : 'Sin terminal'}</span><br>
                                                <span style="font-size:12px; color:var(--text-soft);">
                                                    🕐 ${turno ? turno.nombre : 'Sin turno'} | 📅 ${semana ? semana.tipo : 'Sin día'}
                                                </span><br>
                                                <span style="font-size:12px; color:var(--accent);">
                                                    Entrada: ${r.entrada || '--:--'} | Salida: ${r.salida || '--:--'}
                                                </span>
                                            </p>
                                        </div>
                                        <div class="ske-registro-card-acciones">
                                            <button class="ske-registro-btn-editar" data-id="${r.id}">Editar</button>
                                            <button class="ske-registro-btn-eliminar" data-id="${r.id}">Eliminar</button>
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
        // ✅ 1. Cargar todos los datos desde Firebase (actualiza caché local)
        await DB_FIREBASE.load('reservas');
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');
        await DB_FIREBASE.load('turnos');
        await DB_FIREBASE.load('semanas');

        console.log('✅ Datos de Reservas cargados en init()');

        // ✅ 2. Renderizar la vista
        const container = document.getElementById('viewContainer');
        container.innerHTML = this.render();

        // ✅ 3. Adjuntar eventos
        document.getElementById('btnAddReserva')?.addEventListener('click', () => this.openModal());

        document.querySelectorAll('.ske-registro-btn-editar').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });

        document.querySelectorAll('.ske-registro-btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => this.eliminar(btn.dataset.id));
        });
    },

    async openModal(editId = null) {
        // ✅ Asegurar que tenemos los datos más recientes de todas las colecciones
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');
        await DB_FIREBASE.load('turnos');
        await DB_FIREBASE.load('semanas');

        const reservas = DB.load('reservas');
        const data = editId ? reservas.find(r => r.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const turnos = DB.load('turnos');
        const semanas = DB.load('semanas');

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const modalOverlay = App.showModal(`
            <div class="ske-registro-modal-inner" style="max-width:600px;">
                <div class="ske-registro-modal-header">
                    <h3>${editId ? 'Editar' : 'Nueva'} Reserva</h3>
                </div>
                <div class="ske-registro-modal-body">
                    <div class="ske-registro-input-group">
                        <label>Línea *</label>
                        <select id="reservaLinea" class="ske-registro-select">${lineaOptions}</select>
                    </div>
                    <div class="ske-registro-input-group">
                        <label>Terminal *</label>
                        <select id="reservaTerminal" class="ske-registro-select">
                            <option value="">Selecciona línea primero</option>
                        </select>
                    </div>
                    <div class="ske-registro-input-group">
                        <label>Turno *</label>
                        <select id="reservaTurno" class="ske-registro-select">
                            <option value="">Selecciona línea y terminal primero</option>
                        </select>
                    </div>
                    <div class="ske-registro-input-group">
                        <label>Tipo de Día *</label>
                        <select id="reservaSemana" class="ske-registro-select">
                            <option value="">Selecciona línea y terminal primero</option>
                        </select>
                    </div>
                    <div class="ske-registro-input-group">
                        <label>Tipo de Reserva *</label>
                        <input type="text" id="reservaTipo" class="ske-registro-input" value="${data ? data.tipo : ''}" placeholder="Ej. MA, CA, RA, CC">
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <div class="ske-registro-input-group" style="flex: 1;">
                            <label>Hora de Entrada</label>
                            <input type="time" id="reservaEntrada" class="ske-registro-input" value="${data ? data.entrada : ''}">
                        </div>
                        <div class="ske-registro-input-group" style="flex: 1;">
                            <label>Hora de Salida</label>
                            <input type="time" id="reservaSalida" class="ske-registro-input" value="${data ? data.salida : ''}">
                        </div>
                    </div
                </div>
                <div class="ske-registro-modal-footer">
                    <button class="ske-registro-btn-modal" id="btnCancel">Cancelar</button>
                    <button class="ske-registro-btn-modal ske-registro-btn-guardar" id="btnSave">
                        ${editId ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </div>
        `);

        const selectLinea = document.getElementById('reservaLinea');
        const selectTerminal = document.getElementById('reservaTerminal');
        const selectTurno = document.getElementById('reservaTurno');
        const selectSemana = document.getElementById('reservaSemana');

        // ✅ Lógica en cascada robusta
        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const filtradas = terminales.filter(t => t.lineaId === lineaId);
            
            selectTerminal.innerHTML = filtradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + filtradas.map(t => 
                    `<option value="${t.id}" ${data && data.terminalId === t.id ? 'selected' : ''}>${t.nombre}</option>`
                ).join('');
            
            updateTurnos();
            updateSemanas();
        };

        const updateTurnos = () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            
            let filtrados = turnos.filter(t => t.lineaId === lineaId);
            if (terminalId) {
                filtrados = filtrados.filter(t => t.terminalId === terminalId);
            }
            
            selectTurno.innerHTML = filtrados.length === 0
                ? '<option value="">No hay turnos</option>'
                : '<option value="">Selecciona turno</option>' + filtrados.map(t => 
                    `<option value="${t.id}" ${data && data.turnoId === t.id ? 'selected' : ''}>${t.nombre}</option>`
                ).join('');
        };

        const updateSemanas = () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            
            // ✅ Ahora filtramos por Línea Y Terminal, ya que el módulo Semana ahora requiere ambos
            let filtradas = semanas.filter(s => s.lineaId === lineaId);
            if (terminalId) {
                filtradas = filtradas.filter(s => s.terminalId === terminalId);
            }
            
            selectSemana.innerHTML = filtradas.length === 0
                ? '<option value="">No hay tipos de día</option>'
                : '<option value="">Selecciona tipo de día</option>' + filtradas.map(s => 
                    `<option value="${s.id}" ${data && data.semanaId === s.id ? 'selected' : ''}>${s.tipo}</option>`
                ).join('');
        };

        selectLinea.addEventListener('change', updateTerminales);
        selectTerminal.addEventListener('change', () => {
            updateTurnos();
            updateSemanas();
        });
        
        // Ejecutar al abrir para pre-seleccionar si es edición
        updateTerminales();

        document.getElementById('btnCancel').addEventListener('click', () => modalOverlay.remove());
        
        document.getElementById('btnSave').addEventListener('click', async () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const turnoId = selectTurno.value;
            const semanaId = selectSemana.value;
            const tipo = document.getElementById('reservaTipo').value.trim();
            const entrada = document.getElementById('reservaEntrada').value;
            const salida = document.getElementById('reservaSalida').value;

            console.log('💾 Guardando reserva:', { lineaId, terminalId, turnoId, semanaId, tipo, entrada, salida });

            if (!lineaId || !terminalId || !turnoId || !semanaId || !tipo) {
                App.showToast('⚠️ Completa todos los campos obligatorios');
                return;
            }

            let reservasData = DB.load('reservas');

            if (editId) {
                const idx = reservasData.findIndex(r => r.id === editId);
                if (idx !== -1) {
                    reservasData[idx] = { ...reservasData[idx], lineaId, terminalId, turnoId, semanaId, tipo, entrada, salida };
                }
            } else {
                reservasData.push({
                    id: DB.generateId(),
                    lineaId,
                    terminalId,
                    turnoId,
                    semanaId,
                    tipo,
                    entrada: entrada || '',
                    salida: salida || '',
                    createdAt: Date.now()
                });
            }

            // ✅ Guardar local y en Firebase
            await DB_FIREBASE.sync('reservas', reservasData);

            modalOverlay.remove();
            App.showToast(editId ? '✅ Reserva actualizada' : '✅ Reserva guardada');

            // ✅ Recargar la vista
            await this.init();
        });
    },

    async eliminar(id) {
        if (!confirm('¿Eliminar esta reserva?')) return;

        let reservasData = DB.load('reservas').filter(r => r.id !== id);

        // ✅ Guardar local y en Firebase
        await DB_FIREBASE.sync('reservas', reservasData);

        App.showToast('🗑️ Reserva eliminada');

        // ✅ Recargar la vista
        await this.init();
    }
};

export default Reservas;