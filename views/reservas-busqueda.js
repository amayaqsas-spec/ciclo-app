// ============================================
// RESERVAS-BUSQUEDA.JS - Módulo Corregido
// ============================================

const ReservasBusqueda = {
    render() {
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        return `
            <div class="view active ske-reservas">
                <!-- HEADER SKEUOMÓRFICO -->
                <div class="ske-reservas-header">
                    <div class="ske-reservas-icono">
                        <svg viewBox="0 0 24 24">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                    </div>
                    <div class="ske-reservas-texto">
                        <h2 class="ske-reservas-titulo">Búsqueda de Reservas</h2>
                        <p class="ske-reservas-subtitulo">Encuentra reservas por línea, terminal y turno</p>
                    </div>
                </div>

                <!-- FORMULARIO DE BÚSQUEDA -->
                <div class="ske-reservas-form-card">
                    <div class="ske-reservas-input-group">
                        <label class="ske-reservas-label">
                            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            Línea
                        </label>
                        <select id="rbLinea" class="ske-reservas-select">
                            <option value="">Selecciona una línea</option>
                            ${lineas.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('')}
                        </select>
                    </div>

                    <div class="ske-reservas-input-group">
                        <label class="ske-reservas-label">
                            <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            Terminal
                        </label>
                        <select id="rbTerminal" class="ske-reservas-select" disabled>
                            <option value="">Primero selecciona una línea</option>
                        </select>
                    </div>

                    <div class="ske-reservas-input-group">
                        <label class="ske-reservas-label">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Turno
                        </label>
                        <select id="rbTurno" class="ske-reservas-select" disabled>
                            <option value="">Primero selecciona terminal</option>
                        </select>
                    </div>

                    <div class="ske-reservas-input-group">
                        <label class="ske-reservas-label">
                            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            Tipo de Día
                        </label>
                        <select id="rbTipoDia" class="ske-reservas-select" disabled>
                            <option value="">Primero selecciona turno</option>
                        </select>
                    </div>

                    <div class="ske-reservas-input-group">
                        <label class="ske-reservas-label">
                            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Tipo de Reserva
                        </label>
                        <input type="text" id="rbTipoReserva" class="ske-reservas-input" placeholder="Ej: MA, CC, CB, RA" disabled>
                    </div>

                    <button class="ske-reservas-btn-buscar" id="btnBuscarReserva" disabled>
                        <svg viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <span>Buscar Reserva</span>
                    </button>
                </div>

                <!-- RESULTADO -->
                <div id="rbResultado"></div>
            </div>
        `;
    },

    init() {
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const reservas = DB.load('reservas');
        const turnos = DB.load('turnos') || [];
        const semanas = DB.load('semanas') || [];

        console.log(' Reservas cargadas:', reservas.length);
        console.log('🔄 Turnos cargados:', turnos.length);
        console.log('📅 Semanas cargadas:', semanas.length);

        if (reservas.length > 0) {
            console.log('📋 Primera reserva:', reservas[0]);
        }
        if (turnos.length > 0) {
            console.log('🔄 Primer turno:', turnos[0]);
        }
        if (semanas.length > 0) {
            console.log('📅 Primera semana:', semanas[0]);
        }

        const selectLinea = document.getElementById('rbLinea');
        const selectTerminal = document.getElementById('rbTerminal');
        const selectTurno = document.getElementById('rbTurno');
        const selectTipoDia = document.getElementById('rbTipoDia');
        const inputTipoReserva = document.getElementById('rbTipoReserva');
        const btnBuscar = document.getElementById('btnBuscarReserva');
        const resultadoDiv = document.getElementById('rbResultado');

        // Función auxiliar: obtener nombre de turno por ID
        const getTurnoNombre = (turnoId) => {
            const turno = turnos.find(t => t.id === turnoId);
            return turno ? turno.nombre : turnoId;
        };

        // Función auxiliar: obtener nombre de tipo de día por ID de semana
        const getTipoDiaNombre = (semanaId) => {
            const semana = semanas.find(s => s.id === semanaId);
            return semana ? semana.tipo : semanaId;
        };

        // Cambio de línea
        selectLinea?.addEventListener('change', (e) => {
            const lineaId = e.target.value;
            
            selectTerminal.innerHTML = '<option value="">Selecciona terminal</option>';
            selectTurno.innerHTML = '<option value="">Primero selecciona terminal</option>';
            selectTipoDia.innerHTML = '<option value="">Primero selecciona turno</option>';
            inputTipoReserva.value = '';
            inputTipoReserva.disabled = true;
            btnBuscar.disabled = true;
            resultadoDiv.innerHTML = '';

            if (lineaId) {
                // Filtrar terminales que tengan reservas para esta línea
                const terminalesConReservas = reservas
                    .filter(r => r.lineaId === lineaId)
                    .map(r => r.terminalId)
                    .filter((v, i, arr) => v && arr.indexOf(v) === i);

                if (terminalesConReservas.length > 0) {
                    terminalesConReservas.forEach(termId => {
                        const terminal = terminales.find(t => t.id === termId);
                        const nombre = terminal ? terminal.nombre : termId;
                        selectTerminal.innerHTML += `<option value="${termId}">${nombre}</option>`;
                    });
                } else {
                    const terminalesLinea = terminales.filter(t => t.lineaId === lineaId);
                    terminalesLinea.forEach(t => {
                        selectTerminal.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
                    });
                }
                selectTerminal.disabled = false;
            } else {
                selectTerminal.disabled = true;
            }
        });

        // Cambio de terminal
        selectTerminal?.addEventListener('change', (e) => {
            const terminalId = e.target.value;
            
            selectTurno.innerHTML = '<option value="">Selecciona turno</option>';
            selectTipoDia.innerHTML = '<option value="">Primero selecciona turno</option>';
            inputTipoReserva.value = '';
            inputTipoReserva.disabled = true;
            btnBuscar.disabled = true;
            resultadoDiv.innerHTML = '';

            if (terminalId) {
                const lineaId = selectLinea.value;
                
                const reservasFiltradas = reservas.filter(r => {
                    return r.lineaId === lineaId && r.terminalId === terminalId;
                });

                console.log('🔍 Reservas filtradas para terminal:', reservasFiltradas.length);

                // ✅ Extraer turnos únicos por turnoId
                const turnoIds = [...new Set(
                    reservasFiltradas
                        .map(r => r.turnoId)
                        .filter(v => v)
                )];

                console.log('🎯 IDs de turnos encontrados:', turnoIds);

                if (turnoIds.length > 0) {
                    turnoIds.forEach(turnoId => {
                        const turnoNombre = getTurnoNombre(turnoId);
                        selectTurno.innerHTML += `<option value="${turnoId}">${turnoNombre}</option>`;
                    });
                    selectTurno.disabled = false;
                } else {
                    selectTurno.innerHTML = '<option value="">No hay turnos para esta terminal</option>';
                    selectTurno.disabled = true;
                }
            } else {
                selectTurno.disabled = true;
            }
        });

        // Cambio de turno
        selectTurno?.addEventListener('change', (e) => {
            const turnoId = e.target.value;
            
            selectTipoDia.innerHTML = '<option value="">Selecciona tipo de día</option>';
            inputTipoReserva.value = '';
            inputTipoReserva.disabled = true;
            btnBuscar.disabled = true;
            resultadoDiv.innerHTML = '';

            if (turnoId) {
                const lineaId = selectLinea.value;
                const terminalId = selectTerminal.value;

                const reservasFiltradas = reservas.filter(r => {
                    return r.lineaId === lineaId && 
                           r.terminalId === terminalId && 
                           r.turnoId === turnoId;
                });

                // ✅ Extraer semanas/tipos de día únicos por semanaId
                const semanaIds = [...new Set(
                    reservasFiltradas
                        .map(r => r.semanaId)
                        .filter(v => v)
                )];

                if (semanaIds.length > 0) {
                    semanaIds.forEach(semanaId => {
                        const tipoDiaNombre = getTipoDiaNombre(semanaId);
                        selectTipoDia.innerHTML += `<option value="${semanaId}">${tipoDiaNombre}</option>`;
                    });
                    selectTipoDia.disabled = false;
                } else {
                    selectTipoDia.innerHTML = '<option value="">No hay tipos de día</option>';
                    selectTipoDia.disabled = true;
                }
            } else {
                selectTipoDia.disabled = true;
            }
        });

        // Cambio de tipo de día
        selectTipoDia?.addEventListener('change', (e) => {
            const semanaId = e.target.value;
            
            inputTipoReserva.value = '';
            btnBuscar.disabled = true;
            resultadoDiv.innerHTML = '';

            if (semanaId) {
                inputTipoReserva.disabled = false;
            } else {
                inputTipoReserva.disabled = true;
            }
        });

        // Habilitar búsqueda cuando hay tipo de reserva
        inputTipoReserva?.addEventListener('input', (e) => {
            if (e.target.value.trim()) {
                btnBuscar.disabled = false;
            } else {
                btnBuscar.disabled = true;
            }
        });

        // Buscar reserva
        btnBuscar?.addEventListener('click', () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const turnoId = selectTurno.value;
            const semanaId = selectTipoDia.value;
            const tipoReserva = inputTipoReserva.value.trim().toUpperCase();

            if (!lineaId || !terminalId || !turnoId || !semanaId || !tipoReserva) {
                App.showToast('⚠️ Completa todos los campos');
                return;
            }

            const linea = lineas.find(l => l.id === lineaId);
            const terminal = terminales.find(t => t.id === terminalId);
            const turno = turnos.find(t => t.id === turnoId);
            const semana = semanas.find(s => s.id === semanaId);

            const reserva = reservas.find(r => {
                return r.lineaId === lineaId && 
                       r.terminalId === terminalId && 
                       r.turnoId === turnoId && 
                       r.semanaId === semanaId && 
                       r.tipo.toUpperCase() === tipoReserva;
            });

            if (reserva) {
                resultadoDiv.innerHTML = this.renderResultado(reserva, linea, terminal, turno, semana);
            } else {
                resultadoDiv.innerHTML = `
                    <div class="ske-reservas-empty">
                        <div class="ske-reservas-empty-icono">
                            <svg viewBox="0 0 24 24">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <h3>Reserva no encontrada</h3>
                        <p>No existe la reserva <strong>"${tipoReserva}"</strong> para la configuración seleccionada.</p>
                    </div>
                `;
            }
        });
    },

    renderResultado(reserva, linea, terminal, turno, semana) {
        return `
            <div class="ske-reservas-resultado">
                <div class="ske-reservas-resultado-header">
                    <div class="ske-reservas-tipo-badge">${reserva.tipo}</div>
                    <div class="ske-reservas-info-row">
                        <span class="ske-reservas-info-tag">
                            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            ${linea?.nombre || 'N/A'}
                        </span>
                        <span class="ske-reservas-info-tag">
                            <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            ${terminal?.nombre || 'N/A'}
                        </span>
                        <span class="ske-reservas-info-tag">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            ${turno?.nombre || 'N/A'}
                        </span>
                        <span class="ske-reservas-info-tag">
                            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            ${semana?.tipo || 'N/A'}
                        </span>
                    </div>
                </div>

                <div class="ske-reservas-horarios">
                    <div class="ske-reservas-horario-box">
                        <span class="ske-reservas-horario-label">Entrada</span>
                        <span class="ske-reservas-horario-valor">${reserva.entrada || '--:--'}</span>
                    </div>
                    <div class="ske-reservas-horario-arrow">→</div>
                    <div class="ske-reservas-horario-box">
                        <span class="ske-reservas-horario-label">Salida</span>
                        <span class="ske-reservas-horario-valor">${reserva.salida || '--:--'}</span>
                    </div>
                </div>
            </div>
        `;
    }
};

export default ReservasBusqueda;