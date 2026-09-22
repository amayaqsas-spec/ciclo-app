// ============================================
// SERVICIOS-BUSQUEDA.JS - Búsqueda Profesional de Servicios
// ============================================

const ServiciosBusqueda = {
    render() {
        const lineas = DB.load('lineas');
        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        return `
            <div class="view active">
                <h2 class="page-title">
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Búsqueda de Servicios
                </h2>

                <!-- PANEL DE BÚSQUEDA -->
                <div class="sb-search-panel">
                    <div class="sb-search-grid">
                        <div class="sb-input-group">
                            <label>Línea</label>
                            <select id="sbLinea">${lineaOptions}</select>
                        </div>
                        <div class="sb-input-group">
                            <label>Terminal</label>
                            <select id="sbTerminal">
                                <option value="">Selecciona línea primero</option>
                            </select>
                        </div>
                        <div class="sb-input-group">
                            <label>Tipo de Día</label>
                            <select id="sbSemana">
                                <option value="">Selecciona línea primero</option>
                            </select>
                        </div>
                        <div class="sb-input-group">
                            <label>Número de Servicio</label>
                            <input type="text" id="sbNumero" placeholder="Ej. 1, 2, 11, 12">
                        </div>
                    </div>
                    <button class="sb-btn-buscar" id="btnBuscar">
                        <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Buscar Servicio
                    </button>
                </div>

                <!-- RESULTADOS -->
                <div id="sbResultados"></div>
            </div>
        `;
    },

    init() {
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        const selectLinea = document.getElementById('sbLinea');
        const selectTerminal = document.getElementById('sbTerminal');
        const selectSemana = document.getElementById('sbSemana');

        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const terminalesFiltradas = terminales.filter(t => t.lineaId === lineaId);
            selectTerminal.innerHTML = terminalesFiltradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + terminalesFiltradas.map(t => 
                    `<option value="${t.id}">${t.nombre}</option>`
                ).join('');
            updateSemanas();
        };

        const updateSemanas = () => {
            const lineaId = selectLinea.value;
            const semanasFiltradas = semanas.filter(s => s.lineaId === lineaId);
            selectSemana.innerHTML = semanasFiltradas.length === 0
                ? '<option value="">No hay tipos de día</option>'
                : '<option value="">Selecciona tipo de día</option>' + semanasFiltradas.map(s => 
                    `<option value="${s.id}">${s.tipo}</option>`
                ).join('');
        };

        selectLinea.addEventListener('change', updateTerminales);
        updateTerminales();

        document.getElementById('btnBuscar').addEventListener('click', () => this.buscar());
        
        // Buscar también al presionar Enter
        document.getElementById('sbNumero').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.buscar();
        });
    },

    buscar() {
        const lineaId = document.getElementById('sbLinea').value;
        const terminalId = document.getElementById('sbTerminal').value;
        const semanaId = document.getElementById('sbSemana').value;
        const numero = document.getElementById('sbNumero').value.trim();

        if (!lineaId || !terminalId || !semanaId || !numero) {
            App.showToast('Completa todos los campos para buscar');
            return;
        }

        const servicios = DB.load('servicios');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        // Buscar servicio exacto
        const servicio = servicios.find(s => 
            s.lineaId === lineaId && 
            s.terminalId === terminalId && 
            s.semanaId === semanaId && 
            s.nombre === numero
        );

        const container = document.getElementById('sbResultados');

        if (!servicio) {
            container.innerHTML = `
                <div class="sb-no-result">
                    <svg viewBox="0 0 24 24" style="width:60px;height:60px;stroke:var(--text-light);fill:none;stroke-width:1.5;opacity:0.4;">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        <line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                    <h3>Servicio no encontrado</h3>
                    <p>No existe un servicio con el número <strong>${numero}</strong></p>
                    <p style="font-size:12px;color:var(--text-soft);margin-top:8px;">Verifica la línea, terminal, tipo de día y número de servicio.</p>
                </div>
            `;
            return;
        }

        const linea = lineas.find(l => l.id === servicio.lineaId);
        const terminal = terminales.find(t => t.id === servicio.terminalId);
        const semana = semanas.find(s => s.id === servicio.semanaId);
        const trenes = servicio.trenes || [];
        const haceGarage = servicio.garage === true || servicio.garage === 'Si' || servicio.garage === 'Sí';

        container.innerHTML = `
            <div class="sb-result-container">
                <!-- HEADER: Información básica -->
                <div class="sb-header-info">
                    <div class="sb-servicio-numero">Servicio #${servicio.nombre}</div>
                    <div class="sb-info-detalles">
                        <div class="sb-info-tag">
                            <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                            ${linea ? linea.nombre : 'N/A'}
                        </div>
                        <div class="sb-info-tag">
                            <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            ${terminal ? terminal.nombre : 'N/A'}
                        </div>
                        <div class="sb-info-tag">
                            <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            ${semana ? semana.tipo : 'N/A'}
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN: Trenes -->
                ${trenes.length > 0 ? `
                    <div class="sb-section">
                        <div class="sb-section-header">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                            <h3>Trenes</h3>
                        </div>
                        <div class="sb-trenes-grid">
                            ${trenes.map((tren, idx) => `
                                <div class="sb-tren-card">
                                    <div class="sb-tren-header">
                                        <span class="sb-tren-label">Tren</span>
                                        <span class="sb-tren-numero">#${tren.numero || (idx + 1)}</span>
                                    </div>
                                    <div class="sb-tren-vueltas">
                                        <span class="sb-vueltas-label">Vueltas:</span>
                                        <span class="sb-vueltas-numero">${tren.vueltas || 'N/A'}</span>
                                    </div>
                                    <div class="sb-tren-horarios">
                                        <div class="sb-horario-item">
                                            <span class="sb-horario-label">Salida</span>
                                            <span class="sb-horario-time">${tren.salida || '--:--'}</span>
                                        </div>
                                        <div class="sb-horario-separator">→</div>
                                        <div class="sb-horario-item">
                                            <span class="sb-horario-label">Llegada</span>
                                            <span class="sb-horario-time">${tren.llegada || '--:--'}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- SECCIÓN: Garage -->
                <div class="sb-section">
                    <div class="sb-section-header">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;">
                            ${haceGarage 
                                ? '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' 
                                : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
                        </svg>
                        <h3>Garage</h3>
                    </div>
                    <div class="sb-garage-status ${haceGarage ? 'sb-garage-yes' : 'sb-garage-no'}">
                        ${haceGarage ? '✓ Sí hace Garage' : ' No hace Garage'}
                    </div>
                </div>

                <!-- SECCIÓN: Descanso -->
                <div class="sb-section">
                    <div class="sb-section-header">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <h3>Descanso</h3>
                    </div>
                    <div class="sb-descanso-container">
                        <div class="sb-descanso-item">
                            <span class="sb-descanso-label">Inicio</span>
                            <span class="sb-descanso-time">${servicio.descansoInicio || '--:--'}</span>
                        </div>
                        <div class="sb-descanso-arrow">→</div>
                        <div class="sb-descanso-item">
                            <span class="sb-descanso-label">Final</span>
                            <span class="sb-descanso-time">${servicio.descansoFinal || '--:--'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

export default ServiciosBusqueda;