// ============================================
// HOME.JS - Dashboard con Descanso entre Trenes
// ============================================

const Home = {
    relojInterval: null,
    minutosAtraso: 0,
    infoServicio: null,
    tiempoExtraActivo: false,
    servicioTiempoExtra: null,

    FECHA_INICIO_CICLO: new Date(2026, 9, 11),
    TOTAL_SEMANAS_CICLO: 5,

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

    calcularSemanaActual() {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const fechaInicio = new Date(this.FECHA_INICIO_CICLO);
        fechaInicio.setHours(0, 0, 0, 0);

        const diferenciaDias = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24));
        
        console.log(' [Home] Cálculo de semana:');
        console.log('  Fecha inicio:', fechaInicio.toISOString().split('T')[0]);
        console.log('  Hoy:', hoy.toISOString().split('T')[0]);
        console.log('  Días transcurridos:', diferenciaDias);

        if (diferenciaDias < 0) {
            return 1;
        }

        const semanasTranscurridas = Math.floor(diferenciaDias / 7);
        const semanaActual = (semanasTranscurridas % this.TOTAL_SEMANAS_CICLO) + 1;

        return semanaActual;
    },

    // ✅ NUEVA FUNCIÓN: Convertir hora "HH:MM" a minutos desde medianoche
    horaAMinutos(horaStr) {
        if (!horaStr || horaStr === '--:--') return -1;
        const [h, m] = horaStr.split(':').map(Number);
        return h * 60 + m;
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

    async cargarTiempoExtra() {
        const tipoDia = this.getTipoDiaActual();
        const userLineaId = DB.get('userLineaId');
        
        const numeroServicio = prompt(`¿Qué servicio de tipo "${tipoDia}" vas a trabajar?\n\nIngresa el número de servicio:`);
        
        if (!numeroServicio || numeroServicio.trim() === '') {
            App.showToast('⚠️ Debes ingresar un número de servicio');
            return;
        }

        const infoServicio = this.buscarServicioPorTipo(tipoDia, numeroServicio.trim(), userLineaId);
        
        if (!infoServicio) {
            App.showToast(`❌ No se encontró el servicio "${numeroServicio}" para tipo de día "${tipoDia}"`);
            return;
        }

        this.tiempoExtraActivo = true;
        this.servicioTiempoExtra = infoServicio;
        DB.set('tiempoExtraActivo', true);
        DB.set('servicioTiempoExtra', {
            servicioId: infoServicio.servicio.nombre,
            tipoDia: tipoDia
        });

        App.showToast(`✅ Tiempo Extra activado: Servicio ${numeroServicio}`);
        
        if (typeof Views !== 'undefined' && Views.load) {
            Views.load('home', false);
        } else {
            window.location.reload();
        }
    },

    cancelarTiempoExtra() {
        this.tiempoExtraActivo = false;
        this.servicioTiempoExtra = null;
        DB.remove('tiempoExtraActivo');
        DB.remove('servicioTiempoExtra');
        
        App.showToast('❌ Tiempo Extra cancelado');
        
        if (typeof Views !== 'undefined' && Views.load) {
            Views.load('home', false);
        } else {
            window.location.reload();
        }
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

        const semanaActualNum = this.calcularSemanaActual();
        
        let posicionHoy = 'N/A';
        let tipoDiaActual = this.getTipoDiaActual();
        let errorMensaje = null;
        let esReservaHoy = false;
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaNombreReal = diasSemana[new Date().getDay()];
        const hoy = new Date();

        this.infoServicio = null;

        const tiempoExtraGuardado = DB.get('tiempoExtraActivo', false);
        const servicioExtraGuardado = DB.get('servicioTiempoExtra', null);
        
        if (tiempoExtraGuardado && servicioExtraGuardado) {
            this.tiempoExtraActivo = true;
            this.servicioTiempoExtra = this.buscarServicioPorTipo(
                servicioExtraGuardado.tipoDia,
                servicioExtraGuardado.servicioId,
                userLineaId
            );
        }

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
        const mostrarBotonesModo = userNumeroRol && rolesSemanal.length > 0 && posicionHoy !== 'N/A' && !esReservaHoy;
        const modoForzado = DB.get('modoDiaForzado', null);

        const laboralActivo = modoForzado === null || modoForzado === 'laboral';
        const domingoActivo = modoForzado === 'domingo';

        const servicioAMostrar = this.tiempoExtraActivo ? this.servicioTiempoExtra : this.infoServicio;
        const errorAMostrar = this.tiempoExtraActivo ? null : errorMensaje;

        return `
            <div class="view active ske-home">
                <div class="ske-greeting-card">
                    <div class="ske-greeting-content">
                        <div class="ske-avatar-frame" id="welcomeIcon">
                            <div class="ske-avatar-inner">
                                ${imagenPerfil ? `<img src="${imagenPerfil}" alt="Perfil" class="ske-avatar-img">` : `<svg viewBox="0 0 24 24" class="ske-avatar-placeholder"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`}
                            </div>
                            <button class="ske-avatar-btn" id="btnCambiarFoto"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></button>
                            <input type="file" id="inputFotoPerfil" accept="image/*" style="display:none;">
                        </div>
                        <div class="ske-greeting-text">
                            <h1 class="ske-greeting-title">¡Hola, ${name}!</h1>
                            <p class="ske-greeting-subtitle">${diaNombreReal} ${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}</p>
                            <div class="ske-badges-row" style="margin-top: 12px; justify-content: flex-end; gap: 8px;">
                                <span class="ske-chip ske-chip-soft" style="background: var(--primary); color: white;">📆 Semana ${semanaActualNum}</span>
                                ${modoForzado ? `<span class="ske-chip" style="background: var(--accent); color: white; font-size: 11px;">🔄 Modo: ${tipoDiaActual}</span>` : ''}
                                ${this.tiempoExtraActivo ? `<span class="ske-chip" style="background: #FF9800; color: white; font-size: 11px;">️ Tiempo Extra</span>` : ''}
                            </div>
                        </div>
                        ${avisosNoLeidos > 0 ? `<button class="ske-fab-notification" id="btnVerAvisos"><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span class="ske-fab-badge">${avisosNoLeidos}</span></button>` : ''}
                    </div>
                </div>

                ${mostrarBotonesModo ? `
                    <div style="margin: 16px 0; padding: 16px; background: var(--surface); border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                        <div style="font-size: 12px; font-weight: 700; color: var(--text-soft); margin-bottom: 10px; text-transform: uppercase; text-align: center;">🔄 Modo de visualización</div>
                        <div style="display: flex; gap: 8px;">
                            <button id="btnModoLaboral" style="flex:1; padding: 12px; border-radius: 8px; border: 2px solid ${laboralActivo ? 'var(--primary)' : 'var(--bg-soft)'}; background: ${laboralActivo ? 'var(--primary)' : 'var(--surface)'}; color: ${laboralActivo ? 'white' : 'var(--text)'}; font-weight: 700; cursor: pointer; font-size: 14px;">📅 Laboral</button>
                            <button id="btnModoDomingo" style="flex:1; padding: 12px; border-radius: 8px; border: 2px solid ${domingoActivo ? 'var(--accent)' : 'var(--bg-soft)'}; background: ${domingoActivo ? 'var(--accent)' : 'var(--surface)'}; color: ${domingoActivo ? 'white' : 'var(--text)'}; font-weight: 700; cursor: pointer; font-size: 14px;">🌙 Domingo/Festivo</button>
                        </div>
                    </div>
                ` : ''}

                <div style="margin: 16px 0; padding: 16px; background: var(--surface); border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                    <div style="font-size: 12px; font-weight: 700; color: var(--text-soft); margin-bottom: 10px; text-transform: uppercase; text-align: center;">⏱️ Tiempo Extra</div>
                    ${this.tiempoExtraActivo ? `
                        <button id="btnCancelarTiempoExtra" style="width: 100%; padding: 12px; background: #c62828; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            ❌ Cancelar Tiempo Extra
                        </button>
                    ` : `
                        <button id="btnTiempoExtra" style="width: 100%; padding: 12px; background: #FF9800; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);">
                            ⏱️ Activar Tiempo Extra
                        </button>
                    `}
                </div>

                <div id="skeServicioDiaContainer">
                    ${errorAMostrar ? `
                        <div style="text-align: center; padding: 40px 20px; background: var(--surface); border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                            <h3 style="color: var(--text); margin-bottom: 8px;">Información no disponible</h3>
                            <p style="color: var(--text-soft); font-size: 14px;">${errorAMostrar}</p>
                        </div>
                    ` : servicioAMostrar ? this.renderServicioDia(servicioAMostrar, tipoDiaActual, posicionHoy) : `
                        <div style="text-align: center; padding: 40px 20px; background: var(--surface); border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                            <h3>Sin servicio asignado</h3>
                            <p style="color: var(--text-soft);">No hay servicio registrado para tu posición hoy.</p>
                        </div>
                    `}
                </div>

                ${tiempoExtraPendiente.length > 0 ? `
                    <div style="margin-top: 20px; background: var(--surface); padding: 16px; border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                            <div style="background: #FF9800; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><svg viewBox="0 0 24 24" style="width: 18px; height: 18px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                            <h2 style="margin: 0; font-size: 16px; color: var(--text);">Tiempo Extra por Cobrar</h2>
                            <span style="background: #FF9800; color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">${tiempoExtraPendiente.length}</span>
                        </div>
                        ${tiempoExtraPendiente.map(item => `<div style="background: var(--bg-soft); padding: 10px; border-radius: 8px; margin-bottom: 8px;"><div style="font-weight: 700; color: var(--text);">${item.tipo}</div><div style="font-size: 12px; color: var(--text-soft);">${item.nota || 'Sin nota'} • ${item.fecha}</div></div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    // ✅ FUNCIÓN MODIFICADA: Renderiza servicio con descanso intercalado entre trenes
    renderServicioDia(info, tipoDia, posicion) {
        const { servicio, linea, terminal } = info;
        const trenes = (servicio && servicio.trenes) || [];
        const haceGarage = servicio.garage === true || servicio.garage === 'Si' || servicio.garage === 'Sí';
        
        const descansoInicio = servicio.descansoInicio || '--:--';
        const descansoFinal = servicio.descansoFinal || '--:--';
        const descansoInicioMin = this.horaAMinutos(descansoInicio);
        const descansoFinalMin = this.horaAMinutos(descansoFinal);

        // ✅ Construir lista cronológica: trenes + descanso en su posición correcta
        const bloques = [];
        
        trenes.forEach((tren, idx) => {
            const numTren = tren.numero || (idx + 1);
            const labelTren = idx === 0 ? 'Primer Tren' : idx === 1 ? 'Segundo Tren' : `Tren #${numTren}`;
            const llegadaMin = this.horaAMinutos(tren.llegada);
            const salidaMin = this.horaAMinutos(tren.salida);
            
            bloques.push({
                tipo: 'tren',
                idx: idx,
                horaOrden: salidaMin,
                tren: tren,
                labelTren: labelTren,
                numTren: numTren
            });
            
            // ✅ Si el descanso está entre la llegada de este tren y la salida del siguiente, insertarlo
            if (descansoInicioMin >= 0 && descansoFinalMin >= 0) {
                const siguienteTren = trenes[idx + 1];
                const siguienteSalida = siguienteTren ? this.horaAMinutos(siguienteTren.salida) : 9999;
                
                // El descanso va después de este tren si:
                // - La hora de inicio del descanso >= hora de llegada de este tren
                // - Y la hora de inicio del descanso < hora de salida del siguiente tren
                if (descansoInicioMin >= llegadaMin && descansoInicioMin < siguienteSalida) {
                    bloques.push({
                        tipo: 'descanso',
                        horaOrden: descansoInicioMin
                    });
                }
            }
        });
        
        // ✅ Si el descanso no se insertó entre trenes (ej. después del último), agregarlo al final
        const yaInsertado = bloques.some(b => b.tipo === 'descanso');
        if (!yaInsertado && descansoInicioMin >= 0 && descansoFinalMin >= 0) {
            const ultimaLlegada = this.horaAMinutos(trenes[trenes.length - 1].llegada);
            if (descansoInicioMin >= ultimaLlegada) {
                bloques.push({
                    tipo: 'descanso',
                    horaOrden: descansoInicioMin
                });
            }
        }

        return `
            <div style="background: var(--surface); padding: 20px; border-radius: 12px; box-shadow: var(--clay-shadow-sm); margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid var(--bg-soft);">
                    <div>
                        <div style="font-size: 11px; color: var(--text-soft); text-transform: uppercase;">${this.tiempoExtraActivo ? 'Servicio de Tiempo Extra' : 'Servicio del Día'}</div>
                        <div style="font-size: 28px; font-weight: 800; color: var(--night-blue, var(--primary));">Servicio ${servicio.nombre}</div>
                    </div>
                    <div style="text-align: right;"><div style="font-size: 11px; color: var(--text-soft);">Tipo de día</div><div style="background: var(--primary); color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">${tipoDia}</div></div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
                    <div style="background: var(--bg-soft); padding: 10px; border-radius: 8px;"><div style="font-size: 10px; color: var(--text-soft);"> Línea</div><div style="font-size: 14px; font-weight: 700; color: var(--night-blue, var(--text));">${linea ? linea.nombre : 'N/A'}</div></div>
                    <div style="background: var(--bg-soft); padding: 10px; border-radius: 8px;"><div style="font-size: 10px; color: var(--text-soft);">🚇 Terminal</div><div style="font-size: 14px; font-weight: 700; color: var(--night-blue, var(--text));">${terminal ? terminal.nombre : 'N/A'}</div></div>
                </div>
                ${haceGarage ? `<div style="background: #e8f5e9; color: #2e7d32; padding: 10px; border-radius: 8px; font-weight: 700; font-size: 13px; text-align: center; margin-bottom: 16px;">✅ Hace Garage</div>` : ''}
                
                <!-- ✅ BLOQUES INTERCALADOS: Trenes y Descanso en orden cronológico -->
                ${bloques.map(bloque => {
                    if (bloque.tipo === 'tren') {
                        const tren = bloque.tren;
                        return `
                            <div style="background: var(--bg-soft); padding: 12px; border-radius: 10px; margin-bottom: 8px; border-left: 4px solid var(--primary);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <span style="font-weight: 700; color: var(--night-blue, var(--primary)); font-size: 14px;">${bloque.labelTren} #${bloque.numTren}</span>
                                    ${tren.garage ? '<span style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700;">GARAGE</span>' : ''}
                                </div>
                                <div style="display: grid; grid-template-columns: ${tren.vueltas ? '1fr 1fr 1fr' : '1fr 1fr'}; gap: 8px;">
                                    <div style="text-align: center; background: var(--surface); padding: 8px; border-radius: 6px;"><div style="font-size: 10px; color: var(--text-soft);">Salida</div><div style="font-size: 16px; font-weight: 800; color: var(--night-blue, var(--text));">${tren.salida || '--:--'}</div></div>
                                    <div style="text-align: center; background: var(--surface); padding: 8px; border-radius: 6px;"><div style="font-size: 10px; color: var(--text-soft);">Llegada</div><div style="font-size: 16px; font-weight: 800; color: var(--night-blue, var(--text));">${tren.llegada || '--:--'}</div></div>
                                    ${tren.vueltas ? `<div style="text-align: center; background: var(--surface); padding: 8px; border-radius: 6px;"><div style="font-size: 10px; color: var(--text-soft);">Vueltas</div><div style="font-size: 16px; font-weight: 800; color: var(--night-blue, var(--text));">${tren.vueltas}</div></div>` : ''}
                                </div>
                            </div>
                        `;
                    } else if (bloque.tipo === 'descanso') {
                        // ✅ Bloque de descanso intercalado
                        return `
                            <div style="background: var(--bg-soft); padding: 16px; border-radius: 12px; border: 2px solid var(--bg-soft); margin: 12px 0;">
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                                    <div style="background: var(--accent); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><svg viewBox="0 0 24 24" style="width: 18px; height: 18px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                                    <span style="font-size: 15px; font-weight: 700; color: var(--text);">Tiempo de Descanso</span>
                                </div>
                                <div style="display: flex; align-items: center; justify-content: space-around; background: var(--surface); padding: 14px; border-radius: 10px; margin-bottom: 16px;">
                                    <div style="text-align: center;"><div style="font-size: 10px; color: var(--text-soft);">Inicio</div><div style="font-size: 20px; font-weight: 800; color: var(--night-blue, var(--text));">${descansoInicio}</div></div>
                                    <div style="font-size: 24px; color: var(--text-soft);">→</div>
                                    <div style="text-align: center;"><div style="font-size: 10px; color: var(--text-soft);">Final</div><div style="font-size: 20px; font-weight: 800; color: var(--night-blue, var(--text));">${descansoFinal}</div></div>
                                </div>
                                <div id="hsdRelojContainer" style="text-align: center; margin-bottom: 12px; padding: 20px; background: var(--surface); border-radius: 10px; border: 2px solid var(--bg-soft);">
                                    <div id="hsdRelojTiempo" style="font-size: 42px; font-weight: 800; color: var(--night-blue, var(--primary)); font-variant-numeric: tabular-nums; letter-spacing: 2px;">00:00:00</div>
                                    <div id="hsdRelojEtiqueta" style="font-size: 13px; color: var(--text-soft); margin-top: 8px; font-weight: 600;">Esperando inicio de descanso...</div>
                                </div>
                                <button id="btnAgregarAtrasoHome" style="width: 100%; padding: 12px; background: #FF9800; color: white; border: none; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3); line-height: 1.2;">⏱️ Agregar Atraso al Tiempo de Alimentos</button>
                            </div>
                        `;
                    }
                    return '';
                }).join('')}
            </div>
        `;
    },

    async init() {
        this.minutosAtraso = 0;
        
        console.log('📥 [Home] Cargando datos de Firebase...');
        await DB_FIREBASE.load('rolesSemanal');
        await DB_FIREBASE.load('configuracionGlobal');
        await DB_FIREBASE.load('servicios');
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');
        await DB_FIREBASE.load('semanas');
        console.log('✅ [Home] Datos de Firebase cargados');

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
                    if (file.size > 5 * 1024 * 1024) { App.showToast('La imagen es muy grande. Máximo 5MB'); return; }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        DB.set('imagenPerfil', ev.target.result);
                        const imgExistente = welcomeIcon.querySelector('.ske-avatar-img');
                        if (imgExistente) imgExistente.src = ev.target.result;
                        else welcomeIcon.querySelector('.ske-avatar-inner').innerHTML = `<img src="${ev.target.result}" alt="Perfil" class="ske-avatar-img">`;
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
        if (btnModoDomingo) btnModoDomingo.addEventListener('click', () => { DB.set('modoDiaForzado', 'domingo'); DB.set('fechaModoForzado', hoyStr); App.showToast(' Modo: Domingo/Festivo'); recargarHome(); });

        const btnTiempoExtra = document.getElementById('btnTiempoExtra');
        const btnCancelarTiempoExtra = document.getElementById('btnCancelarTiempoExtra');

        if (btnTiempoExtra) {
            btnTiempoExtra.addEventListener('click', () => this.cargarTiempoExtra());
        }

        if (btnCancelarTiempoExtra) {
            btnCancelarTiempoExtra.addEventListener('click', () => this.cancelarTiempoExtra());
        }

        const btnAtraso = document.getElementById('btnAgregarAtrasoHome');
        if (btnAtraso) {
            btnAtraso.addEventListener('click', () => {
                const servicioActual = this.tiempoExtraActivo ? this.servicioTiempoExtra?.servicio : this.infoServicio?.servicio;
                if (servicioActual) {
                    this.agregarAtraso(servicioActual);
                } else {
                    App.showToast('⚠️ No hay servicio disponible para agregar atraso');
                }
            });
        }

        const servicioParaReloj = this.tiempoExtraActivo ? this.servicioTiempoExtra?.servicio : this.infoServicio?.servicio;
        if (servicioParaReloj) {
            this.iniciarReloj(servicioParaReloj);
        }

        const btnVerAvisos = document.getElementById('btnVerAvisos');
        if (btnVerAvisos) btnVerAvisos.addEventListener('click', () => { if (typeof Views !== 'undefined' && Views.load) Views.load('avisos', true); });

        if (typeof CicloTracking !== 'undefined') {
            console.log('🛰️ [Home] Preparando CicloTracking...');
            
            setTimeout(() => {
                const container = document.getElementById('skeServicioDiaContainer');
                if (container) {
                    console.log('✅ [Home] Contenedor encontrado, iniciando CicloTracking...');
                    CicloTracking.init();
                } else {
                    console.error('❌ [Home] Contenedor #skeServicioDiaContainer no encontrado');
                }
            }, 1000);
        } else {
            console.error('❌ [Home] CicloTracking no está definido');
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

    // ✅ FUNCIÓN MODIFICADA: Texto del contador corregido
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
                    relojEtiqueta.textContent = '⏰ Tu descanso inicia en...';
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
                relojEtiqueta.textContent = minutosAtraso > 0 ? `️ Tiempo restante (+${minutosAtraso} min)` : '🍽️ Tiempo restante de descanso';
                relojTiempo.style.color = 'var(--night-blue, var(--primary))';
            } else if (horaActualMinutos >= minutosFinalAjustado && horaActualMinutos < minutosLimite) {
                const diff = horaActualMinutos - minutosFinalAjustado;
                relojTiempo.textContent = `${String(Math.floor(diff / 60)).padStart(2, '0')}:${String(diff % 60).padStart(2, '0')}:${String(segundosActuales).padStart(2, '0')}`;
                // ✅ TEXTO CORREGIDO
                relojEtiqueta.textContent = 'Si no ha llegado tu siguiente tren, este es el atraso hasta el momento'; 
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
