// ============================================
// ROL.JS - Módulo Mi Rol con calendario en 2 pasos
// ============================================

const Rol = {
    render() {
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
        const btnAddRol = document.getElementById('btnAddRol');
        if (btnAddRol) {
            btnAddRol.addEventListener('click', () => this.paso1());
        }
        this.renderList();
    },

    // ============================================
    // PASO 1: Datos básicos
    // ============================================
    paso1(editId = null) {
        const data = editId ? DB.load('roles').find(r => r.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const descansosSeleccionados = data && data.descansos ? data.descansos : [];

        const descansoCheckboxes = diasSemana.map(d => `
            <label class="descanso-checkbox">
                <input type="checkbox" value="${d}" ${descansosSeleccionados.includes(d) ? 'checked' : ''} class="descanso-check">
                <span>${d}</span>
            </label>
        `).join('');

        const semanaOptions = [1, 2, 3, 4, 5].map(n => 
            `<option value="${n}" ${data && data.semanaInicio === n ? 'selected' : ''}>Semana ${n}</option>`
        ).join('');

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Rol - Paso 1</h3>
            <p style="font-size:12px;color:var(--text-soft);margin-bottom:16px;">Completa los datos básicos para crear el calendario</p>
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
            <div class="input-group">
                <label>Número de Rol</label>
                <input type="number" id="rolNumero" value="${data ? data.numeroRol : ''}" placeholder="Ej. 1, 2, 3, 7" min="1">
            </div>
            <div class="input-group">
                <label>Días de Descanso</label>
                <div class="descansos-container" id="descansosContainer">
                    ${descansoCheckboxes}
                </div>
                <small style="color:var(--text-soft);font-size:11px;margin-top:6px;display:block;">Selecciona los días que NO trabajas</small>
            </div>
            <div class="input-group">
                <label>Semana de Inicio</label>
                <select id="rolSemanaInicio">
                    <option value="">¿Con qué semana empezamos?</option>
                    ${semanaOptions}
                </select>
                <small style="color:var(--text-soft);font-size:11px;margin-top:6px;display:block;">La semana actual se marcará con este número</small>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancelPaso1">Cancelar</button>
                <button class="btn-primary" id="btnCrearCalendario">Crear Calendario →</button>
            </div>
        `);

        const selectLinea = document.getElementById('rolLinea');
        const selectTerminal = document.getElementById('rolTerminal');

        selectLinea.addEventListener('change', () => {
            const lineaId = selectLinea.value;
            const terminalesFiltradas = terminales.filter(t => t.lineaId === lineaId);
            selectTerminal.innerHTML = terminalesFiltradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + terminalesFiltradas.map(t => 
                    `<option value="${t.id}" ${data && data.terminalId === t.id ? 'selected' : ''}>${t.nombre}</option>`
                ).join('');
        });

        if (selectLinea.value) {
            selectLinea.dispatchEvent(new Event('change'));
        }

        document.getElementById('btnCancelPaso1').addEventListener('click', () => modal.remove());
        document.getElementById('btnCrearCalendario').addEventListener('click', () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const numeroRol = document.getElementById('rolNumero').value.trim();
            const semanaInicio = parseInt(document.getElementById('rolSemanaInicio').value);
            const descansos = Array.from(document.querySelectorAll('.descanso-check:checked')).map(cb => cb.value);

            if (!lineaId || !terminalId || !numeroRol || !semanaInicio) {
                App.showToast('Completa todos los campos obligatorios');
                return;
            }

            modal.remove();
            this.paso2(editId, { lineaId, terminalId, numeroRol: parseInt(numeroRol), semanaInicio, descansos }, data);
        });
    },

    // ============================================
    // PASO 2: Calendario para asignar servicios
    // ============================================
    paso2(editId, datosBasicos, dataAnterior) {
        const { lineaId, terminalId, numeroRol, semanaInicio, descansos } = datosBasicos;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const linea = lineas.find(l => l.id === lineaId);
        const terminal = terminales.find(t => t.id === terminalId);

        const hoy = new Date();
        const domingoInicio = this.getDomingoDeEstaSemana(hoy);
        const diasCortos = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        let htmlCalendario = '<div class="calendario-paso2-scroll">';

        for (let i = 0; i < 5; i++) {
            const numeroSemanaCiclico = ((semanaInicio - 1 + i) % 5) + 1;
            const fechaInicio = new Date(domingoInicio);
            fechaInicio.setDate(fechaInicio.getDate() + (i * 7));
            
            const fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaFin.getDate() + 6);
            
            const mesInicio = meses[fechaInicio.getMonth()];
            const mesFin = meses[fechaFin.getMonth()];
            const mesTexto = mesInicio === mesFin ? mesInicio : `${mesInicio}-${mesFin}`;

            htmlCalendario += `
                <div class="semana-paso2-card">
                    <div class="semana-paso2-header">
                        <span class="semana-paso2-titulo">SEMANA ${numeroSemanaCiclico} - ${mesTexto}</span>
                    </div>
                    <div class="dias-paso2-grid">
            `;

            for (let diaIdx = 0; diaIdx < 7; diaIdx++) {
                const diaNombre = diasSemana[diaIdx];
                const esDescanso = descansos.includes(diaNombre);
                const fechaDia = new Date(fechaInicio);
                fechaDia.setDate(fechaDia.getDate() + diaIdx);
                const diaNumero = fechaDia.getDate();
                const esHoy = this.getFechaLocal(fechaDia) === this.getFechaLocal(hoy);
                
                let valorGuardado = '';
                if (dataAnterior && dataAnterior.semanas && dataAnterior.semanas[i] && dataAnterior.semanas[i].dias[diaIdx]) {
                    valorGuardado = dataAnterior.semanas[i].dias[diaIdx].dato || '';
                }

                const displayValor = valorGuardado ? valorGuardado : '<span style="color:var(--primary);font-size:22px;font-weight:800;">+</span>';

                htmlCalendario += `
                    <div class="dia-paso2-celda ${esDescanso ? 'dia-paso2-descanso' : ''} ${esHoy ? 'dia-paso2-hoy' : ''}" 
                         data-semana="${i}" data-dia="${diaIdx}" data-valor="${valorGuardado}">
                        <div class="dia-paso2-header">
                            <span class="dia-paso2-nombre">${diasCortos[diaIdx]}</span>
                            <span class="dia-paso2-numero">${diaNumero}</span>
                        </div>
                        ${esDescanso ? 
                            '<div class="dia-paso2-badge-descanso">🛌</div>' :
                            `<div class="dia-paso2-valor-display">${displayValor}</div>`
                        }
                    </div>
                `;
            }

            htmlCalendario += `
                    </div>
                </div>
            `;
        }

        htmlCalendario += '</div>';

        const modal = App.showModal(`
            <h3>Paso 2 - Asignar Servicios</h3>
            <div class="paso2-info-bar">
                <span class="paso2-info-tag">Rol #${numeroRol}</span>
                <span class="paso2-info-tag">${linea ? linea.nombre : ''}</span>
                <span class="paso2-info-tag">${terminal ? terminal.nombre : ''}</span>
            </div>
            <p style="font-size:12px;color:var(--text-soft);margin-bottom:12px;">Toca cada día para agregar el servicio o reserva. El día de hoy está resaltado.</p>
            ${htmlCalendario}
            <div class="modal-actions">
                <button class="btn-secondary" id="btnVolverPaso1">← Volver</button>
                <button class="btn-primary" id="btnGuardarRol">${editId ? 'Actualizar' : 'Guardar'} Rol</button>
            </div>
        `);

        // ✅ Lógica para abrir el modal al tocar un día
        document.querySelectorAll('.dia-paso2-celda:not(.dia-paso2-descanso)').forEach(celda => {
            celda.addEventListener('click', () => {
                const semIdx = parseInt(celda.dataset.semana);
                const diaIdx = parseInt(celda.dataset.dia);
                const currentVal = celda.dataset.valor || '';
                const diaNombre = diasSemana[diaIdx];
                
                // Calcular fecha para mostrar en el modal
                const fechaInicioSem = new Date(domingoInicio);
                fechaInicioSem.setDate(fechaInicioSem.getDate() + (semIdx * 7));
                const fechaDia = new Date(fechaInicioSem);
                fechaDia.setDate(fechaDia.getDate() + diaIdx);
                const fechaStr = fechaDia.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

                const modalDia = App.showModal(`
                    <h3 style="text-transform:capitalize;">${diaNombre} ${fechaStr}</h3>
                    <div class="input-group" style="margin: 24px 0;">
                        <label style="font-size:14px;font-weight:700;">Servicio o Reserva</label>
                        <input type="text" id="modalServicioInput" value="${currentVal}" placeholder="Ej: 1234, MA, RA" 
                               style="width:100%;padding:14px;font-size:18px;text-align:center;border:2px solid var(--primary);border-radius:10px;background:var(--surface);color:var(--text);font-weight:700;">
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary" id="btnCancelModalDia">Cancelar</button>
                        <button class="btn-primary" id="btnSaveModalDia">Guardar</button>
                    </div>
                `);

                document.getElementById('btnCancelModalDia').addEventListener('click', () => modalDia.remove());
                document.getElementById('btnSaveModalDia').addEventListener('click', () => {
                    const nuevoValor = document.getElementById('modalServicioInput').value.trim();
                    
                    // Actualizar la celda visualmente y en sus datos
                    celda.dataset.valor = nuevoValor;
                    const displayDiv = celda.querySelector('.dia-paso2-valor-display');
                    displayDiv.innerHTML = nuevoValor ? nuevoValor : '<span style="color:var(--primary);font-size:22px;font-weight:800;">+</span>';
                    
                    modalDia.remove();
                    App.showToast('Dato guardado');
                });
            });
        });

        document.getElementById('btnVolverPaso1').addEventListener('click', () => {
            modal.remove();
            this.paso1(editId);
        });

        document.getElementById('btnGuardarRol').addEventListener('click', () => {
            const semanasData = this.obtenerDatosCalendarioPaso2(semanaInicio, descansos, domingoInicio);

            let roles = DB.load('roles');

            if (editId) {
                const idx = roles.findIndex(r => r.id === editId);
                if (idx !== -1) {
                    roles[idx] = { 
                        ...roles[idx], 
                        lineaId, 
                        terminalId,
                        numeroRol,
                        descansos,
                        semanaInicio,
                        semanas: semanasData
                    };
                }
            } else {
                roles.push({
                    id: DB.generateId(),
                    lineaId,
                    terminalId,
                    numeroRol,
                    descansos,
                    semanaInicio,
                    semanas: semanasData,
                    createdAt: Date.now()
                });
            }

            DB.save('roles', roles);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Rol actualizado' : 'Rol guardado exitosamente');
        });
    },

    obtenerDatosCalendarioPaso2(semanaInicio, descansos, domingoInicio) {
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const semanas = [];

        for (let i = 0; i < 5; i++) {
            const numeroSemanaCiclico = ((semanaInicio - 1 + i) % 5) + 1;
            const fechaInicio = new Date(domingoInicio);
            fechaInicio.setDate(fechaInicio.getDate() + (i * 7));
            
            const fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaFin.getDate() + 6);

            const dias = [];
            for (let diaIdx = 0; diaIdx < 7; diaIdx++) {
                const diaNombre = diasSemana[diaIdx];
                const esDescanso = descansos.includes(diaNombre);
                
                // ✅ Leer el valor del atributo data-valor de la celda
                const celda = document.querySelector(`.dia-paso2-celda[data-semana="${i}"][data-dia="${diaIdx}"]`);
                const valor = celda ? (celda.dataset.valor || '') : '';
                
                const fechaDia = new Date(fechaInicio);
                fechaDia.setDate(fechaDia.getDate() + diaIdx);
                const fechaDiaStr = this.getFechaLocal(fechaDia);

                dias.push({
                    dia: diaNombre,
                    dato: valor,
                    esDescanso: esDescanso,
                    esFestivo: false,
                    fecha: fechaDiaStr,
                    numeroDia: fechaDia.getDate()
                });
            }

            semanas.push({
                numeroSemana: numeroSemanaCiclico,
                fechaInicio: this.getFechaLocal(fechaInicio),
                fechaFin: this.getFechaLocal(fechaFin),
                dias: dias
            });
        }

        return semanas;
    },

    getDomingoDeEstaSemana(fecha) {
        const d = new Date(fecha);
        const dia = d.getDay();
        const diff = d.getDate() - dia;
        return new Date(d.setDate(diff));
    },

    renderList() {
        const list = document.getElementById('rolList');
        if (!list) return;

        const roles = DB.load('roles');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        if (roles.length === 0) {
            list.innerHTML = `
                <div class="aviso-empty">
                    <svg viewBox="0 0 24 24" style="width:48px;height:48px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <p>No hay roles registrados</p>
                    <p style="font-size:12px;color:var(--text-soft);margin-top:8px;">Haz clic en "Nuevo" para crear tu rol</p>
                </div>
            `;
            return;
        }

        list.innerHTML = roles.map(rol => {
            const linea = lineas.find(l => l.id === rol.lineaId);
            const terminal = terminales.find(t => t.id === rol.terminalId);
            
            return `
                <div class="rol-main-container">
                    <div class="rol-header-info">
                        <div class="rol-info-left">
                            <span class="rol-info-tag">Rol #${rol.numeroRol || 'N/A'}</span>
                            <span class="rol-info-tag">${linea ? linea.nombre : 'Sin línea'}</span>
                            <span class="rol-info-tag">${terminal ? terminal.nombre : 'Sin terminal'}</span>
                        </div>
                        <div class="rol-actions">
                            <button class="btn-edit" data-id="${rol.id}">Editar</button>
                            <button class="btn-remove" data-id="${rol.id}">Eliminar</button>
                        </div>
                    </div>
                    <div id="rolCalendario-${rol.id}"></div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => this.paso1(btn.dataset.id));
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
            this.renderCalendario(rol.id);
        });
    },

    renderCalendario(rolId) {
        const rol = DB.load('roles').find(r => r.id === rolId);
        if (!rol) return;

        const container = document.getElementById(`rolCalendario-${rol.id}`);
        if (!container) return;

        const semanas = rol.semanas || [];
        const hoy = new Date();
        const hoyStr = this.getFechaLocal(hoy);

        if (semanas.length === 0) {
            container.innerHTML = `
                <div style="padding:20px;text-align:center;color:var(--text-soft);">
                    <p>No hay semanas configuradas</p>
                </div>
            `;
            return;
        }

        // ✅ MANTENER ORDEN CRONOLÓGICO (igual que Paso 2)
        const semanasOrdenadas = semanas;

        container.innerHTML = `
            <div class="rol-calendario-scroll">
                ${semanasOrdenadas.map(semana => this.renderSemanaCard(rol, semana, hoyStr)).join('')}
            </div>
        `;
    },

    renderSemanaCard(rol, semana, hoyStr) {
        const diasCortos = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        const hoy = new Date();
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        const fechaInicio = new Date(semana.fechaInicio);
        const fechaFin = new Date(semana.fechaFin);
        
        // ✅ Normalizar todas las fechas al inicio del día (00:00:00) para comparar correctamente
        hoy.setHours(0, 0, 0, 0);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setHours(0, 0, 0, 0);
        
        // ✅ Comparar correctamente
        const esSemanaActual = hoy >= fechaInicio && hoy <= fechaFin;
        
        const mesInicio = meses[fechaInicio.getMonth()];
        const mesFin = meses[fechaFin.getMonth()];
        const mesTexto = mesInicio === mesFin ? mesInicio : `${mesInicio}-${mesFin}`;

        return `
            <div class="rol-semana-card ${esSemanaActual ? 'semana-activa' : ''}">
                <div class="rol-semana-header">
                    <div class="rol-semana-titulo">SEMANA ${semana.numeroSemana} - ${mesTexto}</div>
                    ${esSemanaActual ? '<div class="rol-semana-badge-actual">HOY</div>' : ''}
                </div>
                <div class="rol-dias-grid-calendario">
                    ${semana.dias.map((dia, diaIdx) => {
                        const fechaDiaStr = dia.fecha || this.calcularFecha(semana.fechaInicio, diaIdx);
                        const esHoy = fechaDiaStr === hoyStr;
                        const esDescanso = dia.esDescanso || false;
                        const diaNumero = dia.numeroDia || new Date(fechaDiaStr).getDate();
                        
                        return `
                            <div class="rol-dia-calendario ${esHoy ? 'dia-hoy' : ''} ${esDescanso ? 'dia-descanso' : ''}">
                                <div class="rol-dia-header">
                                    <span class="rol-dia-nombre-corto">${diasCortos[diaIdx]}</span>
                                    <span class="rol-dia-numero">${diaNumero}</span>
                                </div>
                                ${esDescanso ? 
                                    '<div class="rol-descanso-badge">🛌</div>' :
                                    `<div class="rol-dia-servicio">${dia.dato || '—'}</div>`
                                }
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    calcularFecha(fechaInicio, diasAgregar) {
        if (!fechaInicio) return '';
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