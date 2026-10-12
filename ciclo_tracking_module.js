// ============================================
// CICLO_TRACKING_MODULE.JS - Seguimiento Operativo en Tiempo Real
// ============================================

const CicloTracking = {
    // ⚙️ Constantes Operativas
    DWELL_TIME_MS: 166000, // 2 minutos y 46 segundos (166,000 ms)
    RECOVERY_THRESHOLD_MIN: 82.5,
    POST_SHIFT_TOLERANCE_MS: 140 * 60 * 1000, // 2 horas y 20 minutos
    STORAGE_KEY: 'ciclo_tracking_state_v1',

    // 🧠 Estado Interno
    state: {
        turnoId: null,
        accumulatedDelayMs: 0,
        currentTrainIndex: 0,
        expirationTime: null,
        isTracking: false
    },

    intervalId: null,

    // ==========================================
    // FASE 1: Ciclo de Vida y Extracción
    // ==========================================
    
    async init() {
        console.log('🛰️ [CicloTracking] Inicializando módulo de seguimiento...');
        
        // Esperar a que el contenedor de servicios esté en el DOM
        const container = await this.waitForElement('#skeServicioDiaContainer');
        if (!container) {
            console.warn('⚠️ [CicloTracking] No se encontró el contenedor de servicios. Abortando.');
            return;
        }

        this.extractData();
        this.loadState();
        this.checkExpiration();
        
        if (!this.state.expirationTime) {
            this.calculateExpiration();
        }

        this.renderTrackingUI();
        this.startRealTimeTracking();
    },

    waitForElement(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }
            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    },

    extractData() {
        // Extraer datos del DOM renderizado por Home.js
        const serviceTitle = document.querySelector('.ske-greeting-title')?.nextElementSibling?.textContent || 'Servicio Desconocido';
        const trainCards = document.querySelectorAll('.ske-servicios-tren-card, [style*="border-left: 4px solid var(--primary)"]'); // Selector resiliente
        
        this.state.turnoId = `turno_${Date.now()}`; // ID único para la sesión
        
        console.log('📊 [CicloTracking] Datos extraídos:', { 
            turno: serviceTitle, 
            trenes: trainCards.length 
        });
    },

    // ==========================================
    // FASE 3: Persistencia y Expiración
    // ==========================================

    loadState() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Solo restaurar si es el mismo día/turno lógico (simplificado)
                this.state.accumulatedDelayMs = parsed.accumulatedDelayMs || 0;
                this.state.currentTrainIndex = parsed.currentTrainIndex || 0;
                this.state.expirationTime = parsed.expirationTime || null;
                console.log('💾 [CicloTracking] Estado rehidratado:', this.state);
            }
        } catch (e) {
            console.error('❌ [CicloTracking] Error al cargar estado:', e);
        }
    },

    saveState() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('❌ [CicloTracking] Error al guardar estado:', e);
        }
    },

    calculateExpiration() {
        // Busca la última hora de llegada en el DOM o asume +140 min desde ahora
        const now = new Date();
        this.state.expirationTime = now.getTime() + this.POST_SHIFT_TOLERANCE_MS;
        this.saveState();
    },

    checkExpiration() {
        const now = Date.now();
        if (this.state.expirationTime && now > this.state.expirationTime) {
            console.log('⏰ [CicloTracking] Turno expirado. Ejecutando reset automático...');
            this.resetState();
        }
    },

    resetState() {
        this.state = {
            turnoId: `turno_${Date.now()}`,
            accumulatedDelayMs: 0,
            currentTrainIndex: 0,
            expirationTime: null,
            isTracking: false
        };
        localStorage.removeItem(this.STORAGE_KEY);
        this.renderTrackingUI(); // Refrescar UI a estado inicial
        console.log('🔄 [CicloTracking] Estado reiniciado a 00:00:00');
    },

    // ==========================================
    // FASE 2: Lógica Operativa e Hidratación UI
    // ==========================================

    renderTrackingUI() {
        const container = document.getElementById('skeServicioDiaContainer');
        if (!container) return;

        // 1. Inyectar Panel de Acumulados (si no existe)
        if (!document.getElementById('ct-accumulator-panel')) {
            const panel = document.createElement('div');
            panel.id = 'ct-accumulator-panel';
            panel.style.cssText = `
                margin: 20px 0;
                background: var(--surface);
                padding: 16px;
                border-radius: 12px;
                box-shadow: var(--clay-shadow-sm);
                border-left: 4px solid var(--primary);
            `;
            container.parentNode.insertBefore(panel, container);
        }

        this.updateAccumulatorUI();

        // 2. Inyectar botones y badges en las tarjetas de trenes
        const trainCards = document.querySelectorAll('[style*="border-left: 4px solid var(--primary)"]');
        trainCards.forEach((card, index) => {
            if (!card.querySelector('.ct-controls')) {
                const controls = document.createElement('div');
                controls.className = 'ct-controls';
                controls.style.cssText = `
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px dashed var(--bg-soft);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                `;

                const btn = document.createElement('button');
                btn.className = 'btn-llegada-real';
                btn.textContent = '📍 Registrar Llegada a Terminal';
                btn.style.cssText = `
                    width: 100%;
                    padding: 10px;
                    background: var(--bg-soft);
                    color: var(--text);
                    border: 1px solid var(--primary);
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                `;
                btn.onmouseover = () => { btn.style.background = 'var(--primary)'; btn.style.color = 'white'; };
                btn.onmouseout = () => { btn.style.background = 'var(--bg-soft)'; btn.style.color = 'var(--text)'; };
                
                btn.addEventListener('click', () => this.registerArrival(index, card));

                const statusBadge = document.createElement('div');
                statusBadge.className = 'ct-status-badge';
                statusBadge.style.cssText = `
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-soft);
                    text-align: center;
                `;
                statusBadge.textContent = 'Pendiente';

                controls.appendChild(statusBadge);
                controls.appendChild(btn);
                card.appendChild(controls);
                
                // Marcar visualmente los ya completados
                if (index < this.state.currentTrainIndex) {
                    card.style.opacity = '0.6';
                    statusBadge.textContent = '✓ Completado';
                    statusBadge.style.color = 'var(--primary)';
                    btn.style.display = 'none';
                } else if (index === this.state.currentTrainIndex) {
                    statusBadge.textContent = '📍 Usted está aquí';
                    statusBadge.style.color = 'var(--accent)';
                }
            }
        });
    },

    updateAccumulatorUI() {
        const panel = document.getElementById('ct-accumulator-panel');
        if (!panel) return;

        const delayMin = (this.state.accumulatedDelayMs / 60000).toFixed(1);
        const remaining = Math.max(0, this.RECOVERY_THRESHOLD_MIN - delayMin).toFixed(1);
        const isThresholdReached = delayMin >= this.RECOVERY_THRESHOLD_MIN;

        panel.style.borderLeftColor = isThresholdReached ? 'var(--accent)' : 'var(--primary)';
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 16px; color: var(--text); font-weight: 700;">⏱️ Ciclo de Recuperación</h3>
                <span style="background: ${isThresholdReached ? 'var(--accent)' : 'var(--primary)'}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">
                    ${isThresholdReached ? 'UMBRAL ALCANZADO' : 'EN SEGUIMIENTO'}
                </span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div style="background: var(--bg-soft); padding: 10px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 11px; color: var(--text-soft);">Atraso Acumulado</div>
                    <div style="font-size: 20px; font-weight: 800; color: ${isThresholdReached ? 'var(--accent)' : 'var(--text)'};">${delayMin} min</div>
                </div>
                <div style="background: var(--bg-soft); padding: 10px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 11px; color: var(--text-soft);">Margen Restante</div>
                    <div style="font-size: 20px; font-weight: 800; color: var(--primary);">${remaining} min</div>
                </div>
            </div>
            ${isThresholdReached ? `
                <div style="background: rgba(255, 152, 0, 0.1); border: 1px solid var(--accent); color: var(--accent); padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; text-align: center; animation: pulse 2s infinite;">
                    ⚙️ Estado de regulación: Se ha alcanzado el tiempo equivalente a un ciclo completo de regulación operacional (Ciclo de Recuperación Acumulado).
                </div>
            ` : ''}
        `;
    },

    registerArrival(index, cardElement) {
        const now = new Date();
        // Aquí se podría extraer la hora teórica del DOM si estuviera estructurada, 
        // por ahora simulamos el cálculo de desfase basado en la acción del usuario.
        // En una implementación completa, parsearías el texto "Llegada: HH:MM" del DOM.
        
        const theoreticalTimeStr = cardElement.querySelector('[style*="font-size: 10px; color: var(--text-soft);"]')?.nextElementSibling?.textContent;
        
        let delayMs = 0;
        if (theoreticalTimeStr && theoreticalTimeStr !== '--:--') {
            const [h, m] = theoreticalTimeStr.split(':').map(Number);
            const theoreticalDate = new Date();
            theoreticalDate.setHours(h, m, 0, 0);
            
            delayMs = Math.max(0, now.getTime() - theoreticalDate.getTime());
            this.state.accumulatedDelayMs += delayMs;
        }

        this.state.currentTrainIndex = index + 1;
        this.saveState();

        // Feedback visual inmediato
        const delayMin = (delayMs / 60000).toFixed(1);
        const badge = cardElement.querySelector('.ct-status-badge');
        const btn = cardElement.querySelector('.btn-llegada-real');
        
        if (badge) {
            badge.textContent = delayMin > 0 ? `⚠️ Registrado (+${delayMin} min)` : '✓ Registrado (A tiempo)';
            badge.style.color = delayMin > 0 ? 'var(--accent)' : '#2e7d32';
        }
        if (btn) btn.style.display = 'none';
        
        cardElement.style.opacity = '0.6';

        // Mover "Usted está aquí" al siguiente
        const nextCard = document.querySelectorAll('[style*="border-left: 4px solid var(--primary)"]')[this.state.currentTrainIndex];
        if (nextCard) {
            const nextBadge = nextCard.querySelector('.ct-status-badge');
            if (nextBadge) {
                nextBadge.textContent = '📍 Usted está aquí';
                nextBadge.style.color = 'var(--accent)';
            }
        }

        this.updateAccumulatorUI();
        
        // Recalcular expiración desde la última acción
        this.state.expirationTime = now.getTime() + this.POST_SHIFT_TOLERANCE_MS;
        this.saveState();

        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(delayMin > 0 ? `⚠️ Llegada registrada: +${delayMin} min de atraso` : '✅ Llegada registrada a tiempo');
        }
    },

    startRealTimeTracking() {
        if (this.intervalId) clearInterval(this.intervalId);
        
        this.intervalId = setInterval(() => {
            this.checkExpiration();
            // Aquí se podría añadir lógica para actualizar el badge "Usted está aquí" 
            // comparando new Date() con los horarios teóricos de los tramos.
        }, 15000); // Cada 15 segundos
    },

    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('🛑 [CicloTracking] Módulo destruido y limpieza realizada.');
    }
};

// Exportar para uso modular (si el entorno lo soporta) o dejar en scope global controlado
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CicloTracking;
} else {
    window.CicloTracking = CicloTracking;
}