// ============================================
// SERVICIOS-BUSQUEDA.JS - Módulo Buscador de Servicios
// ============================================

const ServiciosBusqueda = {
    relojInterval: null,
    servicioActual: null,
    minutosAtraso: 0,
    hayAtrasoActivo: false,

    render() {
        const lineas = DB.load('lineas');
        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        return `
            <div class="view active">
                <h2 class="page-title">
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Servicios
                </h2>

                <div class="sb-buscador">
                    <div class="input-group">
                        <label>Línea</label>
                        <select id="sbLinea">${lineaOptions}</select>
                    </div>
                    <div class="input-group">
                        <label>Terminal</label>
                        <select id="sbTerminal"><option value="">Selecciona línea primero</option></select>
                    </div>
                    <div class="input-group">
                        <label>Tipo de Semana</label>
                        <select id="sbSemana"><option value="">Selecciona terminal primero</option></select>
                    </div>
                    <div class="input-group">
                        <label>Número de Servicio</label>
                        <input type="text" id="sbServicioTexto" placeholder="Ej: 1234" disabled>
                    </div>
                    <button class="btn-buscar-servicio" id="btnBuscarServicio" disabled>
                        <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Buscar
                    </button>
                </div>

                <div id="sbResultado"></div>
            </div>
        `;
    },

    init() {
        this.minutosAtraso = 0;
        this.hayAtrasoActivo = false;

        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        const selectLinea = document.getElementById('sbLinea');
        const selectTerminal = document.getElementById('sbTerminal');
        const selectSemana = document.getElementById('sbSemana');
        const inputServicio = document.getElementById('sbServicioTexto');
        const btnBuscar = document.getElementById('btnBuscarServicio');

        const resetearBusqueda = () => {
            if (this.relojInterval) {
                clearInterval(this.relojInterval);
                this.relojInterval = null;
            }
            this.servicioActual = null;
            this.minutosAtraso = 0;
            this.hayAtrasoActivo = false;
            inputServicio.value = '';
            inputServicio.disabled = true;
            btnBuscar.disabled = true;
            document.getElementById('sbResultado').innerHTML = '';
        };

        // ✅ TERMINALES CON NOMBRE COMPLETO + TURNO
        selectLinea.addEventListener('change', () => {
            const lineaId = selectLinea.value;
            selectTerminal.innerHTML = '<option value="">Selecciona terminal</option>';
            selectSemana.innerHTML = '<option value="">Selecciona terminal primero</option>';
            resetearBusqueda();

            if (lineaId) {
                const terminalesFiltradas = terminales.filter(t => t.lineaId === lineaId);
                terminalesFiltradas.forEach(t => {
                    selectTerminal.innerHTML += `<option value="${t.id}">${t.nombre} - ${t.turno}</option>`;
                });
            }
        });

        selectTerminal.addEventListener('change', () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            selectSemana.innerHTML = '<option value="">Selecciona semana</option>';
            resetearBusqueda();

            if (lineaId && terminalId) {
                const semanasFiltradas = semanas.filter(s => 
                    s.lineaId === lineaId && s.terminalId === terminalId
                );
                semanasFiltradas.forEach(s => {
                    selectSemana.innerHTML += `<option value="${s.id}">${s.tipo}</option>`;
                });
            }
        });

        selectSemana.addEventListener('change', () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const semanaId = selectSemana.value;

            if (lineaId && terminalId && semanaId) {
                inputServicio.disabled = false;
                inputServicio.focus();
            } else {
                inputServicio.disabled = true;
                btnBuscar.disabled = true;
            }
        });

        inputServicio.addEventListener('input', () => {
            btnBuscar.disabled = inputServicio.value.trim().length === 0;
        });

        inputServicio.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !btnBuscar.disabled) {
                this.buscarServicio();
            }
        });

        btnBuscar.addEventListener('click', () => this.buscarServicio());
    },

    onLeave() {
        if (this.hayAtrasoActivo && this.minutosAtraso > 0) {
            return new Promise((resolve) => {
                const overlay = document.createElement('div');
                overlay.className = 'modal-overlay show';
                overlay.innerHTML = `
                    <div class="modal">
                        <h3>⚠️ Atraso se borrará</h3>
                        <p style="color:var(--text-soft);font-size:13px;margin-bottom:16px;line-height:1.5;">
                            Tienes <strong style="color:#ff9800;">+${this.minutosAtraso} min de atraso</strong> agregado.<br><br>
                            El atraso <strong>NO se guarda</strong> y se borrará al salir de esta vista.
                        </p>
                        <div class="modal-actions">
                            <button class="btn-secondary" id="btnCancelarSalidaSB">Quedarme</button>
                            <button class="btn-primary" id="btnConfirmarSalidaSB" style="background:#ff9800;">Salir y borrar</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(overlay);

                document.getElementById('btnCancelarSalidaSB').addEventListener('click', () => {
                    overlay.remove();
                    resolve(false);
                });

                document.getElementById('btnConfirmarSalidaSB').addEventListener('click', () => {
                    overlay.remove();
                    this.minutosAtraso = 0;
                    this.hayAtrasoActivo = false;
                    if (this.relojInterval) {
                        clearInterval(this.relojInterval);
                        this.relojInterval = null;
                    }
                    resolve(true);
                });
            });
        }
        return Promise.resolve(true);
    },

    buscarServicio() {
        const lineaId = document.getElementById('sbLinea').value;
        const terminalId = document.getElementById('sbTerminal').value;
        const semanaId = document.getElementById('sbSemana').value;
        const numeroServicio = document.getElementById('sbServicioTexto').value.trim();

        if (!lineaId || !terminalId || !semanaId || !numeroServicio) {
            App.showToast('Completa todos los campos');
            return;
        }

        const servicios = DB.load('servicios');
        const servicio = servicios.find(s => 
            s.lineaId === lineaId && 
            s.terminalId === terminalId && 
            s.semanaId === semanaId && 
            s.nombre === numeroServicio
        );

        if (!servicio) {
            document.getElementById('sbResultado').innerHTML = `
                <div class="sb-no-resultado">
                    <svg viewBox="0 0 24 24" style="width:40px;height:40px;stroke:var(--text-light);fill:none;stroke-width:2;margin-bottom:8px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                    <p>No se encontró el servicio <strong>${numeroServicio}</strong></p>
                    <p style="font-size:11px;color:var(--text-light);margin-top:4px;">Verifica el número e intenta de nuevo</p>
                </div>
            `;
            return;
        }

        this.mostrarServicio(servicio);
    },

    mostrarServicio(servicio) {
        this.servicioActual = servicio;
        this.minutosAtraso = 0;
        this.hayAtrasoActivo = false;

        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');
        const linea = lineas.find(l => l.id === servicio.lineaId);
        const terminal = terminales.find(t => t.id === servicio.terminalId);
        const semana = semanas.find(s => s.id === servicio.semanaId);

        const trenes = servicio.trenes || [];
        const tren1 = trenes[0] || {};
        const tren2 = trenes[1] || {};
        const trenesExtra = trenes.slice(2);

        const haceGarage = servicio.garage === true || servicio.garage === 'Si' || servicio.garage === 'Sí';
        const garageTexto = haceGarage ? 'Sí hace Garage' : 'No hace Garage';
        const garageClase = haceGarage ? 'sb-garage-si' : 'sb-garage-no';

        const resultado = document.getElementById('sbResultado');
        resultado.innerHTML = `
            <div class="sb-info-header">
                <div class="sb-info-row">
                    <span class="sb-info-label">Línea:</span>
                    <span class="sb-info-value">${linea ? linea.nombre : 'N/A'}</span>
                </div>
                <div class="sb-info-row">
                    <span class="sb-info-label">Terminal:</span>
                    <span class="sb-info-value">${terminal ? terminal.nombre : 'N/A'}</span>
                </div>
                <div class="sb-info-row">
                    <span class="sb-info-label">Semana:</span>
                    <span class="sb-info-value">${semana ? semana.tipo : 'N/A'}</span>
                </div>
            </div>

            <div class="sb-servicio-nombre">Servicio #${servicio.nombre}</div>

            <div class="sb-garage-badge ${garageClase}">
                <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;">
                    ${haceGarage 
                        ? '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' 
                        : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
                </svg>
                ${garageTexto}
            </div>

            <div class="sb-trenes-container">
                ${tren1.numero || tren1.salida ? `
                    <div class="sb-tren">
                        <div class="sb-tren-numero">Primer Tren #${tren1.numero || '1'}</div>
                        <div class="sb-tren-horarios">
                            <div class="sb-horario">
                                <span class="sb-horario-label">Salida</span>
                                <span class="sb-horario-valor">${tren1.salida || '--:--'}</span>
                            </div>
                            <div class="sb-horario">
                                <span class="sb-horario-label">Llegada</span>
                                <span class="sb-horario-valor">${tren1.llegada || '--:--'}</span>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                ${tren2.numero || tren2.salida ? `
                    <div class="sb-tren">
                        <div class="sb-tren-numero">Segundo Tren #${tren2.numero || '2'}</div>
                        <div class="sb-tren-horarios">
                            <div class="sb-horario">
                                <span class="sb-horario-label">Salida</span>
                                <span class="sb-horario-valor">${tren2.salida || '--:--'}</span>
                            </div>
                            <div class="sb-horario">
                                <span class="sb-horario-label">Llegada</span>
                                <span class="sb-horario-valor">${tren2.llegada || '--:--'}</span>
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${trenesExtra.map((tren, idx) => `
                    <div class="sb-tren">
                        <div class="sb-tren-numero">Tren Adicional #${tren.numero || (idx + 3)}</div>
                        <div class="sb-tren-horarios">
                            <div class="sb-horario">
                                <span class="sb-horario-label">Salida</span>
                                <span class="sb-horario-valor">${tren.salida || '--:--'}</span>
                            </div>
                            <div class="sb-horario">
                                <span class="sb-horario-label">Llegada</span>
                                <span class="sb-horario-valor">${tren.llegada || '--:--'}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="sb-descanso-container">
                <div class="sb-descanso-titulo">
                    <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Descanso
                </div>
                <div class="sb-descanso-horarios">
                    <div class="sb-descanso-item">
                        <span class="sb-descanso-label">Inicio</span>
                        <span class="sb-descanso-valor">${servicio.descansoInicio || '--:--'}</span>
                    </div>
                    <div class="sb-descanso-separador">→</div>
                    <div class="sb-descanso-item">
                        <span class="sb-descanso-label">Final</span>
                        <span class="sb-descanso-valor">${servicio.descansoFinal || '--:--'}</span>
                    </div>
                </div>
                
                <div class="sb-reloj-container" id="sbRelojContainer">
                    <div class="sb-reloj-tiempo" id="sbRelojTiempo">--:--:--</div>
                    <div class="sb-reloj-etiqueta" id="sbRelojEtiqueta">Calculando...</div>
                </div>

                <button class="btn-atraso-sb" id="btnAgregarAtrasoSB">
                    <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Agregar Atraso en Línea
                </button>
            </div>
        `;

        this.iniciarReloj(servicio);

        document.getElementById('btnAgregarAtrasoSB').addEventListener('click', () => this.agregarAtraso());
    },

    iniciarReloj(servicio) {
        if (this.relojInterval) clearInterval(this.relojInterval);

        const actualizarReloj = () => {
            const ahora = new Date();
            const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
            const segundosActuales = ahora.getSeconds();

            const [hInicio, mInicio] = (servicio.descansoInicio || '00:00').split(':').map(Number);
            const [hFinal, mFinal] = (servicio.descansoFinal || '00:00').split(':').map(Number);

            const minutosInicio = hInicio * 60 + mInicio;
            const minutosFinal = hFinal * 60 + mFinal;
            const minutosAtraso = this.minutosAtraso || 0;
            const minutosFinalAjustado = minutosFinal + minutosAtraso;

            const relojTiempo = document.getElementById('sbRelojTiempo');
            const relojEtiqueta = document.getElementById('sbRelojEtiqueta');

            if (!relojTiempo || !relojEtiqueta) return;

            if (horaActual < minutosInicio) {
                const diff = minutosInicio - horaActual;
                const horas = Math.floor(diff / 60);
                const mins = diff % 60;
                relojTiempo.textContent = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(60 - segundosActuales).padStart(2, '0')}`;
                relojEtiqueta.textContent = 'Tiempo para iniciar descanso';
                relojTiempo.className = 'sb-reloj-tiempo sb-reloj-espera';
            } else if (horaActual >= minutosInicio && horaActual < minutosFinalAjustado) {
                const diff = minutosFinalAjustado - horaActual;
                const horas = Math.floor(diff / 60);
                const mins = diff % 60;
                const segs = 60 - segundosActuales;
                relojTiempo.textContent = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
                relojEtiqueta.textContent = minutosAtraso > 0 
                    ? `Tiempo restante (con +${minutosAtraso} min de atraso)` 
                    : 'Tiempo restante de descanso';
                relojTiempo.className = 'sb-reloj-tiempo sb-reloj-activo';
            } else {
                const diff = horaActual - minutosFinalAjustado;
                const horas = Math.floor(diff / 60);
                const mins = diff % 60;
                relojTiempo.textContent = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(segundosActuales).padStart(2, '0')}`;
                relojEtiqueta.textContent = 'Descanso finalizado';
                relojTiempo.className = 'sb-reloj-tiempo sb-reloj-terminado';
            }
        };

        actualizarReloj();
        this.relojInterval = setInterval(actualizarReloj, 1000);
    },

    agregarAtraso() {
        const minutos = prompt('¿Cuántos minutos de atraso en línea?');
        
        if (minutos === null) return;
        
        const minutosNum = parseInt(minutos);
        
        if (isNaN(minutosNum) || minutosNum <= 0) {
            App.showToast('Ingresa un número válido de minutos');
            return;
        }

        this.minutosAtraso = (this.minutosAtraso || 0) + minutosNum;
        this.hayAtrasoActivo = true;

        App.showToast(`+${minutosNum} min de atraso agregados (temporal)`);
        this.iniciarReloj(this.servicioActual);
        
        const container = document.getElementById('sbRelojContainer');
        if (container) {
            let badge = container.querySelector('.sb-atraso-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'sb-atraso-badge';
                container.appendChild(badge);
            }
            badge.textContent = `+${this.minutosAtraso} min atraso`;
        }
    }
};

export default ServiciosBusqueda;