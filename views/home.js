// ============================================
// HOME.JS - Dashboard Inteligente con Rol Semanal
// ============================================

const Home = {
    relojInterval: null,
    minutosAtraso: 0,

    getFechaLocal(fecha) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // ✅ Determina el tipo de día (automático o forzado por el usuario)
    getTipoDiaActual() {
        const modoForzado = DB.get('modoDiaForzado', null);
        const fechaForzada = DB.get('fechaModoForzado', null);
        const hoyStr = this.getFechaLocal(new Date());

        // Si el modo forzado es de un día anterior, resetearlo
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

    render() {
        const defaultName = Auth.currentUser ? Auth.getUserName(Auth.currentUser) : 'Usuario';
        const name = DB.get('userName', defaultName);
        const imagenPerfil = DB.get('imagenPerfil', null);
        const avisosNoLeidos = DB.get('avisosNoLeidos', 0);

        // ✅ Obtener datos del perfil del usuario
        const userLineaId = DB.get('userLineaId');
        const userTerminalId = DB.get('userTerminalId');
        const userNumeroRol = DB.get('userNumeroRol');

        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const rolesSemanal = DB.load('rolesSemanal');
        const servicios = DB.load('servicios');
        const semanas = DB.load('semanas'); // Tipos de día registrados

        const miLinea = lineas.find(l => l.id === userLineaId);
        const miTerminal = terminales.find(t => t.id === userTerminalId);
        
        let semanaActualNum = 1;
        let posicionHoy = 'N/A';
        let tipoDiaActual = this.getTipoDiaActual();
        let infoServicio = null;
        let errorMensaje = null;

        if (userNumeroRol && rolesSemanal.length > 0) {
            const miRol = rolesSemanal.find(r => r.numeroRol === userNumeroRol && r.lineaId === userLineaId);

            if (miRol) {
                // Calcular semana actual basada en la fecha de inicio
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const fechaInicio = new Date(miRol.fechaInicio);
                fechaInicio.setHours(0, 0, 0, 0);
                const diasTranscurridos = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24));
                
                semanaActualNum = Math.floor(diasTranscurridos / 7) % 5 + 1;
                const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                const diaNombre = diasSemana[hoy.getDay()];

                const semanaData = miRol.semanas.find(s => s.numero === semanaActualNum);
                if (semanaData && semanaData.dias[diaNombre]) {
                    posicionHoy = semanaData.dias[diaNombre].posicion || 'N/A';
                }

                // Buscar el servicio correspondiente
                if (posicionHoy !== 'N/A') {
                    const tipoDiaConfig = semanas.find(s => s.tipo === tipoDiaActual && s.lineaId === userLineaId && s.terminalId === userTerminalId);
                    
                    if (tipoDiaConfig) {
                        infoServicio = servicios.find(s => 
                            String(s.nombre).trim() === String(posicionHoy).trim() && 
                            s.lineaId === userLineaId && 
                            s.semanaId === tipoDiaConfig.id
                        );
                    } else {
                        errorMensaje = `No se encontró configuración de tipo de día "${tipoDiaActual}" para esta terminal.`;
                    }

                    if (!infoServicio && !errorMensaje) {
                        errorMensaje = `No hay servicio registrado con la posición "${posicionHoy}" para el tipo de día "${tipoDiaActual}".`;
                    }
                }
            } else {
                errorMensaje = `No se encontró el Rol #${userNumeroRol} en el sistema. Verifica con tu administrador.`;
            }
        } else {
            errorMensaje = 'Tu perfil no está completamente configurado. Por favor, contacta a tu administrador.';
        }

        const tiempoExtraPendiente = DB.load('tiempoExtra').filter(t => !t.cobrado);
        const diaSemana = new Date().getDay();
        const mostrarBotones = posicionHoy !== 'N/A' && !errorMensaje;

        return `
            <div class="view active ske-home">
                <!-- HEADER SALUDO -->
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
                            <p class="ske-greeting-subtitle">Tu espacio de gestión inteligente</p>
                            
                            <div class="ske-badges-row" style="margin-top: 12px; justify-content: flex-end;">
                                <span class="ske-chip ske-chip-soft" style="background: var(--primary); color: white;">
                                    <svg viewBox="0 0 24 24" style="width:14px;height:14px;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    Semana ${semanaActualNum}
                                </span>
                            </div>
                        </div>
                        
                        ${avisosNoLeidos > 0 ? `
                            <button class="ske-fab-notification" id="btnVerAvisos" title="Hay ${avisosNoLeidos} documento(s) nuevo(s)">
                                <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                <span class="ske-fab-badge">${avisosNoLeidos}</span>
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- ✅ BOTONES DE ALTERNANCIA LABORAL/DOMINGO -->
                ${mostrarBotones ? `
                    <div class="ske-modo-dia-container" style="margin: 16px 0; padding: 16px; background: var(--surface); border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                        <div class="ske-modo-dia-label" style="font-size: 13px; font-weight: 700; color: var(--text-soft); margin-bottom: 10px; text-transform: uppercase;">Modo de visualización:</div>
                        <div class="ske-modo-dia-botones" style="display: flex; gap: 8px;">
                            ${diaSemana >= 1 && diaSemana <= 5 ? `
                                <button class="ske-modo-btn ${DB.get('modoDiaForzado') === null ? 'ske-modo-btn-activo' : ''}" id="btnModoLaboral" style="flex:1; padding: 10px; border-radius: 8px; border: 2px solid var(--bg-soft); background: ${DB.get('modoDiaForzado') === null ? 'var(--primary)' : 'var(--surface)'}; color: ${DB.get('modoDiaForzado') === null ? 'white' : 'var(--text)'}; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg viewBox="0 0 24 24" style="width:16px;height:16px;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    Laboral
                                </button>
                                <button class="ske-modo-btn ${DB.get('modoDiaForzado') === 'domingo' ? 'ske-modo-btn-activo' : ''}" id="btnModoDomingo" style="flex:1; padding: 10px; border-radius: 8px; border: 2px solid var(--bg-soft); background: ${DB.get('modoDiaForzado') === 'domingo' ? 'var(--accent)' : 'var(--surface)'}; color: ${DB.get('modoDiaForzado') === 'domingo' ? 'white' : 'var(--text)'}; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg viewBox="0 0 24 24" style="width:16px;height:16px;"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                    Domingo/Festivo
                                </button>
                            ` : `
                                <button class="ske-modo-btn ${DB.get('modoDiaForzado') === null ? 'ske-modo-btn-activo' : ''}" id="btnModoNormal" style="flex:1; padding: 10px; border-radius: 8px; border: 2px solid var(--bg-soft); background: ${DB.get('modoDiaForzado') === null ? 'var(--primary)' : 'var(--surface)'}; color: ${DB.get('modoDiaForzado') === null ? 'white' : 'var(--text)'}; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg viewBox="0 0 24 24" style="width:16px;height:16px;"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                    ${diaSemana === 0 ? 'Domingo/Festivo' : 'Sábado'}
                                </button>
                                <button class="ske-modo-btn ${DB.get('modoDiaForzado') === 'laboral' ? 'ske-modo-btn-activo' : ''}" id="btnModoLaboralForzado" style="flex:1; padding: 10px; border-radius: 8px; border: 2px solid var(--bg-soft); background: ${DB.get('modoDiaForzado') === 'laboral' ? 'var(--accent)' : 'var(--surface)'}; color: ${DB.get('modoDiaForzado') === 'laboral' ? 'white' : 'var(--text)'}; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg viewBox="0 0 24 24" style="width:16px;height:16px;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    Ver como Laboral
                                </button>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- ✅ CONTENEDOR DE SERVICIO DEL DÍA -->
                <div id="skeServicioDiaContainer">
                    ${errorMensaje ? `
                        <div class="ske-servicio-no-existe" style="text-align: center; padding: 40px 20px; background: var(--surface); border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                            <div class="ske-servicio-no-existe-icono" style="margin-bottom: 16px;">
                                <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; stroke: var(--text-soft); fill: none;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            </div>
                            <h3 style="color: var(--text); margin-bottom: 8px;">Información no disponible</h3>
                            <p style="color: var(--text-soft); font-size: 14px;">${errorMensaje}</p>
                        </div>
                    ` : infoServicio ? this.renderServicioDia(infoServicio, tipoDiaActual, semanaActualNum) : `
                        <div class="ske-empty-card" style="text-align: center; padding: 40px 20px; background: var(--surface); border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                            <h3 class="ske-empty-title">Sin servicio asignado</h3>
                            <p class="ske-empty-text">No hay servicio registrado para tu posición hoy.</p>
                        </div>
                    `}
                </div>

                <!-- TIEMPO EXTRA PENDIENTE -->
                ${tiempoExtraPendiente.length > 0 ? `
                    <div class="ske-section" style="margin-top: 20px;">
                        <div class="ske-section-header">
                            <div class="ske-icon-circle ske-icon-warning">
                                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            </div>
                            <h2 class="ske-section-title">Tiempo Extra por Cobrar</h2>
                            <span class="ske-counter">${tiempoExtraPendiente.length}</span>
                        </div>
                        <div class="ske-list">
                            ${tiempoExtraPendiente.map(item => `
                                <div class="ske-list-item">
                                    <div class="ske-list-item-content">
                                        <div class="ske-list-item-title">${item.tipo}</div>
                                        <div class="ske-list-item-subtitle">${item.nota || 'Sin nota'}</div>
                                    </div>
                                    <div class="ske-list-item-meta">${item.fecha}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    renderServicioDia(info, tipoDia, semanaNum) {
        const { servicio, linea, terminal, semana } = info;
        const trenes = servicio.trenes || [];
        const haceGarage = servicio.garage === true || servicio.garage === 'Si' || servicio.garage === 'Sí';
        const garageTexto = haceGarage ? 'Sí hace Garage' : 'No hace Garage';
        const garageClass = haceGarage ? 'ske-garage-yes' : 'ske-garage-no';

        return `
            <div class="ske-section">
                <div class="ske-section-header">
                    <div class="ske-icon-circle">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <h2 class="ske-section-title">Servicio del Día</h2>
                    <span class="ske-tipo-dia-badge" style="background: var(--primary); color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;">${tipoDia}</span>
                </div>

                <div class="ske-info-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                    <div class="ske-info-item" style="background: var(--bg-soft); padding: 12px; border-radius: 8px;">
                        <span class="ske-info-label" style="font-size: 11px; color: var(--text-soft); display: block;">Línea</span>
                        <span class="ske-info-value" style="font-size: 15px; font-weight: 700; color: var(--text);">${linea ? linea.nombre : 'N/A'}</span>
                    </div>
                    <div class="ske-info-item" style="background: var(--bg-soft); padding: 12px; border-radius: 8px;">
                        <span class="ske-info-label" style="font-size: 11px; color: var(--text-soft); display: block;">Terminal</span>
                        <span class="ske-info-value" style="font-size: 15px; font-weight: 700; color: var(--text);">${terminal ? terminal.nombre : 'N/A'}</span>
                    </div>
                </div>

                <div class="ske-service-number" style="text-align: center; font-size: 32px; font-weight: 800; color: var(--primary); margin: 16px 0; letter-spacing: 1px;">
                    Servicio ${servicio.nombre}
                </div>

                <div class="ske-garage-badge ${garageClass}" style="text-align: center; padding: 10px; background: ${haceGarage ? '#e8f5e9' : '#ffebee'}; color: ${haceGarage ? '#2e7d32' : '#c62828'}; border-radius: 8px; font-weight: 700; font-size: 14px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <svg viewBox="0 0 24 24" style="width: 18px; height: 18px;">
                        ${haceGarage 
                            ? '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' 
                            : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
                    </svg>
                    ${garageTexto}
                </div>

                <div class="ske-trains-list" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                    ${trenes.map((tren, idx) => {
                        const numTren = tren.numero || (idx + 1);
                        const labelTren = idx === 0 ? 'Primer Tren' : idx === 1 ? 'Segundo Tren' : `Tren Adicional #${numTren}`;
                        return `
                            <div class="ske-train-card" style="background: var(--surface); padding: 16px; border-radius: 12px; box-shadow: var(--clay-shadow-sm); border: 1px solid var(--bg-soft);">
                                <div class="ske-train-header" style="font-size: 14px; font-weight: 700; color: var(--text-soft); margin-bottom: 10px; display: flex; justify-content: space-between;">
                                    ${labelTren} <span class="ske-train-num" style="color: var(--primary);">#${numTren}</span>
                                </div>
                                <div class="ske-train-times" style="display: flex; gap: 12px;">
                                    <div class="ske-time-box" style="flex: 1; text-align: center; background: var(--bg-soft); padding: 10px; border-radius: 8px;">
                                        <span class="ske-time-label" style="display: block; font-size: 11px; color: var(--text-soft); margin-bottom: 4px;">Salida</span>
                                        <span class="ske-time-value" style="display: block; font-size: 18px; font-weight: 800; color: var(--text);">${tren.salida || '--:--'}</span>
                                    </div>
                                    <div class="ske-time-box" style="flex: 1; text-align: center; background: var(--bg-soft); padding: 10px; border-radius: 8px;">
                                        <span class="ske-time-label" style="display: block; font-size: 11px; color: var(--text-soft); margin-bottom: 4px;">Llegada</span>
                                        <span class="ske-time-value" style="display: block; font-size: 18px; font-weight: 800; color: var(--text);">${tren.llegada || '--:--'}</span>
                                    </div>
                                    ${tren.vueltas ? `
                                    <div class="ske-time-box" style="flex: 1; text-align: center; background: var(--bg-soft); padding: 10px; border-radius: 8px;">
                                        <span class="ske-time-label" style="display: block; font-size: 11px; color: var(--text-soft); margin-bottom: 4px;">Vueltas</span>
                                        <span class="ske-time-value" style="display: block; font-size: 18px; font-weight: 800; color: var(--text);">${tren.vueltas}</span>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="ske-rest-card" style="background: var(--surface); padding: 20px; border-radius: 12px; box-shadow: var(--clay-shadow-sm); border: 1px solid var(--bg-soft);">
                    <div class="ske-rest-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
                        <div class="ske-icon-circle ske-icon-small" style="background: var(--accent); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <svg viewBox="0 0 24 24" style="width: 18px; height: 18px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <span style="font-size: 16px; font-weight: 700; color: var(--text);">Tiempo de Descanso</span>
                    </div>
                    <div class="ske-rest-times" style="display: flex; align-items: center; justify-content: space-around; background: var(--bg-soft); padding: 16px; border-radius: 10px; margin-bottom: 20px;">
                        <div class="ske-rest-item" style="text-align: center;">
                            <span class="ske-rest-label" style="display: block; font-size: 11px; color: var(--text-soft); margin-bottom: 4px;">Inicio</span>
                            <span class="ske-rest-value" style="display: block; font-size: 20px; font-weight: 800; color: var(--text);">${servicio.descansoInicio || '--:--'}</span>
                        </div>
                        <div class="ske-rest-separator" style="font-size: 24px; color: var(--text-soft); font-weight: 300;">→</div>
                        <div class="ske-rest-item" style="text-align: center;">
                            <span class="ske-rest-label" style="display: block; font-size: 11px; color: var(--text-soft); margin-bottom: 4px;">Final</span>
                            <span class="ske-rest-value" style="display: block; font-size: 20px; font-weight: 800; color: var(--text);">${servicio.descansoFinal || '--:--'}</span>
                        </div>
                    </div>
                    
                    <div class="ske-clock-container" id="hsdRelojContainer" style="text-align: center; margin-bottom: 16px; padding: 16px; background: var(--bg); border-radius: 10px; border: 2px solid var(--bg-soft);">
                        <div class="ske-clock-time" id="hsdRelojTiempo" style="font-size: 36px; font-weight: 800; color: var(--primary); font-variant-numeric: tabular-nums;">--:--:--</div>
                        <div class="ske-clock-label" id="hsdRelojEtiqueta" style="font-size: 13px; color: var(--text-soft); margin-top: 4px;">Calculando...</div>
                    </div>

                    <button class="ske-btn-warning" id="btnAgregarAtrasoHome" style="width: 100%; padding: 14px; background: #FF9800; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);">
                        <svg viewBox="0 0 24 24" style="width: 18px; height: 18px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Agregar Atraso en Línea
                    </button>
                </div>
            </div>
        `;
    },

    init() {
        this.minutosAtraso = 0;

        // ✅ Lógica del botón de cambiar foto (igual que antes)
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

        // ✅ EVENTOS DE BOTONES DE MODO (Alternancia Laboral/Domingo)
        const btnModoLaboral = document.getElementById('btnModoLaboral');
        const btnModoDomingo = document.getElementById('btnModoDomingo');
        const btnModoNormal = document.getElementById('btnModoNormal');
        const btnModoLaboralForzado = document.getElementById('btnModoLaboralForzado');

        const recargarHome = () => setTimeout(() => window.location.reload(), 300);

        if (btnModoLaboral) {
            btnModoLaboral.addEventListener('click', () => {
                DB.remove('modoDiaForzado');
                DB.remove('fechaModoForzado');
                App.showToast('📅 Modo: Laboral (Automático)');
                recargarHome();
            });
        }

        if (btnModoDomingo) {
            btnModoDomingo.addEventListener('click', () => {
                DB.set('modoDiaForzado', 'domingo');
                DB.set('fechaModoForzado', this.getFechaLocal(new Date()));
                App.showToast('🌙 Modo: Domingo/Festivo (Forzado)');
                recargarHome();
            });
        }

        if (btnModoNormal) {
            btnModoNormal.addEventListener('click', () => {
                DB.remove('modoDiaForzado');
                DB.remove('fechaModoForzado');
                App.showToast('📅 Modo: Automático');
                recargarHome();
            });
        }

        if (btnModoLaboralForzado) {
            btnModoLaboralForzado.addEventListener('click', () => {
                DB.set('modoDiaForzado', 'laboral');
                DB.set('fechaModoForzado', this.getFechaLocal(new Date()));
                App.showToast('📅 Modo: Laboral (Forzado)');
                recargarHome();
            });
        }

        // ✅ Iniciar reloj si hay servicio
        const btnAtraso = document.getElementById('btnAgregarAtrasoHome');
        if (btnAtraso) {
            // Necesitamos recuperar los datos del servicio para el reloj
            const userNumeroRol = DB.get('userNumeroRol');
            const userLineaId = DB.get('userLineaId');
            const rolesSemanal = DB.load('rolesSemanal');
            const miRol = rolesSemanal.find(r => r.numeroRol === userNumeroRol && r.lineaId === userLineaId);
            
            if (miRol) {
                const hoy = new Date();
                const diasTranscurridos = Math.floor((hoy - new Date(miRol.fechaInicio)) / (1000 * 60 * 60 * 24));
                const semanaActualNum = Math.floor(diasTranscurridos / 7) % 5 + 1;
                const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                const diaNombre = diasSemana[hoy.getDay()];
                const posicionHoy = miRol.semanas.find(s => s.numero === semanaActualNum)?.dias[diaNombre]?.posicion;

                if (posicionHoy) {
                    const tipoDiaActual = this.getTipoDiaActual();
                    const semanas = DB.load('semanas');
                    const tipoDiaConfig = semanas.find(s => s.tipo === tipoDiaActual && s.lineaId === userLineaId);
                    const servicios = DB.load('servicios');
                    const servicio = servicios.find(s => String(s.nombre).trim() === String(posicionHoy).trim() && s.semanaId === tipoDiaConfig?.id);

                    if (servicio) {
                        this.iniciarReloj(servicio);
                        btnAtraso.addEventListener('click', () => this.agregarAtraso(servicio));
                    }
                }
            }
        }
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
            const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
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

            if (horaActual < minutosInicio) {
                const diff = minutosInicio - horaActual;
                relojTiempo.textContent = `${String(Math.floor(diff / 60)).padStart(2, '0')}:${String(diff % 60).padStart(2, '0')}:${String(60 - segundosActuales).padStart(2, '0')}`;
                relojEtiqueta.textContent = 'Tiempo para iniciar descanso';
                relojTiempo.className = 'ske-clock-time ske-clock-waiting';
            } else if (horaActual >= minutosInicio && horaActual < minutosFinalAjustado) {
                const diff = minutosFinalAjustado - horaActual;
                relojTiempo.textContent = `${String(Math.floor(diff / 60)).padStart(2, '0')}:${String(diff % 60).padStart(2, '0')}:${String(60 - segundosActuales).padStart(2, '0')}`;
                relojEtiqueta.textContent = minutosAtraso > 0 ? `Tiempo restante (+${minutosAtraso} min)` : 'Tiempo restante de descanso';
                relojTiempo.className = 'ske-clock-time ske-clock-active';
            } else if (horaActual >= minutosFinalAjustado && horaActual < minutosLimite) {
                const diff = minutosLimite - horaActual;
                relojTiempo.textContent = `${String(Math.floor(diff / 60)).padStart(2, '0')}:${String(diff % 60).padStart(2, '0')}:${String(60 - segundosActuales).padStart(2, '0')}`;
                relojEtiqueta.textContent = '⏰ Tiempo de tolerancia restante';
                relojTiempo.className = 'ske-clock-time ske-clock-tolerancia';
            } else {
                relojTiempo.textContent = '00:00:00';
                relojEtiqueta.textContent = 'Tiempo finalizado';
                relojTiempo.className = 'ske-clock-time ske-clock-finished';
            }
        };

        actualizarReloj();
        this.relojInterval = setInterval(actualizarReloj, 1000);
    },

    agregarAtraso(servicio) {
        const minutos = prompt('¿Cuántos minutos de atraso en línea?');
        if (minutos === null) return;
        const minutosNum = parseInt(minutos);
        if (isNaN(minutosNum) || minutosNum <= 0) {
            App.showToast('Ingresa un número válido de minutos');
            return;
        }
        this.minutosAtraso = (this.minutosAtraso || 0) + minutosNum;
        App.showToast(`+${minutosNum} min de atraso agregados`);
        this.iniciarReloj(servicio);
        
        const container = document.getElementById('hsdRelojContainer');
        if (container) {
            let badge = container.querySelector('.ske-atraso-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'ske-atraso-badge';
                badge.style.cssText = 'margin-top: 10px; padding: 6px 12px; background: #ffebee; color: #c62828; border-radius: 20px; font-size: 13px; font-weight: 700; display: inline-block;';
                container.appendChild(badge);
            }
            badge.textContent = `⚠️ +${this.minutosAtraso} min de atraso`;
        }
    }
};

export default Home;