// ============================================
// HOME.JS - Módulo de Inicio con botones Laboral/Domingo FUNCIONALES
// ============================================

const Home = {
    relojInterval: null,
    minutosAtraso: 0,
    modoForzado: localStorage.getItem('modoDiaForzado') || null,
    fechaModoForzado: localStorage.getItem('fechaModoForzado') || null,

    getFechaLocal(fecha) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    procesarImagen(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const size = 200;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    const minDim = Math.min(img.width, img.height);
                    const startX = (img.width - minDim) / 2;
                    const startY = (img.height - minDim) / 2;
                    ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
                    const base64 = canvas.toDataURL('image/jpeg', 0.9);
                    resolve(base64);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // ✅ Determina el tipo de día (automático o forzado)
    getTipoDiaActual() {
        // Verificar si el modo forzado es de un día anterior
        if (this.modoForzado && this.fechaModoForzado) {
            const hoy = new Date();
            const hoyStr = this.getFechaLocal(hoy);
            
            // Si la fecha guardada es diferente a hoy, resetear
            if (this.fechaModoForzado !== hoyStr) {
                this.modoForzado = null;
                this.fechaModoForzado = null;
                localStorage.removeItem('modoDiaForzado');
                localStorage.removeItem('fechaModoForzado');
            }
        }
        
        if (this.modoForzado === 'domingo') {
            return 'Domingo/Festivos';
        }
        if (this.modoForzado === 'laboral') {
            return 'Laboral';
        }
        const hoy = new Date();
        const dia = hoy.getDay();
        if (dia === 0) return 'Domingo/Festivos';
        if (dia === 6) return 'Sábado';
        return 'Laboral';
    },

    render() {
        const defaultName = Auth.currentUser ? Auth.getUserName(Auth.currentUser) : 'Usuario';
        const name = DB.get('userName', defaultName);
        const imagenPerfil = DB.get('imagenPerfil', null);
        const avisosNoLeidos = DB.get('avisosNoLeidos', 0);

        const roles = DB.load('roles');
        let semanaActual = null;
        let datoDiaActual = null;
        let infoServicio = null;
        let tipoDiaActual = this.getTipoDiaActual();
        let servicioNoExiste = false;

        if (roles.length > 0) {
            const rol = roles.sort((a, b) => b.createdAt - a.createdAt)[0];
            const hoy = new Date();
            const hoyStr = this.getFechaLocal(hoy);
            
            semanaActual = rol.semanas.find(semana => hoyStr >= semana.fechaInicio && hoyStr <= semana.fechaFin);
            
            if (semanaActual) {
                const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                const diaNombre = diasSemana[hoy.getDay()];
                const dia = semanaActual.dias.find(d => d.dia === diaNombre);
                
                if (dia && dia.dato) {
                    datoDiaActual = dia.dato;
                    // ✅ Buscar servicio según el tipo de día (automático o forzado)
                    infoServicio = this.buscarServicioPorTipo(rol, tipoDiaActual, datoDiaActual);
                    
                    if (!infoServicio) {
                        servicioNoExiste = true;
                    }
                }
            }
        }

        const tiempoExtraPendiente = DB.load('tiempoExtra').filter(t => !t.cobrado);
        
        const hoy = new Date();
        const diaSemana = hoy.getDay();
        const mostrarBotones = datoDiaActual !== null;

        return `
            <div class="view active ske-home">
                <!-- HEADER SALUDO SKEUOMÓRFICO -->
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
                            <input type="file" id="inputFotoPerfil" accept="image/png, image/jpeg, image/jpg, image/webp" style="display:none;">
                        </div>
                        
                        <div class="ske-greeting-text">
                            <h1 class="ske-greeting-title">¡Hola, ${name}!</h1>
                            <p class="ske-greeting-subtitle">Tu espacio de gestión inteligente</p>
                            
                            ${semanaActual ? `
                                <div class="ske-badges-row">
                                    <span class="ske-chip ske-chip-soft">
                                        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                        Semana ${semanaActual.numeroSemana}
                                    </span>
                                    ${datoDiaActual ? `
                                        <span class="ske-chip ske-chip-primary">
                                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                            ${tipoDiaActual} · Servicio ${datoDiaActual}
                                        </span>
                                    ` : ''}
                                </div>
                            ` : ''}
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
                    <div class="ske-modo-dia-container">
                        <div class="ske-modo-dia-label">Modo de visualización:</div>
                        <div class="ske-modo-dia-botones">
                            ${diaSemana >= 1 && diaSemana <= 5 ? `
                                <button class="ske-modo-btn ${this.modoForzado === null ? 'ske-modo-btn-activo' : ''}" id="btnModoLaboral">
                                    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    Laboral
                                </button>
                                <button class="ske-modo-btn ${this.modoForzado === 'domingo' ? 'ske-modo-btn-activo' : ''}" id="btnModoDomingo">
                                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                    Domingo/Festivo
                                </button>
                            ` : `
                                <button class="ske-modo-btn ${this.modoForzado === null ? 'ske-modo-btn-activo' : ''}" id="btnModoNormal">
                                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                    ${diaSemana === 0 ? 'Domingo/Festivo' : 'Sábado'}
                                </button>
                                <button class="ske-modo-btn ${this.modoForzado === 'laboral' ? 'ske-modo-btn-activo' : ''}" id="btnModoLaboralForzado">
                                    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    Ver como Laboral
                                </button>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- TIEMPO EXTRA PENDIENTE -->
                ${tiempoExtraPendiente.length > 0 ? `
                    <div class="ske-section">
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

                <!-- ✅ CONTENEDOR DE SERVICIO DEL DÍA -->
                <div id="skeServicioDiaContainer">
                    ${infoServicio ? this.renderServicioDia(infoServicio, tipoDiaActual) : ''}

                    ${servicioNoExiste ? `
                        <div class="ske-servicio-no-existe">
                            <div class="ske-servicio-no-existe-icono">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                            </div>
                            <h3>Servicio no disponible</h3>
                            <p>No hay servicios fijos para estas reservas.</p>
                            <p class="ske-servicio-no-existe-hint">Verifica en Registro → Servicios si existe el servicio <strong>"${datoDiaActual}"</strong> para el tipo de día <strong>"${tipoDiaActual}"</strong>.</p>
                        </div>
                    ` : ''}

                    ${!infoServicio && !datoDiaActual ? `
                        <div class="ske-empty-card">
                            <div class="ske-empty-icono">
                                <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            </div>
                            <h3 class="ske-empty-title">Sin servicio asignado</h3>
                            <p class="ske-empty-text">No hay servicio asignado para hoy.</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    renderServicioDia(info, tipoDia) {
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
                    <span class="ske-tipo-dia-badge">${tipoDia}</span>
                </div>

                <div class="ske-info-grid">
                    <div class="ske-info-item">
                        <span class="ske-info-label">Línea</span>
                        <span class="ske-info-value">${linea ? linea.nombre : 'N/A'}</span>
                    </div>
                    <div class="ske-info-item">
                        <span class="ske-info-label">Terminal</span>
                        <span class="ske-info-value">${terminal ? terminal.nombre : 'N/A'}</span>
                    </div>
                    <div class="ske-info-item">
                        <span class="ske-info-label">Tipo de día</span>
                        <span class="ske-info-value">${semana ? semana.tipo : 'N/A'}</span>
                    </div>
                </div>

                <div class="ske-service-number">${servicio.nombre}</div>

                <div class="ske-garage-badge ${garageClass}">
                    <svg viewBox="0 0 24 24">
                        ${haceGarage 
                            ? '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' 
                            : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
                    </svg>
                    ${garageTexto}
                </div>

                <div class="ske-trains-list">
                    ${trenes.map((tren, idx) => {
                        const numTren = tren.numero || (idx + 1);
                        const labelTren = idx === 0 ? 'Primer Tren' : idx === 1 ? 'Segundo Tren' : `Tren Adicional #${numTren}`;
                        return `
                            <div class="ske-train-card">
                                <div class="ske-train-header">${labelTren} <span class="ske-train-num">#${numTren}</span></div>
                                <div class="ske-train-times">
                                    <div class="ske-time-box">
                                        <span class="ske-time-label">Salida</span>
                                        <span class="ske-time-value">${tren.salida || '--:--'}</span>
                                    </div>
                                    <div class="ske-time-box">
                                        <span class="ske-time-label">Llegada</span>
                                        <span class="ske-time-value">${tren.llegada || '--:--'}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="ske-rest-card">
                    <div class="ske-rest-header">
                        <div class="ske-icon-circle ske-icon-small">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <span>Descanso</span>
                    </div>
                    <div class="ske-rest-times">
                        <div class="ske-rest-item">
                            <span class="ske-rest-label">Inicio</span>
                            <span class="ske-rest-value">${servicio.descansoInicio || '--:--'}</span>
                        </div>
                        <div class="ske-rest-separator">→</div>
                        <div class="ske-rest-item">
                            <span class="ske-rest-label">Final</span>
                            <span class="ske-rest-value">${servicio.descansoFinal || '--:--'}</span>
                        </div>
                    </div>
                    
                    <div class="ske-clock-container" id="hsdRelojContainer">
                        <div class="ske-clock-time" id="hsdRelojTiempo">--:--:--</div>
                        <div class="ske-clock-label" id="hsdRelojEtiqueta">Calculando...</div>
                    </div>

                    <button class="ske-btn-warning" id="btnAgregarAtrasoHome">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Agregar Atraso en Línea
                    </button>
                </div>
            </div>
        `;
    },

    buscarServicioPorTipo(rol, tipoDia, numeroServicio) {
        if (!numeroServicio) return null;
        
        const servicios = DB.load('servicios');
        const semanas = DB.load('semanas');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        
        const normalizar = (texto) => {
            return texto.toLowerCase()
                       .normalize('NFD')
                       .replace(/[\u0300-\u036f]/g, '')
                       .trim();
        };
        
        const tipoDiaNorm = normalizar(tipoDia);
        
        // ✅ Buscar la semana/tipo de día que coincida
        const semanaTipo = semanas.find(s => {
            const tipoSemanaNorm = normalizar(s.tipo);
            
            if (tipoSemanaNorm === tipoDiaNorm) return true;
            if (tipoDiaNorm === 'domingo/festivos' && tipoSemanaNorm === 'domingo') return true;
            if (tipoDiaNorm === 'domingo' && tipoSemanaNorm === 'domingo/festivos') return true;
            
            return false;
        });
        
        if (!semanaTipo) {
            return null;
        }
        
        const numeroServicioStr = String(numeroServicio).trim();
        
        // ✅ Buscar el servicio que coincida con línea, semana y número
        const servicio = servicios.find(s => {
            const nombreServicio = String(s.nombre).trim();
            return nombreServicio === numeroServicioStr && 
                   s.lineaId === rol.lineaId && 
                   s.semanaId === semanaTipo.id;
        });
        
        if (servicio) {
            return {
                servicio,
                linea: lineas.find(l => l.id === servicio.lineaId),
                terminal: terminales.find(t => t.id === servicio.terminalId),
                semana: semanaTipo
            };
        }
        
        return null;
    },

    init() {
        this.minutosAtraso = 0;

        const btnVerAvisos = document.getElementById('btnVerAvisos');
        if (btnVerAvisos) {
            btnVerAvisos.addEventListener('click', () => {
                if (typeof Views !== 'undefined' && Views.load) {
                    Views.load('avisos', true);
                }
            });
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
                    const tiposValidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
                    if (!tiposValidos.includes(file.type)) {
                        App.showToast('Formato no válido. Usa JPG, PNG o WebP');
                        return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                        App.showToast('La imagen es muy grande. Máximo 5MB');
                        return;
                    }
                    try {
                        App.showToast('Procesando imagen...');
                        const imagenBase64 = await this.procesarImagen(file);
                        DB.set('imagenPerfil', imagenBase64);
                        const imgExistente = welcomeIcon.querySelector('.ske-avatar-img');
                        if (imgExistente) {
                            imgExistente.src = imagenBase64;
                        } else {
                            welcomeIcon.innerHTML = `
                                <div class="ske-avatar-inner">
                                    <img src="${imagenBase64}" alt="Perfil" class="ske-avatar-img">
                                </div>
                                <button class="ske-avatar-btn" id="btnCambiarFoto" title="Cambiar foto">
                                    <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                </button>
                                <input type="file" id="inputFotoPerfil" accept="image/png, image/jpeg, image/jpg, image/webp" style="display:none;">
                            `;
                            
                            const nuevoBtn = document.getElementById('btnCambiarFoto');
                            const nuevoInput = document.getElementById('inputFotoPerfil');
                            nuevoBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                nuevoInput.click();
                            });
                            nuevoInput.addEventListener('change', async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const tiposValidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
                                    if (!tiposValidos.includes(file.type)) {
                                        App.showToast('Formato no válido. Usa JPG, PNG o WebP');
                                        return;
                                    }
                                    if (file.size > 5 * 1024 * 1024) {
                                        App.showToast('La imagen es muy grande. Máximo 5MB');
                                        return;
                                    }
                                    try {
                                        App.showToast('Procesando imagen...');
                                        const imagenBase64 = await this.procesarImagen(file);
                                        DB.set('imagenPerfil', imagenBase64);
                                        const imgExistente = welcomeIcon.querySelector('.ske-avatar-img');
                                        if (imgExistente) {
                                            imgExistente.src = imagenBase64;
                                        }
                                        App.showToast('Foto de perfil actualizada');
                                    } catch (error) {
                                        App.showToast('Error al procesar la imagen');
                                    }
                                }
                            });
                        }
                        App.showToast('Foto de perfil actualizada');
                    } catch (error) {
                        console.error('Error al procesar imagen:', error);
                        App.showToast('Error al procesar la imagen');
                    }
                }
            });
        }

        // ✅ EVENTOS DE BOTONES DE MODO - SIMPLE Y CONFIABLE
        const btnModoLaboral = document.getElementById('btnModoLaboral');
        const btnModoDomingo = document.getElementById('btnModoDomingo');
        const btnModoNormal = document.getElementById('btnModoNormal');
        const btnModoLaboralForzado = document.getElementById('btnModoLaboralForzado');

        if (btnModoLaboral) {
            btnModoLaboral.addEventListener('click', () => {
                localStorage.removeItem('modoDiaForzado');
                localStorage.removeItem('fechaModoForzado');
                App.showToast('📅 Modo: Laboral');
                setTimeout(() => window.location.reload(), 300);
            });
        }

        if (btnModoDomingo) {
            btnModoDomingo.addEventListener('click', () => {
                const hoy = new Date();
                const hoyStr = this.getFechaLocal(hoy);
                localStorage.setItem('modoDiaForzado', 'domingo');
                localStorage.setItem('fechaModoForzado', hoyStr);
                App.showToast('🌙 Modo: Domingo/Festivo');
                setTimeout(() => window.location.reload(), 300);
            });
        }

        if (btnModoNormal) {
            btnModoNormal.addEventListener('click', () => {
                localStorage.removeItem('modoDiaForzado');
                localStorage.removeItem('fechaModoForzado');
                App.showToast('📅 Modo: Automático');
                setTimeout(() => window.location.reload(), 300);
            });
        }

        if (btnModoLaboralForzado) {
            btnModoLaboralForzado.addEventListener('click', () => {
                const hoy = new Date();
                const hoyStr = this.getFechaLocal(hoy);
                localStorage.setItem('modoDiaForzado', 'laboral');
                localStorage.setItem('fechaModoForzado', hoyStr);
                App.showToast('📅 Modo: Laboral (forzado)');
                setTimeout(() => window.location.reload(), 300);
            });
        }

        // ✅ Iniciar reloj si hay servicio
        const servicioEl = document.querySelector('.ske-rest-card');
        if (servicioEl) {
            const roles = DB.load('roles');
            if (roles.length > 0) {
                const rol = roles.sort((a, b) => b.createdAt - a.createdAt)[0];
                const hoy = new Date();
                const hoyStr = this.getFechaLocal(hoy);
                const semanaActual = rol.semanas.find(semana => hoyStr >= semana.fechaInicio && hoyStr <= semana.fechaFin);
                
                if (semanaActual) {
                    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                    const diaNombre = diasSemana[hoy.getDay()];
                    const dia = semanaActual.dias.find(d => d.dia === diaNombre);
                    
                    if (dia && dia.dato) {
                        const tipoDia = this.getTipoDiaActual();
                        const servicio = this.buscarServicioPorTipo(rol, tipoDia, dia.dato);
                        
                        if (servicio && servicio.servicio) {
                            this.minutosAtraso = 0;
                            this.iniciarReloj(servicio.servicio);
                            
                            const btnAtraso = document.getElementById('btnAgregarAtrasoHome');
                            if (btnAtraso) {
                                btnAtraso.addEventListener('click', () => this.agregarAtraso(servicio.servicio));
                            }
                        }
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

    // ✅ NUEVA LÓGICA DEL CRONÓMETRO
    iniciarReloj(servicio) {
        if (this.relojInterval) clearInterval(this.relojInterval);

        // ✅ Constante: 1 hora 25 minutos = 85 minutos adicionales
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
            
            // ✅ Límite: fin del descanso + 85 minutos (1h 25min)
            const minutosLimite = minutosFinalAjustado + MINUTOS_TOLERANCIA;

            const relojTiempo = document.getElementById('hsdRelojTiempo');
            const relojEtiqueta = document.getElementById('hsdRelojEtiqueta');

            if (!relojTiempo || !relojEtiqueta) return;

            // ✅ ESTADO 1: Antes del descanso - cuenta regresiva hasta que inicie
            if (horaActual < minutosInicio) {
                const diff = minutosInicio - horaActual;
                const horas = Math.floor(diff / 60);
                const mins = diff % 60;
                relojTiempo.textContent = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(60 - segundosActuales).padStart(2, '0')}`;
                relojEtiqueta.textContent = 'Tiempo para iniciar descanso';
                relojTiempo.className = 'ske-clock-time ske-clock-waiting';
            }
            // ✅ ESTADO 2: Durante el descanso - cuenta regresiva del descanso
            else if (horaActual >= minutosInicio && horaActual < minutosFinalAjustado) {
                const diff = minutosFinalAjustado - horaActual;
                const horas = Math.floor(diff / 60);
                const mins = diff % 60;
                const segs = 60 - segundosActuales;
                relojTiempo.textContent = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
                relojEtiqueta.textContent = minutosAtraso > 0 
                    ? `Tiempo restante de descanso (con +${minutosAtraso} min)` 
                    : 'Tiempo restante de descanso';
                relojTiempo.className = 'ske-clock-time ske-clock-active';
            }
            // ✅ ESTADO 3: Después del descanso - 85 minutos de tolerancia
            else if (horaActual >= minutosFinalAjustado && horaActual < minutosLimite) {
                const diff = minutosLimite - horaActual;
                const horas = Math.floor(diff / 60);
                const mins = diff % 60;
                const segs = 60 - segundosActuales;
                relojTiempo.textContent = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
                relojEtiqueta.textContent = '⏰ Tiempo de tolerancia restante';
                relojTiempo.className = 'ske-clock-time ske-clock-tolerancia';
            }
            // ✅ ESTADO 4: Pasó el tiempo de tolerancia - se queda en 00:00:00
            else {
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

        App.showToast(`+${minutosNum} min de atraso agregados (temporal)`);
        this.iniciarReloj(servicio);
        
        const container = document.getElementById('hsdRelojContainer');
        if (container) {
            let badge = container.querySelector('.ske-atraso-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'ske-atraso-badge';
                container.appendChild(badge);
            }
            badge.textContent = `+${this.minutosAtraso} min atraso`;
        }
    }
};

export default Home;