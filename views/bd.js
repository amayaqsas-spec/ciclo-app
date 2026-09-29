// ============================================
// BD.JS - Módulo Base de Datos con Skeuomorphism
// ============================================

const Bd = {
    render() {
        const userName = DB.get('userName', Auth.currentUser ? Auth.getUserName(Auth.currentUser) : 'Usuario');
        const userEmail = Auth.currentUser ? Auth.currentUser.email : 'usuario@correo.com';
        
        // Calcular estadísticas
        const roles = DB.load('roles');
        const servicios = DB.load('servicios');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');
        const reservas = DB.load('reservas');
        const espejos = DB.load('espejos');
        const notas = DB.load('notas');
        const tiempoExtra = DB.load('tiempoExtra');
        const avisos = DB.load('avisos');
        
        const totalRegistros = roles.length + servicios.length + lineas.length + 
                              terminales.length + semanas.length + reservas.length + 
                              espejos.length + notas.length + tiempoExtra.length + avisos.length;

        return `
            <div class="view active ske-bd">
                <!-- HEADER SKEUOMÓRFICO -->
                <div class="ske-bd-header">
                    <div class="ske-bd-icono">
                        <svg viewBox="0 0 24 24">
                            <ellipse cx="12" cy="5" rx="9" ry="3"/>
                            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                        </svg>
                    </div>
                    <div class="ske-bd-texto">
                        <h2 class="ske-bd-titulo">Base de Datos</h2>
                        <p class="ske-bd-subtitulo">Gestiona y respalda tu información</p>
                    </div>
                </div>

                <!-- PERFIL DE USUARIO -->
                <div class="ske-bd-section">
                    <div class="ske-bd-section-header">
                        <div class="ske-bd-section-icono">
                            <svg viewBox="0 0 24 24">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>
                        <h3>Perfil de Usuario</h3>
                    </div>
                    
                    <div class="ske-bd-profile-card">
                        <div class="ske-bd-profile-email">${userEmail}</div>
                        
                        <div class="ske-bd-input-row">
                            <div class="ske-bd-input-group">
                                <label>Nombre de Usuario</label>
                                <input type="text" id="bdUserName" value="${userName}" placeholder="Tu nombre">
                                <span class="ske-bd-input-hint">Este nombre aparecerá en el saludo del inicio</span>
                            </div>
                            <button class="ske-bd-btn-save" id="btnSaveUserName">
                                <svg viewBox="0 0 24 24">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                    <polyline points="17 21 17 13 7 13 7 21"/>
                                    <polyline points="7 3 7 8 15 8"/>
                                </svg>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- GESTIÓN DE DATOS -->
                <div class="ske-bd-section">
                    <div class="ske-bd-section-header">
                        <div class="ske-bd-section-icono">
                            <svg viewBox="0 0 24 24">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </div>
                        <h3>Gestión de Datos</h3>
                    </div>
                    
                    <p class="ske-bd-section-desc">
                        Gestiona los datos de tu aplicación. Puedes exportar una copia de seguridad, 
                        restaurar datos desde un archivo o reiniciar la aplicación completamente.
                    </p>

                    <div class="ske-bd-actions-grid">
                        <div class="ske-bd-action-card ske-bd-action-export">
                            <div class="ske-bd-action-icono">
                                <svg viewBox="0 0 24 24">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                            </div>
                            <div class="ske-bd-action-info">
                                <h4>Exportar</h4>
                                <p>Descargar copia de seguridad</p>
                            </div>
                            <button class="ske-bd-action-btn" id="btnExportar">
                                Exportar
                            </button>
                        </div>

                        <div class="ske-bd-action-card ske-bd-action-import">
                            <div class="ske-bd-action-icono">
                                <svg viewBox="0 0 24 24">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                            </div>
                            <div class="ske-bd-action-info">
                                <h4>Importar</h4>
                                <p>Restaurar desde archivo</p>
                            </div>
                            <button class="ske-bd-action-btn" id="btnImportar">
                                Importar
                            </button>
                            <input type="file" id="inputImportar" accept=".json" style="display:none;">
                        </div>

                        <div class="ske-bd-action-card ske-bd-action-reset">
                            <div class="ske-bd-action-icono">
                                <svg viewBox="0 0 24 24">
                                    <polyline points="1 4 1 10 7 10"/>
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                                </svg>
                            </div>
                            <div class="ske-bd-action-info">
                                <h4>Reiniciar</h4>
                                <p>Borrar todos los datos</p>
                            </div>
                            <button class="ske-bd-action-btn" id="btnReiniciar">
                                Reiniciar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- ESTADÍSTICAS -->
                <div class="ske-bd-section">
                    <div class="ske-bd-section-header">
                        <div class="ske-bd-section-icono">
                            <svg viewBox="0 0 24 24">
                                <line x1="18" y1="20" x2="18" y2="10"/>
                                <line x1="12" y1="20" x2="12" y2="4"/>
                                <line x1="6" y1="20" x2="6" y2="14"/>
                            </svg>
                        </div>
                        <h3>Estadísticas</h3>
                    </div>
                    
                    <div class="ske-bd-stats-grid">
                        <div class="ske-bd-stat-item">
                            <div class="ske-bd-stat-number">${roles.length}</div>
                            <div class="ske-bd-stat-label">Roles</div>
                        </div>
                        <div class="ske-bd-stat-item">
                            <div class="ske-bd-stat-number">${servicios.length}</div>
                            <div class="ske-bd-stat-label">Servicios</div>
                        </div>
                        <div class="ske-bd-stat-item">
                            <div class="ske-bd-stat-number">${lineas.length}</div>
                            <div class="ske-bd-stat-label">Líneas</div>
                        </div>
                        <div class="ske-bd-stat-item">
                            <div class="ske-bd-stat-number">${terminales.length}</div>
                            <div class="ske-bd-stat-label">Terminales</div>
                        </div>
                        <div class="ske-bd-stat-item">
                            <div class="ske-bd-stat-number">${semanas.length}</div>
                            <div class="ske-bd-stat-label">Semanas</div>
                        </div>
                        <div class="ske-bd-stat-item">
                            <div class="ske-bd-stat-number">${reservas.length}</div>
                            <div class="ske-bd-stat-label">Reservas</div>
                        </div>
                        <div class="ske-bd-stat-item">
                            <div class="ske-bd-stat-number">${espejos.length}</div>
                            <div class="ske-bd-stat-label">Espejos</div>
                        </div>
                        <div class="ske-bd-stat-item">
                            <div class="ske-bd-stat-number">${notas.length}</div>
                            <div class="ske-bd-stat-label">Notas</div>
                        </div>
                        <div class="ske-bd-stat-item">
                            <div class="ske-bd-stat-number">${tiempoExtra.length}</div>
                            <div class="ske-bd-stat-label">Tiempo Extra</div>
                        </div>
                        <div class="ske-bd-stat-item">
                            <div class="ske-bd-stat-number">${avisos.length}</div>
                            <div class="ske-bd-stat-label">Avisos</div>
                        </div>
                    </div>

                    <div class="ske-bd-total-stats">
                        <div class="ske-bd-total-label">Total de Registros</div>
                        <div class="ske-bd-total-number">${totalRegistros}</div>
                    </div>
                </div>

                <!-- INFORMACIÓN -->
                <div class="ske-bd-section ske-bd-info-section">
                    <div class="ske-bd-info-icono">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                    </div>
                    <div class="ske-bd-info-content">
                        <h4>Información Importante</h4>
                        <p>Los datos se almacenan localmente en tu dispositivo. Te recomendamos exportar una copia de seguridad regularmente para evitar pérdida de información.</p>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        // Guardar nombre de usuario
        document.getElementById('btnSaveUserName')?.addEventListener('click', () => {
            const newName = document.getElementById('bdUserName').value.trim();
            if (newName) {
                DB.set('userName', newName);
                document.getElementById('menuUserName').textContent = newName;
                App.showToast('✅ Nombre actualizado');
            }
        });

        // Exportar
        document.getElementById('btnExportar')?.addEventListener('click', () => this.exportarDatos());

        // Importar
        document.getElementById('btnImportar')?.addEventListener('click', () => {
            document.getElementById('inputImportar').click();
        });
        document.getElementById('inputImportar')?.addEventListener('change', (e) => this.importarDatos(e));

        // Reiniciar
        document.getElementById('btnReiniciar')?.addEventListener('click', () => this.reiniciarDatos());
    },

    exportarDatos() {
        const datos = {
            version: '1.0',
            fecha: new Date().toISOString(),
            userName: DB.get('userName', ''),
            theme: DB.get('theme', 'lavender'),
            roles: DB.load('roles'),
            servicios: DB.load('servicios'),
            lineas: DB.load('lineas'),
            terminales: DB.load('terminales'),
            semanas: DB.load('semanas'),
            reservas: DB.load('reservas'),
            espejos: DB.load('espejos'),
            notas: DB.load('notas'),
            tiempoExtra: DB.load('tiempoExtra'),
            avisos: DB.load('avisos')
        };

        const dataStr = JSON.stringify(datos, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `ciclo-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        App.showToast('✅ Copia de seguridad exportada');
    },

    importarDatos(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const datos = JSON.parse(event.target.result);
                
                if (confirm('¿Restaurar datos? Esto reemplazará toda la información actual.')) {
                    if (datos.userName) DB.set('userName', datos.userName);
                    if (datos.theme) DB.set('theme', datos.theme);
                    if (datos.roles) DB.save('roles', datos.roles);
                    if (datos.servicios) DB.save('servicios', datos.servicios);
                    if (datos.lineas) DB.save('lineas', datos.lineas);
                    if (datos.terminales) DB.save('terminales', datos.terminales);
                    if (datos.semanas) DB.save('semanas', datos.semanas);
                    if (datos.reservas) DB.save('reservas', datos.reservas);
                    if (datos.espejos) DB.save('espejos', datos.espejos);
                    if (datos.notas) DB.save('notas', datos.notas);
                    if (datos.tiempoExtra) DB.save('tiempoExtra', datos.tiempoExtra);
                    if (datos.avisos) DB.save('avisos', datos.avisos);

                    App.showToast('✅ Datos restaurados correctamente');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (error) {
                App.showToast('❌ Error al importar: archivo inválido');
            }
        };
        reader.readAsText(file);
    },

    reiniciarDatos() {
        if (confirm('️ ¿Estás seguro? Se borrarán TODOS los datos de la aplicación.')) {
            if (confirm('Esta acción no se puede deshacer. ¿Continuar?')) {
                const keys = ['roles', 'servicios', 'lineas', 'terminales', 'semanas', 
                             'reservas', 'espejos', 'notas', 'tiempoExtra', 'avisos'];
                
                keys.forEach(key => DB.save(key, []));
                DB.set('userName', '');
                DB.set('theme', 'lavender');
                
                App.showToast(' Aplicación reiniciada');
                setTimeout(() => location.reload(), 1500);
            }
        }
    }
};

export default Bd;