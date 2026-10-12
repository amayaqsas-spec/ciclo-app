// ============================================
// CICLO_TRACKING_MODULE.JS - Seguimiento Independiente de Vueltas
// ============================================

const CicloTracking = {
    DWELL_TIME_MS: 166000,
    RECOVERY_THRESHOLD_MIN: 82.5,
    POST_SHIFT_TOLERANCE_MS: 140 * 60 * 1000,
    STORAGE_KEY: 'ciclo_tracking_state_v2',

    state: {
        turnoId: null,
        accumulatedDelayMin: 0,
        currentTrenIndex: 0,
        currentVuelta: 1,
        vueltasCompletadas: {},
        llegadasRegistradas: {},
        expirationTime: null,
        isTracking: false
    },

    intervalId: null,
    servicioData: null,

    async init() {
        console.log('🛰️ [CicloTracking] Inicializando...');
        
        const container = await this.waitForElement('#skeServicioDiaContainer');
        if (!container) {
            console.warn('⚠️ [CicloTracking] No se encontró contenedor de servicios');
            return;
        }

        this.extractServiceData();
        
        if (!this.servicioData) {
            console.log('ℹ️ [CicloTracking] No hay servicio disponible para seguimiento');
            return;
        }

        this.loadState();
        this.checkExpiration();

        if (!this.state.expirationTime) {
            this.calculateExpiration();
        }

        this.renderTrackingPanel();
        this.startRealTimeTracking();
        console.log('✅ [CicloTracking] Módulo activo');
    },

    waitForElement(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) return resolve(document.querySelector(selector));
            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => { observer.disconnect(); resolve(null); }, 3000);
        });
    },

    extractServiceData() {
        const userLineaId = DB.get('userLineaId');
        const userNumeroRol = DB.get('userNumeroRol');
        const rolesSemanal = DB.load('rolesSemanal');
        const servicios = DB.load('servicios');
        const semanas = DB.load('semanas');

        if (!userNumeroRol || !rolesSemanal.length) return;

        const miRol = rolesSemanal.find(r => String(r.numeroRol) === String(userNumeroRol) && r.lineaId === userLineaId);
        if (!miRol) return;

        const configGlobal = DB.load('configuracionGlobal');
        const configInicio = configGlobal.find(c => c.tipo === 'inicioCiclo');
        
        let semanaActualNum = 1;
        if (configInicio && configInicio.fechaInicio) {
            const fechaInicio = new Date(configInicio.fechaInicio + 'T00:00:00');
            const hoyFecha = new Date();
            hoyFecha.setHours(0, 0, 0, 0);
            fechaInicio.setHours(0, 0, 0, 0);
            const diferenciaDias = Math.floor((hoyFecha - fechaInicio) / (1000 * 60 * 60 * 24));
            const semanasTranscurridas = Math.floor(diferenciaDias / 7);
            semanaActualNum = ((semanasTranscurridas + (configInicio.semanaInicial || 1) - 1) % 5) + 1;
        }

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaNombre = diasSemana[new Date().getDay()];
        const semanaData = miRol.semanas.find(s => s.numero === semanaActualNum);
        
        if (!semanaData || !semanaData.dias || !semanaData.dias[diaNombre]) return;

        const posicionHoy = semanaData.dias[diaNombre].posicion;
        if (!posicionHoy) return;

        const normalizar = (texto) => {
            if (!texto) return '';
            return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '').trim();
        };

        const hoy = new Date();
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

    loadState() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.turnoId === this.state.turnoId) {
                    this.state.accumulatedDelayMin = parsed.accumulatedDelayMin || 0;
                    this.state.currentTrenIndex = parsed.currentTrenIndex || 0;
                    this.state.currentVuelta = parsed.currentVuelta || 1;
                    this.state.vueltasCompletadas = parsed.vueltasCompletadas || {};
                    this.state.llegadasRegistradas = parsed.llegadasRegistradas || {};
                    this.state.expirationTime = parsed.expirationTime || null;
                    this.state.isTracking = true;
                    console.log('💾 [CicloTracking] Estado rehidratado:', this.state);
                }
            }
        } catch (e) {
            console.error('❌ [CicloTracking] Error al cargar estado:', e);
        }
    },

    saveState() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error(' [CicloTracking] Error al guardar:', e);
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
            console.log(' [CicloTracking] Turno expirado. Reset automático.');
            this.resetState();
        }
    },

    resetState() {
        this.state = {
            turnoId: this.state.turnoId || `turno_${Date.now()}`,
            accumulatedDelayMin: 0,
            currentTrenIndex: 0,
            currentVuelta: 1,
            vueltasCompletadas: {},
            llegadasRegistradas: {},
            expirationTime: null,
            isTracking: false
        };
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('🔄 [CicloTracking] Estado reiniciado');
    },

    renderTrackingPanel() {
        const container = document.getElementById('skeServicioDiaContainer');
        if (!container || !this.servicioData) return;

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
        
        let html = `
            <h3 style="margin: 0 0 16px 0; font-size: 18px; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                🚂 Seguimiento de Vueltas
                <span style="font-size: 12px; background: var(--bg-soft); color: var(--text-soft); padding: 4px 10px; border-radius: 12px; font-weight: 600;">
                    Tren ${this.state.currentTrenIndex + 1} de ${trenes.length}
                </span>
            </h3>
        `;

        trenes.forEach((tren, trenIdx) => {
            const vueltas = tren.vueltas || 1;
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
                    opacity: ${esTrenCompletado ? '0.6' : '1'};
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="margin: 0; font-size: 16px; color: var(--night-blue, var(--primary)); font-weight: 700;">
                            ${esTrenCompletado ? '✓ ' : esTrenActivo ? ' ' : ''}${labelTren} #${numTren}
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
                            <div style="font-size: 10px; color: var(--text-soft);">Vueltas</div>
                            <div style="font-size: 16px; font-weight: 800; color: var(--night-blue, var(--text));">${vueltas}</div>
                        </div>
                    </div>
            `;

            if (esTrenActivo) {
                html += `<div style="font-size: 12px; font-weight: 700; color: var(--text-soft); margin-bottom: 8px;">Progreso de Vueltas:</div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">`;

                for (let v = 1; v <= vueltas; v++) {
                    const vueltaKey = `${trenIdx}_${v}`;
                    const estaCompletada = this.state.vueltasCompletadas[vueltaKey];
                    const esVueltaActual = v === this.state.currentVuelta;
                    
                    html += `
                        <button class="ct-btn-vuelta" data-tren="${trenIdx}" data-vuelta="${v}" style="
                            flex: 1;
                            min-width: 70px;
                            padding: 10px 6px;
                            background: ${estaCompletada ? 'var(--primary)' : 'var(--surface)'};
                            color: ${estaCompletada ? 'white' : 'var(--text)'};
                            border: 2px solid ${esVueltaActual ? 'var(--accent)' : 'var(--bg-soft)'};
                            border-radius: 8px;
                            font-size: 12px;
                            font-weight: 700;
                            cursor: ${estaCompletada ? 'default' : 'pointer'};
                            transition: all 0.2s;
                        ">
                            ${estaCompletada ? `✓ V${v}` : esVueltaActual ? `📍 V${v}` : `V${v}`}
                        </button>
                    `;
                }
                html += `</div>`;

                html += `
                    <button class="ct-btn-llegada" data-tren="${trenIdx}" style="
                        width: 100%;
                        padding: 12px;
                        background: var(--accent);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 14px;
                        font-weight: 700;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        box-shadow: 0 4px 12px rgba(124, 92, 191, 0.3);
                    ">
                         Marcar Llegada a Terminal Final
                    </button>
                `;

                if (this.state.llegadasRegistradas[trenIdx]) {
                    const info = this.state.llegadasRegistradas[trenIdx];
                    html += `
                        <div style="margin-top: 10px; padding: 10px; background: var(--surface); border-radius: 8px; border-left: 4px solid ${info.atraso > 0 ? 'var(--accent)' : '#4CAF50'};">
                            <div style="font-size: 13px; font-weight: 700; color: ${info.atraso > 0 ? 'var(--accent)' : '#4CAF50'};">
                                ${info.atraso > 0 ? `⚠️ ${info.atraso} min de atraso en línea` : '✓ Llegada a tiempo'}
                            </div>
                            <div style="font-size: 11px; color: var(--text-soft); margin-top: 4px;">
                                Registrada a las ${info.horaReal} (teórica: ${tren.llegada})
                            </div>
                        </div>
                    `;
                }
            } else if (esTrenCompletado) {
                const info = this.state.llegadasRegistradas[trenIdx];
                if (info) {
                    html += `
                        <div style="padding: 10px; background: var(--surface); border-radius: 8px; border-left: 4px solid ${info.atraso > 0 ? 'var(--accent)' : '#4CAF50'};">
                            <div style="font-size: 13px; font-weight: 700; color: ${info.atraso > 0 ? 'var(--accent)' : '#4CAF50'};">
                                ✓ Completado - ${info.atraso > 0 ? `${info.atraso} min atraso` : 'A tiempo'}
                            </div>
                        </div>
                    `;
                }
            } else {
                html += `<div style="text-align: center; padding: 10px; color: var(--text-soft); font-size: 12px; font-style: italic;">⏳ Pendiente</div>`;
            }

            html += `</div>`;
        });

        // Panel de atraso acumulado
        const esUmbralAlcanzado = this.state.accumulatedDelayMin >= this.RECOVERY_THRESHOLD_MIN;
        const margenRestante = Math.max(0, this.RECOVERY_THRESHOLD_MIN - this.state.accumulatedDelayMin).toFixed(1);

        html += `
            <div style="
                margin-top: 16px;
                padding: 16px;
                background: var(--bg-soft);
                border-radius: 12px;
                border-left: 4px solid ${esUmbralAlcanzado ? 'var(--accent)' : 'var(--primary)'};
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="margin: 0; font-size: 14px; color: var(--text); font-weight: 700;">⏱️ Ciclo de Recuperación</h4>
                    <span style="background: ${esUmbralAlcanzado ? 'var(--accent)' : 'var(--primary)'}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;">
                        ${esUmbralAlcanzado ? 'UMBRAL ALCANZADO' : 'EN SEGUIMIENTO'}
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div style="background: var(--surface); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: var(--text-soft);">Atraso Acumulado</div>
                        <div style="font-size: 22px; font-weight: 800; color: ${esUmbralAlcanzado ? 'var(--accent)' : 'var(--text)'};">
                            ${this.state.accumulatedDelayMin.toFixed(1)} min
                        </div>
                    </div>
                    <div style="background: var(--surface); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: var(--text-soft);">Margen Restante</div>
                        <div style="font-size: 22px; font-weight: 800; color: var(--primary);">${margenRestante} min</div>
                    </div>
                </div>
                ${esUmbralAlcanzado ? `
                    <div style="
                        background: rgba(255, 152, 0, 0.1);
                        border: 1px solid var(--accent);
                        color: var(--accent);
                        padding: 12px;
                        border-radius: 8px;
                        font-size: 13px;
                        font-weight: 600;
                        text-align: center;
                        animation: pulse 2s infinite;
                    ">
                        ⚙️ Estado de regulación: Se ha alcanzado el tiempo equivalente a un ciclo completo de regulación operacional (Ciclo de Recuperación Acumulado).
                    </div>
                ` : ''}
            </div>
        `;

        panel.innerHTML = html;
        container.parentNode.insertBefore(panel, container.nextSibling);

        this.attachEventListeners();
    },

    attachEventListeners() {
        document.querySelectorAll('.ct-btn-vuelta').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trenIdx = parseInt(btn.dataset.tren);
                const vuelta = parseInt(btn.dataset.vuelta);
                this.marcarVuelta(trenIdx, vuelta);
            });
        });

        document.querySelectorAll('.ct-btn-llegada').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trenIdx = parseInt(btn.dataset.tren);
                this.marcarLlegada(trenIdx);
            });
        });
    },

    marcarVuelta(trenIdx, vueltaNum) {
        const vueltaKey = `${trenIdx}_${vueltaNum}`;
        if (this.state.vueltasCompletadas[vueltaKey]) return;

        const ahora = new Date();
        const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

        this.state.vueltasCompletadas[vueltaKey] = {
            hora: horaActual,
            timestamp: ahora.getTime()
        };

        if (vueltaNum === this.state.currentVuelta) {
            this.state.currentVuelta = vueltaNum + 1;
        }

        this.saveState();
        this.renderTrackingPanel();
        App.showToast(`✅ Vuelta ${vueltaNum} completada a las ${horaActual}`);
    },

    marcarLlegada(trenIdx) {
        const tren = this.servicioData.trenes[trenIdx];
        if (!tren) return;

        const ahora = new Date();
        const horaReal = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
        
        const [hLlegada, mLlegada] = (tren.llegada || '00:00').split(':').map(Number);
        const llegadaTeorica = new Date(ahora);
        llegadaTeorica.setHours(hLlegada, mLlegada, 0, 0);

        const minutosAtraso = Math.max(0, Math.floor((ahora - llegadaTeorica) / (1000 * 60)));

        this.state.llegadasRegistradas[trenIdx] = {
            horaReal: horaReal,
            atraso: minutosAtraso,
            timestamp: ahora.getTime()
        };

        this.state.accumulatedDelayMin += minutosAtraso;
        this.state.currentTrenIndex = trenIdx + 1;
        this.state.currentVuelta = 1;

        this.saveState();
        this.renderTrackingPanel();

        if (minutosAtraso > 0) {
            App.showToast(`⚠️ Llegada registrada: +${minutosAtraso} min de atraso`);
        } else {
            App.showToast('✅ Llegada registrada a tiempo');
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
        const panel = document.getElementById('ct-tracking-panel');
        if (panel) panel.remove();
        console.log('🛑 [CicloTracking] Módulo destruido');
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CicloTracking;
} else {
    window.CicloTracking = CicloTracking;
}