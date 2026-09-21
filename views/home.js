// ============================================
// HOME.JS - Módulo de Inicio con botón Festivo
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

    // ✅ Verificar si hoy está marcado como festivo
    esHoyFestivo() {
        const festivoData = DB.get('diaFestivo', null);
        if (!festivoData) return false;
        
        const hoy = this.getFechaLocal(new Date());
        return festivoData.fecha === hoy && festivoData.esFestivo === true;
    },

    // ✅ Marcar/desmarcar hoy como festivo
    toggleFestivo() {
        const hoy = this.getFechaLocal(new Date());
        const festivoData = DB.get('diaFestivo', null);
        
        let nuevoEstado = false;
        
        if (festivoData && festivoData.fecha === hoy) {
            // Si ya está marcado, desmarcar
            nuevoEstado = !festivoData.esFestivo;
        }
        
        DB.set('diaFestivo', {
            fecha: hoy,
            esFestivo: nuevoEstado
        });
        
        // Recargar la vista para aplicar cambios
        Views.load('home');
        
        App.showToast(nuevoEstado ? '🎉 Día marcado como festivo' : '✅ Día laboral normal');
    },

    render() {
        const defaultName = Auth.currentUser ? Auth.getUserName(Auth.currentUser) : 'Usuario';
        const name = DB.get('userName', defaultName);

        const roles = DB.load('roles');
        let semanaActual = null;
        let datoDiaActual = null;
        let infoServicio = null;
        let tipoDiaActual = '';
        let esFestivo = this.esHoyFestivo();

        if (roles.length > 0) {
            const rol = roles.sort((a, b) => b.createdAt - a.createdAt)[0];
            const hoy = new Date();
            const hoyStr = this.getFechaLocal(hoy);
            
            semanaActual = rol.semanas.find(semana => hoyStr >= semana.fechaInicio && hoyStr <= semana.fechaFin);
            
            if (semanaActual) {
                const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                const diaIdx = hoy.getDay();
                const diaNombre = diasSemana[diaIdx];
                const dia = semanaActual.dias.find(d => d.dia === diaNombre);
                
                if (dia && dia.dato) {
                    // ✅ Determinar tipo de día
                    tipoDiaActual = 'Laboral';
                    if (diaIdx === 0) {
                        tipoDiaActual = 'Domingo/Festivos';
                    } else if (diaIdx === 6) {
                        tipoDiaActual = 'Sábado';
                    }
                    
                    // ✅ Si está marcado como festivo, usar Domingo/Festivos
                    if (esFestivo) {
                        tipoDiaActual = 'Domingo/Festivos';
                    }

                    datoDiaActual = dia.dato;
                    
                    // ✅ Buscar servicio según tipo de día
                    infoServicio = this.buscarServicioPorTipo(rol, tipoDiaActual, datoDiaActual);
                }
            }
        }

        const tiempoExtraPendiente = DB.load('tiempoExtra').filter(t => !t.cobrado);

        return `
            <div class="view active">
                <div class="welcome-card">
                    <div class="welcome-icon">
                        <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
                                <div class="badge-item ${esFestivo ? 'badge-festivo' : ''}">
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

                ${infoServicio ? this.renderServicioDia(infoServicio, esFestivo) : ''}

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

    renderServicioDia(info, esFestivo) {
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
                    <span class="hsd-value">${semana ? semana.tipo : 'N/A'} ${esFestivo ? '🎉' : ''}</span>
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

                <!-- ✅ BOTÓN MARCAR FESTIVO -->
                <button class="btn-festivo ${esFestivo ? 'btn-festivo-activo' : ''}" id="btnToggleFestivo">
                    <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;">
                        ${esFestivo 
                            ? '<path d="M20 6L9 17l-5-5"/><circle cx="12" cy="12" r="10"/>' 
                            : '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>'}
                    </svg>
                    <span>${esFestivo ? 'Día Festivo (clic para quitar)' : 'Marcar como Festivo'}</span>
                </button>
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

        // ✅ Evento del botón festivo
        const btnFestivo = document.getElementById('btnToggleFestivo');
        if (btnFestivo) {
            btnFestivo.addEventListener('click', () => this.toggleFestivo());
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
                        
                        const esFestivo = this.esHoyFestivo();
                        if (esFestivo) tipoDia = 'Domingo/Festivos';

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