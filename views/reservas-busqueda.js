// ============================================
// RESERVAS-BUSQUEDA.JS - Búsqueda de Reservas
// ============================================

const ReservasBusqueda = {
    render() {
        const lineas = DB.load('lineas');
        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        return `
            <div class="view active">
                <h2 class="page-title">
                    <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Reservas
                </h2>

                <!-- PANEL DE BÚSQUEDA -->
                <div class="search-panel">
                    <div class="search-grid">
                        <div class="input-group">
                            <label>Línea</label>
                            <select id="rbLinea">${lineaOptions}</select>
                        </div>
                        <div class="input-group">
                            <label>Terminal</label>
                            <select id="rbTerminal">
                                <option value="">Selecciona línea primero</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Turno</label>
                            <select id="rbTurno">
                                <option value="">Selecciona línea primero</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Tipo de Reserva</label>
                            <input type="text" id="rbTipo" placeholder="Ej. MA, CC, CB, RA">
                        </div>
                    </div>
                    <button class="btn-search" id="btnBuscarReserva">
                        <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Buscar Reserva
                    </button>
                </div>

                <!-- RESULTADOS -->
                <div id="rbResultados"></div>
            </div>
        `;
    },

    init() {
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const turnos = DB.load('turnos');

        const selectLinea = document.getElementById('rbLinea');
        const selectTerminal = document.getElementById('rbTerminal');
        const selectTurno = document.getElementById('rbTurno');

        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const terminalesFiltradas = terminales.filter(t => t.lineaId === lineaId);
            selectTerminal.innerHTML = terminalesFiltradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + terminalesFiltradas.map(t => 
                    `<option value="${t.id}">${t.nombre}</option>`
                ).join('');
            updateTurnos();
        };

        const updateTurnos = () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            
            let turnosFiltrados = turnos.filter(t => t.lineaId === lineaId);
            if (terminalId) {
                turnosFiltrados = turnosFiltrados.filter(t => t.terminalId === terminalId);
            }
            
            selectTurno.innerHTML = turnosFiltrados.length === 0
                ? '<option value="">No hay turnos</option>'
                : '<option value="">Selecciona turno</option>' + turnosFiltrados.map(t => 
                    `<option value="${t.id}">${t.nombre}</option>`
                ).join('');
        };

        selectLinea.addEventListener('change', updateTerminales);
        selectTerminal.addEventListener('change', updateTurnos);
        updateTerminales();

        document.getElementById('btnBuscarReserva').addEventListener('click', () => this.buscar());
        
        // Buscar también al presionar Enter
        document.getElementById('rbTipo').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.buscar();
        });
    },

    buscar() {
        const lineaId = document.getElementById('rbLinea').value;
        const terminalId = document.getElementById('rbTerminal').value;
        const turnoId = document.getElementById('rbTurno').value;
        const tipo = document.getElementById('rbTipo').value.trim().toUpperCase();

        if (!lineaId || !terminalId || !turnoId || !tipo) {
            App.showToast('Completa todos los campos para buscar');
            return;
        }

        const reservas = DB.load('reservas');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const turnos = DB.load('turnos');

        // Buscar reservas que coincidan (case-insensitive)
        const reservasEncontradas = reservas.filter(r => 
            r.lineaId === lineaId && 
            r.terminalId === terminalId && 
            r.turnoId === turnoId && 
            r.tipo.toUpperCase() === tipo
        );

        const container = document.getElementById('rbResultados');

        if (reservasEncontradas.length === 0) {
            container.innerHTML = `
                <div class="sb-empty">
                    <svg viewBox="0 0 24 24" style="width:48px;height:48px;stroke:var(--text-light);fill:none;stroke-width:1.5;opacity:0.4;">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        <line x1="9" y1="10" x2="15" y2="10"/>
                    </svg>
                    <h3>Reserva no encontrada</h3>
                    <p>No existe una reserva con tipo <strong>${tipo}</strong> para los filtros seleccionados.</p>
                    <p style="font-size:12px;color:var(--text-soft);margin-top:8px;">Verifica la línea, terminal, turno y tipo de reserva.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = reservasEncontradas.map(reserva => {
            const linea = lineas.find(l => l.id === reserva.lineaId);
            const terminal = terminales.find(t => t.id === reserva.terminalId);
            const turno = turnos.find(t => t.id === reserva.turnoId);

            return `
                <div class="rb-result-card">
                    <div class="rb-header">
                        <div class="rb-tipo-badge">${reserva.tipo}</div>
                        <div class="rb-info-basica">
                            <div class="rb-info-item">
                                <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                                <span>${linea ? linea.nombre : 'N/A'}</span>
                            </div>
                            <div class="rb-info-item">
                                <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                <span>${terminal ? terminal.nombre : 'N/A'}</span>
                            </div>
                            <div class="rb-info-item">
                                <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                <span>${turno ? turno.nombre : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="rb-horarios">
                        <div class="rb-horario-box">
                            <div class="rb-horario-label">Hora de Entrada</div>
                            <div class="rb-horario-valor">${reserva.entrada || '--:--'}</div>
                        </div>
                        <div class="rb-horario-arrow">→</div>
                        <div class="rb-horario-box">
                            <div class="rb-horario-label">Hora de Salida</div>
                            <div class="rb-horario-valor">${reserva.salida || '--:--'}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
};

export default ReservasBusqueda;