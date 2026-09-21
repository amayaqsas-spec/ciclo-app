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
            <div class="screen-container">
                <div class="screen-header">
                    <div class="screen-header-content">
                        <h1>CICLO</h1>
                        <p>Bienvenido de vuelta. Inicia sesión para continuar</p>
                    </div>
                </div>
                <div class="screen-form">
                    <h2 class="form-title">Login</h2>
                    <div class="msg-error" id="loginError"></div>
                    <div class="input-group">
                        <label>Email</label>
                        <input type="email" id="loginEmail" placeholder="tu@correo.com" autocomplete="email">
                    </div>
                    <div class="input-group">
                        <label>Contraseña</label>
                        <input type="password" id="loginPassword" placeholder="••••••••" autocomplete="current-password">
                    </div>
                    <button class="btn-primary" id="btnLogin">Iniciar Sesión</button>
                    <div class="bottom-text">¿No tienes una cuenta? <a id="goRegister">Regístrate</a></div>
                </div>
            </div>
        `;

        document.getElementById('btnLogin').addEventListener('click', () => this.handleLogin());
        document.getElementById('goRegister').addEventListener('click', () => this.renderRegister());
        document.getElementById('loginPassword').addEventListener('keypress', e => {
            if (e.key === 'Enter') this.handleLogin();
        });
    },

    renderRegister() {
        const container = document.getElementById('authContainer');
        container.innerHTML = `
            <div class="screen-container">
                <div class="screen-header">
                    <div class="screen-header-content">
                        <h1>CICLO</h1>
                        <p>Crea tu cuenta y comienza</p>
                    </div>
                </div>
                <div class="screen-form">
                    <h2 class="form-title">Crear cuenta</h2>
                    <div class="msg-error" id="registerError"></div>
                    <div class="msg-success" id="registerSuccess"></div>
                    <div class="input-group">
                        <label>Nombre</label>
                        <input type="text" id="registerName" placeholder="Tu nombre" autocomplete="name">
                    </div>
                    <div class="input-group">
                        <label>Correo electrónico</label>
                        <input type="email" id="registerEmail" placeholder="tu@correo.com" autocomplete="email">
                    </div>
                    <div class="input-group">
                        <label>Contraseña</label>
                        <input type="password" id="registerPassword" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
                    </div>
                    <button class="btn-primary" id="btnRegister">Empezar</button>
                    <button class="btn-secondary" id="btnBackLogin">Volver al login</button>
                </div>
            </div>
        `;

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
            
        } catch (error) {
            console.error(' Error de login:', error.code, error.message);
            this.showError('loginError', this.getAuthError(error.code, error.message));
            btn.innerHTML = 'Iniciar Sesión';
            btn.disabled = false;
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
            
            // GUARDAR EL NOMBRE EN LOCALSTORAGE (PRIORIDAD MÁXIMA)
            DB.set('userName', name);
            console.log('💾 Nombre guardado en localStorage:', name);
            
            // También actualizar el perfil de Firebase
            await cred.user.updateProfile({ displayName: name });
            console.log('✅ Perfil de Firebase actualizado con displayName:', name);
            
            this.showSuccess('registerSuccess', '¡Cuenta creada! Bienvenido ' + name);

            // Limpiar formulario
            document.getElementById('registerName').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
            
            console.log('✅ Registro exitoso. El onAuthStateChanged se encargará del resto.');
            
        } catch (error) {
            console.error('❌ Error de registro:', error.code, error.message);
            this.showError('registerError', this.getAuthError(error.code, error.message));
            btn.innerHTML = 'Empezar';
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

    // FUNCIÓN CORREGIDA: Prioriza el nombre del campo "Nombre" del registro
    getUserName(user) {
        console.log(' Obteniendo nombre del usuario...');
        
        // PRIORIDAD 1: Nombre guardado en localStorage (del campo "Nombre" del registro)
        const localName = DB.get('userName');
        console.log('📦 Nombre en localStorage:', localName);
        
        if (localName && localName.trim() !== '') {
            console.log('✅ Usando nombre de localStorage:', localName);
            return localName.trim();
        }
        
        // PRIORIDAD 2: displayName de Firebase (también se actualiza al registrar)
        if (user && user.displayName && user.displayName.trim() !== '') {
            console.log('✅ Usando displayName de Firebase:', user.displayName);
            // Guardar en localStorage para futuras sesiones
            DB.set('userName', user.displayName);
            return user.displayName.trim();
        }
        
        // PRIORIDAD 3: Parte del correo (último recurso, NOMBRE NO DEBERÍA LLEGAR AQUÍ)
        if (user && user.email) {
            const emailName = user.email.split('@')[0];
            console.log('⚠️ Usando nombre del correo (último recurso):', emailName);
            return emailName;
        }
        
        console.log('⚠️ No se encontró nombre, usando "Usuario"');
        return 'Usuario';
    },

    async logout() {
        console.log(' Cerrando sesión...');
        DB.remove('userName');
        await firebase.auth().signOut();
    }
};

// Hacer Auth disponible globalmente
window.Auth = Auth;
window.ADMIN_EMAIL = ADMIN_EMAIL;