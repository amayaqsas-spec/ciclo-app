// ============================================
// APP.JS - Orquestador Principal con navegación back
// ============================================

const firebase = window.firebase || (typeof firebase !== 'undefined' ? firebase : null);

// ============================================
// TEMAS
// ============================================
const themes = {
    lavender: { '--bg': '#F0E6F6', '--bg-soft': '#E8D5F5', '--surface': '#F5EEFA', '--primary': '#9B7FD4', '--primary-soft': '#B8A5E0', '--accent': '#7C5CBF', '--text': '#3D2E5C', '--text-soft': '#7A6B8E', '--text-light': '#A89BBE', '--clay-shadow': '8px 8px 16px #D4C4E0, -8px -8px 16px #FFFFFF', '--clay-shadow-sm': '4px 4px 8px #D4C4E0, -4px -4px 8px #FFFFFF', '--clay-inset': 'inset 4px 4px 8px #D4C4E0, inset -4px -4px 8px #FFFFFF' },
    ocean: { '--bg': '#E6F4F6', '--bg-soft': '#D5EEF5', '--surface': '#EEF8FA', '--primary': '#5FB8D4', '--primary-soft': '#8CCCE0', '--accent': '#3D9ABF', '--text': '#2E4A5C', '--text-soft': '#6B828E', '--text-light': '#9BB0BE', '--clay-shadow': '8px 8px 16px #C4DCE0, -8px -8px 16px #FFFFFF', '--clay-shadow-sm': '4px 4px 8px #C4DCE0, -4px -4px 8px #FFFFFF', '--clay-inset': 'inset 4px 4px 8px #C4DCE0, inset -4px -4px 8px #FFFFFF' },
    mint: { '--bg': '#E6F6EE', '--bg-soft': '#D5F5E8', '--surface': '#EEFAF4', '--primary': '#5FD4A8', '--primary-soft': '#8CE0C0', '--accent': '#3DBF8A', '--text': '#2E5C4A', '--text-soft': '#6B8E7A', '--text-light': '#9BBEA8', '--clay-shadow': '8px 8px 16px #C4E0D4, -8px -8px 16px #FFFFFF', '--clay-shadow-sm': '4px 4px 8px #C4E0D4, -4px -4px 8px #FFFFFF', '--clay-inset': 'inset 4px 4px 8px #C4E0D4, inset -4px -4px 8px #FFFFFF' },
    peach: { '--bg': '#F6EEE6', '--bg-soft': '#F5E0D5', '--surface': '#FAF4EE', '--primary': '#D49B7F', '--primary-soft': '#E0B8A5', '--accent': '#BF7C5C', '--text': '#5C3D2E', '--text-soft': '#8E7A6B', '--text-light': '#BEA89B', '--clay-shadow': '8px 8px 16px #E0D4C4, -8px -8px 16px #FFFFFF', '--clay-shadow-sm': '4px 4px 8px #E0D4C4, -4px -4px 8px #FFFFFF', '--clay-inset': 'inset 4px 4px 8px #E0D4C4, inset -4px -4px 8px #FFFFFF' },
    night: { '--bg': '#2A2438', '--bg-soft': '#352F44', '--surface': '#3D3650', '--primary': '#5C5470', '--primary-soft': '#7A7290', '--accent': '#DBD8E3', '--text': '#FFFFFF', '--text-soft': '#C8C4D4', '--text-light': '#9A96A8', '--clay-shadow': '8px 8px 16px #1A1528, -8px -8px 16px #3A3448', '--clay-shadow-sm': '4px 4px 8px #1A1528, -4px -4px 8px #3A3448', '--clay-inset': 'inset 4px 4px 8px #1A1528, inset -4px -4px 8px #3A3448' },
    rose: { '--bg': '#000000', '--bg-soft': '#1A0010', '--surface': '#2A0018', '--primary': '#E41F7B', '--primary-soft': '#FF4D94', '--accent': '#FF8BA0', '--text': '#FFFFFF', '--text-soft': '#FFB3C6', '--text-light': '#CC8899', '--clay-shadow': '8px 8px 16px #000000, -8px -8px 16px #330020', '--clay-shadow-sm': '4px 4px 8px #000000, -4px -4px 8px #330020', '--clay-inset': 'inset 4px 4px 8px #000000, inset -4px -4px 8px #330020' },
    orange: { '--bg': '#EEEEEE', '--bg-soft': '#E0E0E0', '--surface': '#F5F5F5', '--primary': '#FD7014', '--primary-soft': '#FF8C3A', '--accent': '#FF6B00', '--text': '#222831', '--text-soft': '#5A6070', '--text-light': '#8A90A0', '--clay-shadow': '8px 8px 16px #C8C8C8, -8px -8px 16px #FFFFFF', '--clay-shadow-sm': '4px 4px 8px #C8C8C8, -4px -4px 8px #FFFFFF', '--clay-inset': 'inset 4px 4px 8px #C8C8C8, inset -4px -4px 8px #FFFFFF' },
    red: { '--bg': '#1A0000', '--bg-soft': '#2A0000', '--surface': '#330000', '--primary': '#950101', '--primary-soft': '#CC0000', '--accent': '#FF0000', '--text': '#FFFFFF', '--text-soft': '#FFB3B3', '--text-light': '#CC8888', '--clay-shadow': '8px 8px 16px #0A0000, -8px -8px 16px #2A0000', '--clay-shadow-sm': '4px 4px 8px #0A0000, -4px -4px 8px #2A0000', '--clay-inset': 'inset 4px 4px 8px #0A0000, inset -4px -4px 8px #2A0000' },
    lime: { '--bg': '#0F0F0F', '--bg-soft': '#1A1A1A', '--surface': '#2E2E2E', '--primary': '#C7FF2E', '--primary-soft': '#D4FF5C', '--accent': '#AADD00', '--text': '#FFFFFF', '--text-soft': '#CCCCCC', '--text-light': '#888888', '--clay-shadow': '8px 8px 16px #050505, -8px -8px 16px #1A1A1A', '--clay-shadow-sm': '4px 4px 8px #050505, -4px -4px 8px #1A1A1A', '--clay-inset': 'inset 4px 4px 8px #050505, inset -4px -4px 8px #1A1A1A' }
};

