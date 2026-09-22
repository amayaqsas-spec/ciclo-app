// ============================================
// APP.JS - Módulo de Información de la Aplicación
// ============================================

const AppInfo = {
    render() {
        return `
            <div class="view active">
                <h2 class="page-title">
                    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    App
                </h2>

                <!-- BENEFICIOS -->
                <div class="app-section app-benefits">
                    <h3 class="app-section-title">✨ Beneficios de usar CICLO</h3>
                    <div class="benefits-grid">
                        <div class="benefit-item">
                            <div class="benefit-icon">📅</div>
                            <div class="benefit-text">
                                <strong>Gestión de Roles</strong>
                                <p>Organiza tus turnos y horarios de manera eficiente</p>
                            </div>
                        </div>
                        <div class="benefit-item">
                            <div class="benefit-icon">⏱️</div>
                            <div class="benefit-text">
                                <strong>Control de Tiempo</strong>
                                <p>Monitorea tu descanso y tiempo extra en tiempo real</p>
                            </div>
                        </div>
                        <div class="benefit-item">
                            <div class="benefit-icon">🔍</div>
                            <div class="benefit-text">
                                <strong>Búsqueda Rápida</strong>
                                <p>Encuentra servicios, trenes y espejos al instante</p>
                            </div>
                        </div>
                        <div class="benefit-item">
                            <div class="benefit-icon">💾</div>
                            <div class="benefit-text">
                                <strong>Respaldo Seguro</strong>
                                <p>Exporta e importa tus datos cuando lo necesites</p>
                            </div>
                        </div>
                        <div class="benefit-item">
                            <div class="benefit-icon">🎨</div>
                            <div class="benefit-text">
                                <strong>Personalización</strong>
                                <p>Múltiples temas y colores a tu elección</p>
                            </div>
                        </div>
                        <div class="benefit-item">
                            <div class="benefit-icon">📱</div>
                            <div class="benefit-text">
                                <strong>100% Offline</strong>
                                <p>Funciona sin internet, tus datos están locales</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RESPONSABILIDAD -->
                <div class="app-section app-disclaimer">
                    <div class="disclaimer-box">
                        <svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:#ff9800;fill:none;stroke-width:2;margin-bottom:8px;">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <h3 style="color:#ff9800;margin-bottom:8px;">⚠️ Aviso Importante</h3>
                        <p style="font-size:13px;line-height:1.6;color:var(--text-soft);">
                            El uso de esta aplicación es <strong>responsabilidad exclusiva del usuario</strong>. 
                            CICLO es una herramienta de apoyo para la gestión de roles y horarios, 
                            pero la verificación de la información y el cumplimiento de las normas 
                            laborales corresponden al usuario.
                        </p>
                    </div>
                </div>

                <!-- DISEÑO -->
                <div class="app-section app-credits">
                    <h3 class="app-section-title"> Diseño, colores y ambiente gráfico</h3>
                    <div class="credit-item">
                        <div class="credit-logo">
                            <img src="./assets/lo1.png" alt="Logo Diseño" class="app-logo">
                        </div>
                        <div class="credit-info">
                            <p style="font-size:13px;color:var(--text-soft);">
                                Diseño UI/UX con enfoque en usabilidad y experiencia del usuario. 
                                Paleta de colores cuidadosamente seleccionada para crear un ambiente 
                                visualmente agradable y funcional.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- PROGRAMACIÓN -->
                <div class="app-section app-credits">
                    <h3 class="app-section-title"> Programación, Lógica Relacional "A"</h3>
                    <div class="credit-item">
                        <div class="credit-logo">
                            <img src="./assets/mi.png" alt="Logo Programación" class="app-logo">
                        </div>
                        <div class="credit-info">
                            <p style="font-size:13px;color:var(--text-soft);">
                                Desarrollo con arquitectura limpia y lógica relacional avanzada. 
                                Implementación de bases de datos locales optimizadas para máximo 
                                rendimiento y seguridad de datos.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- REDES SOCIALES -->
                <div class="app-section app-social">
                    <h3 class="app-section-title"> Conocenos</h3>
                    <a href="https://www.tiktok.com/@susanaramirezcastro?_r=1&_t=ZS-99r2n8u0iRR" 
                       target="_blank" 
                       class="social-link social-tiktok">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                        <span>+QDetalles</span>
                        <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;margin-left:auto;">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                    </a>
                </div>

                <!-- CONTACTO -->
                <div class="app-section app-contact">
                    <h3 class="app-section-title"> Contacto</h3>
                    <a href="mailto:amayaqsas@gmail.com" class="contact-email">
                        <svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:var(--primary);fill:none;stroke-width:2;">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <span>amayaqsas@gmail.com</span>
                    </a>
                </div>

                <!-- VERSIÓN -->
                <div class="app-version">
                    <p style="font-size:11px;color:var(--text-light);text-align:center;">
                        CICLO v1.0 • Desarrollado por amayasily
                    </p>
                </div>
            </div>
        `;
    },

    init() {
        console.log(' Módulo App Info cargado');
    }
};

export default AppInfo;