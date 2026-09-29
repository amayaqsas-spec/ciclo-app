// ============================================
// INSTALACION.JS - Módulo de Instalación PWA
// ============================================

const Instalacion = {
    render() {
        const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const esAndroid = /Android/i.test(navigator.userAgent);
        
        return `
            <div class="view active ske-instalacion">
                <!-- HEADER -->
                <div class="ske-instalacion-header">
                    <div class="ske-instalacion-icono">
                        <svg viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </div>
                    <h2 class="ske-instalacion-titulo">Instalar Aplicación</h2>
                    <p class="ske-instalacion-subtitulo">Disfruta CICLO en tu dispositivo</p>
                </div>

                <!-- BENEFICIOS -->
                <div class="ske-beneficios-card">
                    <h3 class="ske-beneficios-titulo">¿Por qué instalar?</h3>
                    <div class="ske-beneficio-item">
                        <div class="ske-beneficio-icono">
                            <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                        </div>
                        <div class="ske-beneficio-texto">
                            <strong>Acceso rápido</strong>
                            <span>Desde tu pantalla de inicio</span>
                        </div>
                    </div>
                    <div class="ske-beneficio-item">
                        <div class="ske-beneficio-icono">
                            <svg viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                        </div>
                        <div class="ske-beneficio-texto">
                            <strong>Funciona offline</strong>
                            <span>Sin necesidad de internet</span>
                        </div>
                    </div>
                    <div class="ske-beneficio-item">
                        <div class="ske-beneficio-icono">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <div class="ske-beneficio-texto">
                            <strong>Mayor velocidad</strong>
                            <span>Rendimiento optimizado</span>
                        </div>
                    </div>
                </div>

                <!-- BOTONES DE INSTALACIÓN -->
                <div class="ske-botones-container">
                    ${esAndroid ? `
                        <button class="ske-btn-instalar ske-btn-android" id="btnInstalarAndroid">
                            <svg viewBox="0 0 24 24">
                                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0225 3.503C15.5902 8.4796 13.8532 8.199 12 8.199c-1.8532 0-3.5902.2806-5.1367.7511L4.8408 5.4471a.4161.4161 0 00-.5676-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589.3432 18.6617h23.3136c0-4.0028-2.3457-7.475-5.7753-9.3403"/>
                            </svg>
                            <span>Instalar en Android</span>
                        </button>
                    ` : ''}

                    ${esIOS ? `
                        <button class="ske-btn-instalar ske-btn-ios" id="btnInstalarIOS">
                            <svg viewBox="0 0 24 24">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                            </svg>
                            <span>Instalar en iPhone/iPad</span>
                        </button>
                    ` : ''}

                    ${!esAndroid && !esIOS ? `
                        <button class="ske-btn-instalar ske-btn-desktop" id="btnInstalarDesktop">
                            <svg viewBox="0 0 24 24">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                <line x1="8" y1="21" x2="16" y2="21"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                            <span>Instalar en Computadora</span>
                        </button>
                    ` : ''}
                </div>

                <!-- MODAL ANDROID -->
                <div class="ske-modal-overlay" id="modalAndroid">
                    <div class="ske-modal">
                        <div class="ske-modal-header">
                            <div class="ske-modal-icono ske-modal-icono-android">
                                <svg viewBox="0 0 24 24">
                                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0225 3.503C15.5902 8.4796 13.8532 8.199 12 8.199c-1.8532 0-3.5902.2806-5.1367.7511L4.8408 5.4471a.4161.4161 0 00-.5676-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589.3432 18.6617h23.3136c0-4.0028-2.3457-7.475-5.7753-9.3403"/>
                                </svg>
                            </div>
                            <h3>Instalar en Android</h3>
                        </div>
                        <div class="ske-modal-contenido">
                            <p>La aplicación se instalará de forma <strong>nativa</strong> en tu dispositivo para un mejor desempeño.</p>
                            <div class="ske-modal-pasos">
                                <div class="ske-modal-paso">
                                    <span class="ske-modal-paso-numero">1</span>
                                    <span>Toca el botón "Instalar"</span>
                                </div>
                                <div class="ske-modal-paso">
                                    <span class="ske-modal-paso-numero">2</span>
                                    <span>Confirma la instalación</span>
                                </div>
                                <div class="ske-modal-paso">
                                    <span class="ske-modal-paso-numero">3</span>
                                    <span>¡Listo! Aparecerá en tu pantalla de inicio</span>
                                </div>
                            </div>
                        </div>
                        <div class="ske-modal-acciones">
                            <button class="ske-btn-modal ske-btn-modal-cancelar" id="btnCancelarAndroid">Cancelar</button>
                            <button class="ske-btn-modal ske-btn-modal-aceptar" id="btnAceptarAndroid">
                                <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Instalar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- MODAL iOS -->
                <div class="ske-modal-overlay" id="modalIOS">
                    <div class="ske-modal">
                        <div class="ske-modal-header">
                            <div class="ske-modal-icono ske-modal-icono-ios">
                                <svg viewBox="0 0 24 24">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                </svg>
                            </div>
                            <h3>Instalar en iPhone/iPad</h3>
                        </div>
                        <div class="ske-modal-contenido">
                            <p>En iOS la instalación es diferente. Sigue estos pasos:</p>
                            <div class="ske-modal-pasos">
                                <div class="ske-modal-paso">
                                    <span class="ske-modal-paso-numero">1</span>
                                    <span>Abre <strong>Safari</strong> (no Chrome)</span>
                                </div>
                                <div class="ske-modal-paso">
                                    <span class="ske-modal-paso-numero">2</span>
                                    <span>Ve a la página de CICLO</span>
                                </div>
                                <div class="ske-modal-paso">
                                    <span class="ske-modal-paso-numero">3</span>
                                    <span>Toca el botón <strong>Compartir</strong> (cuadrado con flecha ↑)</span>
                                </div>
                                <div class="ske-modal-paso">
                                    <span class="ske-modal-paso-numero">4</span>
                                    <span>Desliza y toca <strong>"Agregar a pantalla de inicio"</strong></span>
                                </div>
                                <div class="ske-modal-paso">
                                    <span class="ske-modal-paso-numero">5</span>
                                    <span>Toca <strong>"Agregar"</strong> para confirmar</span>
                                </div>
                            </div>
                            <p class="ske-modal-nota">Una vez instalada, funcionará como una app nativa.</p>
                        </div>
                        <div class="ske-modal-acciones">
                            <button class="ske-btn-modal ske-btn-modal-cerrar" id="btnCerrarIOS">Entendido</button>
                        </div>
                    </div>
                </div>

                <!-- MODAL DESKTOP -->
                <div class="ske-modal-overlay" id="modalDesktop">
                    <div class="ske-modal">
                        <div class="ske-modal-header">
                            <div class="ske-modal-icono ske-modal-icono-desktop">
                                <svg viewBox="0 0 24 24">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                    <line x1="8" y1="21" x2="16" y2="21"/>
                                    <line x1="12" y1="17" x2="12" y2="21"/>
                                </svg>
                            </div>
                            <h3>Instalar en Computadora</h3>
                        </div>
                        <div class="ske-modal-contenido">
                            <p>Para instalar en tu computadora:</p>
                            <div class="ske-modal-pasos">
                                <div class="ske-modal-paso">
                                    <span class="ske-modal-paso-numero">1</span>
                                    <span>Abre <strong>Chrome</strong> o <strong>Edge</strong></span>
                                </div>
                                <div class="ske-modal-paso">
                                    <span class="ske-modal-paso-numero">2</span>
                                    <span>Ve a la página de CICLO</span>
                                </div>
                                <div class="ske-modal-paso">
                                    <span class="ske-modal-paso-numero">3</span>
                                    <span>Haz clic en el ícono de instalación en la barra de direcciones</span>
                                </div>
                                <div class="ske-modal-paso">
                                    <span class="ske-modal-paso-numero">4</span>
                                    <span>Confirma la instalación</span>
                                </div>
                            </div>
                        </div>
                        <div class="ske-modal-acciones">
                            <button class="ske-btn-modal ske-btn-modal-cerrar" id="btnCerrarDesktop">Entendido</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const btnAndroid = document.getElementById('btnInstalarAndroid');
        const btnIOS = document.getElementById('btnInstalarIOS');
        const btnDesktop = document.getElementById('btnInstalarDesktop');

        const modalAndroid = document.getElementById('modalAndroid');
        const modalIOS = document.getElementById('modalIOS');
        const modalDesktop = document.getElementById('modalDesktop');

        // Android
        if (btnAndroid) {
            btnAndroid.addEventListener('click', () => {
                modalAndroid.classList.add('show');
            });
        }

        document.getElementById('btnCancelarAndroid')?.addEventListener('click', () => {
            modalAndroid.classList.remove('show');
        });

        document.getElementById('btnAceptarAndroid')?.addEventListener('click', async () => {
            modalAndroid.classList.remove('show');
            
            // Intentar instalación PWA
            if (window.deferredPrompt) {
                window.deferredPrompt.prompt();
                const { outcome } = await window.deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    App.showToast('✅ ¡Instalación iniciada!');
                } else {
                    App.showToast('⚠️ Instalación cancelada');
                }
                window.deferredPrompt = null;
            } else {
                App.showToast('⚠️ No se pudo iniciar la instalación');
            }
        });

        // iOS
        if (btnIOS) {
            btnIOS.addEventListener('click', () => {
                modalIOS.classList.add('show');
            });
        }

        document.getElementById('btnCerrarIOS')?.addEventListener('click', () => {
            modalIOS.classList.remove('show');
        });

        // Desktop
        if (btnDesktop) {
            btnDesktop.addEventListener('click', () => {
                modalDesktop.classList.add('show');
            });
        }

        document.getElementById('btnCerrarDesktop')?.addEventListener('click', () => {
            modalDesktop.classList.remove('show');
        });

        // Cerrar modales al hacer clic fuera
        [modalAndroid, modalIOS, modalDesktop].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('show');
                    }
                });
            }
        });
    }
};

export default Instalacion;