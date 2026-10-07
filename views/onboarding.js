// ============================================
// ONBOARDING.JS - Configuración Inicial Obligatoria
// ============================================

const Onboarding = {
    render(cargando = false) {
        const lineas = DB.load('lineas');
        const lineaOptions = lineas.length > 0 
            ? '<option value="">Selecciona tu línea</option>' + lineas.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('')
            : '<option value="">Cargando líneas...</option>';

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
                        </p>
                    </div>

                    ${cargando ? `
                        <div style="text-align: center; padding: 40px 20px;">
                            <div class="spinner" style="border-color: var(--primary-soft); border-top-color: var(--primary); width: 40px; height: 40px; margin: 0 auto 16px auto;"></div>
                            <p style="color: var(--text-soft); font-size: 14px;">Cargando información...</p>
                        </div>
                    ` : `
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
                    `}
                </div>

                <div class="auth-background">
                    <div class="auth-bg-circle"></div>
                    <div class="auth-bg-circle"></div>
                </div>
            </div>
        `;
    },

    async init() {
        console.log('🎬 Onboarding init() llamado');

        // ✅ Ocultar header y menú lateral durante el onboarding
        const header = document.querySelector('.app-header');
        const sideMenu = document.getElementById('sideMenu');
        const menuOverlay = document.getElementById('menuOverlay');
        if (header) header.style.display = 'none';
        if (sideMenu) sideMenu.style.display = 'none';
        if (menuOverlay) menuOverlay.style.display = 'none';

        if (DB.get('perfilConfigurado') === true) {
            console.log('✅ Perfil ya configurado, yendo al Home');
            this.mostrarUI();
            this.irAlHome();
            return;
        }

        const container = document.getElementById('viewContainer');
        if (container) {
            container.innerHTML = this.render(true);
        }

        console.log(' Cargando líneas y terminales desde Firebase...');
        
        try {
            await DB_FIREBASE.load('lineas');
            await DB_FIREBASE.load('terminales');
            
            const lineas = DB.load('lineas');
            const terminales = DB.load('terminales');
            
            console.log('✅ Líneas cargadas:', lineas.length);
            console.log('✅ Terminales cargadas:', terminales.length);

            if (container) {
                container.innerHTML = this.render(false);
            }

            this.setupEventListeners();

        } catch (error) {
            console.error('❌ Error al cargar datos desde Firebase:', error);
            
            if (container) {
                container.innerHTML = this.render(false);
            }
            
            const errorMsg = document.getElementById('onboardingError');
            if (errorMsg) {
                errorMsg.textContent = '️ Error al cargar las líneas. Intenta recargar la página.';
                errorMsg.style.display = 'block';
            }
        }
    },

    setupEventListeners() {
        const terminales = DB.load('terminales');
        const selectLinea = document.getElementById('onbLinea');
        const selectTerminal = document.getElementById('onbTerminal');
        const errorMsg = document.getElementById('onboardingError');

        if (!selectLinea || !selectTerminal) {
            console.error('❌ No se encontraron los elementos del formulario');
            return;
        }

        selectLinea.addEventListener('change', () => {
            const lineaId = selectLinea.value;
            const filtradas = terminales.filter(t => t.lineaId === lineaId);
            
            selectTerminal.innerHTML = filtradas.length === 0
                ? '<option value="">No hay terminales para esta línea</option>'
                : '<option value="">Selecciona tu terminal</option>' + filtradas.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('');
            
            selectTerminal.disabled = filtradas.length === 0;
        });

        document.getElementById('btnEmpezar').addEventListener('click', async () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const numeroRol = document.getElementById('onbRol').value.trim();

            if (!lineaId || !terminalId || !numeroRol) {
                errorMsg.textContent = '⚠️ Es indispensable completar Línea, Terminal y Número de Rol para continuar.';
                errorMsg.style.display = 'block';
                setTimeout(() => { errorMsg.style.display = 'none'; }, 4000);
                return;
            }

            DB.set('perfilConfigurado', true);
            DB.set('userLineaId', lineaId);
            DB.set('userTerminalId', terminalId);
            DB.set('userNumeroRol', numeroRol);

            console.log('💾 Perfil guardado:', { lineaId, terminalId, numeroRol });

            const btn = document.getElementById('btnEmpezar');
            btn.innerHTML = '<div class="spinner"></div> Guardando...';
            btn.disabled = true;

            setTimeout(() => {
                App.showToast('✅ Perfil configurado correctamente');
                this.mostrarUI();
                this.irAlHome();
            }, 800);
        });
    },

    // ✅ Mostrar de nuevo el header y menú
    mostrarUI() {
        const header = document.querySelector('.app-header');
        const sideMenu = document.getElementById('sideMenu');
        if (header) header.style.display = '';
        if (sideMenu) sideMenu.style.display = '';
    },

    irAlHome() {
        console.log('🚀 Intentando ir al Home...');
        
        if (window.Views && window.Views.load) {
            console.log('✅ Usando window.Views.load');
            window.Views.load('home', false);
            return;
        }
        
        if (typeof Views !== 'undefined' && Views.load) {
            console.log('✅ Usando Views.load directamente');
            Views.load('home', false);
            return;
        }
        
        console.log('⚠️ Views no disponible, recargando página...');
        window.location.href = '#home';
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }
};

export default Onboarding;