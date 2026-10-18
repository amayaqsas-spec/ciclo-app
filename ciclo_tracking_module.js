// ============================================
// CICLO_TRACKING_MODULE.JS - Seguimiento por Carreras con Botón Omitir
// ============================================

const CicloTracking = {
    DWELL_TIME_MS: 166000,
    RECOVERY_THRESHOLD_MIN: 82.5,
    POST_SHIFT_TOLERANCE_MS: 85 * 60 * 1000,
    STORAGE_KEY: 'ciclo_tracking_state_v10',

    state: {
        turnoId: null,
        lastDelayMin: 0,
        currentTrenIndex: 0,
        currentCarrera: 1,
        carrerasCompletadas: {},
        llegadasRegistradas: {},
        expirationTime: null,
        isTracking: false,
        turnoFinalizado: false
    },

    intervalId: null,
    blinkInterval: null,
    servicioData: null,

    formatMinutos(minutos) {
        const totalMin = Math.floor(minutos);
        const horas = Math.floor(totalMin / 60);
        const mins = totalMin % 60;
        
        if (horas > 0) {
            return `${horas}:${String(mins).padStart(2, '0')}`;
        }
        return `0:${String(mins).padStart(2, '0')}`;
    },

    async init() {
        console.log('🛰️ [CicloTracking] Inicializando...');
        
        const container = document.getElementById('skeServicioDiaContainer');
        if (!container) {
            console.error('❌ [CicloTracking] Contenedor #skeServicioDiaContainer NO encontrado');
            return;
        }
        console.log('✅ [CicloTracking] Contenedor encontrado');

        this.extractServiceData();
        
        if (!this.servicioData) {
            console.error('❌ [CicloTracking] No se encontró servicio');
            console.log('🔍 userLineaId:', DB.get('userLineaId'));
            console.log(' userNumeroRol:', DB.get('userNumeroRol'));
            console.log('🔍 servicios:', DB.load('servicios').length);
            console.log('🔍 rolesSemanal:', DB.load('rolesSemanal').length);
            console.log('🔍 semanas:', DB.load('semanas').length);
            return;
        }
        
        console.log('✅ [CicloTracking] Servicio encontrado:', this.servicioData.nombre);
        console.log('🔍 [CicloTracking] Trenes:', this.servicioData.trenes.length);

        this.loadState();
        this.checkExpiration();

        if (!this.state.expirationTime) {
            this.calculateExpiration();
        }

        this.renderTrackingPanel();
        console.log('✅ [CicloTracking] Panel renderizado');

        this.startRealTimeTracking();
        console.log('✅ [CicloTracking] Activo');
    },

    extractServiceData() {
        const userLineaId = DB.get('userLineaId');
        const userNumeroRol = DB.get('userNumeroRol');
        const rolesSemanal = DB.load('rolesSemanal');
        const servicios = DB.load('servicios');
        const semanas = DB.load('semanas');

        const tiempoExtraActivo = DB.get('tiempoExtraActivo', false);
        const servicioExtraGuardado = DB.get('servicioTiempoExtra', null);

        if (tiempoExtraActivo && servicioExtraGuardado) {
            const servicio = servicios.find(s => 
                String(s.nombre).trim() === String(servicioExtraGuardado.servicioId).trim() &&
                s.lineaId === userLineaId
            );

            if (servicio && servicio.trenes && servicio.trenes.length > 0) {
                this.servicioData = servicio;
                this.state.turnoId = `tiempo_extra_${servicio.nombre}_${this.getFechaLocal(new Date())}`;
                return;
            }
        }

        if (!userNumeroRol || !rolesSemanal.length) return;

        const miRol = rolesSemanal.find(r => String(r.numeroRol) === String(userNumeroRol) && r.lineaId === userLineaId);
        if (!miRol) return;

        const FECHA_INICIO = new Date(2026, 9, 11);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        FECHA_INICIO.setHours(0, 0, 0, 0);
        
        const diferenciaDias = Math.floor((hoy - FECHA_INICIO) / (1000 * 60 * 60 * 24));
        const semanasTranscurridas = Math.floor(diferenciaDias / 7);
        const semanaActualNum = (semanasTranscurridas % 5) + 1;

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaNombre = diasSemana[hoy.getDay()];

        const semanaData = miRol.semanas.find(s => s.numero === semanaActualNum);
        if (!semanaData || !semanaData.dias || !semanaData.dias[diaNombre]) return;

        const posicionHoy = semanaData.dias[diaNombre].posicion;
        if (!posicionHoy) return;

        const normalizar = (texto) => {
            if (!texto) return '';
            return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '').trim();
        };

        const diaSemana = hoy.getDay();
        let tipoEsperado = 'Laboral';
        if (diaSemana === 0) tipoEsperado = 'Domingo/Festivos';
        else if (diaSemana === 6) tipoEsperado = 'Sábado';

        const tipoDiaConfig = semanas.find(s => 
            normalizar(s.tipo) === normalizar(tipoEsperado) && s.lineaId === userLineaId
        );
        if (!tipoDiaConfig) return;

        const servicio = servicios.find(s => 
            String(s.nombre).trim() === String(posicionHoy).trim() &&
            s.lineaId === userLineaId &&
            s.semanaId === tipoDiaConfig.id
        );

        if (servicio && servicio.trenes && servicio.trenes.length > 0) {
            this.servicioData = servicio;
            this.state.turnoId = `turno_${servicio.nombre}_${this.getFechaLocal(new Date())}`;
        }
    },

    getFechaLocal(fecha) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    calcularCarreras(tren) {
        const [hSalida, mSalida] = (tren.salida || '00:00').split(':').map(Number);
        const [hLlegada, mLlegada] = (tren.llegada || '00:00').split(':').map(Number);
        const vueltas = tren.vueltas || 1;

        const salidaMinutos = hSalida * 60 + mSalida;
        let llegadaMinutos = hLlegada * 60 + mLlegada;
        if (llegadaMinutos < salidaMinutos) llegadaMinutos += 24 * 60;

        const duracionTotalMinutos = llegadaMinutos - salidaMinutos;
        const totalCarreras = vueltas * 2;
        const tiempoEspera = 3;
        const totalEspera = tiempoEspera * (totalCarreras - 1);
        const tiempoViajeReal = duracionTotalMinutos - totalEspera;
        const duracionPorCarrera = tiempoViajeReal / totalCarreras;

        const carreras = [];
        let tiempoActual = salidaMinutos;

        for (let i = 1; i <= totalCarreras; i++) {
            const esIda = i % 2 === 1;
            const direccion = esIda ? 'Origen → Destino' : 'Destino → Origen';
            const numeroVuelta = Math.ceil(i / 2);
            const tipoCarrera = esIda ? 'Ida' : 'Vuelta';

            const horaSalidaCarrera = tiempoActual;
            const horaLlegadaCarrera = tiempoActual + duracionPorCarrera;

            const hSal = Math.floor(horaSalidaCarrera / 60) % 24;
            const mSal = Math.floor(horaSalidaCarrera % 60);
            const hLleg = Math.floor(horaLlegadaCarrera / 60) % 24;
            const mLleg = Math.floor(horaLlegadaCarrera % 60);

            carreras.push({
                numero: i,
                numeroVuelta: numeroVuelta,
                tipo: tipoCarrera,
                direccion: direccion,
                horaSalida: `${String(hSal).padStart(2, '0')}:${String(mSal).padStart(2, '0')}`,
                horaLlegada: `${String(hLleg).padStart(2, '0')}:${String(mLleg).padStart(2, '0')}`,
                esIda: esIda
            });

            if (i < totalCarreras) {
                tiempoActual = horaLlegadaCarrera + tiempoEspera;
            }
        }

        return carreras;
    },

    loadState() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.turnoId === this.state.turnoId) {
                    this.state.lastDelayMin = parsed.lastDelayMin || 0;
                    this.state.currentTrenIndex = parsed.currentTrenIndex || 0;
                    this.state.currentCarrera = parsed.currentCarrera || 1;
                    this.state.carrerasCompletadas = parsed.carrerasCompletadas || {};
                    this.state.llegadasRegistradas = parsed.llegadasRegistradas || {};
                    this.state.expirationTime = parsed.expirationTime || null;
                    this.state.turnoFinalizado = parsed.turnoFinalizado || false;
                    this.state.isTracking = true;
                }
            }
        } catch (e) {
            console.error('❌ Error al cargar estado:', e);
        }
    },

    saveState() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('❌ Error al guardar:', e);
        }
    },

    calculateExpiration() {
        const trenes = this.servicioData.trenes;
        const ultimoTren = trenes[trenes.length - 1];
        const [hLlegada, mLlegada] = (ultimoTren.llegada || '23:59').split(':').map(Number);
        const ahora = new Date();
        const llegadaFinal = new Date(ahora);
        llegadaFinal.setHours(hLlegada, mLlegada, 0, 0);
        if (llegadaFinal < ahora) llegadaFinal.setDate(llegadaFinal.getDate() + 1);
        
        this.state.expirationTime = llegadaFinal.getTime() + this.POST_SHIFT_TOLERANCE_MS;
        this.saveState();
    },

    checkExpiration() {
        const now = Date.now();
        if (this.state.expirationTime && now > this.state.expirationTime) {
            if (!this.state.turnoFinalizado) {
                this.state.turnoFinalizado = true;
                this.saveState();
                this.renderTrackingPanel();
            }
        }
    },

    resetState() {
        this.state = {
            turnoId: this.state.turnoId || `turno_${Date.now()}`,
            lastDelayMin: 0,
            currentTrenIndex: 0,
            currentCarrera: 1,
            carrerasCompletadas: {},
            llegadasRegistradas: {},
            expirationTime: null,
            isTracking: false,
            turnoFinalizado: false
        };
        localStorage.removeItem(this.STORAGE_KEY);
        this.renderTrackingPanel();
    },

    resetCarrera(carreraKey) {
        const [trenIdxStr, carreraNumStr] = carreraKey.split('_');
        const carreraNum = parseInt(carreraNumStr);

        delete this.state.llegadasRegistradas[carreraKey];
        delete this.state.carrerasCompletadas[carreraKey];

        this.state.currentTrenIndex = parseInt(trenIdxStr);
        this.state.currentCarrera = carreraNum;

        this.saveState();
        this.renderTrackingPanel();

        App.showToast(`↺ Carrera ${carreraNum} desmarcada`);
    },

    // ✅ NUEVA FUNCIÓN: Omitir carrera (sin registrar atraso)
    omitirCarrera(carreraKey, carreraNum) {
        console.log('⏭️ [Omitir] Carrera:', carreraNum);
        
        const ahora = new Date();
        const horaReal = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

        // ✅ Marcar como omitida con atraso = 0
        this.state.llegadasRegistradas[carreraKey] = {
            horaReal: horaReal,
            atraso: 0,
            omitida: true, // ✅ Marcador especial
            timestamp: ahora.getTime()
        };

        this.state.carrerasCompletadas[carreraKey] = {
            hora: horaReal,
            atraso: 0,
            omitida: true,
            timestamp: ahora.getTime()
        };

        // ✅ Avanzar al siguiente tren si es la última carrera
        if (carreraNum === this.state.currentCarrera) {
            this.state.currentCarrera = carreraNum + 1;
            
            const tren = this.servicioData.trenes[this.state.currentTrenIndex];
            const vueltas = tren.vueltas || 1;
            const totalCarreras = vueltas * 2;
            
            if (this.state.currentCarrera > totalCarreras) {
                this.state.currentTrenIndex++;
                this.state.currentCarrera = 1;
            }
        }

        this.saveState();
        this.renderTrackingPanel();

        App.showToast(`️ Carrera ${carreraNum} omitida`);
    },

    marcarLlegadaCarrera(carreraKey, carreraNum, horaLlegadaTeorica) {
        console.log(' [Marcar] Carrera:', carreraNum, 'Hora teórica:', horaLlegadaTeorica);
        
        const ahora = new Date();
        const horaReal = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
        
        const [hTeorica, mTeorica] = horaLlegadaTeorica.split(':').map(Number);
        const llegadaTeorica = new Date(ahora);
        llegadaTeorica.setHours(hTeorica, mTeorica, 0, 0);

        const minutosAtraso = Math.max(0, Math.floor((ahora - llegadaTeorica) / (1000 * 60)));

        console.log('⏱️ [Marcar] Hora real:', horaReal, 'Atraso:', minutosAtraso, 'min');

        this.state.lastDelayMin = minutosAtraso;

        this.state.llegadasRegistradas[carreraKey] = {
            horaReal: horaReal,
            atraso: minutosAtraso,
            timestamp: ahora.getTime()
        };

        this.state.carrerasCompletadas[carreraKey] = {
            hora: horaReal,
            atraso: minutosAtraso,
            timestamp: ahora.getTime()
        };

        if (carreraNum === this.state.currentCarrera) {
            this.state.currentCarrera = carreraNum + 1;
            
            const tren = this.servicioData.trenes[this.state.currentTrenIndex];
            const vueltas = tren.vueltas || 1;
            const totalCarreras = vueltas * 2;
            
            if (this.state.currentCarrera > totalCarreras) {
                this.state.currentTrenIndex++;
                this.state.currentCarrera = 1;
            }
        }

        this.saveState();
        this.renderTrackingPanel();

        if (minutosAtraso >= 60) {
            this.startBlinking();
        } else {
            this.stopBlinking();
        }

        if (minutosAtraso > 0) {
            App.showToast(`⚠️ Carrera ${carreraNum}: +${this.formatMinutos(minutosAtraso)} de atraso`);
        } else {
            App.showToast(`✅ Carrera ${carreraNum}: A tiempo`);
        }
    },

    startBlinking() {
        if (this.blinkInterval) return;
        
        let visible = true;
        this.blinkInterval = setInterval(() => {
            const atrasoElement = document.getElementById('ct-atraso-total');
            const margenElement = document.getElementById('ct-margen-restante');
            
            if (atrasoElement && margenElement) {
                if (visible) {
                    atrasoElement.style.color = '#c62828';
                    atrasoElement.style.textShadow = '0 0 10px rgba(198, 40, 40, 0.5)';
                    margenElement.style.color = '#c62828';
                    margenElement.style.textShadow = '0 0 10px rgba(198, 40, 40, 0.5)';
                } else {
                    atrasoElement.style.color = 'var(--text)';
                    atrasoElement.style.textShadow = 'none';
                    margenElement.style.color = 'var(--primary)';
                    margenElement.style.textShadow = 'none';
                }
                visible = !visible;
            }
        }, 500);
    },

    stopBlinking() {
        if (this.blinkInterval) {
            clearInterval(this.blinkInterval);
            this.blinkInterval = null;
            
            const atrasoElement = document.getElementById('ct-atraso-total');
            const margenElement = document.getElementById('ct-margen-restante');
            
            if (atrasoElement) {
                atrasoElement.style.color = 'var(--text)';
                atrasoElement.style.textShadow = 'none';
            }
            if (margenElement) {
                margenElement.style.color = 'var(--primary)';
                margenElement.style.textShadow = 'none';
            }
        }
    },

    renderTrackingPanel() {
        const container = document.getElementById('skeServicioDiaContainer');
        if (!container || !this.servicioData) return;

        const panelAnterior = document.getElementById('ct-tracking-panel');
        if (panelAnterior) panelAnterior.remove();

        const panel = document.createElement('div');
        panel.id = 'ct-tracking-panel';
        panel.style.cssText = `
            margin-top: 20px;
            background: var(--surface);
            padding: 20px;
            border-radius: 16px;
            box-shadow: var(--clay-shadow-sm);
            border-top: 4px solid var(--primary);
        `;

        const trenes = this.servicioData.trenes;
        const now = Date.now();
        const turnoExpirado = this.state.expirationTime && now > this.state.expirationTime;

        if (turnoExpirado) {
            const esUmbralAlcanzado = this.state.lastDelayMin >= this.RECOVERY_THRESHOLD_MIN;
            
            let resumenHtml = `
                <h3 style="margin: 0 0 16px 0; font-size: 18px; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                    ✅ Servicio Finalizado
                </h3>
                <div style="margin-top: 16px; padding: 16px; background: var(--bg-soft); border-radius: 12px; border-left: 4px solid ${esUmbralAlcanzado ? 'var(--accent)' : 'var(--primary)'};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="margin: 0; font-size: 14px; color: var(--text); font-weight: 700;">⏱️ Último Atraso Registrado</h4>
                        <span style="background: ${esUmbralAlcanzado ? 'var(--accent)' : '#4CAF50'}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;">
                            ${esUmbralAlcanzado ? 'UMBRAL ALCANZADO' : 'DENTRO DEL MÁXIMO'}
                        </span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div style="background: var(--surface); padding: 10px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--text-soft);">Último Atraso</div>
                            <div style="font-size: 22px; font-weight: 800; color: ${esUmbralAlcanzado ? 'var(--accent)' : 'var(--text)'};">
                                ${this.formatMinutos(this.state.lastDelayMin)}
                            </div>
                        </div>
                        <div style="background: var(--surface); padding: 10px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--text-soft);">Margen Restante</div>
                            <div style="font-size: 22px; font-weight: 800; color: var(--primary);">
                                ${this.formatMinutos(Math.max(0, this.RECOVERY_THRESHOLD_MIN - this.state.lastDelayMin))}
                            </div>
                        </div>
                    </div>
                    ${esUmbralAlcanzado ? `
                        <div style="background: rgba(255, 152, 0, 0.1); border: 1px solid var(--accent); color: var(--accent); padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 600; text-align: center;">
                            ️ Se alcanzó el tiempo equivalente a un ciclo completo de regulación operacional.
                        </div>
                    ` : `
                        <div style="background: rgba(76, 175, 80, 0.1); border: 1px solid #4CAF50; color: #4CAF50; padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 600; text-align: center;">
                            ✅ Servicio completado dentro del margen operativo permitido.
                        </div>
                    `}
                </div>
            `;
            
            panel.innerHTML = resumenHtml;
            container.parentNode.insertBefore(panel, container.nextSibling);
            return;
        }

        const esTiempoExtra = DB.get('tiempoExtraActivo', false);
        
        let html = `
            <h3 style="margin: 0 0 16px 0; font-size: 18px; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                ${esTiempoExtra ? '️' : '🚂'} Seguimiento de Carreras${esTiempoExtra ? ' (Tiempo Extra)' : ''}
            </h3>
        `;

        trenes.forEach((tren, trenIdx) => {
            const vueltas = tren.vueltas || 1;
            const totalCarreras = vueltas * 2;
            const numTren = tren.numero || (trenIdx + 1);
            const labelTren = trenIdx === 0 ? 'Primer Tren' : trenIdx === 1 ? 'Segundo Tren' : `Tren #${numTren}`;
            const esTrenActivo = trenIdx === this.state.currentTrenIndex;
            const esTrenCompletado = trenIdx < this.state.currentTrenIndex;

            html += `
                <div class="ct-tren-card" data-tren-index="${trenIdx}" style="
                    margin-bottom: 16px;
                    padding: 16px;
                    background: var(--bg-soft);
                    border-radius: 12px;
                    border-left: 4px solid ${esTrenCompletado ? '#4CAF50' : esTrenActivo ? 'var(--primary)' : 'var(--bg-soft)'};
                    opacity: ${esTrenCompletado ? '0.7' : '1'};
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="margin: 0; font-size: 16px; color: var(--night-blue, var(--primary)); font-weight: 700;">
                            ${esTrenCompletado ? '✓ ' : ''}${labelTren} #${numTren}
                        </h4>
                        ${tren.garage ? '<span style="background: #4CAF50; color: white; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 700;">GARAGE</span>' : ''}
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                        <div style="text-align: center; background: var(--surface); padding: 8px; border-radius: 8px;">
                            <div style="font-size: 10px; color: var(--text-soft);">Salida</div>
                            <div style="font-size: 16px; font-weight: 800; color: var(--night-blue, var(--text));">${tren.salida || '--:--'}</div>
                        </div>
                        <div style="text-align: center; background: var(--surface); padding: 8px; border-radius: 8px;">
                            <div style="font-size: 10px; color: var(--text-soft);">Llegada</div>
                            <div style="font-size: 16px; font-weight: 800; color: var(--night-blue, var(--text));">${tren.llegada || '--:--'}</div>
                        </div>
                        <div style="text-align: center; background: var(--surface); padding: 8px; border-radius: 8px;">
                            <div style="font-size: 10px; color: var(--text-soft);">Carreras</div>
                            <div style="font-size: 16px; font-weight: 800; color: var(--night-blue, var(--text));">${totalCarreras}</div>
                        </div>
                    </div>
            `;

            if (esTrenActivo || esTrenCompletado) {
                const carreras = this.calcularCarreras(tren);
                
                html += `<div style="margin-bottom: 12px;">
                    <div style="font-size: 12px; font-weight: 700; color: var(--text-soft); margin-bottom: 8px;">📋 Desglose de Carreras:</div>`;

                carreras.forEach((carrera) => {
                    const carreraKey = `${trenIdx}_${carrera.numero}`;
                    const estaCompletada = this.state.carrerasCompletadas[carreraKey];
                    const llegadaInfo = this.state.llegadasRegistradas[carreraKey];
                    const esOmitida = llegadaInfo && llegadaInfo.omitida;

                    html += `
                        <div class="ct-carrera-card" data-carrera-key="${carreraKey}" style="
                            margin-bottom: 10px;
                            padding: 12px;
                            background: ${esOmitida ? '#9E9E9E' : estaCompletada ? 'var(--primary)' : 'var(--surface)'};
                            border-radius: 10px;
                            border: 2px solid ${esOmitida ? '#9E9E9E' : estaCompletada ? 'var(--primary)' : 'var(--bg-soft)'};
                        ">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                <div style="flex: 1;">
                                    <div style="font-size: 14px; font-weight: 700; color: ${estaCompletada ? 'white' : 'var(--text)'};">
                                        ${esOmitida ? '⏭️ ' : estaCompletada ? '✓ ' : ' '}Carrera ${carrera.numero} - ${carrera.tipo}
                                    </div>
                                    <div style="font-size: 11px; color: ${estaCompletada ? 'rgba(255,255,255,0.8)' : 'var(--text-soft)'};">
                                        ${carrera.direccion}
                                    </div>
                                    <div style="font-size: 10px; color: ${estaCompletada ? 'rgba(255,255,255,0.6)' : 'var(--text-light)'}; margin-top: 2px;">
                                        Salida: ${carrera.horaSalida}
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 10px; color: ${estaCompletada ? 'rgba(255,255,255,0.8)' : 'var(--text-soft)'};">Llegada aprox.</div>
                                    <div style="font-size: 18px; font-weight: 800; color: ${estaCompletada ? 'white' : 'var(--night-blue, var(--text))'};">
                                        ${carrera.horaLlegada}
                                    </div>
                                </div>
                            </div>
                            
                            ${!estaCompletada && esTrenActivo ? `
                                <div style="display: flex; gap: 8px; margin-top: 8px;">
                                    <button onclick="CicloTracking.marcarLlegadaCarrera('${carreraKey}', ${carrera.numero}, '${carrera.horaLlegada}')" style="
                                        flex: 2;
                                        padding: 10px;
                                        background: #FF9800;
                                        color: white;
                                        border: none;
                                        border-radius: 8px;
                                        font-size: 13px;
                                        font-weight: 700;
                                        cursor: pointer;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        gap: 6px;
                                        box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
                                        -webkit-tap-highlight-color: transparent;
                                        touch-action: manipulation;
                                    ">
                                        📍 Marcar Llegada
                                    </button>
                                    <button onclick="if(confirm('¿Omitir registro de esta carrera?')) CicloTracking.omitirCarrera('${carreraKey}', ${carrera.numero})" style="
                                        flex: 1;
                                        padding: 10px;
                                        background: #757575;
                                        color: white;
                                        border: none;
                                        border-radius: 8px;
                                        font-size: 13px;
                                        font-weight: 700;
                                        cursor: pointer;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        gap: 4px;
                                        -webkit-tap-highlight-color: transparent;
                                        touch-action: manipulation;
                                    ">
                                        ⏭️ Omitir
                                    </button>
                                </div>
                            ` : ''}
                            
                            ${llegadaInfo ? `
                                <div style="margin-top: 8px; padding: 8px; background: ${esOmitida ? 'rgba(158,158,158,0.2)' : llegadaInfo.atraso > 0 ? 'rgba(255,152,0,0.2)' : 'rgba(76,175,80,0.2)'}; border-radius: 6px; border-left: 3px solid ${esOmitida ? '#9E9E9E' : llegadaInfo.atraso > 0 ? '#FF9800' : '#4CAF50'};">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div style="flex: 1;">
                                            <div style="font-size: 12px; font-weight: 700; color: ${esOmitida ? '#9E9E9E' : llegadaInfo.atraso > 0 ? '#FF9800' : '#4CAF50'};">
                                                ${esOmitida ? '️ Omitida' : llegadaInfo.atraso > 0 ? `⚠️ +${this.formatMinutos(llegadaInfo.atraso)} atraso` : '✓ A tiempo'}
                                            </div>
                                            <div style="font-size: 10px; color: var(--text-soft); margin-top: 2px;">
                                                ${esOmitida ? 'Sin registro de hora' : `Registrada: ${llegadaInfo.horaReal} (Teórica: ${carrera.horaLlegada})`}
                                            </div>
                                        </div>
                                        ${esTrenActivo ? `
                                            <button onclick="CicloTracking.resetCarrera('${carreraKey}')" title="Desmarcar" style="
                                                background: rgba(255,255,255,0.3);
                                                border: none;
                                                border-radius: 6px;
                                                width: 32px;
                                                height: 32px;
                                                cursor: pointer;
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                                font-size: 16px;
                                                margin-left: 8px;
                                                color: white;
                                                -webkit-tap-highlight-color: transparent;
                                                touch-action: manipulation;
                                            " onmouseover="this.style.background='rgba(255,255,255,0.5)'" onmouseout="this.style.background='rgba(255,255,255,0.3)'">
                                                ↺
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                });

                html += `</div>`;
            } else {
                html += `<div style="text-align: center; padding: 10px; color: var(--text-soft); font-size: 12px; font-style: italic;">⏳ Pendiente</div>`;
            }

            html += `</div>`;
        });

        const esUmbralAlcanzado = this.state.lastDelayMin >= this.RECOVERY_THRESHOLD_MIN;
        const margenRestante = Math.max(0, this.RECOVERY_THRESHOLD_MIN - this.state.lastDelayMin);
        const necesitaParpadeo = this.state.lastDelayMin >= 60;

        html += `
            <div style="margin-top: 16px; padding: 16px; background: var(--bg-soft); border-radius: 12px; border-left: 4px solid ${esUmbralAlcanzado ? 'var(--accent)' : 'var(--primary)'};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="margin: 0; font-size: 14px; color: var(--text); font-weight: 700;">⏱️ Atraso del Servicio</h4>
                    <span style="background: ${esUmbralAlcanzado ? 'var(--accent)' : 'var(--primary)'}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;">
                        ${esUmbralAlcanzado ? 'UMBRAL ALCANZADO' : 'EN SEGUIMIENTO'}
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div style="background: var(--surface); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: var(--text-soft);">Atraso en Linea</div>
                        <div id="ct-atraso-total" style="font-size: 22px; font-weight: 800; color: ${esUmbralAlcanzado ? 'var(--accent)' : 'var(--text)'};">
                            ${this.formatMinutos(this.state.lastDelayMin)}
                        </div>
                    </div>
                    <div style="background: var(--surface); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: var(--text-soft);">Margen Restante</div>
                        <div id="ct-margen-restante" style="font-size: 22px; font-weight: 800; color: var(--primary);">${this.formatMinutos(margenRestante)}</div>
                    </div>
                </div>
                ${esUmbralAlcanzado ? `
                    <div style="background: rgba(255, 152, 0, 0.1); border: 1px solid var(--accent); color: var(--accent); padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 600; text-align: center;">
                        ⚙️ Se ha alcanzado el tiempo equivalente a un ciclo completo de regulación operacional.
                    </div>
                ` : ''}
                ${necesitaParpadeo && !esUmbralAlcanzado ? `
                    <div style="background: rgba(198, 40, 40, 0.1); border: 1px solid #c62828; color: #c62828; padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 600; text-align: center;">
                        ⚠️ Atraso de 1 hora o más - Se aproxima la pérdida de una vuelta
                    </div>
                ` : ''}
            </div>
        `;

        panel.innerHTML = html;
        container.parentNode.insertBefore(panel, container.nextSibling);

        if (necesitaParpadeo) {
            this.startBlinking();
        } else {
            this.stopBlinking();
        }
    },

    startRealTimeTracking() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
            this.checkExpiration();
        }, 30000);
    },

    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.stopBlinking();
        const panel = document.getElementById('ct-tracking-panel');
        if (panel) panel.remove();
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CicloTracking;
} else {
    window.CicloTracking = CicloTracking;
}
