// ============================================
// ACTIVIDAD-USUARIOS.JS - Módulo de Admin con Botón de Actualizar
// ============================================

const ActividadUsuarios = {
    getCollection() {
        return window.firebase.firestore().collection('actividad_usuarios');
    },

    render() {
        if (!Auth.isAdmin) {
            return `
                <div class="view active">
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-soft);">
                        <p>🔒 Solo el administrador puede ver esta sección.</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="view active">
                <div style="padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 12px;">
                        <div>
                            <h2 style="margin: 0; font-size: 22px; color: var(--primary);">📊 Actividad de Usuarios</h2>
                            <p style="margin: 4px 0 0 0; color: var(--text-soft); font-size: 14px;">Registro de accesos a la aplicación</p>
                        </div>
                        <button id="btnActualizar" style="background: var(--primary); color: white; border: none; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <polyline points="1 20 1 14 7 14"></polyline>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            Actualizar
                        </button>
                    </div>

                    <!-- Filtros -->
                    <div style="background: var(--surface); padding: 16px; border-radius: 12px; box-shadow: var(--clay-shadow-sm); margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
                        <div style="flex: 1; min-width: 200px;">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-soft); margin-bottom: 4px;">Filtrar por fecha</label>
                            <input type="date" id="filtroFecha" style="width: 100%; padding: 10px; border: 1px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text);">
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-soft); margin-bottom: 4px;">Filtrar por email</label>
                            <input type="text" id="filtroEmail" placeholder="correo@ejemplo.com" style="width: 100%; padding: 10px; border: 1px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text);">
                        </div>
                        <div style="display: flex; align-items: flex-end; gap: 8px;">
                            <button id="btnFiltrar" style="padding: 10px 16px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">🔍 Filtrar</button>
                            <button id="btnLimpiar" style="padding: 10px 16px; background: var(--bg-soft); color: var(--text); border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">✕ Limpiar</button>
                        </div>
                    </div>

                    <!-- Resumen -->
                    <div id="resumenActividad" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px;"></div>

                    <!-- Última actualización -->
                    <div id="ultimaActualizacion" style="font-size: 11px; color: var(--text-soft); text-align: right; margin-bottom: 12px;"></div>

                    <!-- Lista de accesos -->
                    <div id="listaActividad">
                        <div style="text-align: center; padding: 40px; color: var(--text-soft);">
                            <div class="spinner" style="border-color: var(--primary-soft); border-top-color: var(--primary); width: 32px; height: 32px; margin: 0 auto 16px;"></div>
                            <p>Cargando actividad...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        if (!Auth.isAdmin) return;

        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('filtroFecha').value = hoy;

        document.getElementById('btnFiltrar')?.addEventListener('click', () => this.cargarActividad());
        document.getElementById('btnLimpiar')?.addEventListener('click', () => {
            document.getElementById('filtroFecha').value = '';
            document.getElementById('filtroEmail').value = '';
            this.cargarActividad();
        });
        document.getElementById('btnActualizar')?.addEventListener('click', () => {
            this.cargarActividad();
            App.showToast('🔄 Datos actualizados');
        });

        this.cargarActividad();
    },

    async cargarActividad() {
        const lista = document.getElementById('listaActividad');
        const resumen = document.getElementById('resumenActividad');
        const ultimaAct = document.getElementById('ultimaActualizacion');
        const filtroFecha = document.getElementById('filtroFecha').value;
        const filtroEmail = document.getElementById('filtroEmail').value.trim().toLowerCase();

        try {
            let query = this.getCollection().orderBy('timestamp', 'desc').limit(200);
            
            if (filtroFecha) {
                const fechaInicio = new Date(filtroFecha + 'T00:00:00').getTime();
                const fechaFin = new Date(filtroFecha + 'T23:59:59').getTime();
                query = this.getCollection()
                    .where('timestamp', '>=', fechaInicio)
                    .where('timestamp', '<=', fechaFin)
                    .orderBy('timestamp', 'desc');
            }

            const snapshot = await query.get();
            let registros = [];
            snapshot.forEach(doc => {
                registros.push({ id: doc.id, ...doc.data() });
            });

            if (filtroEmail) {
                registros = registros.filter(r => r.email.toLowerCase().includes(filtroEmail));
            }

            const usuariosUnicos = [...new Set(registros.map(r => r.email))];
            const hoy = new Date().toLocaleDateString('es-MX');
            const accesosHoy = registros.filter(r => r.fecha === hoy).length;

            resumen.innerHTML = `
                <div style="background: var(--surface); padding: 14px; border-radius: 10px; box-shadow: var(--clay-shadow-sm); text-align: center;">
                    <div style="font-size: 11px; color: var(--text-soft);">Total registros</div>
                    <div style="font-size: 24px; font-weight: 800; color: var(--primary);">${registros.length}</div>
                </div>
                <div style="background: var(--surface); padding: 14px; border-radius: 10px; box-shadow: var(--clay-shadow-sm); text-align: center;">
                    <div style="font-size: 11px; color: var(--text-soft);">Usuarios únicos</div>
                    <div style="font-size: 24px; font-weight: 800; color: var(--accent);">${usuariosUnicos.length}</div>
                </div>
                <div style="background: var(--surface); padding: 14px; border-radius: 10px; box-shadow: var(--clay-shadow-sm); text-align: center;">
                    <div style="font-size: 11px; color: var(--text-soft);">Accesos hoy</div>
                    <div style="font-size: 24px; font-weight: 800; color: #4CAF50;">${accesosHoy}</div>
                </div>
            `;

            const ahora = new Date();
            const horaActual = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            if (ultimaAct) {
                ultimaAct.textContent = `Última actualización: ${horaActual}`;
            }

            if (registros.length === 0) {
                lista.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: var(--surface); border-radius: 12px;">
                        <div style="font-size: 48px; margin-bottom: 12px;">📭</div>
                        <h3 style="margin: 0 0 8px 0; color: var(--text);">Sin registros</h3>
                        <p style="margin: 0; color: var(--text-soft); font-size: 14px;">No hay accesos registrados con estos filtros.</p>
                    </div>
                `;
                return;
            }

            const porUsuario = {};
            registros.forEach(r => {
                if (!porUsuario[r.email]) {
                    porUsuario[r.email] = { email: r.email, accesos: 0, ultimoAcceso: null, fechas: new Set() };
                }
                porUsuario[r.email].accesos++;
                porUsuario[r.email].fechas.add(r.fecha);
                if (!porUsuario[r.email].ultimoAcceso || r.timestamp > porUsuario[r.email].ultimoAcceso.timestamp) {
                    porUsuario[r.email].ultimoAcceso = r;
                }
            });

            let html = `<div style="display: flex; flex-direction: column; gap: 12px;">`;

            Object.values(porUsuario).forEach(u => {
                html += `
                    <div style="background: var(--surface); padding: 16px; border-radius: 12px; box-shadow: var(--clay-shadow-sm); border-left: 4px solid var(--primary);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 15px; font-weight: 700; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${u.email}</div>
                                <div style="font-size: 12px; color: var(--text-soft); margin-top: 2px;">
                                    Último acceso: ${u.ultimoAcceso.fecha} a las ${u.ultimoAcceso.hora}
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <span style="background: var(--primary); color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700;">
                                    ${u.accesos} acceso${u.accesos !== 1 ? 's' : ''}
                                </span>
                                <span style="background: var(--bg-soft); color: var(--text-soft); padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                    ${u.fechas.size} día${u.fechas.size !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        
                        <details style="margin-top: 8px;">
                            <summary style="font-size: 12px; color: var(--primary); cursor: pointer; font-weight: 600;">Ver detalle de accesos</summary>
                            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--bg-soft); max-height: 200px; overflow-y: auto;">
                                ${registros.filter(r => r.email === u.email).map(r => `
                                    <div style="display: flex; justify-content: space-between; padding: 6px 8px; background: var(--bg-soft); border-radius: 6px; margin-bottom: 4px; font-size: 12px;">
                                        <span style="color: var(--text);">${r.fecha}</span>
                                        <span style="color: var(--text-soft); font-weight: 600;">${r.hora}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </details>
                    </div>
                `;
            });

            html += `</div>`;
            lista.innerHTML = html;

        } catch (error) {
            console.error('❌ Error al cargar actividad:', error);
            lista.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #c62828;">
                    <p>Error al cargar los datos: ${error.message}</p>
                </div>
            `;
        }
    }
};

window.ActividadUsuarios = ActividadUsuarios;

export default ActividadUsuarios;