const themeNames = {
    lavender: 'Lavanda', ocean: 'Océano', mint: 'Menta', peach: 'Durazno',
    night: 'Noche', rose: 'Rosa', orange: 'Naranja', red: 'Rojo', lime: 'Lima'
};

// ============================================
// MAPA DE VISTAS
// ============================================
const viewModules = {
    home: './views/home.js',
    avisos: './views/avisos.js',
    notas: './views/notas.js',
    'tiempo-extra': './views/tiempo-extra.js',
    'servicios-busqueda': './views/servicios-busqueda.js',
    'reservas-busqueda': './views/reservas-busqueda.js',
    'espejo': './views/espejo.js',
    'registro-linea': './views/registro/linea.js',
    'registro-terminal': './views/registro/terminal.js',
    'registro-turno': './views/registro/turno.js',
    'registro-semana': './views/registro/semana.js',
    'registro-reservas': './views/registro/reservas.js',
    'registro-servicios': './views/registro/servicios.js',
    'registro-espejo': './views/registro/espejo.js',
    'mi-rol': './views/rol.js',
    'bd': './views/bd.js',
    'app': './views/app.js'
};

const loadedModules = {};

// ============================================
// HISTORIAL DE NAVEGACIÓN
// ============================================
const navigationHistory = ['home'];
let backPressTimer = null;
let isExiting = false;

