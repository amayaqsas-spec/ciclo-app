// ============================================
// ROL.JS - Módulo de Mi Rol con lógica de días
// ============================================

const Rol = {
    render() {
        const roles = DB.load('roles');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        if (roles.length === 0) {
            return `
                <div class="view active">
                    <h2 class="page-title">
                        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Mi Rol
                    </h2>
                    <div class="aviso-empty">
                        <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <p>No hay roles registrados</p>
                    </div>
                </div>
            `;
        }

        const rol = roles.sort((a, b) => b.createdAt - a.createdAt)[0];
        const linea = lineas.find(l => l.id === rol.lineaId);
        const terminal = terminales.find(t => t.id === rol.terminalId);

        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Mi Rol
                    </h2>
                    <button class="btn-add" id="btnAddRol">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nuevo
                    </button>
                </div>
                <div id="rolList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddRol').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('roles').find(r => r.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Rol</h3>
            <div class="input-group">
                <label>Línea</label>
                <select id="rolLinea">${lineaOptions}</select>
            </div>
            <div class="input-group">
                <label>Terminal</label>
                <select id="rolTerminal">
                    <option value="">Selecciona línea primero</option>
                </select>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        const selectLinea = document.getElementById('rolLinea');
        const selectTerminal = document.getElementById('rolTerminal');

        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const terminalesFiltradas = terminales.filter(t => t.lineaId === lineaId);
            selectTerminal.innerHTML = terminalesFiltradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + terminalesFiltradas.map(t => 
                    `<option value="${t.id}" ${data && data.terminalId === t.id ? 'selected' : ''}>${t.nombre}</option>`
                ).join('');
        };

        selectLinea.addEventListener('change', updateTerminales);
        updateTerminales();

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;

            if (!lineaId || !terminalId) {
                App.showToast('Completa todos los campos');
                return;
            }

            let roles = DB.load('roles');

            if (editId) {
                const idx = roles.findIndex(r => r.id === editId);
                if (idx !== -1) {
                    roles[idx] = { ...roles[idx], lineaId, terminalId };
                }
            } else {
                roles.push({
                    id: DB.generateId(),
                    lineaId,
                    terminalId,
                    semanas: [],
                    createdAt: Date.now()
                });
            }

            DB.save('roles', roles);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Rol actualizado' : 'Rol guardado');
        });
    },

    renderList() {
        const list = document.getElementById('rolList');
        const roles = DB.load('roles');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        if (roles.length === 0) {
            list.innerHTML = `
                <div class="aviso-empty">
                    <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <p>No hay roles registrados</p>
                </div>
            `;
            return;
        }

        list.innerHTML = roles.map(rol => {
            const linea = lineas.find(l => l.id === rol.lineaId);
            const terminal = terminales.find(t => t.id === rol.terminalId);
            
            return `
                <div class="rol-container">
                    <div class="rol-header-info">
                        <div class="rol-info-left">
                            <span class="rol-info-tag">${linea ? linea.nombre : 'Sin línea'}</span>
                            <span class="rol-info-tag">${terminal ? terminal.nombre : 'Sin terminal'}</span>
                        </div>
                        <div class="rol-actions">
                            <button class="btn-edit" data-id="${rol.id}">Editar</button>
                            <button class="btn-remove" data-id="${rol.id}">Eliminar</button>
                        </div>
                    </div>
                    <div id="rolSemanas-${rol.id}"></div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });
        list.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar este rol?')) {
                    let data = DB.load('roles').filter(r => r.id !== btn.dataset.id);
                    DB.save('roles', data);
                    this.renderList();
                    App.showToast('Rol eliminado');
                }
            });
        });

        roles.forEach(rol => {
            this.renderSemanas(rol.id);
        });
    },

    renderSemanas(rolId) {
        const rol = DB.load('roles').find(r => r.id === rolId);
        if (!rol) return;

        const container = document.getElementById(`rolSemanas-${rolId}`);
        if (!container) return;

        const semanas = rol.semanas || [];
        const hoy = new Date();
        const hoyStr = this.getFechaLocal(hoy);

        container.innerHTML = semanas.map((semana, idx) => {
            const esSemanaActual = hoyStr >= semana.fechaInicio && hoyStr <= semana.fechaFin;
            
            return `
                <div class="rol-semana ${esSemanaActual ? 'semana-actual' : ''}">
                    <div class="rol-semana-titulo">
                        Semana ${semana.numeroSemana || idx + 1} • ${semana.fechaInicio} al ${semana.fechaFin}
                    </div>
                    <div class="rol-dias-grid">
                        ${this.renderDias(rol, semana, idx)}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderDias(rol, semana, semanaIdx) {
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const hoy = new Date();
        const hoyStr = this.getFechaLocal(hoy);

        return semana.dias.map((dia, diaIdx) => {
            const fechaDia = this.calcularFecha(semana.fechaInicio, diaIdx);
            const esHoy = fechaDia === hoyStr;
            const diaNombre = diasSemana[diaIdx];
            
            // ✅ Determinar el tipo de día
            let tipoDia = 'Laboral';
            if (diaIdx === 0) {
                tipoDia = 'Domingo/Festivos';
            } else if (diaIdx === 6) {
                tipoDia = 'Sábado';
            }
            
            // ✅ Si está marcado como festivo, usar tipo Domingo/Festivos
            if (dia.esFestivo) {
                tipoDia = 'Domingo/Festivos';
            }

            // ✅ Buscar el servicio correspondiente al tipo de día
            const servicioDelDia = this.buscarServicioPorTipo(rol, tipoDia, dia.dato);

            return `
                <div class="rol-dia ${esHoy ? 'dia-actual' : ''} ${dia.esDescanso ? 'dia-descanso' : ''}">
                    <div class="rol-dia-nombre">${diaNombre.substring(0, 3)}</div>
                    <div class="rol-dia-numero">${diaIdx + 1}</div>
                    ${!dia.esDescanso ? `
                        <input type="text" class="rol-dia-dato" 
                               data-rol="${rol.id}" 
                               data-semana="${semanaIdx}" 
                               data-dia="${diaIdx}" 
                               value="${dia.dato || ''}" 
                               placeholder="Servicio"
                               title="Tipo: ${tipoDia}">
                        ${dia.esFestivo ? '<div style="font-size:8px;color:#ff9800;">🎉</div>' : ''}
                    ` : ''}
                </div>
            `;
        }).join('');
    },

    buscarServicioPorTipo(rol, tipoDia, numeroServicio) {
        if (!numeroServicio) return null;
        
        const servicios = DB.load('servicios');
        const semanas = DB.load('semanas');
        
        // Buscar la semana que corresponde al tipo de día
        const semanaTipo = semanas.find(s => 
            s.lineaId === rol.lineaId && 
            s.tipo === tipoDia
        );
        
        if (!semanaTipo) return null;
        
        // Buscar el servicio con ese número y tipo de día
        const servicio = servicios.find(s => 
            s.nombre === numeroServicio && 
            s.lineaId === rol.lineaId && 
            s.semanaId === semanaTipo.id
        );
        
        return servicio;
    },

    calcularFecha(fechaInicio, diasAgregar) {
        const fecha = new Date(fechaInicio);
        fecha.setDate(fecha.getDate() + diasAgregar);
        return this.getFechaLocal(fecha);
    },

    getFechaLocal(fecha) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};

export default Rol;