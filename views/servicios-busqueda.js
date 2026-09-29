// ============================================
// SERVICIOS-BUSQUEDA.JS - Módulo con Skeuomorphism
// ============================================

const ServiciosBusqueda = {
    render() {
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        return `
            <div class="view active ske-servicios">
                <!-- HEADER SKEUOMÓRFICO -->
                <div class="ske-servicios-header">
                    <div class="ske-servicios-icono">
                        <svg viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </div>
                    <div class="ske-servicios-texto">
                        <h2 class="ske-servicios-titulo">Búsqueda de Servicios</h2>
                        <p class="ske-servicios-subtitulo">Encuentra servicios por línea, terminal y tipo de día</p>
                    </div>
                </div>

                <!-- FORMULARIO DE BÚSQUEDA -->
                <div class="ske-servicios-form-card">
                    <div class="ske-servicios-input-group">
                        <label class="ske-servicios-label">
                            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            Línea
                        </label>
                        <select id="sbLinea" class="ske-servicios-select">
                            <option value="">Selecciona una línea</option>
                            ${lineas.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('')}
                        </select>
                    </div>

                    <div class="ske-servicios-input-group">
                        <label class="ske-servicios-label">
                            <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            Terminal
                        </label>
                        <select id="sbTerminal" class="ske-servicios-select" disabled>
                            <option value="">Primero selecciona una línea</option>
                        </select>
                    </div>

                    <div class="ske-servicios-input-group">
                        <label class="ske-servicios-label">
                            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            Tipo de Día
                        </label>
                        <select id="sbTipoDia" class="ske-servicios-select" disabled>
                            <option value="">Primero selecciona terminal</option>
                        </select>
                    </div>

                    <div class="ske-servicios-input-group">
                        <label class="ske-servicios-label">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Número de Servicio
                        </label>
                        <input type="text" id="sbNumeroServicio" class="ske-servicios-input" placeholder="Ej: 1, 2, 11, 12" disabled>
                    </div>

                    <button class="ske-servicios-btn-buscar" id="btnBuscarServicio" disabled>
                        <svg viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <span>Buscar Servicio</span>
                    </button>
                </div>

                <!-- RESULTADO -->
                <div id="sbResultado"></div>
            </div>
        `;
    },

    init() {
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');
        const servicios = DB.load('servicios');

        const selectLinea = document.getElementById('sbLinea');
        const selectTerminal = document.getElementById('sbTerminal');
        const selectTipoDia = document.getElementById('sbTipoDia');
        const inputNumero = document.getElementById('sbNumeroServicio');
        const btnBuscar = document.getElementById('btnBuscarServicio');
        const resultadoDiv = document.getElementById('sbResultado');

        // Cambio de línea
        selectLinea?.addEventListener('change', (e) => {
            const lineaId = e.target.value;
            
            selectTerminal.innerHTML = '<option value="">Selecciona terminal</option>';
            selectTipoDia.innerHTML = '<option value="">Primero selecciona terminal</option>';
            inputNumero.value = '';
            inputNumero.disabled = true;
            btnBuscar.disabled = true;
            resultadoDiv.innerHTML = '';

            if (lineaId) {
                const terminalesLinea = terminales.filter(t => t.lineaId === lineaId);
                terminalesLinea.forEach(t => {
                    selectTerminal.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
                });
                selectTerminal.disabled = false;
            } else {
                selectTerminal.disabled = true;
            }
        });

        // Cambio de terminal
        selectTerminal?.addEventListener('change', (e) => {
            const terminalId = e.target.value;
            
            selectTipoDia.innerHTML = '<option value="">Selecciona tipo de día</option>';
            inputNumero.value = '';
            inputNumero.disabled = true;
            btnBuscar.disabled = true;
            resultadoDiv.innerHTML = '';

            if (terminalId) {
                const tiposDia = [...new Set(semanas.map(s => s.tipo))];
                tiposDia.forEach(tipo => {
                    selectTipoDia.innerHTML += `<option value="${tipo}">${tipo}</option>`;
                });
                selectTipoDia.disabled = false;
            } else {
                selectTipoDia.disabled = true;
            }
        });

        // Cambio de tipo de día
        selectTipoDia?.addEventListener('change', (e) => {
            const tipoDia = e.target.value;
            
            inputNumero.value = '';
            btnBuscar.disabled = true;
            resultadoDiv.innerHTML = '';

            if (tipoDia) {
                inputNumero.disabled = false;
            } else {
                inputNumero.disabled = true;
            }
        });

        // Habilitar búsqueda cuando hay número
        inputNumero?.addEventListener('input', (e) => {
            if (e.target.value.trim()) {
                btnBuscar.disabled = false;
            } else {
                btnBuscar.disabled = true;
            }
        });

        // Buscar servicio
        btnBuscar?.addEventListener('click', () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const tipoDia = selectTipoDia.value;
            const numeroServicio = inputNumero.value.trim();

            if (!lineaId || !terminalId || !tipoDia || !numeroServicio) {
                App.showToast('⚠️ Completa todos los campos');
                return;
            }

            const linea = lineas.find(l => l.id === lineaId);
            const terminal = terminales.find(t => t.id === terminalId);
            const semana = semanas.find(s => s.tipo === tipoDia);

            const servicio = servicios.find(s => 
                s.lineaId === lineaId && 
                s.terminalId === terminalId && 
                s.semanaId === semana?.id && 
                String(s.nombre).trim() === numeroServicio
            );

            if (servicio) {
                resultadoDiv.innerHTML = this.renderResultado(servicio, linea, terminal, semana);
                this.initResultadoEvents(servicio);
            } else {
                resultadoDiv.innerHTML = `
                    <div class="ske-servicios-empty">
                        <div class="ske-servicios-empty-icono">
                            <svg viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                        </div>
                        <h3>Servicio no encontrado</h3>
                        <p>No existe el servicio <strong>"${numeroServicio}"</strong> para la configuración seleccionada.</p>
                    </div>
                `;
            }
        });
    },

    renderResultado(servicio, linea, terminal, semana) {
        const trenes = servicio.trenes || [];
        const haceGarage = servicio.garage === true || servicio.garage === 'Si' || servicio.garage === 'Sí';

        return `
            <div class="ske-servicios-resultado">
                <div class="ske-servicios-resultado-header">
                    <div class="ske-servicios-numero-badge">Servicio #${servicio.nombre}</div>
                    <div class="ske-servicios-info-row">
                        <span class="ske-servicios-info-tag">
                            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            ${linea?.nombre || 'N/A'}
                        </span>
                        <span class="ske-servicios-info-tag">
                            <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            ${terminal?.nombre || 'N/A'}
                        </span>
                        <span class="ske-servicios-info-tag">
                            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            ${semana?.tipo || 'N/A'}
                        </span>
                    </div>
                </div>

                <!-- GARAGE -->
                <div class="ske-servicios-garage ${haceGarage ? 'ske-garage-yes' : 'ske-garage-no'}">
                    <svg viewBox="0 0 24 24">
                        ${haceGarage 
                            ? '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' 
                            : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
                    </svg>
                    <span>${haceGarage ? 'Sí hace Garage' : 'No hace Garage'}</span>
                </div>

                <!-- TRENES -->
                ${trenes.length > 0 ? `
                    <div class="ske-servicios-trenes">
                        <h3 class="ske-servicios-section-title">
                            <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
                            Trenes
                        </h3>
                        <div class="ske-servicios-trenes-list">
                            ${trenes.map((tren, idx) => {
                                const numTren = tren.numero || (idx + 1);
                                const labelTren = idx === 0 ? 'Primer Tren' : idx === 1 ? 'Segundo Tren' : `Tren #${numTren}`;
                                return `
                                    <div class="ske-servicios-tren-card">
                                        <div class="ske-servicios-tren-header">${labelTren} <span class="ske-servicios-tren-num">#${numTren}</span></div>
                                        <div class="ske-servicios-tren-times">
                                            <div class="ske-servicios-time-box">
                                                <span class="ske-servicios-time-label">Salida</span>
                                                <span class="ske-servicios-time-value">${tren.salida || '--:--'}</span>
                                            </div>
                                            <div class="ske-servicios-time-box">
                                                <span class="ske-servicios-time-label">Llegada</span>
                                                <span class="ske-servicios-time-value">${tren.llegada || '--:--'}</span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- DESCANSO -->
                <div class="ske-servicios-descanso">
                    <div class="ske-servicios-descanso-header">
                        <div class="ske-servicios-icono-small">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <span>Descanso</span>
                    </div>
                    <div class="ske-servicios-descanso-times">
                        <div class="ske-servicios-descanso-item">
                            <span class="ske-servicios-descanso-label">Inicio</span>
                            <span class="ske-servicios-descanso-value">${servicio.descansoInicio || '--:--'}</span>
                        </div>
                        <div class="ske-servicios-descanso-separator">→</div>
                        <div class="ske-servicios-descanso-item">
                            <span class="ske-servicios-descanso-label">Final</span>
                            <span class="ske-servicios-descanso-value">${servicio.descansoFinal || '--:--'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    initResultadoEvents(servicio) {
        // Eventos adicionales si son necesarios
    }
};

export default ServiciosBusqueda;