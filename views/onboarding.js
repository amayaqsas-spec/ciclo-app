// ============================================
// ONBOARDING.JS - Bienvenida y Configuración Inicial Obligatoria
// ============================================

const Onboarding = {
    render() {
        const lineas = DB.load('lineas');
        const lineaOptions = lineas.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('');

        return `
            <div class="auth-container" style="background: linear-gradient(135deg, var(--bg) 0%, var(--bg-soft) 100%);">
                <div class="auth-card" style="max-width: 500px; padding: 40px 32px;">
                    <div class="auth-header" style="margin-bottom: 24px;">
                        <h1 class="auth-title" style="font-size: 42px; margin-bottom: 8px;">CICLO</h1>
                        <p class="auth-subtitle" style="font-size: 16px; color: var(--text); font-weight: 500;">
                            ¡Bienvenido a tu espacio de gestión inteligente!
                        </p>
                    </div>

                    <div style="background: var(--bg-soft); padding: 16px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid var(--primary);">
                        <p style="font-size: 14px; color: var(--text); margin: 0; line-height: 1.5;">
                            Esta aplicación te ayudará a consultar tus servicios, turnos, trenes y tiempos de descanso de manera rápida y precisa. 
                            <br><br>
                            <strong>¡Gracias por ser parte del equipo!</strong> Para comenzar, por favor configura tu perfil operativo.
                        </p>
                    </div>

                    <div class="auth-form">
                        <h2 class="form-title" style="text-align: left; font-size: 18px; margin-bottom: 16px;">Configura tu perfil</h2>
                        
                        <div class="msg-error" id="onboardingError"></div>

                        <div class="input-group-modern">
                            <label class="input-label">Tu Línea</label>
                            <select id="onbLinea" class="input-modern">
                                <option value="">Selecciona tu línea</option>
                                ${lineaOptions}
                            </select>
                        </div>

                        <div class="input-group-modern">
                            <label class="input-label">Tu Terminal</label>
                            <select id="onbTerminal" class="input-modern" disabled>
                                <option value="">Selecciona línea primero</option>
                            </select>
                        </div>

                        <div class="input-group-modern">
                            <label class="input-label">Tu Número de Rol</label>
                            <input type="text" id="onbRol" class="input-modern" placeholder="Ej. 1234">
                        </div>

                        <button class="btn-auth-primary" id="btnEmpezar" style="margin-top: 16px;">
                            <span>Empezar a usar la App</span>
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
        // Si ya está configurado, redirigir al home
        if (DB.get('perfilConfigurado') === true) {
            window.Views.load('home', false);
            return;
        }

        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const selectLinea = document.getElementById('onbLinea');
        const selectTerminal = document.getElementById('onbTerminal');

        selectLinea.addEventListener('change', () => {
            const lineaId = selectLinea.value;
            const filtradas = terminales.filter(t => t.lineaId === lineaId);
            
            selectTerminal.innerHTML = filtradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + filtradas.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('');
            
            selectTerminal.disabled = filtradas.length === 0;
        });

        document.getElementById('btnEmpezar').addEventListener('click', async () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const numeroRol = document.getElementById('onbRol').value.trim();

            if (!lineaId || !terminalId || !numeroRol) {
                const err = document.getElementById('onboardingError');
                err.textContent = 'Por favor, completa todos los campos.';
                err.classList.add('show');
                setTimeout(() => err.classList.remove('show'), 3000);
                return;
            }

            // Guardar configuración del usuario
            DB.set('perfilConfigurado', true);
            DB.set('userLineaId', lineaId);
            DB.set('userTerminalId', terminalId);
            DB.set('userNumeroRol', numeroRol);

            App.showToast('✅ Perfil configurado correctamente');
            
            // ✅ CAMBIO: Usar window.Views en lugar de Views
            setTimeout(() => {
                window.Views.load('home', false);
            }, 500);
        });
    }
};

export default Onboarding;