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

                <!-- BENEFICIOS - FORMATO LISTA MEJORADO -->
                <div class="ske-app-section">
                    <div class="ske-app-section-header">
                        <div class="ske-app-section-icono ske-app-icono-benefits">
                            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <h3>¿Por qué usar CICLO?</h3>
                    </div>
                    <div class="ske-app-benefits-list">
                        <div class="ske-app-benefit-item">
                            <div class="ske-app-benefit-icono">
                                <svg viewBox="0 0 24 24" style="width:28px;height:28px;stroke:var(--primary);fill:none;stroke-width:2;">
                                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                            </div>
                            <div class="ske-app-benefit-content">
                                <strong>Gestión Inteligente de Roles</strong>
                                <p>Organiza tus turnos, horarios y posiciones de manera automática y precisa, sincronizando las 5 semanas de rotación en tiempo real para que siempre sepas qué te toca.</p>
                            </div>
                        </div>
                        <div class="ske-app-benefit-item">
                            <div class="ske-app-benefit-icono">
                                <svg viewBox="0 0 24 24" style="width:28px;height:28px;stroke:var(--primary);fill:none;stroke-width:2;">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </div>
                            <div class="ske-app-benefit-content">
                                <strong>Control de Tiempo y Descansos</strong>
                                <p>Monitorea tu descanso y tiempo extra con un cronómetro inteligente que te alerta sobre tolerancias y posibles atrasos, cuidando tu cumplimiento laboral.</p>
                            </div>
                        </div>
                        <div class="ske-app-benefit-item">
                            <div class="ske-app-benefit-icono">
                                <svg viewBox="0 0 24 24" style="width:28px;height:28px;stroke:var(--primary);fill:none;stroke-width:2;">
                                    <circle cx="11" cy="11" r="8"/>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                            </div>
                            <div class="ske-app-benefit-content">
                                <strong>Búsqueda Rápida y Eficiente</strong>
                                <p>Encuentra servicios, trenes, espejos y reservas al instante con filtros optimizados, ahorrándote tiempo valioso en tu operación diaria.</p>
                            </div>
                        </div>
                        <div class="ske-app-benefit-item">
                            <div class="ske-app-benefit-icono">
                                <svg viewBox="0 0 24 24" style="width:28px;height:28px;stroke:var(--primary);fill:none;stroke-width:2;">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                            </div>
                            <div class="ske-app-benefit-content">
                                <strong>Respaldo y Sincronización Segura</strong>
                                <p>Tus datos se guardan en la nube y localmente, permitiéndote exportar e importar tu información con total seguridad y sin riesgo de perder nada.</p>
                            </div>
                        </div>
                        <div class="ske-app-benefit-item">
                            <div class="ske-app-benefit-icono">
                                <svg viewBox="0 0 24 24" style="width:28px;height:28px;stroke:var(--primary);fill:none;stroke-width:2;">
                                    <circle cx="13.5" cy="6.5" r="1.5"/>
                                    <circle cx="17.5" cy="10.5" r="1.5"/>
                                    <circle cx="8.5" cy="7.5" r="1.5"/>
                                    <circle cx="6.5" cy="12.5" r="1.5"/>
                                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
                                </svg>
                            </div>
                            <div class="ske-app-benefit-content">
                                <strong>Personalización Total</strong>
                                <p>Adapta la aplicación a tu gusto con múltiples temas de colores skeuomórficos, diseñados para ser agradables a la vista en cualquier condición de luz.</p>
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

                <!-- PROGRAMACIÓN (SIN LA "A") -->
                <div class="ske-app-section">
                    <div class="ske-app-section-header">
                        <div class="ske-app-section-icono ske-app-icono-code">
                            <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                        </div>
                        <h3>Programación y Lógica Relacional</h3>
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
                        <h3>Contacto y Soporte</h3>
                    </div>
                    
                    <div style="text-align: center; color: var(--text-soft); font-size: 14px; margin-bottom: 16px; font-weight: 600;">
                        Errores, sugerencias y/o comentarios:
                    </div>

                    <a href="mailto:amayaqsas@gmail.com" class="ske-app-contact-btn">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <span>amayaqsas@gmail.com</span>
                    </a>

                    <a href="https://t.me/5545436557" target="_blank" class="ske-app-contact-btn" style="margin-top: 12px; background: #0088cc; color: white; border-color: #0088cc;">
                        <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;stroke:none;">
                            <path d="M21.928 2.528c-.378-.434-.97-.58-1.51-.374L2.22 9.338c-.57.218-.914.79-.85 1.39.063.6.51 1.08 1.1 1.18l4.68.77 1.7 5.53c.16.52.64.88 1.18.88.1 0 .2-.01.3-.04l3.4-1.04 2.5 2.2c.27.24.62.37.97.37.18 0 .36-.04.53-.11.5-.22.82-.72.82-1.27v-4.05l6.3-5.04c.46-.37.67-.98.53-1.56z"/>
                        </svg>
                        <span>Telegram: 5545436557</span>
                    </a>
                </div>

                <!-- VERSIÓN -->
                <div class="ske-app-footer">
                    <p>CICLO v2.2 • Desarrollado por amayasily</p>
                </div>
            </div>
        `;
    },

    init() {
        console.log('📱 Módulo App Info cargado');
    }
};

export default AppInfo;