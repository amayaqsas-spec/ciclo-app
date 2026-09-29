// ============================================
// APP.JS - Módulo de Información de la Aplicación
// ============================================

const AppInfo = {
    render() {
        return `
            <div class="view active ske-app-info">
                <!-- HEADER SKEUOMÓRFICO -->
                <div class="ske-app-header">
                    <div class="ske-app-icono">
                        <svg viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                    </div>
                    <div class="ske-app-texto">
                        <h2 class="ske-app-titulo">App</h2>
                        <p class="ske-app-subtitulo">Información y Créditos</p>
                    </div>
                </div>

                <!-- BENEFICIOS - FORMATO LISTA -->
                <div class="ske-app-section">
                    <div class="ske-app-section-header">
                        <div class="ske-app-section-icono ske-app-icono-benefits">
                            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <h3>Beneficios de usar CICLO</h3>
                    </div>
                    <div class="ske-app-benefits-list">
                        <div class="ske-app-benefit-item">
                            <div class="ske-app-benefit-icono">📅</div>
                            <div class="ske-app-benefit-content">
                                <strong>Gestión de Roles</strong>
                                <p>Organiza tus turnos y horarios de manera eficiente</p>
                            </div>
                        </div>
                        <div class="ske-app-benefit-item">
                            <div class="ske-app-benefit-icono">️</div>
                            <div class="ske-app-benefit-content">
                                <strong>Control de Tiempo</strong>
                                <p>Monitorea tu descanso y tiempo extra en tiempo real</p>
                            </div>
                        </div>
                        <div class="ske-app-benefit-item">
                            <div class="ske-app-benefit-icono">🔍</div>
                            <div class="ske-app-benefit-content">
                                <strong>Búsqueda Rápida</strong>
                                <p>Encuentra servicios, trenes y espejos al instante</p>
                            </div>
                        </div>
                        <div class="ske-app-benefit-item">
                            <div class="ske-app-benefit-icono">💾</div>
                            <div class="ske-app-benefit-content">
                                <strong>Respaldo Seguro</strong>
                                <p>Exporta e importa tus datos cuando lo necesites</p>
                            </div>
                        </div>
                        <div class="ske-app-benefit-item">
                            <div class="ske-app-benefit-icono">🎨</div>
                            <div class="ske-app-benefit-content">
                                <strong>Personalización</strong>
                                <p>Múltiples temas y colores a tu elección</p>
                            </div>
                        </div>
                        <div class="ske-app-benefit-item">
                            <div class="ske-app-benefit-icono">📱</div>
                            <div class="ske-app-benefit-content">
                                <strong>100% Offline</strong>
                                <p>Funciona sin internet, tus datos están locales</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RESPONSABILIDAD -->
                <div class="ske-app-section ske-app-disclaimer">
                    <div class="ske-app-disclaimer-icono">
                        <svg viewBox="0 0 24 24">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </div>
                    <div class="ske-app-disclaimer-texto">
                        <h4>Aviso Importante</h4>
                        <p>El uso de esta aplicación es <strong>responsabilidad exclusiva del usuario</strong>. CICLO es una herramienta de apoyo para la gestión de roles y horarios, pero la verificación de la información y el cumplimiento de las normas laborales corresponden al usuario.</p>
                    </div>
                </div>

                <!-- DISEÑO -->
                <div class="ske-app-section">
                    <div class="ske-app-section-header">
                        <div class="ske-app-section-icono ske-app-icono-design">
                            <svg viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
                        </div>
                        <h3>Diseño, colores y ambiente gráfico</h3>
                    </div>
                    <div class="ske-app-credit-card">
                        <div class="ske-app-credit-logo-large">
                            <img src="./assets/lo1.png" alt="Logo Diseño" class="ske-app-logo-img-large">
                        </div>
                        <div class="ske-app-credit-info">
                            <p>Diseño UI/UX con enfoque en usabilidad y experiencia del usuario. Paleta de colores cuidadosamente seleccionada para crear un ambiente visualmente agradable y funcional.</p>
                        </div>
                    </div>
                </div>

                <!-- PROGRAMACIÓN -->
                <div class="ske-app-section">
                    <div class="ske-app-section-header">
                        <div class="ske-app-section-icono ske-app-icono-code">
                            <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                        </div>
                        <h3>Programación, Lógica Relacional "A"</h3>
                    </div>
                    <div class="ske-app-credit-card">
                        <div class="ske-app-credit-logo-large">
                            <img src="./assets/mi.png" alt="Logo Programación" class="ske-app-logo-img-large">
                        </div>
                        <div class="ske-app-credit-info">
                            <p>Desarrollo con arquitectura limpia y lógica relacional avanzada. Implementación de bases de datos locales optimizadas para máximo rendimiento y seguridad de datos.</p>
                        </div>
                    </div>
                </div>

                <!-- REDES SOCIALES -->
                <div class="ske-app-section">
                    <div class="ske-app-section-header">
                        <div class="ske-app-section-icono ske-app-icono-social">
                            <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </div>
                        <h3>Conócenos</h3>
                    </div>
                    <a href="https://www.tiktok.com/@susanaramirezcastro?_r=1&_t=ZS-99r2n8u0iRR" 
                       target="_blank" 
                       class="ske-app-social-btn">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                        <span>+QDetalles</span>
                        <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:currentColor;margin-left:auto;">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                    </a>
                </div>

                <!-- CONTACTO -->
                <div class="ske-app-section">
                    <div class="ske-app-section-header">
                        <div class="ske-app-section-icono ske-app-icono-contact">
                            <svg viewBox="0 0 24 24">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                        </div>
                        <h3>Contacto</h3>
                    </div>
                    <a href="mailto:amayaqsas@gmail.com" class="ske-app-contact-btn">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <span>amayaqsas@gmail.com</span>
                    </a>
                </div>

                <!-- VERSIÓN -->
                <div class="ske-app-footer">
                    <p>CICLO v2.0 • Desarrollado por amayasily</p>
                </div>
            </div>
        `;
    },

    init() {
        console.log('📱 Módulo App Info cargado');
    }
};

export default AppInfo;