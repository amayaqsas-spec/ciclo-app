// ============================================
// HOME.JS - Dashboard con Carga Completa de Datos
// ============================================

const Home = {
    relojInterval: null,
    minutosAtraso: 0,

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

        const normalizar = (texto) => texto.toLowerCase().replace(/\s/g, '').replace(/í/g, 'i');

        const tipoDiaConfig = semanas.find(s => {
            const tipoNorm = normalizar(s.tipo);
            const actualNorm = normalizar(tipoDia);
            return tipoNorm === actualNorm && s.lineaId === userLineaId;
        });

        if (!tipoDiaConfig) return null;

        const servicio = servicios.find(s => {
            const nombreServicio = String(s.nombre).trim();
            const posicionNorm = String(numeroServicio).trim();
            return nombreServicio === posicionNorm &&
                   s.lineaId === userLineaId &&
                   s.semanaId === tipoDiaConfig.id;
        });

        if (servicio) {
            return {
                servicio,
                linea: lineas.find(l => l.id === servicio.lineaId),
                terminal: terminales.find(t => t.id === servicio.terminalId),
                semana: tipoDiaConfig
            };
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
        let infoServicio = null;
        let errorMensaje = null;
        let esReservaHoy = false;
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaNombreReal = diasSemana[new Date().getDay()];
        const hoy = new Date();

        const configGlobal = DB.load('configuracionGlobal');
        const semanaActualConfig = configGlobal.find(c => c.tipo === 'semanaActual');

        if (semanaActualConfig && semanaActualConfig.lineaId === userLineaId) {
            semanaActualNum = semanaActualConfig.numero;
        }

        console.log('🏠 Home - userNumeroRol:', userNumeroRol, 'tipo:', typeof userNumeroRol);
        console.log('🏠 Home - rolesSemanal:', rolesSemanal.length, 'registros');
        console.log('🏠 Home - servicios:', DB.load('servicios').length, 'registros');
        console.log('🏠 Home - semanas:', DB.load('semanas').length, 'registros');

        if (userNumeroRol && rolesSemanal.length > 0) {
            const miRol = rolesSemanal.find(r => String(r.numeroRol) === String(userNumeroRol) && r.lineaId === userLineaId);

            if (miRol) {
                const semanaData = miRol.semanas.find(s => s.numero === semanaActualNum);
                if (semanaData && semanaData.dias && semanaData.dias[diaNombreReal]) {
                    posicionHoy = semanaData.dias[diaNombreReal].posicion || 'N/A';
                }

                console.log(' Home - posición hoy:', posicionHoy);
                console.log('🏠 Home - tipo de día:', tipoDiaActual);

                esReservaHoy = this.esReserva(posicionHoy);

                if (posicionHoy !== 'N/A') {
                    if (esReservaHoy) {
                        errorMensaje = `No hay servicios fijos para este tipo de reservas. Hoy tienes asignada la reserva "${posicionHoy}".`;
                    } else {
                        infoServicio = this.buscarServicioPorTipo(tipoDiaActual, posicionHoy, userLineaId);

                        console.log('🏠 Home - servicio encontrado:', infoServicio ? 'SÍ' : 'NO');

                        if (!infoServicio) {
                            errorMensaje = `No se encontró servicio "${posicionHoy}" para tipo de día "${tipoDiaActual}". Verifica en Registro → Servicios.`;
                        }
                    }
                } else {
                    errorMensaje = `No hay posición asignada para hoy (${diaNombreReal}) en la Semana ${semanaActualNum}.`;
                }
            } else {
                errorMensaje = `No se encontró el Rol #${userNumeroRol} para tu línea. Verifica con tu administrador.`;
            }
        } else {
            errorMensaje = 'Tu perfil no está completamente configurado.';
        }

        const tiempoExtraPendiente = DB.load('tiempoExtra').filter(t => !t.cobrado);
        const diaSemana = new Date().getDay();
        const mostrarBotones = posicionHoy !== 'N/A' && !esReservaHoy && !errorMensaje;
        const modoForzado = DB.get('modoDiaForzado', null);

        return `
            <div class="view active ske-home">
                <div class="ske-greeting-card">
                    <div class="ske-greeting-content">
                        <div class="ske-avatar-frame" id="welcomeIcon">
                            <div class="ske-avatar-inner">
                                ${imagenPerfil ?
                                    `<img src="${imagenPerfil}" alt="Perfil" class="ske-avatar-img">` :
                                    `<svg viewBox="0 0 24 24" class="ske-avatar-placeholder"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
                                }
                            </div>
                            <button class="ske-avatar-btn" id="btnCambiarFoto" title="Cambiar foto">
                                <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            </button>
                            <input type="file" id="inputFotoPerfil" accept="image/*" style="display:none;">
                        </div>

                        <div class="ske-greeting-text">
                            <h1 class="ske-greeting-title">¡Hola, ${name}!</h1>
                            <p class="ske-greeting-subtitle">${diaNombreReal} ${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}</p>

                            <div class="ske-badges-row" style="margin-top: 12px; justify-content: flex-end; gap: 8px;">
                                <span class="ske-chip ske-chip-soft" style="background: var(--primary); color: white;">
                                    📆 Semana ${semanaActualNum}
                                </span>
                                ${modoForzado ? `
                                    <span class="ske-chip" style="background: var(--accent); color: white; font-size: 11px;">
                                        🔄 Modo: ${tipoDiaActual}
                                    </span>
                                ` : ''}
                            </div>
                        </div>

                        ${avisosNoLeidos > 0 ? `
                            <button class="ske-fab-notification" id="btnVerAvisos">
                                <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                <span class="ske-fab-badge">${avisosNoLeidos}</span>
                            </button>
                        ` : ''}
                    </div>
                </div>

                ${mostrarBotones ? `
                    <div style="margin: 16px 0; padding: 16px; background: var(--surface); border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                        <div style="font-size: 12px; font-weight: 700; color: var(--text-soft); margin-bottom: 10px; text-transform: uppercase; text-align: center;">
                            🔄 Modo de visualización
                        </div>
                        <div style="display: flex; gap: 8px;">
                            ${diaSemana >= 1 && diaSemana <= 5 ? `
                                <button id="btnModoLaboral" style="flex:1; padding: 12px; border-radius: 8px; border: 2px solid ${modoForzado === null ? 'var(--primary)' : 'var(--bg-soft)'}; background: ${modoForzado === null ? 'var(--primary)' : 'var(--surface)'}; color: ${modoForzado === null ? 'white' : 'var(--text)'}; font-weight: 700; cursor: pointer; font-size: 14px;">
                                    📅 Laboral
                                </button>
                                <button id="btnModoDomingo" style="flex:1; padding: 12px; border-radius: 8px; border: 2px solid ${modoForzado === 'domingo' ? 'var(--accent)' : 'var(--bg-soft)'}; background: ${modoForzado === 'domingo' ? 'var(--accent)' : 'var(--surface)'}; color: ${modoForzado === 'domingo' ? 'white' : 'var(--text)'}; font-weight: 700; cursor: pointer; font-size: 14px;">
                                    🌙 Domingo/Festivo
                                </button>
                            ` : diaSemana === 6 ? `
                                <button id="btnModoNormal" style="flex:1; padding: 12px; border-radius: 8px; border: 2px solid ${modoForzado === null ? 'var(--primary)' : 'var(--bg-soft)'}; background: ${modoForzado === null ? 'var(--primary)' : 'var(--surface)'}; color: ${modoForzado === null ? 'white' : 'var(--text)'}; font-weight: 700; cursor: pointer; font-size: 14px;">
                                    📅 Sábado
                                </button>
                                <button id="btnModoDomingo" style="flex:1; padding: 12px; border-radius: 8px; border: 2px solid ${modoForzado === 'domingo' ? 'var(--accent)' : 'var(--bg-soft)'}; background: ${modoForzado === 'domingo' ? 'var(--accent)' : 'var(--surface)'}; color: ${modoForzado === 'domingo' ? 'white' : 'var(--text)'}; font-weight: 700; cursor: pointer; font-size: 14px;">
                                    🌙 Domingo/Festivo
                                </button>
                            ` : `
                                <button id="btnModoNormal" style="flex:1; padding: 12px; border-radius: 8px; border: 2px solid ${modoForzado === null ? 'var(--primary)' : 'var(--bg-soft)'}; background: ${modoForzado === null ? 'var(--primary)' : 'var(--surface)'}; color: ${modoForzado === null ? 'white' : 'var(--text)'}; font-weight: 700; cursor: pointer; font-size: 14px;">
                                    🌙 Domingo/Festivo
                                </button>
                                <button id="btnModoLaboral" style="flex:1; padding: 12px; border-radius: 8px; border: 2px solid ${modoForzado === 'laboral' ? 'var(--accent)' : 'var(--bg-soft)'}; background: ${modoForzado === 'laboral' ? 'var(--accent)' : 'var(--surface)'}; color: ${modoForzado === 'laboral' ? 'white' : 'var(--text)'}; font-weight: 700; cursor: pointer; font-size: 14px;">
                                    📅 Laboral
                                </button>
                            `}
                        </div>
                    </div>
                ` : ''}

                <div id="skeServicioDiaContainer">
                    ${errorMensaje ? `
                        <div style="text-align: center; padding: 40px 20px; background: var(--surface); border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                            <div style="margin-bottom: 16px;">
                                ${esReservaHoy ? `
                                    <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; stroke: var(--accent); fill: none;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                ` : `
                                    <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; stroke: var(--text-soft); fill: none;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                `}
                            </div>
                            <h3 style="color: var(--text); margin-bottom: 8px;">
                                ${esReservaHoy ? 'Reserva Asignada' : 'Información no disponible'}
                            </h3>
                            <p style="color: var(--text-soft); font-size: 14px;">${errorMensaje}</p>
                            ${!esReservaHoy ? `
                                <p style="color: var(--text-soft); font-size: 13px; margin-top: 12px;">
                                    <strong>Datos actuales:</strong><br>
                                    Línea: ${miLinea ? miLinea.nombre : 'N/A'}<br>
                                    Terminal: ${miTerminal ? miTerminal.nombre : 'N/A'}<br>
                                    Rol: ${userNumeroRol || 'N/A'}<br>
                                    Semana: ${semanaActualNum}<br>
                                    Posición: ${posicionHoy}<br>
                                    Tipo de día: ${tipoDiaActual}
                                </p>
                            ` : ''}
                        </div>
                    ` : infoServicio ? this.renderServicioDia(infoServicio, tipoDiaActual, posicionHoy) : `
                        <div style="text-align: center; padding: 40px 20px; background: var(--surface); border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                            <h3>Sin servicio asignado</h3>
                            <p style="color: var(--text-soft);">No hay servicio registrado para tu posición hoy.</p>
                        </div>
                    `}
                </div>

                ${tiempoExtraPendiente.length > 0 ? `
                    <div style="margin-top: 20px; background: var(--surface); padding: 16px; border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                            <div style="background: #FF9800; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <svg viewBox="0 0 24 24" style="width: 18px; height: 18px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            </div>
                            <h2 style="margin: 0; font-size: 16px; color: var(--text);">Tiempo Extra por Cobrar</h2>
                            <span style="background: #FF9800; color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">${tiempoExtraPendiente.length}</span>
                        </div>
                        ${tiempoExtraPendiente.map(item => `
                            <div style="background: var(--bg-soft); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
                                <div style="font-weight: 700; color: var(--text);">${item.tipo}</div>
                                <div style="font-size: 12px; color: var(--text-soft);">${item.nota || 'Sin nota'} • ${item.fecha}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    renderServicioDia(info, tipoDia, posicion) {
        if (!info || !info.servicio) {
            return `<div style="padding: 20px; text-align: center;">No hay información del servicio disponible.</div>`;
        }

        const { servicio, linea, terminal } = info;
        const trenes = (servicio && servicio.trenes) || [];
        const haceGarage = servicio.garage === true || servicio.garage === 'Si' || servicio.garage === 'Sí';

        return `
            <div style="background: var(--surface); padding: 20px; border-radius: 12px; box-shadow: var(--clay-shadow-sm); margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid var(--bg-soft);">
                    <div>
                        <div style="font-size: 11px; color: var(--text-soft); text-transform: uppercase;">Servicio del Día</div>
                        <div style="font-size: 28px; font-weight: 800; color: var(--primary);">Servicio ${servicio.nombre}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 11px; color: var(--text-soft);">Tipo de día</div>
                        <div style="background: var(--primary); color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">${tipoDia}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
                    <div style="background: var(--bg-soft); padding: 10px; border-radius: 8px;">
                        <div style="font-size: 10px; color: var(--text-soft);">Línea</div>
                        <div style="font-size: 14px; font-weight: 700;">${linea ? linea.nombre : 'N/A'}</div>
                    </div>
                    <div style="background: var(--bg-soft); padding: 10px; border-radius: 8px;">
                        <div style="font-size: 10px; color: var(--text-soft);">Terminal</div>
                        <div style="font-size: 14px; font-weight: 700;">${terminal ? terminal.nombre : 'N/A'}</div>
                    </div>
                </div>

                ${haceGarage ? `
                    <div style="background: #e8f5e9; color: #2e7d32; padding: 10px; border-radius: 8px; font-weight: 700; font-size: 13px; text-align: center; margin-bottom: 16px;">
                        ✅ Hace Garage
                    </div>
                ` : ''}

                <div style="margin-bottom: 16px;">
                    <div style="font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 10px; text-transform: uppercase;">
                        🚂 Trenes (${trenes.length})
                    </div>
                    ${trenes.map((tren, idx) => {
                        const numTren = tren.numero || (idx + 1);
                        const labelTren = idx === 0 ? 'Primer Tren' : idx === 1 ? 'Segundo Tren' : `Tren #${numTren}`;
                        return `
                            <div style="background: var(--bg-soft); padding: 12px; border-radius: 10px; margin-bottom: 8px; border-left: 4px solid var(--primary);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <span style="font-weight: 700; color: var(--primary); font-size: 14px;">${labelTren} #${numTren}</span>
                                    ${tren.garage ? '<span style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700;">GARAGE</span>' : ''}
                                </div>
                                <div style="display: grid; grid-template-columns: ${tren.vueltas ? '1fr 1fr 1fr' : '1fr 1fr'}; gap: 8px;">
                                    <div style="text-align: center; background: var(--surface); padding: 8px; border-radius: 6px;">
                                        <div style="font-size: 10px; color: var(--text-soft);">Salida</div>
                                        <div style="font-size: 16px; font-weight: 800; color: var(--text);">${tren.salida || '--:--'}</div>
                                    </div>
                                    <div style="text-align: center; background: var(--surface); padding: 8px; border-radius: 6px;">
                                        <div style="font-size: 10px; color: var(--text-soft);">Llegada</div>
                                        <div style="font-size: 16px; font-weight: 800; color: var(--text);">${tren.llegada || '--:--'}</div>
                                    </div>
                                    ${tren.vueltas ? `
                                        <div style="text-align: center; background: var(--surface); padding: 8px; border-radius: 6px;">
                                            <div style="font-size: 10px; color: var(--text-soft);">Vueltas</div>
                                            <div style="font-size: 16px; font-weight: 800; color: var(--text);">${tren.vueltas}</div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="background: var(--bg-soft); padding: 16px; border-radius: 12px; border: 2px solid var(--bg-soft);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                        <div style="background: var(--accent); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <svg viewBox="0 0 24 24" style="width: 18px; height: 18px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <span style="font-size: 15px; font-weight: 700; color: var(--text);">Tiempo de Descanso</span>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-around; background: var(--surface); padding: 14px; border-radius: 10px; margin-bottom: 16px;">
                        <div style="text-align: center;">
                            <div style="font-size: 10px; color: var(--text-soft);">Inicio</div>
                            <div style="font-size: 20px; font-weight: 800; color: var(--text);">${servicio.descansoInicio || '--:--'}</div>
                        </div>
                        <div style="font-size: 24px; color: var(--text-soft);">→</div>
                        <div style="text-align: center;">
                            <div style="font-size: 10px; color: var(--text-soft);">Final</div>
                            <div style="font-size: 20px; font-weight: 800; color: var(--text);">${servicio.descansoFinal || '--:--'}</div>
                        </div>
                    </div>

                    <div id="hsdRelojContainer" style="text-align: center; margin-bottom: 12px; padding: 20px; background: var(--surface); border-radius: 10px; border: 2px solid var(--bg-soft);">
                        <div id="hsdRelojTiempo" style="font-size: 42px; font-weight: 800; color: var(--primary); font-variant-numeric: tabular-nums; letter-spacing: 2px;">--:--:--</div>
                        <div id="hsdRelojEtiqueta" style="font-size: 13px; color: var(--text-soft); margin-top: 8px; font-weight: 600;">Calculando...</div>
                        <div id="hsdRelojMensaje" style="font-size: 12px; color: var(--accent); margin-top: 8px; font-style: italic; display: none;"></div>
                    </div>

                    <div id="badgeAtraso" style="display: none; text-align: center; margin-bottom: 12px; padding: 8px; background: #ffebee; color: #c62828; border-radius: 8px; font-weight: 700; font-size: 13px;"></div>

                    <button id="btnAgregarAtrasoHome" style="width: 100%; padding: 14px; background: #FF9800; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);">
                        ️ Agregar Atraso en Línea
                    </button>
                </div>
            </div>
        `;
    },

    async init() {
        this.minutosAtraso = 0;

        // ✅ CARGAR TODOS LOS DATOS NECESARIOS DESDE FIREBASE
        console.log('🏠 Home - Iniciando carga de datos...');
        await DB_FIREBASE.load('rolesSemanal');
        await DB_FIREBASE.load('configuracionGlobal');
        await DB_FIREBASE.load('servicios');
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');
        await DB_FIREBASE.load('semanas');
        
        console.log('🏠 Home - rolesSemanal cargado:', DB.load('rolesSemanal').length);
        console.log(' Home - configuracionGlobal cargada');
        console.log('🏠 Home - servicios cargados:', DB.load('servicios').length);
        console.log('🏠 Home - líneas cargadas:', DB.load('lineas').length);
        console.log('🏠 Home - terminales cargadas:', DB.load('terminales').length);
        console.log('🏠 Home - semanas cargadas:', DB.load('semanas').length);

        const perfilConfigurado = DB.get('perfilConfigurado', false);
        const bienvenidaVista = DB.get('bienvenidaVista', false);

        if (!perfilConfigurado && !bienvenidaVista) {
            this.mostrarModalBienvenida();
        }

        const btnCambiarFoto = document.getElementById('btnCambiarFoto');
        const inputFotoPerfil = document.getElementById('inputFotoPerfil');
        const welcomeIcon = document.getElementById('welcomeIcon');

        if (btnCambiarFoto && inputFotoPerfil) {
            btnCambiarFoto.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                inputFotoPerfil.click();
            });

            inputFotoPerfil.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                        App.showToast('La imagen es muy grande. Máximo 5MB');
                        return;
                    }
                    try {
                        App.showToast('Procesando imagen...');
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            DB.set('imagenPerfil', ev.target.result);
                            const imgExistente = welcomeIcon.querySelector('.ske-avatar-img');
                            if (imgExistente) {
                                imgExistente.src = ev.target.result;
                            } else {
                                welcomeIcon.querySelector('.ske-avatar-inner').innerHTML = `<img src="${ev.target.result}" alt="Perfil" class="ske-avatar-img">`;
                            }
                            App.showToast('Foto de perfil actualizada');
                        };
                        reader.readAsDataURL(file);
                    } catch (error) {
                        App.showToast('Error al procesar la imagen');
                    }
                }
            });
        }

        const btnModoLaboral = document.getElementById('btnModoLaboral');
        const btnModoDomingo = document.getElementById('btnModoDomingo');
        const btnModoNormal = document.getElementById('btnModoNormal');

        const hoyStr = this.getFechaLocal(new Date());
        const recargarHome = () => setTimeout(() => window.location.reload(), 300);

        if (btnModoLaboral) {
            btnModoLaboral.addEventListener('click', () => {
                DB.set('modoDiaForzado', 'laboral');
                DB.set('fechaModoForzado', hoyStr);
                App.showToast(' Modo: Laboral (hasta mañana)');
                recargarHome();
            });
        }

        if (btnModoDomingo) {
            btnModoDomingo.addEventListener('click', () => {
                DB.set('modoDiaForzado', 'domingo');
                DB.set('fechaModoForzado', hoyStr);
                App.showToast('🌙 Modo: Domingo/Festivo (hasta mañana)');
                recargarHome();
            });
        }

        if (btnModoNormal) {
            btnModoNormal.addEventListener('click', () => {
                DB.remove('modoDiaForzado');
                DB.remove('fechaModoForzado');
                App.showToast(' Modo: Automático');
                recargarHome();
            });
        }

        const btnAtraso = document.getElementById('btnAgregarAtrasoHome');
        if (btnAtraso) {
            const userNumeroRol = DB.get('userNumeroRol');
            const userLineaId = DB.get('userLineaId');
            const rolesSemanal = DB.load('rolesSemanal');
            const miRol = rolesSemanal.find(r => String(r.numeroRol) === String(userNumeroRol) && r.lineaId === userLineaId);

            if (miRol) {
                const configGlobal = DB.load('configuracionGlobal');
                const semanaActualConfig = configGlobal.find(c => c.tipo === 'semanaActual');
                const semanaActualNum = (semanaActualConfig && semanaActualConfig.lineaId === userLineaId) ? semanaActualConfig.numero : 1;

                const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                const diaNombre = diasSemana[new Date().getDay()];
                const semanaData = miRol.semanas.find(s => s.numero === semanaActualNum);
                const posicionHoy = semanaData && semanaData.dias && semanaData.dias[diaNombre] ? semanaData.dias[diaNombre].posicion : null;

                if (posicionHoy && !this.esReserva(posicionHoy)) {
                    const tipoDiaActual = this.getTipoDiaActual();
                    const servicioInfo = this.buscarServicioPorTipo(tipoDiaActual, posicionHoy, userLineaId);

                    if (servicioInfo && servicioInfo.servicio) {
                        this.iniciarReloj(servicioInfo.servicio);
                        btnAtraso.addEventListener('click', () => this.agregarAtraso(servicioInfo.servicio));
                    }
                }
            }
        }

        const btnVerAvisos = document.getElementById('btnVerAvisos');
        if (btnVerAvisos) {
            btnVerAvisos.addEventListener('click', () => {
                if (typeof Views !== 'undefined' && Views.load) {
                    Views.load('avisos', true);
                }
            });
        }
    },

    // ✅ MODAL DE BIENVENIDA CON CAMBIOS SOLICITADOS
    mostrarModalBienvenida() {
        const modalHTML = `
            <div style="background: var(--surface); padding: 32px 24px; border-radius: 20px; max-width: 90%; width: 420px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="margin-bottom: 20px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; box-shadow: 0 8px 24px rgba(155, 127, 212, 0.4);">
                        <svg viewBox="0 0 24 24" style="width: 40px; height: 40px; fill: white;">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <h2 style="margin: 0 0 8px 0; font-size: 28px; color: var(--primary); font-weight: 800;">¡Bienvenido a CICLO!</h2>
                    <p style="font-size: 15px; color: var(--text); margin: 0; line-height: 1.5;">
                        Gracias por usar nuestra aplicación de gestión inteligente.
                    </p>
                </div>

                <div style="background: var(--bg-soft); padding: 16px; border-radius: 12px; margin: 20px 0; border-left: 4px solid var(--primary);">
                    <p style="font-size: 14px; color: var(--text); margin: 0; line-height: 1.6; text-align: left;">
                        <strong>⚠️ Paso importante:</strong><br>
                        Para que la app funcione correctamente y puedas ver tus horarios, trenes y descansos, necesitas registrar tu <strong>Número de Rol</strong>.
                        <br><br>
                        <strong>¿Cómo hacerlo?</strong><br>
                        1. Abre el <strong>menú lateral</strong> (☰)<br>
                        2. Entra al módulo <strong>"Mi Rol"</strong><br>
                        3. Toca el botón <strong>"Nuevo"</strong><br>
                        4. Selecciona tu Línea, Terminal e ingresa tu Número de Rol
                    </p>
                </div>

                <button id="btnEntendidoBienvenida" style="width: 100%; padding: 14px; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 16px rgba(155, 127, 212, 0.4); transition: all 0.3s ease;">
                    Entendido, ir a Mi Rol
                </button>
            </div>
        `;

        const overlay = App.showModal(modalHTML);

        document.getElementById('btnEntendidoBienvenida').addEventListener('click', () => {
            overlay.remove();
            DB.set('bienvenidaVista', true);
            
            setTimeout(() => {
                Views.load('mi-rol', true);
                App.toggleMenu();
            }, 300);
        });
    },

    onLeave() {
        if (this.relojInterval) {
            clearInterval(this.relojInterval);
            this.relojInterval = null;
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
            const relojMensaje = document.getElementById('hsdRelojMensaje');
            const badgeAtraso = document.getElementById('badgeAtraso');

            if (!relojTiempo || !relojEtiqueta) return;

            if (minutosAtraso > 0 && badgeAtraso) {
                badgeAtraso.style.display = 'block';
                badgeAtraso.textContent = `️ +${minutosAtraso} minutos de atraso agregados`;
            }

            if (horaActualMinutos < minutosInicio) {
                const diff = minutosInicio - horaActualMinutos;
                const horas = Math.floor(diff / 60);
                const mins = diff % 60;
                const segs = 60 - segundosActuales;
                relojTiempo.textContent = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
                relojEtiqueta.textContent = '⏳ Tiempo para iniciar descanso';
                relojTiempo.style.color = 'var(--primary)';
                if (relojMensaje) relojMensaje.style.display = 'none';
            } else if (horaActualMinutos >= minutosInicio && horaActualMinutos < minutosFinalAjustado) {
                const diff = minutosFinalAjustado - horaActualMinutos;
                const horas = Math.floor(diff / 60);
                const mins = diff % 60;
                const segs = 60 - segundosActuales;
                relojTiempo.textContent = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
                relojEtiqueta.textContent = minutosAtraso > 0
                    ? `🍽️ Tiempo restante de descanso (+${minutosAtraso} min)`
                    : '🍽️ Tiempo restante de descanso';
                relojTiempo.style.color = 'var(--primary)';
                if (relojMensaje) relojMensaje.style.display = 'none';
            } else if (horaActualMinutos >= minutosFinalAjustado && horaActualMinutos < minutosLimite) {
                const diff = minutosLimite - horaActualMinutos;
                const horas = Math.floor(diff / 60);
                const mins = diff % 60;
                const segs = 60 - segundosActuales;
                relojTiempo.textContent = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
                relojEtiqueta.textContent = '⏰ Tiempo de tolerancia restante';
                relojTiempo.style.color = '#FF9800';
                if (relojMensaje) {
                    relojMensaje.style.display = 'block';
                    relojMensaje.textContent = '️ A partir de este momento, si no ha llegado tu tren, es el tiempo de atraso que hay';
                    relojMensaje.style.color = '#FF9800';
                }
            } else {
                relojTiempo.textContent = '00:00:00';
                relojEtiqueta.textContent = 'Tiempo finalizado';
                relojTiempo.style.color = '#c62828';
                if (relojMensaje) {
                    relojMensaje.style.display = 'block';
                    relojMensaje.textContent = '⚠️ A partir de este momento, si no ha llegado tu tren, es el tiempo de atraso que hay';
                    relojMensaje.style.color = '#c62828';
                }
            }
        };

        actualizarReloj();
        this.relojInterval = setInterval(actualizarReloj, 1000);
    },

    agregarAtraso(servicio) {
        const minutos = prompt('¿Cuántos minutos de atraso en línea deseas agregar?');

        if (minutos === null) return;

        const minutosNum = parseInt(minutos);

        if (isNaN(minutosNum) || minutosNum <= 0) {
            App.showToast('Ingresa un número válido de minutos');
            return;
        }

        this.minutosAtraso = (this.minutosAtraso || 0) + minutosNum;

        App.showToast(`⏱️ +${minutosNum} min de atraso agregados al descanso`);

        this.iniciarReloj(servicio);
    }
};

export default Home;