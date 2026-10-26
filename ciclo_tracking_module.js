// ============================================
// CICLO_TRACKING_MODULE.JS - Seguimiento por Carreras con Hora Teórica Proporcional y Redondeo
// ============================================

const CicloTracking = {
    DWELL_TIME_MS: 166000,
    RECOVERY_THRESHOLD_MIN: 82.5,
    POST_SHIFT_TOLERANCE_MS: 85 * 60 * 1000,
    STORAGE_KEY: 'ciclo_tracking_state_v13',

    ESTACIONES: {
        norte_sur: [
            'Cuatro Caminos', 'Panteones', 'Tacuba', 'Cuitláhuac',
            'Popotla', 'Colegio Militar', 'Normal', 'San Cosme',
            'Revolución', 'Hidalgo', 'Bellas Artes', 'Allende',
            'Zócalo/Tenochtitlan', 'Pino Suárez', 'San Antonio Abad',
            'Chabacano', 'Viaducto', 'Xola', 'Villa de Cortés',
            'Nativitas', 'Portales', 'Ermita', 'General Anaya', 'Tasqueña'
        ],
        sur_norte: [
            'Tasqueña', 'General Anaya', 'Ermita', 'Portales',
            'Nativitas', 'Villa de Cortés', 'Xola', 'Viaducto',
            'Chabacano', 'San Antonio Abad', 'Pino Suárez', 'Zócalo/Tenochtitlan',
            'Allende', 'Bellas Artes', 'Hidalgo', 'Revolución',
            'San Cosme', 'Normal', 'Colegio Militar', 'Popotla',
            'Cuitláhuac', 'Tacuba', 'Panteones', 'Cuatro Caminos'
        ]
    },

    ESTACIONES_ESPECIALES: ['Hidalgo', 'Bellas Artes', 'Zócalo/Tenochtitlan', 'Pino Suárez', 'Chabacano', 'Ermita'],

    state: {
        turnoId: null,
        lastDelayMin: 0,
        currentTrenIndex: 0,
        currentCarrera: 1,
        carrerasCompletadas: {},
        llegadasRegistradas: {},
        expirationTime: null,
        isTracking: false,
        turnoFinalizado: false,
        direccion: 'norte_sur',
        trenesColapsados: {}
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

    horaAMinutos(horaStr) {
        if (!horaStr || horaStr === '--:--') return 0;
        const [h, m] = horaStr.split(':').map(Number);
        return h * 60 + m;
    },

    minutosAHora(minutos) {
        const h = Math.floor(minutos / 60) % 24;
        const m = Math.floor(minutos % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    },

    calcularHoraTeoricaEstacion(horaSalidaCarrera, horaLlegadaCarrera, estacionIndex, direccion) {
        const minSalida = this.horaAMinutos(horaSalidaCarrera);
        const minLlegada = this.horaAMinutos(horaLlegadaCarrera);
        
        let duracionCarrera = minLlegada - minSalida;
        if (duracionCarrera < 0) duracionCarrera += 24 * 60;
        
        const totalTramos = 23;
        const tiempoPorTramo = duracionCarrera / totalTramos;
        
        let horaEstacion = minSalida;
        
        for (let i = 0; i < estacionIndex - 1; i++) {
            horaEstacion += tiempoPorTramo;
        }
        
        return horaEstacion;
    },

    getDireccionCarrera(tipoCarrera) {
        if (tipoCarrera === 'Vuelta') {
            return this.state.direccion === 'norte_sur' ? 'sur_norte' : 'norte_sur';
        }
        return this.state.direccion;
    },

    determinarDireccion() {
        const userTerminalId = DB.get('userTerminalId');
        const terminales = DB.load('terminales');
        const terminal = terminales.find(t => t.id === userTerminalId);
        
        if (terminal) {
            const nombreTerminal = terminal.nombre.toLowerCase();
            if (nombreTerminal.includes('cuatro') || nombreTerminal.includes('caminos')) {
                this.state.direccion = 'norte_sur';
            } else if (nombreTerminal.includes('tasqueña')) {
                this.state.direccion = 'sur_norte';
            }
        }
        console.log('🧭 [Dirección] Viaje base:', this.state.direccion);
    },

    reportarAtrasoEnEstacion(carreraKey, carreraNum, horaSalidaCarrera, tipoCarrera) {
        const direccion = this.getDireccionCarrera(tipoCarrera);
        
        console.log(' [Reportar] Carrera:', carreraNum, 'Tipo:', tipoCarrera, 'Dirección:', direccion);
        
        const estaciones = this.ESTACIONES[direccion];
        
        const opcionesEstaciones = estaciones.map((estacion, idx) => {
            const esEspecial = this.ESTACIONES_ESPECIALES.includes(estacion);
            return `<option value="${idx}">${idx + 1}. ${estacion}${esEspecial ? ' ⚠️' : ''}</option>`;
        }).join('');
        
        const modalHTML = `
            <div style="background: var(--surface); padding: 24px; border-radius: 16px; max-width: 90%; width: 400px; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; color: var(--primary);">📍 Mi atraso en la Carrera ${carreraNum} (${tipoCarrera})</h3>
                
                <div style="background: rgba(255, 152, 0, 0.1); border: 1px solid #FF9800; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                    <p style="margin: 0; font-size: 12px; color: #FF9800; font-weight: 600;">
                        ⚠️ Los tiempos son aproximados de acuerdo a la hora de llegada del tren a la terminal.
                    </p>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text);">
                        ¿En qué estación te encuentras?
                    </label>
                    <select id="selectEstacion" style="width: 100%; padding: 12px; border: 2px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text);">
                        <option value="">Selecciona una estación...</option>
                        ${opcionesEstaciones}
                    </select>
                </div>
                
                <div id="resultadoAtraso" style="display: none; background: var(--bg-soft); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="font-size: 12px; color: var(--text-soft); margin-bottom: 4px;">Atraso calculado:</div>
                    <div id="valorAtraso" style="font-size: 24px; font-weight: 800; color: var(--accent);"></div>
                    <div id="detalleCalculo" style="font-size: 11px; color: var(--text-soft); margin-top: 8px;"></div>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button id="btnCancelarAtraso" style="flex: 1; padding: 12px; background: var(--bg-soft); color: var(--text); border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                        Cancelar
                    </button>
                    <button id="btnActualizarAtraso" style="flex: 1; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                        ✅ Actualizar Atraso
                    </button>
                </div>
            </div>
        `;
        
        const modalOverlay = App.showModal(modalHTML);
        
        const selectEstacion = document.getElementById('selectEstacion');
        const resultadoDiv = document.getElementById('resultadoAtraso');
        const valorAtrasoDiv = document.getElementById('valorAtraso');
        const detalleCalculoDiv = document.getElementById('detalleCalculo');
        let atrasoCalculado = 0;
        
        const tren = this.servicioData.trenes[this.state.currentTrenIndex];
        const carreras = this.calcularCarreras(tren);
        const carreraActual = carreras.find(c => c.numero === carreraNum);
        const horaLlegadaCarrera = carreraActual ? carreraActual.horaLlegada : '11:39';
        
        console.log('🔍 [Debug] Hora salida:', horaSalidaCarrera, 'Hora llegada:', horaLlegadaCarrera);
        
        selectEstacion.addEventListener('change', () => {
            const estacionIdx = parseInt(selectEstacion.value);
            if (isNaN(estacionIdx)) {
                resultadoDiv.style.display = 'none';
                return;
            }
            
            const horaTeoricaEstacion = this.calcularHoraTeoricaEstacion(
                horaSalidaCarrera, 
                horaLlegadaCarrera, 
                estacionIdx + 1, 
                direccion
            );
            
            const ahora = new Date();
            const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes();
            const horaActualStr = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
            
            const horaTeoricaRedondeada = Math.round(horaTeoricaEstacion);
            atrasoCalculado = Math.max(0, horaActualMinutos - horaTeoricaRedondeada);
            
            const horaTeoricaStr = this.minutosAHora(horaTeoricaRedondeada);
            
            resultadoDiv.style.display = 'block';
            valorAtrasoDiv.textContent = this.formatMinutos(atrasoCalculado);
            valorAtrasoDiv.style.color = atrasoCalculado > 0 ? 'var(--accent)' : '#4CAF50';
            
            detalleCalculoDiv.innerHTML = `
                <strong>Hora teórica en estación:</strong> ${horaTeoricaStr}<br>
                <strong>Hora actual:</strong> ${horaActualStr}<br>
                <strong>Diferencia:</strong> ${atrasoCalculado} minutos
            `;
        });
        
        document.getElementById('btnCancelarAtraso').addEventListener('click', () => modalOverlay.remove());
        
        document.getElementById('btnActualizarAtraso').addEventListener('click', () => {
            if (selectEstacion.value === '') {
                App.showToast('⚠️ Selecciona una estación');
                return;
            }
            
            this.state.lastDelayMin = atrasoCalculado;
            this.saveState();
            this.renderTrackingPanel();
            
            modalOverlay.remove();
            
            if (atrasoCalculado > 0) {
                App.showToast(`⚠️ Atraso actualizado: +${this.formatMinutos(atrasoCalculado)}`);
            } else {
                App.showToast('✅ Atraso actualizado: A tiempo');
            }
            
            if (atrasoCalculado >= 60) {
                this.startBlinking();
            } else {
                this.stopBlinking();
            }
        });
    },

    // ✅ NUEVA FUNCIÓN: Mostrar instrucciones de ayuda
    mostrarAyuda() {
        const modalOverlay = App.showModal(`
            <div style="background: var(--surface); padding: 24px; border-radius: 16px; max-width: 90%; width: 450px; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 2px solid var(--bg-soft);">
                    <div style="background: var(--primary); color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 18px; color: var(--primary);">¿Cómo usar el seguimiento?</h3>
                        <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--text-soft);">Guía paso a paso</p>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 14px;">
                    <div style="background: var(--bg-soft); padding: 14px; border-radius: 10px; border-left: 4px solid var(--primary);">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <span style="background: var(--primary); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">1</span>
                            <strong style="font-size: 14px; color: var(--text);">Entiende las Carreras</strong>
                        </div>
                        <p style="margin: 0; font-size: 13px; color: var(--text-soft); line-height: 1.5;">
                            Cada <strong>vuelta</strong> está compuesta por <strong>2 carreras</strong>: una de <strong>Ida</strong> (Origen → Destino) y una de <strong>Vuelta</strong> (Destino → Origen). Si tu tren tiene 2 vueltas, verás 4 carreras en total.
                        </p>
                    </div>

                    <div style="background: var(--bg-soft); padding: 14px; border-radius: 10px; border-left: 4px solid #4CAF50;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <span style="background: #4CAF50; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">2</span>
                            <strong style="font-size: 14px; color: var(--text);">Marca tu Llegada</strong>
                        </div>
                        <p style="margin: 0; font-size: 13px; color: var(--text-soft); line-height: 1.5;">
                            Cuando llegues a la terminal al finalizar una carrera, presiona el botón <strong style="color: #FF9800;">📍 Marcar Llegada</strong>. Esto registrará la hora real y calculará si llegaste a tiempo o con atraso.
                        </p>
                    </div>

                    <div style="background: var(--bg-soft); padding: 14px; border-radius: 10px; border-left: 4px solid #757575;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <span style="background: #757575; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">3</span>
                            <strong style="font-size: 14px; color: var(--text);">Usa "Omitir" si es necesario</strong>
                        </div>
                        <p style="margin: 0; font-size: 13px; color: var(--text-soft); line-height: 1.5;">
                            Si no pudiste registrar la llegada de una carrera, usa el botón <strong style="color: #757575;">⏭️ Omitir</strong>. Esto te permitirá avanzar a la siguiente carrera sin registro de hora.
                        </p>
                    </div>

                    <div style="background: var(--bg-soft); padding: 14px; border-radius: 10px; border-left: 4px solid #FF9800;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <span style="background: #FF9800; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">4</span>
                            <strong style="font-size: 14px; color: var(--text);">Calcula tu Atraso en Ruta</strong>
                        </div>
                        <p style="margin: 0; font-size: 13px; color: var(--text-soft); line-height: 1.5;">
                            Si quieres saber tu atraso mientras vas en ruta, debes estar en la <strong>carrera correspondiente</strong> (la que aparece activa con el botón naranja). Presiona <strong style="color: var(--primary);"> Mi atraso en la Carrera</strong> y selecciona la estación donde te encuentras.
                        </p>
                    </div>

                    <div style="background: var(--bg-soft); padding: 14px; border-radius: 10px; border-left: 4px solid #2196F3;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <span style="background: #2196F3; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">5</span>
                            <strong style="font-size: 14px; color: var(--text);">Avanza Carrera por Carrera</strong>
                        </div>
                        <p style="margin: 0; font-size: 13px; color: var(--text-soft); line-height: 1.5;">
                            Debes <strong>registrar u omitir</strong> cada carrera para poder avanzar a la siguiente. Las carreras futuras aparecerán bloqueadas hasta que completes la actual.
                        </p>
                    </div>

                    <div style="background: rgba(255, 152, 0, 0.1); border: 1px solid #FF9800; padding: 14px; border-radius: 10px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: #FF9800; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <strong style="font-size: 14px; color: #FF9800;">⚠️ Nota Importante sobre el Atraso</strong>
                        </div>
                        <p style="margin: 0; font-size: 13px; color: var(--text-soft); line-height: 1.5;">
                            El cálculo del atraso es <strong>aproximado</strong>. Los tiempos pueden variar <strong>±2 minutos</strong> (2 minutos antes o 2 minutos después) debido a condiciones del tráfico, tiempo de abordaje y otros factores. Usa este valor como referencia, no como dato exacto.
                        </p>
                    </div>
                </div>

                <button id="btnCerrarAyuda" style="width: 100%; margin-top: 20px; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;">
                    ✅ Entendido
                </button>
            </div>
        `);

        document.getElementById('btnCerrarAyuda').addEventListener('click', () => modalOverlay.remove());
    },

    async init() {
        console.log('🛰️ [CicloTracking] Inicializando...');
        
        const container = document.getElementById('skeServicioDiaContainer');
        if (!container) {
            console.error('❌ [CicloTracking] Contenedor #skeServicioDiaContainer NO encontrado');
            return;
        }
        console.log('✅ [CicloTracking] Contenedor encontrado');

        const tiempoExtraActivo = DB.get('tiempoExtraActivo', false);
        const savedState = localStorage.getItem(this.STORAGE_KEY);
        
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.turnoFinalizado && tiempoExtraActivo) {
                    console.log('🔄 [CicloTracking] Turno finalizado con tiempo extra. Reseteando...');
                    localStorage.removeItem(this.STORAGE_KEY);
                }
            } catch (e) {
                console.error('❌ Error al parsear estado:', e);
            }
        }

        this.extractServiceData();
        
        if (!this.servicioData) {
            console.error('❌ [CicloTracking] No se encontró servicio');
            return;
        }
        console.log('✅ [CicloTracking] Servicio encontrado:', this.servicioData.nombre);

        this.determinarDireccion();
        this.loadState();
        
        if (this.state.turnoFinalizado && this.servicioData) {
            console.log('🔄 [CicloTracking] Reseteando turno finalizado...');
            this.state.turnoFinalizado = false;
            this.state.lastDelayMin = 0;
            this.state.currentTrenIndex = 0;
            this.state.currentCarrera = 1;
            this.state.carrerasCompletadas = {};
            this.state.llegadasRegistradas = {};
            this.state.expirationTime = null;
            this.saveState();
        }

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
                    this.state.direccion = parsed.direccion || 'norte_sur';
                    this.state.trenesColapsados = parsed.trenesColapsados || {};
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
            turnoFinalizado: false,
            direccion: 'norte_sur',
            trenesColapsados: {}
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

    omitirCarrera(carreraKey, carreraNum) {
        const ahora = new Date();
        const horaReal = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

        this.state.llegadasRegistradas[carreraKey] = {
            horaReal: horaReal,
            atraso: 0,
            omitida: true,
            timestamp: ahora.getTime()
        };

        this.state.carrerasCompletadas[carreraKey] = {
            hora: horaReal,
            atraso: 0,
            omitida: true,
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
        App.showToast(`⏭️ Carrera ${carreraNum} omitida`);
    },

    marcarLlegadaCarrera(carreraKey, carreraNum, horaLlegadaTeorica) {
        const ahora = new Date();
        const horaReal = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
        
        const [hTeorica, mTeorica] = horaLlegadaTeorica.split(':').map(Number);
        const llegadaTeorica = new Date(ahora);
        llegadaTeorica.setHours(hTeorica, mTeorica, 0, 0);

        const minutosAtraso = Math.max(0, Math.floor((ahora - llegadaTeorica) / (1000 * 60)));

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

        if (minutosAtraso >= 60) this.startBlinking();
        else this.stopBlinking();

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

    mostrarMensajeBloqueo() {
        App.showToast('️ Debes registrar la llegada u omitir la carrera actual para continuar');
    },

    toggleCollapse(trenIdx) {
        const collapseKey = `tren_${trenIdx}_collapsed`;
        
        if (!this.state.trenesColapsados) {
            this.state.trenesColapsados = {};
        }
        
        this.state.trenesColapsados[collapseKey] = !this.state.trenesColapsados[collapseKey];
        this.saveState();
        this.renderTrackingPanel();
    },

    renderTrackingPanel() {
        const container = document.getElementById('skeServicioDiaContainer');
        if (!container || !this.servicioData) return;

        const panelAnterior = document.getElementById('ct-tracking-panel');
        if (panelAnterior) panelAnterior.remove();

        const panel = document.createElement('div');
        panel.id = 'ct-tracking-panel';
        panel.style.cssText = `margin-top: 20px; background: var(--surface); padding: 20px; border-radius: 16px; box-shadow: var(--clay-shadow-sm); border-top: 4px solid var(--primary);`;

        const trenes = this.servicioData.trenes;
        const now = Date.now();
        const turnoExpirado = this.state.expirationTime && now > this.state.expirationTime;

        if (turnoExpirado) {
            const esUmbralAlcanzado = this.state.lastDelayMin >= this.RECOVERY_THRESHOLD_MIN;
            let resumenHtml = `
                <h3 style="margin: 0 0 16px 0; font-size: 18px; color: var(--primary);">✅ Servicio Finalizado</h3>
                <div style="margin-top: 16px; padding: 16px; background: var(--bg-soft); border-radius: 12px; border-left: 4px solid ${esUmbralAlcanzado ? 'var(--accent)' : 'var(--primary)'};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="margin: 0; font-size: 14px; color: var(--text); font-weight: 700;">️ Total de atraso</h4>
                        <span style="background: ${esUmbralAlcanzado ? 'var(--accent)' : '#4CAF50'}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;">${esUmbralAlcanzado ? 'UMBRAL ALCANZADO' : 'DENTRO DEL MÁXIMO'}</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="background: var(--surface); padding: 10px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--text-soft);">Total de atraso</div>
                            <div style="font-size: 22px; font-weight: 800; color: ${esUmbralAlcanzado ? 'var(--accent)' : 'var(--text)'};">${this.formatMinutos(this.state.lastDelayMin)}</div>
                        </div>
                        <div style="background: var(--surface); padding: 10px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--text-soft);">Margen Restante</div>
                            <div style="font-size: 22px; font-weight: 800; color: var(--primary);">${this.formatMinutos(Math.max(0, this.RECOVERY_THRESHOLD_MIN - this.state.lastDelayMin))}</div>
                        </div>
                    </div>
                </div>
            `;
            panel.innerHTML = resumenHtml;
            container.parentNode.insertBefore(panel, container.nextSibling);
            return;
        }

        const esTiempoExtra = DB.get('tiempoExtraActivo', false);
        
        // ✅ TÍTULO CON BOTÓN DE AYUDA
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; font-size: 18px; color: var(--primary);">🚂 Seguimiento de Carreras${esTiempoExtra ? ' (Tiempo Extra)' : ''}</h3>
                <button id="btnAyudaTracking" style="background: var(--bg-soft); border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-soft); flex-shrink: 0;" title="Ver instrucciones de uso">
                    <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </button>
            </div>
        `;

        trenes.forEach((tren, trenIdx) => {
            const vueltas = tren.vueltas || 1;
            const totalCarreras = vueltas * 2;
            const numTren = tren.numero || (trenIdx + 1);
            const labelTren = trenIdx === 0 ? 'Primer Tren' : trenIdx === 1 ? 'Segundo Tren' : `Tren #${numTren}`;
            const esTrenActivo = trenIdx === this.state.currentTrenIndex;
            const esTrenCompletado = trenIdx < this.state.currentTrenIndex;
            const esTrenFuturo = trenIdx > this.state.currentTrenIndex;

            const carreras = this.calcularCarreras(tren);
            const carrerasCompletadas = carreras.filter(c => {
                const carreraKey = `${trenIdx}_${c.numero}`;
                return this.state.carrerasCompletadas[carreraKey];
            }).length;
            const trenCompleto = carrerasCompletadas === totalCarreras;

            const collapseKey = `tren_${trenIdx}_collapsed`;
            const isCollapsed = this.state.trenesColapsados?.[collapseKey] || false;

            html += `<div class="ct-tren-card" style="margin-bottom: 16px; padding: 16px; background: var(--bg-soft); border-radius: 12px; border-left: 4px solid ${esTrenCompletado ? '#4CAF50' : esTrenActivo ? 'var(--primary)' : 'var(--bg-soft)'}; opacity: ${esTrenCompletado ? '0.7' : esTrenFuturo ? '0.5' : '1'};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                    <h4 style="margin: 0; font-size: 16px; color: var(--primary); font-weight: 700; flex: 1;">${esTrenCompletado ? '✓ ' : esTrenFuturo ? '🔒 ' : ''}${labelTren} #${numTren}</h4>
                    ${tren.garage ? '<span style="background: #4CAF50; color: white; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 700;">GARAGE</span>' : ''}
                    ${trenCompleto ? `<button onclick="CicloTracking.toggleCollapse(${trenIdx})" style="background: var(--primary); color: white; border: none; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: 600; cursor: pointer; margin-left: 8px;">${isCollapsed ? 'Mostrar' : 'Ocultar'}</button>` : ''}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                    <div style="text-align: center; background: var(--surface); padding: 8px; border-radius: 8px;"><div style="font-size: 10px; color: var(--text-soft);">Salida</div><div style="font-size: 16px; font-weight: 800; color: var(--text);">${tren.salida || '--:--'}</div></div>
                    <div style="text-align: center; background: var(--surface); padding: 8px; border-radius: 8px;"><div style="font-size: 10px; color: var(--text-soft);">Llegada</div><div style="font-size: 16px; font-weight: 800; color: var(--text);">${tren.llegada || '--:--'}</div></div>
                    <div style="text-align: center; background: var(--surface); padding: 8px; border-radius: 8px;"><div style="font-size: 10px; color: var(--text-soft);">Carreras</div><div style="font-size: 16px; font-weight: 800; color: var(--text);">${totalCarreras}</div></div>
                </div>`;

            if (!isCollapsed) {
                if (esTrenActivo || esTrenCompletado) {
                    html += `<div style="margin-bottom: 12px;"><div style="font-size: 12px; font-weight: 700; color: var(--text-soft); margin-bottom: 8px;">📋 Desglose de Carreras:</div>`;

                    carreras.forEach((carrera) => {
                        const carreraKey = `${trenIdx}_${carrera.numero}`;
                        const estaCompletada = this.state.carrerasCompletadas[carreraKey];
                        const llegadaInfo = this.state.llegadasRegistradas[carreraKey];
                        const esOmitida = llegadaInfo && llegadaInfo.omitida;
                        const esCarreraActual = (trenIdx === this.state.currentTrenIndex && carrera.numero === this.state.currentCarrera);
                        const esCarreraFutura = (trenIdx > this.state.currentTrenIndex) || (trenIdx === this.state.currentTrenIndex && carrera.numero > this.state.currentCarrera);

                        html += `<div class="ct-carrera-card" style="margin-bottom: 10px; padding: 12px; background: ${esOmitida ? '#9E9E9E' : estaCompletada ? 'var(--primary)' : esCarreraFutura ? '#E0E0E0' : 'var(--surface)'}; border-radius: 10px; border: 2px solid ${esOmitida ? '#9E9E9E' : estaCompletada ? 'var(--primary)' : esCarreraFutura ? '#BDBDBD' : 'var(--bg-soft)'}; opacity: ${esCarreraFutura ? '0.6' : '1'};">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                <div style="flex: 1;">
                                    <div style="font-size: 14px; font-weight: 700; color: ${estaCompletada ? 'white' : esCarreraFutura ? '#757575' : 'var(--text)'};">${esOmitida ? '⏭️ ' : estaCompletada ? '✓ ' : esCarreraFutura ? '🔒 ' : '⏳ '}Carrera ${carrera.numero} - ${carrera.tipo}</div>
                                    <div style="font-size: 11px; color: ${estaCompletada ? 'rgba(255,255,255,0.8)' : esCarreraFutura ? '#9E9E9E' : 'var(--text-soft)'};">${carrera.direccion}</div>
                                    <div style="font-size: 10px; color: ${estaCompletada ? 'rgba(255,255,255,0.6)' : esCarreraFutura ? '#BDBDBD' : 'var(--text-light)'}; margin-top: 2px;">Salida: ${carrera.horaSalida}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 10px; color: ${estaCompletada ? 'rgba(255,255,255,0.8)' : esCarreraFutura ? '#9E9E9E' : 'var(--text-soft)'};">Llegada aprox.</div>
                                    <div style="font-size: 18px; font-weight: 800; color: ${estaCompletada ? 'white' : esCarreraFutura ? '#757575' : 'var(--text)'};">${carrera.horaLlegada}</div>
                                </div>
                            </div>`;

                        if (esCarreraActual && !estaCompletada) {
                            html += `<div style="display: flex; gap: 8px; margin-top: 8px;">
                                <button onclick="CicloTracking.marcarLlegadaCarrera('${carreraKey}', ${carrera.numero}, '${carrera.horaLlegada}')" style="flex: 2; padding: 10px; background: #FF9800; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer;">📍 Marcar Llegada</button>
                                <button onclick="if(confirm('¿Omitir registro de esta carrera?')) CicloTracking.omitirCarrera('${carreraKey}', ${carrera.numero})" style="flex: 1; padding: 10px; background: #757575; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer;">⏭️ Omitir</button>
                            </div>
                            <button onclick="CicloTracking.reportarAtrasoEnEstacion('${carreraKey}', ${carrera.numero}, '${carrera.horaSalida}', '${carrera.tipo}')" style="width: 100%; margin-top: 8px; padding: 10px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer;">📍 Mi atraso en la Carrera</button>`;
                        }

                        if (esCarreraFutura && !estaCompletada) {
                            html += `<div onclick="CicloTracking.mostrarMensajeBloqueo()" style="width: 100%; margin-top: 8px; padding: 10px; background: #BDBDBD; color: #616161; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: not-allowed; text-align: center;">🔒 Completa la carrera actual primero</div>`;
                        }

                        if (llegadaInfo) {
                            html += `<div style="margin-top: 8px; padding: 8px; background: ${esOmitida ? 'rgba(158,158,158,0.2)' : llegadaInfo.atraso > 0 ? 'rgba(255,152,0,0.2)' : 'rgba(76,175,80,0.2)'}; border-radius: 6px; border-left: 3px solid ${esOmitida ? '#9E9E9E' : llegadaInfo.atraso > 0 ? '#FF9800' : '#4CAF50'};">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="flex: 1;">
                                        <div style="font-size: 12px; font-weight: 700; color: ${esOmitida ? '#9E9E9E' : llegadaInfo.atraso > 0 ? '#FF9800' : '#4CAF50'};">${esOmitida ? '️ Omitida' : llegadaInfo.atraso > 0 ? `⚠️ +${this.formatMinutos(llegadaInfo.atraso)} atraso` : '✓ A tiempo'}</div>
                                        <div style="font-size: 10px; color: var(--text-soft); margin-top: 2px;">${esOmitida ? 'Sin registro de hora' : `Registrada: ${llegadaInfo.horaReal} (Teórica: ${carrera.horaLlegada})`}</div>
                                    </div>
                                    ${esTrenActivo ? `<button onclick="CicloTracking.resetCarrera('${carreraKey}')" style="background: rgba(255,255,255,0.3); border: none; border-radius: 6px; width: 32px; height: 32px; cursor: pointer; color: white;">↺</button>` : ''}
                                </div>
                            </div>`;
                        }

                        html += `</div>`;
                    });
                    html += `</div>`;
                } else if (esTrenFuturo) {
                    html += `<div style="text-align: center; padding: 10px; color: var(--text-soft); font-size: 12px;">🔒 Pendiente - Completa el tren actual primero</div>`;
                } else {
                    html += `<div style="text-align: center; padding: 10px; color: var(--text-soft); font-size: 12px;"> Pendiente</div>`;
                }
            } else {
                html += `<div style="text-align: center; padding: 12px; background: var(--surface); border-radius: 8px; color: var(--text-soft); font-size: 12px;">
                    🙈 Tren oculto (${carrerasCompletadas}/${totalCarreras} carreras completadas)
                </div>`;
            }
            html += `</div>`;
        });

        const esUmbralAlcanzado = this.state.lastDelayMin >= this.RECOVERY_THRESHOLD_MIN;
        const margenRestante = Math.max(0, this.RECOVERY_THRESHOLD_MIN - this.state.lastDelayMin);
        const necesitaParpadeo = this.state.lastDelayMin >= 60;

        html += `<div style="margin-top: 16px; padding: 16px; background: var(--bg-soft); border-radius: 12px; border-left: 4px solid ${esUmbralAlcanzado ? 'var(--accent)' : 'var(--primary)'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="margin: 0; font-size: 14px; color: var(--text); font-weight: 700;">⏱️ Atraso del Servicio</h4>
                <span style="background: ${esUmbralAlcanzado ? 'var(--accent)' : 'var(--primary)'}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;">${esUmbralAlcanzado ? 'UMBRAL ALCANZADO' : 'EN SEGUIMIENTO'}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div style="background: var(--surface); padding: 10px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 11px; color: var(--text-soft);">Total de atraso</div>
                    <div id="ct-atraso-total" style="font-size: 22px; font-weight: 800; color: ${esUmbralAlcanzado ? 'var(--accent)' : 'var(--text)'};">${this.formatMinutos(this.state.lastDelayMin)}</div>
                </div>
                <div style="background: var(--surface); padding: 10px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 11px; color: var(--text-soft);">Margen Restante</div>
                    <div id="ct-margen-restante" style="font-size: 22px; font-weight: 800; color: var(--primary);">${this.formatMinutos(margenRestante)}</div>
                </div>
            </div>
            ${necesitaParpadeo && !esUmbralAlcanzado ? `<div style="background: rgba(198, 40, 40, 0.1); border: 1px solid #c62828; color: #c62828; padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 600; text-align: center;">⚠️ Atraso de 1 hora o más - Se aproxima la pérdida de una vuelta</div>` : ''}
        </div>`;

        panel.innerHTML = html;
        container.parentNode.insertBefore(panel, container.nextSibling);

        // ✅ Asignar evento al botón de ayuda
        const btnAyuda = document.getElementById('btnAyudaTracking');
        if (btnAyuda) {
            btnAyuda.addEventListener('click', () => this.mostrarAyuda());
        }

        if (necesitaParpadeo) this.startBlinking();
        else this.stopBlinking();
    },

    startRealTimeTracking() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => { this.checkExpiration(); }, 30000);
    },

    destroy() {
        if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
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