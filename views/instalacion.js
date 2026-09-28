// ============================================
// INSTALACION.JS - Módulo de Instalación de la App
// ============================================

const Instalacion = {
    render() {
        const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const esAndroid = /Android/i.test(navigator.userAgent);
        
        return `
            <div class="view active">
                <div class="instalacion-header">
                    <div class="instalacion-icono-principal">
                        <svg viewBox="0 0 24 24" style="width:48px;height:48px;stroke:white;fill:none;stroke-width:2;">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </div>
                    <h2 class="instalacion-titulo">Instala CICLO</h2>
                    <p class="instalacion-subtitulo">Disfruta de la mejor experiencia en tu dispositivo</p>
                </div>

                <div class="instalacion-beneficios">
                    <div class="beneficio-item">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Acceso rápido desde tu pantalla de inicio</span>
                    </div>
                    <div class="beneficio-item">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Funciona sin conexión a internet</span>
                    </div>
                    <div class="beneficio-item">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Mejor rendimiento y velocidad</span>
                    </div>
                    <div class="beneficio-item">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Experiencia tipo aplicación nativa</span>
                    </div>
                </div>

                ${esAndroid ? `
                    <!-- BOTÓN ANDROID -->
                    <div class="instalacion-card android-card">
                        <div class="instalacion-card-header">
                            <div class="instalacion-plataforma-icono android-icono">
                                <svg viewBox="0 0 24 24" style="width:40px;height:40px;fill:white;">
                                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0225 3.503C15.5902 8.4796 13.8532 8.199 12 8.199c-1.8532 0-3.5902.2806-5.1367.7511L4.8408 5.4471a.4161.4161 0 00-.5676-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589.3432 18.6617h23.3136c0-4.0028-2.3457-7.475-5.7753-9.3403"/>
                                </svg>
                            </div>
                            <div class="instalacion-plataforma-info">
                                <h3>Android</h3>
                                <p>Instalación nativa automática</p>
                            </div>
                        </div>
                        <button class="btn-instalar-android" id="btnInstalarAndroid">
                            <svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:white;fill:none;stroke-width:2;">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Instalar en Android
                        </button>
                    </div>
                ` : ''}

                ${esIOS ? `
                    <!-- INSTRUCCIONES iOS -->
                    <div class="instalacion-card ios-card">
                        <div class="instalacion-card-header">
                            <div class="instalacion-plataforma-icono ios-icono">
                                <svg viewBox="0 0 24 24" style="width:40px;height:40px;fill:white;">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                </svg>
                            </div>
                            <div class="instalacion-plataforma-info">
                                <h3>iPhone / iPad</h3>
                                <p>Instalación manual en Safari</p>
                            </div>
                        </div>
                        
                        <div class="ios-instrucciones">
                            <div class="ios-alerta">
                                <svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:#FF9500;fill:none;stroke-width:2;">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                <p><strong>Importante:</strong> En iOS la instalación es diferente. Debes usar <strong>Safari</strong> (no Chrome) y seguir estos pasos:</p>
                            </div>

                            <div class="ios-paso">
                                <div class="ios-paso-numero">1</div>
                                <div class="ios-paso-contenido">
                                    <strong>Abre Safari</strong>
                                    <p>Usa el navegador Safari de Apple (no Chrome ni otros navegadores)</p>
                                </div>
                            </div>

                            <div class="ios-paso">
                                <div class="ios-paso-numero">2</div>
                                <div class="ios-paso-contenido">
                                    <strong>Visita la página</strong>
                                    <p>Ve a: <code>ciclo-app-omega.vercel.app</code></p>
                                </div>
                            </div>

                            <div class="ios-paso">
                                <div class="ios-paso-numero">3</div>
                                <div class="ios-paso-contenido">
                                    <strong>Toca el botón Compartir</strong>
                                    <p>Es el ícono de un cuadrado con una flecha hacia arriba ↑</p>
                                    <div class="ios-compartir-demo">
                                        <svg viewBox="0 0 24 24" style="width:32px;height:32px;stroke:var(--text);fill:none;stroke-width:2;">
                                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                                            <polyline points="16 6 12 2 8 6"/>
                                            <line x1="12" y1="2" x2="12" y2="15"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div class="ios-paso">
                                <div class="ios-paso-numero">4</div>
                                <div class="ios-paso-contenido">
                                    <strong>Desliza hacia abajo</strong>
                                    <p>Busca la opción <strong>"Agregar a pantalla de inicio"</strong></p>
                                </div>
                            </div>

                            <div class="ios-paso">
                                <div class="ios-paso-numero">5</div>
                                <div class="ios-paso-contenido">
                                    <strong>Toca "Agregar"</strong>
                                    <p>Confirma y listo! Aparecerá el ícono de CICLO en tu pantalla de inicio</p>
                                </div>
                            </div>

                            <div class="ios-nota-final">
                                <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                <p>Una vez instalada, funcionará como una app nativa con acceso directo desde tu pantalla de inicio</p>
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${!esAndroid && !esIOS ? `
                    <!-- ESCRITORIO -->
                    <div class="instalacion-card desktop-card">
                        <div class="instalacion-card-header">
                            <div class="instalacion-plataforma-icono desktop-icono">
                                <svg viewBox="0 0 24 24" style="width:40px;height:40px;stroke:white;fill:none;stroke-width:2;">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                    <line x1="8" y1="21" x2="16" y2="21"/>
                                    <line x1="12" y1="17" x2="12" y2="21"/>
                                </svg>
                            </div>
                            <div class="instalacion-plataforma-info">
                                <h3>Computadora</h3>
                                <p>Instala desde tu navegador</p>
                            </div>
                        </div>
                        
                        <div class="desktop-instrucciones">
                            <div class="desktop-paso">
                                <strong>En Chrome/Edge:</strong>
                                <p>Haz clic en el ícono de instalación en la barra de direcciones (arriba a la derecha) o ve al menú (⋮) → "Instalar CICLO"</p>
                            </div>
                            <div class="desktop-paso">
                                <strong>En Firefox:</strong>
                                <p>La instalación automática no está disponible, pero puedes usar la web normalmente</p>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div class="instalacion-footer">
                    <p>¿Tienes problemas con la instalación?</p>
                    <p class="instalacion-contacto">Contacta al administrador</p>
                </div>
            </div>
        `;
    },

    init() {
        // Evento para botón de Android
        const btnAndroid = document.getElementById('btnInstalarAndroid');
        if (btnAndroid) {
            btnAndroid.addEventListener('click', () => this.mostrarModalAndroid());
        }
    },

    mostrarModalAndroid() {
        const modal = App.showModal(`
            <div class="modal-instalacion">
                <div class="modal-instalacion-icono">
                    <svg viewBox="0 0 24 24" style="width:64px;height:64px;stroke:var(--primary);fill:none;stroke-width:1.5;">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                </div>
                <h3>Instalar CICLO en tu dispositivo</h3>
                <div class="modal-instalacion-contenido">
                    <p>La aplicación se instalará de forma <strong>nativa</strong> en tu celular para un <strong>mejor desempeño</strong>.</p>
                    <div class="modal-instalacion-beneficios">
                        <div class="modal-beneficio">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>Acceso directo desde tu pantalla de inicio</span>
                        </div>
                        <div class="modal-beneficio">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>Funciona sin conexión a internet</span>
                        </div>
                        <div class="modal-beneficio">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>Mayor velocidad y rendimiento</span>
                        </div>
                        <div class="modal-beneficio">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--primary);fill:none;stroke-width:2;"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>Experiencia tipo app nativa</span>
                        </div>
                    </div>
                    <p class="modal-instalacion-nota">La instalación es segura y no ocupa mucho espacio en tu dispositivo.</p>
                </div>
                <div class="modal-instalacion-actions">
                    <button class="btn-modal-cancelar" id="btnModalCancelar">Cancelar</button>
                    <button class="btn-modal-aceptar" id="btnModalAceptar">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:white;fill:none;stroke-width:2;">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Aceptar e Instalar
                    </button>
                </div>
            </div>
        `);

        document.getElementById('btnModalCancelar').addEventListener('click', () => modal.remove());
        document.getElementById('btnModalAceptar').addEventListener('click', async () => {
            modal.remove();
            const exito = await window.iniciarInstalacionPWA();
            if (exito) {
                App.showToast('✅ ¡Instalación iniciada! Revisa tu pantalla de inicio');
            } else {
                App.showToast('️ No se pudo iniciar la instalación. Intenta desde el menú de Chrome');
            }
        });
    }
};

export default Instalacion;