// ============================================
// AUTH.JS - Lógica de Autenticación
// ============================================

const ADMIN_EMAIL = 'amayaqsas@gmail.com';

const Auth = {
    currentUser: null,
    isAdmin: false,

    renderLogin() {
        const container = document.getElementById('authContainer');
        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h1 class="auth-title">CICLO</h1>
                    </div>

                    <div class="auth-form">
                        <h2 class="form-title">Iniciar Sesión</h2>
                        
                        <div class="msg-error" id="loginError"></div>

                        <div class="input-group-modern">
                            <label class="input-label">Correo Electrónico</label>
                            <input type="email" id="loginEmail" class="input-modern" placeholder="tu@correo.com" autocomplete="email">
                        </div>

                        <div class="input-group-modern">
                            <label class="input-label">Contraseña</label>
                            <input type="password" id="loginPassword" class="input-modern" placeholder="••••••••" autocomplete="current-password">
                        </div>

                        <button class="btn-auth-primary" id="btnLogin">
                            <span>Iniciar Sesión</span>
                        </button>

                        <button class="btn-auth-secondary" id="goRegister" style="margin-top: 12px;">
                            <span>Crear una cuenta nueva</span>
                        </button>
                    </div>
                </div>

                <div class="auth-background">
                    <div class="auth-bg-circle"></div>
                    <div class="auth-bg-circle"></div>
                    <div class="auth-bg-circle"></div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .auth-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                position: relative;
                overflow: hidden;
                background: linear-gradient(135deg, var(--bg) 0%, var(--bg-soft) 100%);
            }

            .auth-background {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                overflow: hidden;
                z-index: 0;
            }

            .auth-bg-circle {
                position: absolute;
                border-radius: 50%;
                background: var(--primary);
                opacity: 0.1;
                animation: float 20s infinite ease-in-out;
            }

            .auth-bg-circle:nth-child(1) {
                width: 300px;
                height: 300px;
                top: -150px;
                right: -100px;
                animation-delay: 0s;
            }

            .auth-bg-circle:nth-child(2) {
                width: 200px;
                height: 200px;
                bottom: -100px;
                left: -50px;
                animation-delay: 5s;
            }

            .auth-bg-circle:nth-child(3) {
                width: 150px;
                height: 150px;
                top: 50%;
                left: 50%;
                animation-delay: 10s;
            }

            @keyframes float {
                0%, 100% { transform: translate(0, 0) scale(1); }
                33% { transform: translate(30px, -30px) scale(1.1); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
            }

            .auth-card {
                background: var(--surface);
                border-radius: 20px;
                padding: 32px 28px;
                max-width: 400px;
                width: 100%;
                box-shadow: var(--clay-shadow);
                position: relative;
                z-index: 1;
                animation: slideUp 0.5s ease-out;
            }

            @keyframes slideUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .auth-header { text-align: center; margin-bottom: 24px; }
            
            .auth-title {
                font-size: 36px;
                font-weight: 800;
                color: var(--primary);
                margin: 0;
                letter-spacing: 3px;
            }

            .auth-form { width: 100%; }
            
            .form-title {
                font-size: 18px;
                font-weight: 700;
                color: var(--text);
                margin: 0 0 20px 0;
                text-align: center;
            }

            .input-group-modern { margin-bottom: 16px; }
            
            .input-label {
                display: block;
                font-size: 13px;
                font-weight: 600;
                color: var(--text);
                margin-bottom: 6px;
            }
            
            .input-modern {
                width: 100%;
                padding: 12px 14px;
                border: 2px solid var(--bg-soft);
                border-radius: 10px;
                font-size: 15px;
                background: var(--bg);
                color: var(--text);
                transition: all 0.3s ease;
                box-sizing: border-box;
            }
            .input-modern:focus {
                outline: none;
                border-color: var(--primary);
                background: var(--surface);
                box-shadow: 0 0 0 3px rgba(155, 127, 212, 0.1);
            }
            .input-modern::placeholder { color: var(--text-light); }

            .btn-auth-primary {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 8px;
                box-shadow: 0 4px 12px rgba(155, 127, 212, 0.3);
            }
            .btn-auth-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(155, 127, 212, 0.4); }
            .btn-auth-primary:active { transform: translateY(0); }
            .btn-auth-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

            .btn-auth-secondary {
                width: 100%;
                padding: 12px;
                background: var(--bg-soft);
                color: var(--text);
                border: 2px solid var(--bg-soft);
                border-radius: 10px;
                font-size: 15px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .btn-auth-secondary:hover { background: var(--bg); border-color: var(--primary); color: var(--primary); }

            .msg-error {
                background: #fee;
                color: #c33;
                padding: 10px;
                border-radius: 8px;
                font-size: 13px;
                margin-bottom: 14px;
                display: none;
                border-left: 4px solid #c33;
            }
            .msg-error.show { display: block; animation: shake 0.5s ease-in-out; }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }

            .spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s ease-in-out infinite;
            }
            @keyframes spin { to { transform: rotate(360deg); } }

            @media (max-width: 480px) {
                .auth-card { padding: 28px 24px; max-width: 360px; }
                .auth-title { font-size: 32px; }
                .form-title { font-size: 17px; }
                .input-modern { padding: 11px 13px; }
                .btn-auth-primary, .btn-auth-secondary { padding: 11px; font-size: 15px; }
            }
        `;
        document.head.appendChild(style);

        document.getElementById('btnLogin').addEventListener('click', () => this.handleLogin());
        document.getElementById('goRegister').addEventListener('click', () => this.renderRegister());
        document.getElementById('loginPassword').addEventListener('keypress', e => {
            if (e.key === 'Enter') this.handleLogin();
        });
    },

    renderRegister() {
        const container = document.getElementById('authContainer');
        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h1 class="auth-title">CICLO</h1>
                    </div>

                    <div class="auth-form">
                        <h2 class="form-title">Crear Cuenta</h2>
                        
                        <div class="msg-error" id="registerError"></div>
                        <div class="msg-success" id="registerSuccess"></div>

                        <div class="input-group-modern">
                            <label class="input-label">Nombre/Seudónimo</label>
                            <input type="text" id="registerName" class="input-modern" placeholder="Tu nombre" autocomplete="name">
                        </div>

                        <div class="input-group-modern">
                            <label class="input-label">Correo Electrónico</label>
                            <input type="email" id="registerEmail" class="input-modern" placeholder="tu@correo.com" autocomplete="email">
                        </div>

                        <div class="input-group-modern">
                            <label class="input-label">Contraseña</label>
                            <input type="password" id="registerPassword" class="input-modern" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
                        </div>

                        <button class="btn-auth-primary" id="btnRegister">
                            <span>Crear Cuenta</span>
                        </button>

                        <button class="btn-auth-secondary" id="btnBackLogin" style="margin-top: 12px;">
                            <span>Volver al Login</span>
                        </button>
                    </div>
                </div>

                <div class="auth-background">
                    <div class="auth-bg-circle"></div>
                    <div class="auth-bg-circle"></div>
                    <div class="auth-bg-circle"></div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .msg-success {
                background: #efe;
                color: #3c3;
                padding: 10px;
                border-radius: 8px;
                font-size: 13px;
                margin-bottom: 14px;
                display: none;
                border-left: 4px solid #3c3;
            }
            .msg-success.show { display: block; animation: slideDown 0.3s ease-out; }
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);

        document.getElementById('btnRegister').addEventListener('click', () => this.handleRegister());
        document.getElementById('btnBackLogin').addEventListener('click', () => this.renderLogin());
        document.getElementById('registerPassword').addEventListener('keypress', e => {
            if (e.key === 'Enter') this.handleRegister();
        });
    },

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        console.log(' Intentando login con:', email);

        if (!email || !password) {
            this.showError('loginError', 'Completa todos los campos');
            return;
        }

        const btn = document.getElementById('btnLogin');
        btn.innerHTML = '<div class="spinner"></div>';
        btn.disabled = true;

        try {
            if (!firebase || !firebase.auth) {
                throw new Error('Firebase no está disponible');
            }

            const auth = firebase.auth();
            console.log(' Llamando a signInWithEmailAndPassword...');
            
            await auth.signInWithEmailAndPassword(email, password);
            console.log('✅ Login exitoso');
            
        } catch (error) {
            console.error('❌ Error de login:', error.code, error.message);
            this.showError('loginError', this.getAuthError(error.code, error.message));
            btn.innerHTML = '<span>Iniciar Sesión</span>';
            btn.disabled = false;
        }
    },

    async handleRegister() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

        console.log('📝 Intentando registro:', { name, email });

        if (!name || !email || !password) {
            this.showError('registerError', 'Completa todos los campos');
            return;
        }
        if (password.length < 6) {
            this.showError('registerError', 'Mínimo 6 caracteres');
            return;
        }

        const btn = document.getElementById('btnRegister');
        btn.innerHTML = '<div class="spinner"></div>';
        btn.disabled = true;

        try {
            if (!firebase || !firebase.auth) {
                throw new Error('Firebase no está disponible');
            }

            const auth = firebase.auth();
            const cred = await auth.createUserWithEmailAndPassword(email, password);
            
            DB.set('userName', name);
            console.log('💾 Nombre guardado en localStorage:', name);
            
            await cred.user.updateProfile({ displayName: name });
            console.log('✅ Perfil de Firebase actualizado con displayName:', name);
            
            this.showSuccess('registerSuccess', '¡Cuenta creada! Bienvenido ' + name);

            document.getElementById('registerName').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
            
            console.log('✅ Registro exitoso. El onAuthStateChanged se encargará del resto.');
            
        } catch (error) {
            console.error('❌ Error de registro:', error.code, error.message);
            this.showError('registerError', this.getAuthError(error.code, error.message));
            btn.innerHTML = '<span>Crear Cuenta</span>';
            btn.disabled = false;
        }
    },

    showError(elementId, msg) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = msg;
            el.classList.add('show');
            setTimeout(() => el.classList.remove('show'), 4000);
        }
    },

    showSuccess(elementId, msg) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = msg;
            el.classList.add('show');
            setTimeout(() => el.classList.remove('show'), 3000);
        }
    },

    getAuthError(code, message) {
        const errors = {
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/invalid-credential': 'Credenciales incorrectas',
            'auth/email-already-in-use': 'Este correo ya está registrado',
            'auth/weak-password': 'Contraseña muy débil (mín. 6 caracteres)',
            'auth/invalid-email': 'Correo inválido',
            'auth/too-many-requests': 'Demasiados intentos. Espera un momento',
            'auth/network-request-failed': 'Sin conexión a internet',
            'auth/api-key-not-valid': 'API Key de Firebase inválida',
            'auth/app-not-authorized': 'App no autorizada en Firebase'
        };
        
        if (errors[code]) return errors[code];
        if (message) return message;
        
        return 'Error: ' + (code || 'desconocido');
    },

    getUserName(user) {
        console.log('👤 Obteniendo nombre del usuario...');
        
        const localName = DB.get('userName');
        console.log('📦 Nombre en localStorage:', localName);
        
        if (localName && localName.trim() !== '') {
            console.log('✅ Usando nombre de localStorage:', localName);
            return localName.trim();
        }
        
        if (user && user.displayName && user.displayName.trim() !== '') {
            console.log('✅ Usando displayName de Firebase:', user.displayName);
            DB.set('userName', user.displayName);
            return user.displayName.trim();
        }
        
        if (user && user.email) {
            const emailName = user.email.split('@')[0];
            console.log('⚠️ Usando nombre del correo:', emailName);
            return emailName;
        }
        
        console.log('⚠️ No se encontró nombre, usando "Usuario"');
        return 'Usuario';
    },

    async logout() {
        console.log('🚪 Cerrando sesión...');
        DB.remove('userName');
        await firebase.auth().signOut();
    }
};

// Hacer Auth disponible globalmente
window.Auth = Auth;
window.ADMIN_EMAIL = ADMIN_EMAIL;