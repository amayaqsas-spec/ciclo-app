// ============================================
// ONBOARDING.JS - Configuración Inicial Obligatoria (Paso 1, 2 y 3)
// ============================================

const Onboarding = {
    render() {
        const lineas = DB.load('lineas');
        const lineaOptions = lineas.length > 0 
            ? '<option value="">Selecciona tu línea</option>' + lineas.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('')
            : '<option value="">No hay líneas registradas</option>';

        return `
            <div class="auth-container" style="background: linear-gradient(135deg, var(--bg) 0%, var(--bg-soft) 100%);">
                <div class="auth-card" style="max-width: 500px; padding: 40px 32px;">
                    <div class="auth-header" style="margin-bottom: 24px;">
                        <h1 class="auth-title" style="font-size: 42px; margin-bottom: 8px;">CICLO</h1>
                        <p class="auth-subtitle" style="font-size: 16px; color: var(--text); font-weight: 500;">
                            ¡Bienvenido a tu espacio de gestión!
                        </p>
                    </div>

                    <div style="background: #fff3cd; padding: 16px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #ffc107;">
                        <p style="font-size: 14px; color: #856404; margin: 0; line-height: 1.5;">
                            <strong>⚠️ Paso 1: Configuración Obligatoria</strong><br>
                            Para que la app funcione, es indispensable que ingreses tu <strong>Número de Rol</strong> asignado. 
                            Cada usuario tiene un rol único. Este dato es el que la app usará para cargar tus horarios, trenes y descansos. 
                            <br><br>
                            <em>Si no tienes tu número de rol, solicítalo a tu administrador.</em>
                        </p>
                    </div>

                    <div class="auth-form">
                        <h2 class="form-title" style="text-align: left; font-size: 18px; margin-bottom: 16px;">Datos de tu Perfil</h2>
                        
                        <div class="msg-error" id="onboardingError" style="display: none; background: #fee; color: #c33; padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 14px; border-left: 4px solid #c33;"></div>

                        <div class="input-group-modern">
                            <label class="input-label">Tu Línea *</label>
                            <select id="onbLinea" class="input-modern">
                                ${lineaOptions}
                            </select>
                        </div>

                        <div class="input-group-modern">
                            <label class="input-label">Tu Terminal *</label>
                            <select id="onbTerminal" class="input-modern" disabled>
                                <option value="">Selecciona línea primero</option>
                            </select>
                        </div>

                        <div class="input-group-modern">
                            <label class="input-label">Tu Número de Rol *</label>
                            <input type="text" id="onbRol" class="input-modern" placeholder="Ej. 1, 2, 7, etc." inputmode="numeric">
                            <p style="font-size: 11px; color: var(--text-soft); margin-top: 4px;">Este número es único por usuario y define tus horarios.</p>
                        </div>

                        <button class="btn-auth-primary" id="btnEmpezar" style="margin-top: 16px;">
                            <span>Guardar y Entrar a la App</span>
                        </button>
                    </div>
                </div>

                <div class="auth-background">
                    <div class="auth-bg-circle"></div>
                    <div class="auth-bg-circle"></div>
                </div>
            </div>
        `;
    },

    init() {
        // ✅ PASO 3: Si ya está configurado, saltar directamente al Home
        if (DB.get('perfilConfigurado') === true) {
            window.Views.load('home', false);
            return;
        }

        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const selectLinea = document.getElementById('onbLinea');
        const selectTerminal = document.getElementById('onbTerminal');
        const errorMsg = document.getElementById('onboardingError');

        // Cascada de terminales: al cambiar la línea, se actualizan las terminales
        selectLinea.addEventListener('change', () => {
            const lineaId = selectLinea.value;
            const filtradas = terminales.filter(t => t.lineaId === lineaId);
            
            selectTerminal.innerHTML = filtradas.length === 0
                ? '<option value="">No hay terminales para esta línea</option>'
                : '<option value="">Selecciona tu terminal</option>' + filtradas.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('');
            
            selectTerminal.disabled = filtradas.length === 0;
        });

        // ✅ PASO 2: Validación estricta al guardar
        document.getElementById('btnEmpezar').addEventListener('click', async () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const numeroRol = document.getElementById('onbRol').value.trim();

            // Si falta alguno, NO deja avanzar y muestra error
            if (!lineaId || !terminalId || !numeroRol) {
                errorMsg.textContent = '⚠️ Es indispensable completar Línea, Terminal y Número de Rol para continuar.';
                errorMsg.style.display = 'block';
                setTimeout(() => { errorMsg.style.display = 'none'; }, 4000);
                return;
            }

            // ✅ Guardar configuración de forma persistente en el dispositivo del usuario
            DB.set('perfilConfigurado', true);
            DB.set('userLineaId', lineaId);
            DB.set('userTerminalId', terminalId);
            DB.set('userNumeroRol', numeroRol);

            // Feedback visual de carga
            const btn = document.getElementById('btnEmpezar');
            const textoOriginal = btn.innerHTML;
            btn.innerHTML = '<div class="spinner"></div> Guardando...';
            btn.disabled = true;

            setTimeout(() => {
                App.showToast('✅ Perfil configurado correctamente');
                // Redirigir al Home, que ahora cargará los datos de ESTE rol específico
                window.Views.load('home', false);
            }, 800);
        });
    }
};

export default Onboarding;