// ============================================
// BD.JS - Módulo de Base de Datos
// ============================================

const BD = {
    clavesSistema: ['theme', 'auth', 'currentUser', 'isAdmin'],

    render() {
        const nombreActual = DB.get('userName', Auth.getUserName(Auth.currentUser));
        
        return `
            <div class="view active">
                <h2 class="page-title">
                    <svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                    Base de Datos
                </h2>

                <div class="bd-section">
                    <h3 class="bd-section-title">👤 Perfil de Usuario</h3>
                    <div class="bd-card">
                        <div class="bd-info">
                            <h3>Nombre de Usuario</h3>
                            <p>Este nombre aparecerá en el saludo del inicio (ej: "¡Hola, Juan!")</p>
                        </div>
                        <div style="display:flex;gap:8px;width:100%;margin-top:10px;">
                            <input type="text" id="inputUserName" value="${nombreActual}" placeholder="Tu nombre" style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--primary-soft);background:var(--bg);color:var(--text);">
                            <button class="bd-btn bd-btn-export" id="btnGuardarNombre" style="padding:8px 16px;">Guardar</button>
                        </div>
                    </div>
                </div>

                <div class="bd-info-card">
                    <p style="font-size:12px;color:var(--text-soft);line-height:1.5;">
                        Gestiona los datos de tu aplicación. Puedes exportar una copia de seguridad, 
                        restaurar datos desde un archivo o reiniciar la aplicación completamente.
                    </p>
                </div>

                <div class="bd-acciones">
                    <div class="bd-card bd-card-export">
                        <div class="bd-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </div>
                        <div class="bd-info">
                            <h3>Exportar</h3>
                            <p>Descargar copia de seguridad</p>
                        </div>
                        <button class="bd-btn bd-btn-export" id="btnExportar">Exportar</button>
                    </div>

                    <div class="bd-card bd-card-import">
                        <div class="bd-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                        </div>
                        <div class="bd-info">
                            <h3>Importar</h3>
                            <p>Restaurar desde archivo</p>
                        </div>
                        <button class="bd-btn bd-btn-import" id="btnImportar">Importar</button>
                        <input type="file" id="inputFileImport" accept=".json" style="display:none;">
                    </div>

                    <div class="bd-card bd-card-reset">
                        <div class="bd-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </div>
                        <div class="bd-info">
                            <h3>Resetear</h3>
                            <p>Borrar todos los datos</p>
                        </div>
                        <button class="bd-btn bd-btn-reset" id="btnResetear">Resetear</button>
                    </div>
                </div>

                <div class="bd-stats">
                    <h3>Resumen de datos</h3>
                    <div id="bdStatsContent"></div>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnGuardarNombre').addEventListener('click', () => {
            const nuevoNombre = document.getElementById('inputUserName').value.trim();
            if (nuevoNombre) {
                DB.set('userName', nuevoNombre);
                App.showToast('✅ Nombre actualizado.');
                document.getElementById('menuUserName').textContent = nuevoNombre;
                if (Views.current === 'home') {
                    setTimeout(() => Views.load('home'), 500);
                }
            }
        });

        document.getElementById('btnExportar').addEventListener('click', () => this.exportar());
        document.getElementById('btnImportar').addEventListener('click', () => {
            document.getElementById('inputFileImport').click();
        });
        document.getElementById('inputFileImport').addEventListener('change', (e) => this.importar(e));
        document.getElementById('btnResetear').addEventListener('click', () => this.resetear());
        
        this.mostrarEstadisticas();
    },

    exportar() {
        const modal = App.showModal(`
            <h3> Exportar Base de Datos</h3>
            <p style="color:var(--text-soft);font-size:13px;margin-bottom:16px;line-height:1.5;">
                Se generará un archivo <strong>JSON</strong> con todos los datos de tu aplicación.
            </p>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancelExport">Cancelar</button>
                <button class="btn-primary" id="btnConfirmExport" style="background:var(--primary);">📥 Descargar</button>
            </div>
        `);

        document.getElementById('btnCancelExport').addEventListener('click', () => modal.remove());
        document.getElementById('btnConfirmExport').addEventListener('click', () => {
            modal.remove();
            this.ejecutarExportacion();
        });
    },

    ejecutarExportacion() {
        const datos = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!this.clavesSistema.includes(key) && !key.startsWith('firebase')) {
                try {
                    datos[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    datos[key] = localStorage.getItem(key);
                }
            }
        }

        datos._meta = {
            version: '1.0',
            fechaExportacion: new Date().toISOString(),
            app: 'CICLO'
        };

        const jsonStr = JSON.stringify(datos, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ciclo_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        App.showToast('✅ Base de datos exportada correctamente');
    },

    importar(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const datos = JSON.parse(e.target.result);
                this.confirmarImportacion(datos);
            } catch (err) {
                App.showToast('❌ Archivo no válido');
            }
        };
        reader.readAsText(file);
        
        event.target.value = '';
    },

    confirmarImportacion(datos) {
        const totalRegistros = Object.keys(datos).filter(k => !this.clavesSistema.includes(k) && k !== '_meta').length;
        
        const modal = App.showModal(`
            <h3>📥 Importar Base de Datos</h3>
            <div style="background:var(--bg-soft);padding:12px;border-radius:var(--radius-xs);margin-bottom:14px;">
                <p style="font-size:12px;color:var(--text);margin-bottom:6px;">
                    <strong>Archivo detectado:</strong>
                </p>
                <p style="font-size:11px;color:var(--text-soft);">
                     ${totalRegistros} secciones de datos<br>
                    📅 Exportado: ${datos._meta?.fechaExportacion ? new Date(datos._meta.fechaExportacion).toLocaleString() : 'Desconocido'}
                </p>
            </div>
            <p style="color:#ff9800;font-size:12px;font-weight:600;margin-bottom:14px;">
                ⚠️ Esto REEMPLAZARÁ los datos actuales. ¿Continuar?
            </p>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancelImport">Cancelar</button>
                <button class="btn-primary" id="btnConfirmImport" style="background:#ff9800;">Sí, importar</button>
            </div>
        `);

        document.getElementById('btnCancelImport').addEventListener('click', () => modal.remove());
        document.getElementById('btnConfirmImport').addEventListener('click', () => {
            modal.remove();
            this.ejecutarImportacion(datos);
        });
    },

    ejecutarImportacion(datos) {
        let contador = 0;
        
        Object.keys(datos).forEach(key => {
            if (!this.clavesSistema.includes(key) && key !== '_meta') {
                try {
                    const valor = datos[key];
                    const valorStr = typeof valor === 'string' ? valor : JSON.stringify(valor);
                    localStorage.setItem(key, valorStr);
                    contador++;
                    console.log(`✅ Importado: ${key}`);
                } catch (e) {
                    console.error(`❌ Error al importar ${key}:`, e);
                }
            }
        });

        App.showToast(`✅ ${contador} secciones importadas correctamente`);
        
        // ✅ Recargar la página para que se apliquen los cambios
        setTimeout(() => {
            location.reload();
        }, 1000);
    },

    resetear() {
        const modal = App.showModal(`
            <h3>️ Resetear Aplicación</h3>
            <div style="background:rgba(220,53,69,0.1);border:1px solid rgba(220,53,69,0.3);padding:12px;border-radius:var(--radius-xs);margin-bottom:14px;">
                <p style="color:#dc3545;font-size:12px;font-weight:600;margin-bottom:8px;">
                    🚨 ACCIÓN IRREVERSIBLE
                </p>
                <p style="color:var(--text-soft);font-size:12px;line-height:1.5;">
                    Se eliminarán <strong>TODOS</strong> los datos de la aplicación.
                </p>
            </div>
            <p style="font-size:12px;color:var(--text);margin-bottom:10px;">
                Para confirmar, escribe <strong style="color:#dc3545;">BORRAR</strong>:
            </p>
            <div class="input-group">
                <input type="text" id="inputConfirmReset" placeholder="Escribe BORRAR" style="text-transform:uppercase;">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancelReset">Cancelar</button>
                <button class="btn-primary" id="btnConfirmReset" style="background:#dc3545;" disabled>🗑️ Resetear todo</button>
            </div>
        `);

        const inputConfirm = document.getElementById('inputConfirmReset');
        const btnConfirm = document.getElementById('btnConfirmReset');

        inputConfirm.addEventListener('input', () => {
            btnConfirm.disabled = inputConfirm.value.trim().toUpperCase() !== 'BORRAR';
        });

        document.getElementById('btnCancelReset').addEventListener('click', () => modal.remove());
        btnConfirm.addEventListener('click', () => {
            if (inputConfirm.value.trim().toUpperCase() === 'BORRAR') {
                modal.remove();
                this.ejecutarReset();
            }
        });
    },

    ejecutarReset() {
        const clavesAEliminar = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!this.clavesSistema.includes(key) && !key.startsWith('firebase')) {
                clavesAEliminar.push(key);
            }
        }

        clavesAEliminar.forEach(key => localStorage.removeItem(key));

        App.showToast('🗑️ Aplicación reseteada completamente');
        
        setTimeout(() => {
            location.reload();
        }, 1000);
    },

    mostrarEstadisticas() {
        const statsContent = document.getElementById('bdStatsContent');
        const secciones = [
            { key: 'lineas', label: 'Líneas' },
            { key: 'terminales', label: 'Terminales' },
            { key: 'semanas', label: 'Días' },
            { key: 'reservas', label: 'Reservas' },
            { key: 'servicios', label: 'Servicios' },
            { key: 'roles', label: 'Roles' },
            { key: 'notas', label: 'Notas' },
            { key: 'tiempoExtra', label: 'Tiempo Extra' },
            { key: 'espejos', label: 'Espejos' },
            { key: 'avisos', label: 'Documentos' }
        ];

        let html = '';
        let total = 0;

        secciones.forEach(sec => {
            const data = DB.load(sec.key);
            const count = Array.isArray(data) ? data.length : 0;
            total += count;
            
            html += `
                <div class="bd-stat-row">
                    <span class="bd-stat-label">${sec.label}</span>
                    <span class="bd-stat-value">${count}</span>
                </div>
            `;
        });

        html += `
            <div class="bd-stat-row bd-stat-total">
                <span class="bd-stat-label">Total de registros</span>
                <span class="bd-stat-value">${total}</span>
            </div>
        `;

        statsContent.innerHTML = html;
    }
};

export default BD;