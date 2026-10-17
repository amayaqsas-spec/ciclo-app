// ============================================
// HOME.JS - Dashboard con Hero Glassmorphism
// ============================================

const Home = {
    relojInterval: null,
    minutosAtraso: 0,
    infoServicio: null,

    RESERVAS: ['Ca', 'CB', 'CC', 'MA', 'RA', 'RB', 'RC', 'RD', 'RE', 'RF', 'RG', 'RH',
               'ca', 'cb', 'cc', 'ma', 'ra', 'rb', 'rc', 'rd', 're', 'rf', 'rg', 'rh'],

    getFechaLocal(fecha) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    esReserva(posicion) {
        if (!posicion) return false;
        return this.RESERVAS.includes(posicion.trim());
    },

    getTipoDiaActual() {
        const modoForzado = DB.get('modoDiaForzado', null);
        const fechaForzada = DB.get('fechaModoForzado', null);
        const hoyStr = this.getFechaLocal(new Date());

        if (modoForzado && fechaForzada !== hoyStr) {
            DB.remove('modoDiaForzado');
            DB.remove('fechaModoForzado');
        }

        const modoActual = DB.get('modoDiaForzado', null);
        if (modoActual === 'domingo') return 'Domingo/Festivos';
        if (modoActual === 'laboral') return 'Laboral';

        const dia = new Date().getDay();
        if (dia === 0) return 'Domingo/Festivos';
        if (dia === 6) return 'Sábado';
        return 'Laboral';
    },

    buscarServicioPorTipo(tipoDia, numeroServicio, userLineaId) {
        if (!numeroServicio || numeroServicio === 'N/A') return null;

        const servicios = DB.load('servicios');
        const semanas = DB.load('semanas');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        const normalizar = (texto) => {
            if (!texto) return '';
            return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '').trim();
        };

        const tipoDiaConfig = semanas.find(s => {
            const tipoNorm = normalizar(s.tipo);
            const actualNorm = normalizar(tipoDia);
            return tipoNorm === actualNorm && s.lineaId === userLineaId;
        });

        if (!tipoDiaConfig) return null;

        const servicio = servicios.find(s => {
            const nombreServicio = String(s.nombre).trim();
            const posicionNorm = String(numeroServicio).trim();
            return nombreServicio === posicionNorm && s.lineaId === userLineaId && s.semanaId === tipoDiaConfig.id;
        });

        if (servicio) {
            return { servicio, linea: lineas.find(l => l.id === servicio.lineaId), terminal: terminales.find(t => t.id === servicio.terminalId), semana: tipoDiaConfig };
        }
        return null;
    },

    render() {
        const defaultName = Auth.currentUser ? Auth.getUserName(Auth.currentUser) : 'Usuario';
        const name = DB.get('userName', defaultName);
        const imagenPerfil = DB.get('imagenPerfil', null);
        const avisosNoLeidos = DB.get('avisosNoLeidos', 0);

        const userLineaId = DB.get('userLineaId');
        const userTerminalId = DB.get('userTerminalId');
        const userNumeroRol = DB.get('userNumeroRol');

        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const rolesSemanal = DB.load('rolesSemanal');

        const miLinea = lineas.find(l => l.id === userLineaId);
        const miTerminal = terminales.find(t => t.id === userTerminalId);

        let semanaActualNum = 1;
        let posicionHoy = 'N/A';
        let tipoDiaActual = this.getTipoDiaActual();
        let errorMensaje = null;
        let esReservaHoy = false;
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaNombreReal = diasSemana[new Date().getDay()];
        const hoy = new Date();

        const configGlobal = DB.load('configuracionGlobal');
        const configInicio = configGlobal.find(c => c.tipo === 'inicioCiclo');

        if (configInicio && configInicio.fechaInicio) {
            const fechaInicio = new Date(configInicio.fechaInicio + 'T00:00:00');
            const hoyFecha = new Date();
            hoyFecha.setHours(0, 0, 0, 0);
            fechaInicio.setHours(0, 0, 0, 0);

            const diferenciaDias = Math.floor((hoyFecha - fechaInicio) / (1000 * 60 * 60 * 24));
            const semanasTranscurridas = Math.floor(diferenciaDias / 7);
            const semanaInicial = configInicio.semanaInicial || 1;
            semanaActualNum = ((semanasTranscurridas + semanaInicial - 1) % 5) + 1;
        }

        this.infoServicio = null;

        if (userNumeroRol && rolesSemanal.length > 0) {
            const miRol = rolesSemanal.find(r => String(r.numeroRol) === String(userNumeroRol) && r.lineaId === userLineaId);

            if (miRol) {
                const semanaData = miRol.semanas.find(s => s.numero === semanaActualNum);
                if (semanaData && semanaData.dias && semanaData.dias[diaNombreReal]) {
                    posicionHoy = semanaData.dias[diaNombreReal].posicion || 'N/A';
                }

                esReservaHoy = this.esReserva(posicionHoy);

                if (posicionHoy !== 'N/A') {
                    if (esReservaHoy) {
                        errorMensaje = `No hay servicios fijos para este tipo de reservas. Hoy tienes asignada la reserva "${posicionHoy}".`;
                    } else {
                        this.infoServicio = this.buscarServicioPorTipo(tipoDiaActual, posicionHoy, userLineaId);
                        if (!this.infoServicio) {
                            errorMensaje = `No se encontró servicio "${posicionHoy}" para tipo de día "${tipoDiaActual}".`;
                        }
                    }
                } else {
                    errorMensaje = `No hay posición asignada para hoy (${diaNombreReal}) en la Semana ${semanaActualNum}.`;
                }
            } else {
                errorMensaje = `No se encontró el Rol #${userNumeroRol} para tu línea.`;
            }
        } else {
            errorMensaje = 'Tu perfil no está completamente configurado.';
        }

        const tiempoExtraPendiente = DB.load('tiempoExtra').filter(t => !t.cobrado);
        const diaSemana = new Date().getDay();
        const mostrarBotonesModo = userNumeroRol && rolesSemanal.length > 0 && posicionHoy !== 'N/A' && !esReservaHoy;
        const modoForzado = DB.get('modoDiaForzado', null);

        const laboralActivo = modoForzado === null || modoForzado === 'laboral';
        const domingoActivo = modoForzado === 'domingo';

        // ✅ URL de imagen de fondo (si existe)
        const bgImageStyle = imagenPerfil 
            ? `background-image: url('${imagenPerfil}'); background-size: cover; background-position: center; filter: blur(20px) brightness(0.7); transform: scale(1.1);` 
            : `background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);`;

        return `
            <div class="view active ske-home">
                <!-- ✅ TARJETA HERO CON GLASSMORPHISM -->
                <div class="hero-card-glass">
                    <!-- Fondo difuminado -->
                    <div class="hero-bg-blur" style="${bgImageStyle}"></div>
                    <!-- Overlay para legibilidad -->
                    <div class="hero-overlay"></div>
                    
                    <div class="hero-content">
                        <!-- Botón de notificaciones -->
                        ${avisosNoLeidos > 0 ? `
                            <button class="hero-bell-btn" id="btnVerAvisos">
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                                <span class="hero-bell-badge">${avisosNoLeidos}</span>
                            </button>
                        ` : ''}

                        <!-- Avatar grande -->
                        <div class="hero-avatar-container">
                            <div class="hero-avatar-ring">
                                ${imagenPerfil 
                                    ? `<img src="${imagenPerfil}" alt="Perfil" class="hero-avatar-img">` 
                                    : `<svg viewBox="0 0 24 24" class="hero-avatar-placeholder"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
                                }
                            </div>
                            <button class="hero-camera-btn" id="btnCambiarFoto">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                    <circle cx="12" cy="13" r="4"/>
                                </svg>
                            </button>
                            <input type="file" id="inputFotoPerfil" accept="image/*" style="display:none;">
                        </div>

                        <!-- Datos del usuario -->
                        <div class="hero-user-info">
                            <h1 class="hero-greeting">¡Hola, ${name}!</h1>
                            <p class="hero-date">${diaNombreReal} ${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}</p>
                            <div class="hero-week-badge">
                                <span class="week-icon">📅</span>
                                <span class="week-text">Semana ${semanaActualNum}</span>
                            </div>
                        </div>
                    </div>
                </div>

                ${mostrarBotonesModo ? `
                    <div class="modern-card">
                        <div class="card-content">
                            <div class="card-section-title">
                                <span class="title-icon">🔄</span>
                                <span>MODO DE VISUALIZACIÓN</span>
                            </div>
                            <div class="mode-buttons-row">
                                <button id="btnModoLaboral" class="mode-btn ${laboralActivo ? 'mode-btn-active' : 'mode-btn-inactive'}">
                                    <span class="mode-btn-icon">📅</span>
                                    <span>Laboral</span>
                                </button>
                                <button id="btnModoDomingo" class="mode-btn ${domingoActivo ? 'mode-btn-active' : 'mode-btn-inactive'}">
                                    <span class="mode-btn-icon">🌙</span>
                                    <span>Domingo/Festivo</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div id="skeServicioDiaContainer">
                    ${errorMensaje ? `
                        <div class="modern-card">
                            <div class="card-content info-card">
                                <h3 class="info-card-title">Información no disponible</h3>
                                <p class="info-card-text">${errorMensaje}</p>
                            </div>
                        </div>
                    ` : this.infoServicio ? this.renderServicioDia(this.infoServicio, tipoDiaActual, posicionHoy) : `
                        <div class="modern-card">
                            <div class="card-content info-card">
                                <h3 class="info-card-title">Sin servicio asignado</h3>
                                <p class="info-card-text">No hay servicio registrado para tu posición hoy.</p>
                            </div>
                        </div>
                    `}
                </div>

                ${tiempoExtraPendiente.length > 0 ? `
                    <div class="modern-card">
                        <div class="card-content">
                            <div class="tiempo-extra-header">
                                <div class="tiempo-extra-icon">⏱️</div>
                                <h2 class="tiempo-extra-title">Tiempo Extra por Cobrar</h2>
                                <span class="tiempo-extra-count">${tiempoExtraPendiente.length}</span>
                            </div>
                            ${tiempoExtraPendiente.map(item => `
                                <div class="tiempo-extra-item">
                                    <div class="tiempo-extra-item-title">${item.tipo}</div>
                                    <div class="tiempo-extra-item-note">${item.nota || 'Sin nota'} • ${item.fecha}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    renderServicioDia(info, tipoDia, posicion) {
        const { servicio, linea, terminal } = info;
        const trenes = (servicio && servicio.trenes) || [];
        const haceGarage = servicio.garage === true || servicio.garage === 'Si' || servicio.garage === 'Sí';

        return `
            <div class="modern-card servicio-card">
                <div class="card-content">
                    <div class="servicio-header">
                        <div class="servicio-title-group">
                            <div class="servicio-subtitle">Servicio del Día</div>
                            <div class="servicio-title">Servicio ${servicio.nombre}</div>
                        </div>
                        <div class="servicio-tipo-badge">${tipoDia}</div>
                    </div>
                    
                    <div class="servicio-info-grid">
                        <div class="servicio-info-item">
                            <div class="info-item-label">🚌 Línea</div>
                            <div class="info-item-value">${linea ? linea.nombre : 'N/A'}</div>
                        </div>
                        <div class="servicio-info-item">
                            <div class="info-item-label">🚇 Terminal</div>
                            <div class="info-item-value">${terminal ? terminal.nombre : 'N/A'}</div>
                        </div>
                    </div>

                    ${haceGarage ? `<div class="garage-badge">✅ Hace Garage</div>` : ''}

                    <div class="trenes-section">
                        <div class="trenes-title">🚂 Trenes (${trenes.length})</div>
                        ${trenes.map((tren, idx) => {
                            const numTren = tren.numero || (idx + 1);
                            const labelTren = idx === 0 ? 'Primer Tren' : idx === 1 ? 'Segundo Tren' : `Tren #${numTren}`;
                            return `
                                <div class="tren-card">
                                    <div class="tren-header">
                                        <span class="tren-label">${labelTren} #${numTren}</span>
                                        ${tren.garage ? '<span class="garage-tag">GARAGE</span>' : ''}
                                    </div>
                                    <div class="tren-times-grid ${tren.vueltas ? 'three-cols' : 'two-cols'}">
                                        <div class="tren-time-box">
                                            <div class="time-label">Salida</div>
                                            <div class="time-value">${tren.salida || '--:--'}</div>
                                        </div>
                                        <div class="tren-time-box">
                                            <div class="time-label">Llegada</div>
                                            <div class="time-value">${tren.llegada || '--:--'}</div>
                                        </div>
                                        ${tren.vueltas ? `<div class="tren-time-box">
                                            <div class="time-label">Vueltas</div>
                                            <div class="time-value">${tren.vueltas}</div>
                                        </div>` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="descanso-section">
                        <div class="descanso-header">
                            <div class="descanso-icon">⏰</div>
                            <span class="descanso-title">Tiempo de Descanso</span>
                        </div>
                        <div class="descanso-times">
                            <div class="descanso-time-box">
                                <div class="time-label">Inicio</div>
                                <div class="time-value">${servicio.descansoInicio || '--:--'}</div>
                            </div>
                            <div class="descanso-arrow">→</div>
                            <div class="descanso-time-box">
                                <div class="time-label">Final</div>
                                <div class="time-value">${servicio.descansoFinal || '--:--'}</div>
                            </div>
                        </div>
                        <div id="hsdRelojContainer" class="reloj-container">
                            <div id="hsdRelojTiempo" class="reloj-tiempo">00:00:00</div>
                            <div id="hsdRelojEtiqueta" class="reloj-etiqueta">Esperando inicio de descanso...</div>
                        </div>
                        <button id="btnAgregarAtrasoHome" class="btn-atraso">⏱️ Agregar Atraso al Tiempo de Alimentos</button>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        this.minutosAtraso = 0;
        await DB_FIREBASE.load('rolesSemanal');
        await DB_FIREBASE.load('configuracionGlobal');
        await DB_FIREBASE.load('servicios');
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');
        await DB_FIREBASE.load('semanas');

        const btnCambiarFoto = document.getElementById('btnCambiarFoto');
        const inputFotoPerfil = document.getElementById('inputFotoPerfil');

        if (btnCambiarFoto && inputFotoPerfil) {
            btnCambiarFoto.addEventListener('click', (e) => { 
                e.preventDefault(); 
                e.stopPropagation();
                inputFotoPerfil.click(); 
            });
            inputFotoPerfil.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 5 * 1024 * 1024) { App.showToast('La imagen es muy grande. Máximo 5MB'); return; }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        DB.set('imagenPerfil', ev.target.result);
                        const imgExistente = document.querySelector('.hero-avatar-img');
                        if (imgExistente) {
                            imgExistente.src = ev.target.result;
                        } else {
                            const ring = document.querySelector('.hero-avatar-ring');
                            if (ring) {
                                ring.innerHTML = `<img src="${ev.target.result}" alt="Perfil" class="hero-avatar-img">`;
                            }
                        }
                        // ✅ Actualizar el fondo de la tarjeta también
                        const bgDiv = document.querySelector('.hero-bg-blur');
                        if (bgDiv) {
                            bgDiv.style.backgroundImage = `url('${ev.target.result}')`;
                            bgDiv.style.background = 'none';
                        }
                        App.showToast('Foto de perfil actualizada');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        const btnModoLaboral = document.getElementById('btnModoLaboral');
        const btnModoDomingo = document.getElementById('btnModoDomingo');
        const hoyStr = this.getFechaLocal(new Date());
        const recargarHome = () => setTimeout(() => window.location.reload(), 300);

        if (btnModoLaboral) btnModoLaboral.addEventListener('click', () => { DB.set('modoDiaForzado', 'laboral'); DB.set('fechaModoForzado', hoyStr); App.showToast('📅 Modo: Laboral'); recargarHome(); });
        if (btnModoDomingo) btnModoDomingo.addEventListener('click', () => { DB.set('modoDiaForzado', 'domingo'); DB.set('fechaModoForzado', hoyStr); App.showToast('🌙 Modo: Domingo/Festivo'); recargarHome(); });

        const btnAtraso = document.getElementById('btnAgregarAtrasoHome');
        if (btnAtraso) {
            btnAtraso.addEventListener('click', () => {
                if (this.infoServicio && this.infoServicio.servicio) {
                    this.agregarAtraso(this.infoServicio.servicio);
                } else {
                    App.showToast('⚠️ No hay servicio disponible para agregar atraso');
                }
            });
        }

        if (this.infoServicio && this.infoServicio.servicio) {
            this.iniciarReloj(this.infoServicio.servicio);
        }

        const btnVerAvisos = document.getElementById('btnVerAvisos');
        if (btnVerAvisos) btnVerAvisos.addEventListener('click', () => { if (typeof Views !== 'undefined' && Views.load) Views.load('avisos', true); });

        if (typeof CicloTracking !== 'undefined') {
            console.log('🛰️ [Home] Iniciando CicloTracking...');
            setTimeout(() => CicloTracking.init(), 800);
        }
    },

    onLeave() {
        if (this.relojInterval) {
            clearInterval(this.relojInterval);
            this.relojInterval = null;
        }
        if (typeof CicloTracking !== 'undefined') {
            CicloTracking.destroy();
        }
        this.minutosAtraso = 0;
        return Promise.resolve(true);
    },

    iniciarReloj(servicio) {
        if (this.relojInterval) clearInterval(this.relojInterval);
        const MINUTOS_TOLERANCIA = 85;
        
        const actualizarReloj = () => {
            const ahora = new Date();
            const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes();
            const segundosActuales = ahora.getSeconds();
            const [hInicio, mInicio] = (servicio.descansoInicio || '00:00').split(':').map(Number);
            const [hFinal, mFinal] = (servicio.descansoFinal || '00:00').split(':').map(Number);
            const minutosInicio = hInicio * 60 + mInicio;
            const minutosFinal = hFinal * 60 + mFinal;
            const minutosAtraso = this.minutosAtraso || 0;
            const minutosFinalAjustado = minutosFinal + minutosAtraso;
            const minutosLimite = minutosFinalAjustado + MINUTOS_TOLERANCIA;

            const relojTiempo = document.getElementById('hsdRelojTiempo');
            const relojEtiqueta = document.getElementById('hsdRelojEtiqueta');
            if (!relojTiempo || !relojEtiqueta) return;

            if (horaActualMinutos < minutosInicio) {
                const diffMinutos = minutosInicio - horaActualMinutos;
                const diffSegundos = 60 - segundosActuales;
                
                if (diffMinutos <= 10) {
                    const minutosRestantes = diffMinutos - 1;
                    const segundosRestantes = diffSegundos;
                    
                    relojTiempo.textContent = `${String(minutosRestantes).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;
                    relojEtiqueta.textContent = ' Tu descanso inicia en...';
                    relojTiempo.style.color = '#FF9800';
                    
                    if (diffMinutos <= 1) {
                        relojTiempo.style.color = '#c62828';
                        relojEtiqueta.textContent = ' ¡Tu descanso está por iniciar!';
                    }
                } else {
                    relojTiempo.textContent = `${String(diffMinutos).padStart(2, '0')}:${String(diffSegundos).padStart(2, '0')}`;
                    relojEtiqueta.textContent = '⏳ Esperando inicio de descanso';
                    relojTiempo.style.color = 'var(--night-blue, var(--primary))';
                }
            } else if (horaActualMinutos >= minutosInicio && horaActualMinutos < minutosFinalAjustado) {
                const diff = minutosFinalAjustado - horaActualMinutos;
                relojTiempo.textContent = `${String(Math.floor(diff / 60)).padStart(2, '0')}:${String(diff % 60).padStart(2, '0')}:${String(60 - segundosActuales).padStart(2, '0')}`;
                relojEtiqueta.textContent = minutosAtraso > 0 ? `🍽️ Tiempo restante (+${minutosAtraso} min)` : '️ Tiempo restante de descanso';
                relojTiempo.style.color = 'var(--night-blue, var(--primary))';
            } else if (horaActualMinutos >= minutosFinalAjustado && horaActualMinutos < minutosLimite) {
                const diff = horaActualMinutos - minutosFinalAjustado;
                relojTiempo.textContent = `${String(Math.floor(diff / 60)).padStart(2, '0')}:${String(diff % 60).padStart(2, '0')}:${String(segundosActuales).padStart(2, '0')}`;
                relojEtiqueta.textContent = '⏱️ Tiempo de atraso en línea'; 
                relojTiempo.style.color = '#FF9800';
            } else {
                relojTiempo.textContent = '01:25:00'; 
                relojEtiqueta.textContent = 'Tiempo máximo de atraso alcanzado'; 
                relojTiempo.style.color = '#c62828';
            }
        };
        actualizarReloj();
        this.relojInterval = setInterval(actualizarReloj, 1000);
    },

    agregarAtraso(servicio) {
        const minutos = prompt('¿Cuántos minutos de atraso deseas agregar al tiempo de alimentos?');
        if (minutos === null) return;
        const minutosNum = parseInt(minutos);
        if (isNaN(minutosNum) || minutosNum <= 0) { App.showToast('Ingresa un número válido'); return; }
        this.minutosAtraso = (this.minutosAtraso || 0) + minutosNum;
        App.showToast(`⏱️ +${minutosNum} min agregados al descanso`);
        this.iniciarReloj(servicio);
    }
};

export default Home;