// ============================================
// HOME.JS - Módulo de Inicio con imagen de perfil procesada
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

    // ✅ Procesar imagen: recortar al centro y redimensionar a 200x200px
    procesarImagen(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const size = 200; // Tamaño final cuadrado
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');

                    // Calcular dimensiones para recortar al centro (cover)
                    const minDim = Math.min(img.width, img.height);
                    const startX = (img.width - minDim) / 2;
                    const startY = (img.height - minDim) / 2;

                    // Dibujar imagen recortada y redimensionada
                    ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

                    // Convertir a base64 con calidad 0.9
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

    render() {
        const defaultName = Auth.currentUser ? Auth.getUserName(Auth.currentUser) : 'Usuario';
        const name = DB.get('userName', defaultName);
        const imagenPerfil = DB.get('imagenPerfil', null);

        const roles = DB.load('roles');
        let semanaActual = null;
        let datoDiaActual = null;
        let infoServicio = null;
        let tipoDiaActual = '';

        if (roles.length > 0) {
            const rol = roles.sort((a, b) => b.createdAt - a.createdAt)[0];
            const hoy = new Date();
            const hoyStr = this.getFechaLocal(hoy);
            
            semanaActual = rol.semanas.find(semana => hoyStr >= semana.fechaInicio && hoyStr <= semana.fechaFin);
            
            if (semanaActual) {
                const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                const diaNombre = diasSemana[hoy.getDay()];
                const diaIdx = hoy.getDay();
                const dia = semanaActual.dias.find(d => d.dia === diaNombre);
                
                if (dia && dia.dato) {
                    tipoDiaActual = 'Laboral';
                    if (diaIdx === 0) {
                        tipoDiaActual = 'Domingo/Festivos';
                    } else if (diaIdx === 6) {
                        tipoDiaActual = 'Sábado';
                    }

                    datoDiaActual = dia.dato;
                    infoServicio = this.buscarServicioPorTipo(rol, tipoDiaActual, datoDiaActual);
                }
            }
        }

        const tiempoExtraPendiente = DB.load('tiempoExtra').filter(t => !t.cobrado);

        return `
            <div class="view active">
                <div class="welcome-card">
                    <div class="welcome-icon" id="welcomeIcon">
                        ${imagenPerfil ? 
                            `<img src="${imagenPerfil}" alt="Perfil" class="perfil-imagen">` :
                            `<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
                        }
                        <button class="btn-cambiar-foto" id="btnCambiarFoto" title="Cambiar foto">
                            <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        </button>
                        <input type="file" id="inputFotoPerfil" accept="image/png, image/jpeg, image/jpg, image/webp" style="display:none;">
                    </div>
                    <div class="welcome-text">
                        <h2>¡Hola, ${name}!</h2>
                        <p>Tu espacio de gestión inteligente</p>
                    </div>
                    ${semanaActual ? `
                        <div class="semana-badge-container">
                            <div class="badge-item">
                                <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:var(--primary);fill:none;stroke-width:2;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                <span>Semana ${semanaActual.numeroSemana}</span>
                            </div>
                            ${datoDiaActual ? `
                                <div class="badge-item">
                                    <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:var(--primary);fill:none;stroke-width:2;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    <span>${tipoDiaActual} - Servicio ${datoDiaActual}</span>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>

                ${tiempoExtraPendiente.length > 0 ? `
                    <div class="te-pendientes-section">
                        <h3 class="te-pendientes-title">
                            <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Tiempo Extra por Cobrar (${tiempoExtraPendiente.length})
                        </h3>
                        <div class="te-pendientes-list">
                            ${tiempoExtraPendiente.map(item => `
                                <div class="te-pendiente-item te-pendiente-item-static">
                                    <div class="te-pendiente-info">
                                        <span class="te-pendiente-tipo">${item.tipo}</span>
                                        <span class="te-pendiente-fecha">${item.fecha}</span>
                                    </div>
                                    <div class="te-pendiente-nota">${item.nota}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${infoServicio ? this.renderServicioDia(infoServicio) : ''}

                ${!infoServicio ? `
                    <div class="aviso-empty" style="margin-top:20px;">
                        <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <p>No hay servicio registrado para hoy (${tipoDiaActual || 'Sin tipo'})</p>
                    </div>
                ` : ''}
            </div>
        `;
    },

    renderServicioDia(info) {
        const { servicio, linea, terminal, semana } = info;
        const trenes = servicio.trenes || [];
        const haceGarage = servicio.garage === true || servicio.garage === 'Si' || servicio.garage === 'Sí';
        const garageTexto = haceGarage ? 'Sí hace Garage' : 'No hace Garage';
        const garageClase = haceGarage ? 'hsd-garage-si' : 'hsd-garage-no';

        return `
            <div class="home-servicio-dia">
                <div class="hsd-header">
                    <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>Servicio del Día</span>
                </div>

                <div class="hsd-info-row">
                    <span class="hsd-label">Línea:</span>
                    <span class="hsd-value">${linea ? linea.nombre : 'N/A'}</span>
                </div>
                <div class="hsd-info-row">
                    <span class="hsd-label">Terminal:</span>
                    <span class="hsd-value">${terminal ? terminal.nombre : 'N/A'}</span>
                </div>
                <div class="hsd-info-row">
                    <span class="hsd-label">Tipo de Día:</span>
                    <span class="hsd-value">${semana ? semana.tipo : 'N/A'}</span>
                </div>

                <div class="hsd-servicio-nombre">Servicio #${servicio.nombre}</div>

                <div class="hsd-garage-badge ${garageClase}">
                    <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;">
                        ${haceGarage 
                            ? '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' 
                            : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
                    </svg>
                    ${garageTexto}
                </div>

                <div class="hsd-trenes-container">
                    ${trenes.map((tren, idx) => {
                        const numTren = tren.numero || (idx + 1);
                        const labelTren = idx === 0 ? 'Primer Tren' : idx === 1 ? 'Segundo Tren' : `Tren Adicional #${numTren}`;
                        return `
                            <div class="hsd-tren">
                                <div class="hsd-tren-numero">${labelTren} #${numTren}</div>
                                <div class="hsd-tren-horarios">
                                    <div class="hsd-horario">
                                        <span class="hsd-horario-label">Salida</span>
                                        <span class="hsd-horario-valor">${tren.salida || '--:--'}</span>
                                    </div>
                                    <div class="hsd-horario">
                                        <span class="hsd-horario-label">Llegada</span>
                                        <span class="hsd-horario-valor">${tren.llegada || '--:--'}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="hsd-descanso-container">
                    <div class="hsd-descanso-titulo">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Descanso
                    </div>
                    <div class="hsd-descanso-horarios">
                        <div class="hsd-descanso-item">
                            <span class="hsd-descanso-label">Inicio</span>
                            <span class="hsd-descanso-valor">${servicio.descansoInicio || '--:--'}</span>
                        </div>
                        <div class="hsd-descanso-separador">→</div>
                        <div class="hsd-descanso-item">
                            <span class="hsd-descanso-label">Final</span>
                            <span class="hsd-descanso-valor">${servicio.descansoFinal || '--:--'}</span>
                        </div>
                    </div>
                    
                    <div class="hsd-reloj-container" id="hsdRelojContainer">
                        <div class="hsd-reloj-tiempo" id="hsdRelojTiempo">--:--:--</div>
                        <div class="hsd-reloj-etiqueta" id="hsdRelojEtiqueta">Calculando...</div>
                    </div>

                    <button class="btn-atraso-home" id="btnAgregarAtrasoHome">
                        <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
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
        
        const semanaTipo = semanas.find(s => 
            s.lineaId === rol.lineaId && 
            s.tipo === tipoDia
        );
        
        if (!semanaTipo) return null;
        
        const servicio = servicios.find(s => 
            s.nombre === numeroServicio && 
            s.lineaId === rol.lineaId && 
            s.semanaId === semanaTipo.id
        );
        
        if (servicio) {
            const lineas = DB.load('lineas');
            const terminales = DB.load('terminales');
            const semanas = DB.load('semanas');
            return {
                servicio,
                linea: lineas.find(l => l.id === servicio.lineaId),
                terminal: terminales.find(t => t.id === servicio.terminalId),
                semana: semanas.find(s => s.id === servicio.semanaId)
            };
        }
        
        return null;
    },

    init() {
        this.minutosAtraso = 0;

        // Evento para cambiar foto de perfil
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
                    // Validar tipo de archivo
                    const tiposValidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
                    if (!tiposValidos.includes(file.type)) {
                        App.showToast('Formato no válido. Usa JPG, PNG o WebP');
                        return;
                    }

                    // Validar tamaño (máximo 5MB antes de procesar)
                    if (file.size > 5 * 1024 * 1024) {
                        App.showToast('La imagen es muy grande. Máximo 5MB');
                        return;
                    }

                    try {
                        App.showToast('Procesando imagen...');
                        
                        // Procesar imagen: recortar y redimensionar
                        const imagenBase64 = await this.procesarImagen(file);
                        
                        // Guardar en localStorage
                        DB.set('imagenPerfil', imagenBase64);
                        
                        // Actualizar la imagen en la UI
                        const imgExistente = welcomeIcon.querySelector('.perfil-imagen');
                        if (imgExistente) {
                            imgExistente.src = imagenBase64;
                        } else {
                            welcomeIcon.innerHTML = `
                                <img src="${imagenBase64}" alt="Perfil" class="perfil-imagen">
                                <button class="btn-cambiar-foto" id="btnCambiarFoto" title="Cambiar foto">
                                    <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                </button>
                                <input type="file" id="inputFotoPerfil" accept="image/png, image/jpeg, image/jpg, image/webp" style="display:none;">
                            `;
                            
                            // Reasignar eventos
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
                                        const imgExistente = welcomeIcon.querySelector('.perfil-imagen');
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

        const servicioEl = document.querySelector('.home-servicio-dia');
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
                        let tipoDia = 'Laboral';
                        if (hoy.getDay() === 0) tipoDia = 'Domingo/Festivos';
                        else if (hoy.getDay() === 6) tipoDia = 'Sábado';

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

            const relojTiempo = document.getElementById('hsdRelojTiempo');
            const relojEtiqueta = document.getElementById('hsdRelojEtiqueta');

            if (!relojTiempo || !relojEtiqueta) return;

            if (horaActual < minutosInicio) {
                const diff = minutosInicio - horaActual;
                const horas = Math.floor(diff / 60);
                const mins = diff % 60;
                relojTiempo.textContent = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(60 - segundosActuales).padStart(2, '0')}`;
                relojEtiqueta.textContent = 'Tiempo para iniciar descanso';
                relojTiempo.className = 'hsd-reloj-tiempo hsd-reloj-espera';
            } else if (horaActual >= minutosInicio && horaActual < minutosFinalAjustado) {
                const diff = minutosFinalAjustado - horaActual;
                const horas = Math.floor(diff / 60);
                const mins = diff % 60;
                const segs = 60 - segundosActuales;
                relojTiempo.textContent = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
                relojEtiqueta.textContent = minutosAtraso > 0 
                    ? `Tiempo restante (con +${minutosAtraso} min de atraso)` 
                    : 'Tiempo restante de descanso';
                relojTiempo.className = 'hsd-reloj-tiempo hsd-reloj-activo';
            } else {
                const diff = horaActual - minutosFinalAjustado;
                const horas = Math.floor(diff / 60);
                const mins = diff % 60;
                relojTiempo.textContent = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(segundosActuales).padStart(2, '0')}`;
                relojEtiqueta.textContent = 'Descanso finalizado';
                relojTiempo.className = 'hsd-reloj-tiempo hsd-reloj-terminado';
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
            let badge = container.querySelector('.hsd-atraso-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'hsd-atraso-badge';
                container.appendChild(badge);
            }
            badge.textContent = `+${this.minutosAtraso} min atraso`;
        }
    }
};

export default Home;