// ============================================
// NAVEGACIÓN DE VISTAS
// ============================================
const Views = {
    current: 'home',

    menuItems: [
        { id: 'home', label: 'Inicio', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
        { 
            id: 'registro', 
            label: 'Registro', 
            icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
            submenu: [
                { id: 'registro-linea', label: 'Línea' },
                { id: 'registro-terminal', label: 'Terminal' },
                { id: 'registro-turno', label: 'Turno' },
                { id: 'registro-semana', label: 'Tipo de Día' },
                { id: 'registro-reservas', label: 'Reservas' },
                { id: 'registro-servicios', label: 'Servicios' },
                { id: 'registro-espejo', label: 'Espejo' }
            ]
        },
        { id: 'tiempo-extra', label: 'Tiempo Extra', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
        { id: 'servicios-busqueda', label: 'Servicios', icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' },
        { id: 'reservas-busqueda', label: 'Reservas', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
        { id: 'espejo', label: 'Espejo', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>' },
        { id: 'notas', label: 'Notas', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
        { id: 'mi-rol', label: 'Mi Rol', icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
        { id: 'avisos', label: 'Documentos', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>' },
        { id: 'apariencia', label: 'Apariencia', icon: '<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>' },
        { id: 'bd', label: 'B.D.', icon: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>' },
        { id: 'app', label: 'App', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>' }
    ],

    renderMenu() {
        const nav = document.getElementById('sideMenuNav');
        let html = '<div class="nav-section-title">Principal</div>';

        this.menuItems.forEach(item => {
            if (item.id === 'apariencia') {
                html += '<div class="nav-section-title">Configuración</div>';
            }

            if (item.submenu) {
                html += `
                    <div class="nav-item has-submenu" data-menu="${item.id}">
                        <svg viewBox="0 0 24 24">${item.icon}</svg>
                        <span>${item.label}</span>
                        <svg class="submenu-arrow" viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;margin-left:auto;"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <div class="nav-submenu" id="submenu-${item.id}" style="display:none;">
                        ${item.submenu.map(sub => `
                            <div class="nav-subitem" data-view="${sub.id}">${sub.label}</div>
                        `).join('')}
                    </div>
                `;
            } else {
                const activeClass = item.id === this.current ? 'active' : '';
                html += `
                    <div class="nav-item ${activeClass}" data-view="${item.id}">
                        <svg viewBox="0 0 24 24">${item.icon}</svg>
                        <span>${item.label}</span>
                    </div>
                `;
            }
        });

        nav.innerHTML = html;

        nav.querySelectorAll('.nav-item:not(.has-submenu)').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const viewId = item.dataset.view;
                if (viewId) {
                    this.load(viewId, true); // true = agregar al historial
                    App.toggleMenu();
                }
            });
        });

        nav.querySelectorAll('.nav-item.has-submenu').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const menuId = item.dataset.menu;
                const submenu = document.getElementById(`submenu-${menuId}`);
                
                if (submenu) {
                    const isHidden = submenu.style.display === 'none' || submenu.style.display === '';
                    nav.querySelectorAll('.nav-submenu').forEach(sm => sm.style.display = 'none');
                    nav.querySelectorAll('.nav-item.has-submenu').forEach(mi => mi.classList.remove('active'));
                    
                    if (isHidden) {
                        submenu.style.display = 'block';
                        item.classList.add('active');
                    }
                }
            });
        });

        nav.querySelectorAll('.nav-subitem').forEach(subitem => {
            subitem.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const viewId = subitem.dataset.view;
                if (viewId) {
                    this.load(viewId, true); // true = agregar al historial
                    App.toggleMenu();
                }
            });
        });
    },

    async load(viewId, addToHistory = true) {
        console.log('📂 Cargando vista:', viewId);

        const currentModule = this.getCurrentModule();
        if (currentModule && typeof currentModule.onLeave === 'function') {
            const puedeSalir = await currentModule.onLeave();
            if (!puedeSalir) {
                console.log('🚫 Salida cancelada por atraso activo');
                return;
            }
        }

        // ✅ Agregar al historial de navegación
        if (addToHistory && viewId !== this.current) {
            navigationHistory.push(viewId);
            // Agregar estado al historial del navegador
            window.history.pushState({ viewId }, '', `#${viewId}`);
        }

        this.current = viewId;
        const container = document.getElementById('viewContainer');

        document.querySelectorAll('.nav-item, .nav-subitem').forEach(n => n.classList.remove('active'));
        const activeItem = document.querySelector(`.nav-item[data-view="${viewId}"], .nav-subitem[data-view="${viewId}"]`);
        if (activeItem) activeItem.classList.add('active');

        if (viewId === 'apariencia') {
            container.innerHTML = this.renderApariencia();
            setTimeout(() => this.initApariencia(), 50);
            return;
        }

        container.innerHTML = `
            <div class="view active" style="display:flex;align-items:center;justify-content:center;min-height:200px;">
                <div class="spinner" style="border-color:var(--primary-soft);border-top-color:var(--primary);width:32px;height:32px;"></div>
            </div>
        `;

        try {
            if (!loadedModules[viewId]) {
                loadedModules[viewId] = await import(viewModules[viewId]);
            }

            const module = loadedModules[viewId];
            const view = module.default;

            container.innerHTML = view.render();
            view.init();

        } catch (error) {
            console.error(`❌ Error al cargar vista "${viewId}":`, error);
            container.innerHTML = `
                <div class="view active" style="text-align:center;padding:40px 20px;">
                    <p style="color:var(--text-soft);">Error al cargar el módulo</p>
                    <p style="color:var(--text-light);font-size:11px;margin-top:10px;">${error.message}</p>
                </div>
            `;
        }
    },

    getCurrentModule() {
        const moduleMap = {
            'home': loadedModules['home']?.default,
            'servicios-busqueda': loadedModules['servicios-busqueda']?.default,
            'reservas-busqueda': loadedModules['reservas-busqueda']?.default
        };
        return moduleMap[this.current] || null;
    },

    renderApariencia() {
        const savedTheme = DB.get('theme', 'lavender');
        const themeCards = Object.keys(themes).map(key => {
            const t = themes[key];
            const colors = [t['--bg'], t['--bg-soft'], t['--primary'], t['--accent']];
            const isSelected = key === savedTheme ? 'selected' : '';
            
            return `
                <div class="theme-card ${isSelected}" data-theme="${key}">
                    <div class="theme-preview">
                        <div style="background:${colors[0]}"></div>
                        <div style="background:${colors[1]}"></div>
                        <div style="background:${colors[2]}"></div>
                        <div style="background:${colors[3]}"></div>
                    </div>
                    <div class="theme-name">${themeNames[key]}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="view active">
                <h2 class="page-title">
                    <svg viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                    Apariencia
                </h2>
                <div class="theme-section">
                    <h3>Paleta de colores</h3>
                    <div class="theme-grid">
                        ${themeCards}
                    </div>
                </div>
            </div>
        `;
    },

    initApariencia() {
        const savedTheme = DB.get('theme', 'lavender');
        this.applyTheme(savedTheme, false);

        const themeCards = document.querySelectorAll('.theme-card');

        themeCards.forEach((card) => {
            const themeName = card.getAttribute('data-theme');
            
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.applyTheme(themeName, true);
            });
        });
    },

    applyTheme(themeName, save = true) {
        const theme = themes[themeName];
        
        if (!theme) {
            console.error('❌ Tema no encontrado:', themeName);
            return;
        }

        const root = document.documentElement;
        
        Object.entries(theme).forEach(([prop, val]) => {
            root.style.setProperty(prop, val);
        });

        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
        const selectedCard = document.querySelector(`.theme-card[data-theme="${themeName}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        if (save) {
            DB.set('theme', themeName);
            App.showToast(`Tema ${themeNames[themeName]} aplicado ✓`);
        }
    }
};

// ============================================
// APP - Orquestador
// ============================================
const App = {
    init() {
        console.log('🚀 App.init() llamado');

        if (!firebase || !firebase.apps || !firebase.apps.length) {
            console.error('❌ Firebase no está inicializado. Revisa index.html');
            return;
        }

        const auth = firebase.auth();

        auth.onAuthStateChanged(user => {
            console.log('🔐 Auth state changed:', user ? user.email : 'null');

            if (user) {
                Auth.currentUser = user;
                Auth.isAdmin = user.email === 'amayaqsas@gmail.com';

                const authContainer = document.getElementById('authContainer');
                const mainApp = document.getElementById('mainApp');

                if (authContainer) authContainer.classList.remove('show');

                setTimeout(() => {
                    if (mainApp) mainApp.classList.add('show');
                }, 300);

                const name = Auth.getUserName(user);
                document.getElementById('menuUserName').textContent = name;
                document.getElementById('menuUserEmail').textContent = user.email;

                const temaGuardado = DB.get('theme', 'lavender');
                if (temaGuardado && themes[temaGuardado]) {
                    Views.applyTheme(temaGuardado, false);
                }

                Views.renderMenu();
                Views.load('home', false); // false = no agregar al historial (es la primera)

                // ✅ Inicializar sistema de navegación back
                this.initBackNavigation();
            } else {
                Auth.currentUser = null;
                Auth.isAdmin = false;

                const mainApp = document.getElementById('mainApp');
                const authContainer = document.getElementById('authContainer');

                if (mainApp) mainApp.classList.remove('show');

                setTimeout(() => {
                    if (authContainer) {
                        authContainer.classList.add('show');
                        Auth.renderLogin();
                    }
                }, 300);
            }
        });

        const menuBtn = document.getElementById('menuBtn');
        const menuOverlay = document.getElementById('menuOverlay');
        const btnLogout = document.getElementById('btnLogout');

        if (menuBtn) menuBtn.addEventListener('click', () => this.toggleMenu());
        if (menuOverlay) menuOverlay.addEventListener('click', () => this.toggleMenu());
        if (btnLogout) btnLogout.addEventListener('click', async () => {
            this.toggleMenu();
            await Auth.logout();
        });

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(err => console.log('SW error:', err));
        }
    },

    // ============================================
    // ✅ SISTEMA DE NAVEGACIÓN BACK
    // ============================================
    initBackNavigation() {
        // Escuchar el botón back del navegador/teléfono
        window.addEventListener('popstate', (event) => {
            console.log(' Botón back presionado');
            this.handleBackButton();
        });

        // Prevenir que el usuario salga accidentalmente con swipe back
        // Agregar un estado inicial al historial
        window.history.replaceState({ viewId: 'home' }, '', '#home');
    },

    handleBackButton() {
        console.log('📍 Historial actual:', navigationHistory);
        console.log('📍 Vista actual:', Views.current);

        // Si hay más de una vista en el historial, volver a la anterior
        if (navigationHistory.length > 1) {
            // Quitar la vista actual del historial
            navigationHistory.pop();
            const vistaAnterior = navigationHistory[navigationHistory.length - 1];
            
            console.log('↩️ Volviendo a:', vistaAnterior);
            
            // Cargar la vista anterior SIN agregar al historial
            Views.load(vistaAnterior, false);
            
            // Cancelar cualquier timer de salida
            if (backPressTimer) {
                clearTimeout(backPressTimer);
                backPressTimer = null;
            }
            isExiting = false;
        } else {
            // Estamos en la vista inicial (home)
            // Mostrar mensaje de "Presiona otra vez para salir"
            if (!isExiting) {
                App.showToast('Presiona otra vez para salir');
                isExiting = true;
                
                // Timer de 2 segundos para resetear
                backPressTimer = setTimeout(() => {
                    isExiting = false;
                    backPressTimer = null;
                }, 2000);
            } else {
                // Segunda vez presionando back - salir de la app
                console.log('🚪 Saliendo de la app');
                
                // En móviles, cerrar la ventana no siempre funciona
                // Intentamos minimizar la app
                if (navigator.app) {
                    navigator.app.exitApp();
                } else if (navigator.device) {
                    navigator.device.exitApp();
                } else {
                    // Fallback: intentar cerrar la ventana
                    window.close();
                    // Si no funciona, mostrar mensaje
                    App.showToast('Desliza hacia abajo para minimizar la app');
                }
                
                isExiting = false;
                if (backPressTimer) {
                    clearTimeout(backPressTimer);
                    backPressTimer = null;
                }
            }
        }
    },

    toggleMenu() {
        const sideMenu = document.getElementById('sideMenu');
        const menuOverlay = document.getElementById('menuOverlay');
        if (sideMenu) sideMenu.classList.toggle('active');
        if (menuOverlay) menuOverlay.classList.toggle('active');
    },

    showToast(msg) {
        const t = document.getElementById('toast');
        if (t) {
            t.textContent = msg;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 3000);
        }
    },

    showModal(html) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay show';
        overlay.innerHTML = `<div class="modal">${html}</div>`;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', e => {
            if (e.target === overlay) overlay.remove();
        });
        return overlay;
    }
};

window.App = App;

// ============================================
// INICIALIZACIÓN
// ============================================
function startApp() {
    console.log('✅ DOM listo, iniciando app...');
    App.init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

console.log('📜 app.js cargado correctamente');