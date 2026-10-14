// ============================================
// AUTH.JS - Autenticación con correcciones iOS
// ============================================

const ADMIN_EMAIL = 'amayaqsas@gmail.com';

const Auth = {
    currentUser: null,
    isAdmin: false,
    isOffline: false,

    async initPersistence() {
        try {
            if (firebase && firebase.auth) {
                await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                console.log('✅ Persistencia de sesión configurada: LOCAL');
            }
        } catch (error) {
            console.warn('️ No se pudo configurar persistencia:', error);
        }
    },

    // ✅ Función para cerrar menús y forzar resize en iOS
    cleanupUI() {
        const sideMenu = document.getElementById('sideMenu');
        const menuOverlay = document.getElementById('menuOverlay');
        if (sideMenu) sideMenu.classList.remove('active');
        if (menuOverlay) menuOverlay.classList.remove('active');
        
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    },

    renderLogin() {
        const container = document.getElementById('authContainer');
        if (!container) return;
        
        // ✅ Ocultar mainApp completamente
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.style.display = 'none';
            mainApp.classList.remove('show');
        }

        container.innerHTML = `
            <div class="auth-wrapper-ios">
                <div class="auth-card-ios">
                    <div class="auth-header-ios">
                        <div class="auth-logo-ios">CICLO</div>
                        <p class="auth-subtitle-ios">Iniciar Sesión</p>
                    </div>

                    <div class="auth-form-ios">
                        <div class="msg-error" id="loginError"></div>

                        <div class="input-group-ios">
                            <label class="input-label-ios">Correo Electrónico</label>
                            <input type="email" id="loginEmail" class="input-ios" placeholder="tu@correo.com" autocomplete="email">
                        </div>

                        <div class="input-group-ios">
                            <label class="input-label-ios">Contraseña</label>
                            <input type="password" id="loginPassword" class="input-ios" placeholder="••••••••" autocomplete="current-password">
                        </div>

                        <button class="btn-primary-ios" id="btnLogin">
                            Iniciar Sesión
                        </button>

                        <button class="btn-secondary-ios" id="goRegister">
                            Crear una cuenta nueva
                        </button>
                    </div>
                </div>
            </div>
        `;

        // ✅ CSS específico para iOS con safe area
        const style = document.createElement('style');
        style.textContent = `
            .auth-wrapper-ios {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
                background: linear-gradient(135deg, var(--bg) 0%, var(--bg-soft) 100%);
                z-index: 10000;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
            }
            .auth-card-ios {
                background: var(--surface);
                border-radius: 24px;
                padding: 32px 24px;
                max-width: 360px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                margin: 20px;
                animation: slideUpIOS 0.4s ease-out;
            }
            @keyframes slideUpIOS {
                from { opacity: 0; transform: translateY(50px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .auth-header-ios {
                text-align: center;
                margin-bottom: 32px;
            }
            .auth-logo-ios {
                font-size: 36px;
                font-weight: 800;
                color: var(--primary);
                margin-bottom: 8px;
                letter-spacing: 2px;
            }
            .auth-subtitle-ios {
                font-size: 16px;
                color: var(--text-soft);
                margin: 0;
            }
            .auth-form-ios {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .input-group-ios {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .input-label-ios {
                font-size: 13px;
                font-weight: 600;
                color: var(--text);
            }
            .input-ios {
                width: 100%;
                padding: 14px 16px;
                border: 2px solid var(--bg-soft);
                border-radius: 12px;
                font-size: 16px;
                background: var(--bg);
                color: var(--text);
                box-sizing: border-box;
                -webkit-appearance: none;
            }
            .input-ios:focus {
                outline: none;
                border-color: var(--primary);
                background: var(--surface);
            }
            .btn-primary-ios {
                width: 100%;
                padding: 16px;
                background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                margin-top: 8px;
                box-shadow: 0 4px 16px rgba(155, 127, 212, 0.3);
                -webkit-tap-highlight-color: transparent;
                touch-action: manipulation;
            }
            .btn-primary-ios:active {
                transform: scale(0.98);
            }
            .btn-primary-ios:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            .btn-secondary-ios {
                width: 100%;
                padding: 16px;
                background: var(--bg-soft);
                color: var(--text);
                border: 2px solid var(--bg-soft);
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                -webkit-tap-highlight-color: transparent;
                touch-action: manipulation;
            }
            .btn-secondary-ios:active {
                background: var(--bg);
                border-color: var(--primary);
                color: var(--primary);
                transform: scale(0.98);
            }
            .msg-error {
                background: #fee;
                color: #c33;
                padding: 12px;
                border-radius: 8px;
                font-size: 13px;
                display: none;
                border-left: 4px solid #c33;
                margin-bottom: 8px;
            }
            .msg-error.show {
                display: block;
                animation: shakeIOS 0.5s ease-in-out;
            }
            @keyframes shakeIOS {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
            .spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s ease-in-out infinite;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            @media (max-width: 480px) {
                .auth-card-ios {
                    padding: 28px 20px;
                    width: 95%;
                    margin: 15px;
                }
                .auth-logo-ios {
                    font-size: 32px;
                }
                .input-ios, .btn-primary-ios, .btn-secondary-ios {
                    padding: 14px 16px;
                }
            }
        `;
        document.head.appendChild(style);

        // ✅ Event listeners
        document.getElementById('btnLogin').addEventListener('click', () => this.handleLogin());
        document.getElementById('goRegister').addEventListener('click', () => this.renderRegister());
        
        document.getElementById('loginPassword').addEventListener('keypress', e => {
            if (e.key === 'Enter') this.handleLogin();
        });
    },

    renderRegister() {
        const container = document.getElementById('authContainer');
        if (!container) return;

        // ✅ Asegurar que mainApp esté oculto
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.style.display = 'none';
        }

        container.innerHTML = `
            <div class="auth-wrapper-ios">
                <div class="auth-card-ios">
                    <div class="auth-header-ios">
                        <div class="auth-logo-ios">CICLO</div>
                        <p class="auth-subtitle-ios">Crear Cuenta</p>
                    </div>

                    <div class="auth-form-ios">
                        <div class="msg-error" id="registerError"></div>
                        <div class="msg-success" id="registerSuccess"></div>

                        <div class="input-group-ios">
                            <label class="input-label-ios">Nombre/Seudónimo</label>
                            <input type="text" id="registerName" class="input-ios" placeholder="Tu nombre" autocomplete="name">
                        </div>

                        <div class="input-group-ios">
                            <label class="input-label-ios">Correo Electrónico</label>
                            <input type="email" id="registerEmail" class="input-ios" placeholder="tu@correo.com" autocomplete="email">
                        </div>

                        <div class="input-group-ios">
                            <label class="input-label-ios">Contraseña</label>
                            <input type="password" id="registerPassword" class="input-ios" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
                        </div>

                        <button class="btn-primary-ios" id="btnRegister">
                            Crear Cuenta
                        </button>

                        <button class="btn-secondary-ios" id="btnBackLogin">
                            Volver al Login
                        </button>
                    </div>
                </div>
            </div>
        `;

        // ✅ CSS para mensaje de éxito
        const style = document.createElement('style');
        style.textContent = `
            .msg-success {
                background: #efe;
                color: #3c3;
                padding: 12px;
                border-radius: 8px;
                font-size: 13px;
                display: none;
                border-left: 4px solid #3c3;
                margin-bottom: 8px;
            }
            .msg-success.show {
                display: block;
                animation: slideDownIOS 0.3s ease-out;
            }
            @keyframes slideDownIOS {
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

        console.log('🔐 Intentando login con:', email);

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
            console.log('🔑 Llamando a signInWithEmailAndPassword...');
            
            await auth.signInWithEmailAndPassword(email, password);
            console.log('✅ Login exitoso');
            
            // ✅ Corrección iOS: Limpiar UI
            this.cleanupUI();
            
        } catch (error) {
            console.error('❌ Error de login:', error.code, error.message);
            
            if (error.code === 'auth/network-request-failed' || error.message.includes('network')) {
                console.log('📡 Error de red, intentando login offline...');
                this.handleOfflineLogin(email, password);
                return;
            }
            
            this.showError('loginError', this.getAuthError(error.code, error.message));
            btn.innerHTML = 'Iniciar Sesión';
            btn.disabled = false;
        }
    },

    handleOfflineLogin(email, password) {
        const savedUsers = DB.get('registeredUsers', []);
        const user = savedUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            console.log('✅ Login offline exitoso para:', user.email);
            this.isOffline = true;
            
            this.currentUser = {
                uid: user.uid || 'offline-' + Date.now(),
                email: user.email,
                displayName: user.nombre
            };
            this.isAdmin = user.email === ADMIN_EMAIL;
            
            DB.set('userName', user.nombre);
            DB.set('offlineUser', user);
            
            this.cleanupUI();
            this.triggerOfflineAuth();
        } else {
            this.showError('loginError', 'Credenciales incorrectas o usuario no registrado');
            const btn = document.getElementById('btnLogin');
            btn.innerHTML = 'Iniciar Sesión';
            btn.disabled = false;
        }
    },

    triggerOfflineAuth() {
        if (window.App && window.App.handleOfflineUser) {
            window.App.handleOfflineUser(this.currentUser);
        }
    },

    async handleRegister() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

        console.log(' Intentando registro:', { name, email });

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
            
            const uid = cred.user.uid;
            console.log('✅ Usuario creado con UID:', uid);

            try {
                const db = firebase.firestore();
                await db.collection('usuarios').doc(uid).set({
                    uid: uid,
                    nombre: name,
                    email: email,
                    fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
                    rol: 'usuario'
                });
                console.log('✅ Usuario guardado en Firestore:', name);
            } catch (firestoreError) {
                console.error('⚠️ Error al guardar en Firestore:', firestoreError);
            }

            const savedUsers = DB.get('registeredUsers', []);
            savedUsers.push({
                uid: uid,
                nombre: name,
                email: email,
                password: password,
                fechaRegistro: Date.now()
            });
            DB.set('registeredUsers', savedUsers);
            console.log('💾 Usuario guardado localmente para offline');

            DB.set('userName', name);
            await cred.user.updateProfile({ displayName: name });
            
            this.showSuccess('registerSuccess', '¡Cuenta creada! Bienvenido ' + name);

            document.getElementById('registerName').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
            
            setTimeout(() => {
                this.cleanupUI();
            }, 1500);
            
        } catch (error) {
            console.error('❌ Error de registro:', error.code, error.message);
            
            if (error.code === 'auth/network-request-failed' || error.message.includes('network')) {
                console.log('📡 Error de red, registrando localmente...');
                this.handleOfflineRegister(name, email, password);
                return;
            }
            
            this.showError('registerError', this.getAuthError(error.code, error.message));
            btn.innerHTML = 'Crear Cuenta';
            btn.disabled = false;
        }
    },

    handleOfflineRegister(name, email, password) {
        const savedUsers = DB.get('registeredUsers', []);
        
        if (savedUsers.find(u => u.email === email)) {
            this.showError('registerError', 'Este correo ya está registrado');
            const btn = document.getElementById('btnRegister');
            btn.innerHTML = 'Crear Cuenta';
            btn.disabled = false;
            return;
        }

        const uid = 'offline-' + Date.now();
        savedUsers.push({
            uid: uid,
            nombre: name,
            email: email,
            password: password,
            fechaRegistro: Date.now(),
            offline: true
        });
        DB.set('registeredUsers', savedUsers);
        DB.set('userName', name);

        console.log('✅ Usuario registrado offline:', name);
        this.showSuccess('registerSuccess', '¡Cuenta creada offline!');

        document.getElementById('registerName').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';

        const btn = document.getElementById('btnRegister');
        btn.innerHTML = 'Crear Cuenta';
        btn.disabled = false;
        
        setTimeout(() => {
            this.cleanupUI();
        }, 1500);
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
            'auth/network-request-failed': 'Sin conexión a internet'
        };
        
        if (errors[code]) return errors[code];
        if (message) return message;
        
        return 'Error: ' + (code || 'desconocido');
    },

    getUserName(user) {
        const localName = DB.get('userName');
        
        if (localName && localName.trim() !== '') {
            return localName.trim();
        }
        
        if (user && user.displayName && user.displayName.trim() !== '') {
            DB.set('userName', user.displayName);
            return user.displayName.trim();
        }
        
        if (user && user.email) {
            return user.email.split('@')[0];
        }
        
        return 'Usuario';
    },

    async logout() {
        console.log('🚪 Cerrando sesión...');
        DB.remove('userName');
        DB.remove('offlineUser');
        this.isOffline = false;
        
        this.cleanupUI();
        
        if (firebase && firebase.auth) {
            await firebase.auth().signOut();
        }
    }
};

window.Auth = Auth;
window.ADMIN_EMAIL = ADMIN_EMAIL;