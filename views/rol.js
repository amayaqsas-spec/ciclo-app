// ============================================
// ROL.JS - Módulo Mi Rol con calendario en 2 pasos (Estilo Skeuomorfismo)
// ============================================

const Rol = {
    render() {
        return `
            <div class="view active ske-rol">
                <div class="ske-rol-header">
                    <div class="ske-rol-icono">
                        <svg viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                    </div>
                    <div class="ske-rol-texto">
                        <h2 class="ske-rol-titulo">Mi Rol</h2>
                        <p class="ske-rol-subtitulo">Gestiona tus roles y calendarios</p>
                    </div>
                    <button class="ske-rol-btn-nuevo" id="btnAddRol">
                        <svg viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span>Nuevo</span>
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
            <label class="ske-rol-descanso-checkbox">
                <input type="checkbox" value="${d}" ${descansosSeleccionados.includes(d) ? 'checked' : ''} class="descanso-check">
                <span class="ske-rol-checkmark"></span>
                <span class="ske-rol-descanso-label">${d}</span>
            </label>
        `).join('');

        const semanaOptions = [1, 2, 3, 4, 5].map(n => 
            `<option value="${n}" ${data && data.semanaInicio === n ? 'selected' : ''}>Semana ${n}</option>`
        ).join('');

        const modalElement = App.showModal(`
            <div class="ske-rol-modal-header">
                <div class="ske-rol-modal-icono">
                    <svg viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </div>
                <h3>${editId ? 'Editar' : 'Nuevo'} Rol - Paso 1</h3>
                <p class="ske-rol-modal-subtitulo">Completa los datos básicos</p>
            </div>
            <div class="ske-rol-modal-body">
                <div class="ske-rol-input-group">
                    <label>Línea *</label>
                    <select id="rolLinea" class="ske-rol-select">${lineaOptions}</select>
                </div>
                <div class="ske-rol-input-group">
                    <label>Terminal *</label>
                    <select id="rolTerminal" class="ske-rol-select">
                        <option value="">Selecciona línea primero</option>
                    </select>
                </div>
                <div class="ske-rol-input-group">
                    <label>Número de Rol *</label>
                    <input type="number" id="rolNumero" class="ske-rol-input" value="${data ? data.numeroRol : ''}" placeholder="Ej. 1, 2, 3, 7" min="1">
                </div>
                <div class="ske-rol-input-group">
                    <label>Días de Descanso</label>
                    <div class="ske-rol-descansos-grid" id="descansosContainer">
                        ${descansoCheckboxes}
                    </div>
                </div>
                <div class="ske-rol-input-group">
                    <label>Semana de Inicio *</label>
                    <select id="rolSemanaInicio" class="ske-rol-select">
                        <option value="">¿Con qué semana empezamos?</option>
                        ${semanaOptions}
                    </select>
                </div>
            </div>
            <div class="ske-rol-modal-footer">
                <button class="ske-rol-btn-modal ske-rol-btn-cancelar" id="btnCancelPaso1">Cancelar</button>
                <button class="ske-rol-btn-modal ske-rol-btn-siguiente" id="btnCrearCalendario">
                    Siguiente
                    <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
            </div>
        `);

        // Aplicar clases skeuomórficas al modal generado por App.showModal
        modalElement.querySelector('.modal').classList.add('ske-rol-modal');
        modalElement.classList.add('ske-rol-modal-overlay');

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

        document.getElementById('btnCancelPaso1').addEventListener('click', () => modalElement.remove());
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

            modalElement.remove();
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

        let htmlCalendario = '<div class="ske-rol-calendario-scroll">';

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
                <div class="ske-rol-semana-card">
                    <div class="ske-rol-semana-header">
                        <span class="ske-rol-semana-titulo">SEMANA ${numeroSemanaCiclico} - ${mesTexto}</span>
                    </div>
                    <div class="ske-rol-dias-grid">
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
                    <div class="ske-rol-dia ${esDescanso ? 'ske-rol-dia-descanso' : ''} ${esHoy ? 'ske-rol-dia-hoy' : ''}" 
                         data-semana="${i}" data-dia="${diaIdx}" data-valor="${valorGuardado}">
                        <div class="ske-rol-dia-header">
                            <span class="ske-rol-dia-nombre">${diasCortos[diaIdx]}</span>
                            <span class="ske-rol-dia-numero">${diaNumero}</span>
                        </div>
                        ${esDescanso ? 
                            '<div class="ske-rol-descanso-badge">🛌</div>' :
                            `<div class="ske-rol-dia-valor-display">${displayValor}</div>`
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

        const modalElement = App.showModal(`
            <div class="ske-rol-modal-header">
                <div class="ske-rol-modal-icono">
                    <svg viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </div>
                <h3>Paso 2 - Asignar Servicios</h3>
                <p class="ske-rol-modal-subtitulo">Toca cada día para agregar el servicio</p>
            </div>
            <div class="ske-rol-modal-body">
                <div class="ske-rol-paso2-info">
                    <span class="ske-rol-paso2-tag">Rol #${numeroRol}</span>
                    <span class="ske-rol-paso2-tag">${linea ? linea.nombre : ''}</span>
                    <span class="ske-rol-paso2-tag">${terminal ? terminal.nombre : ''}</span>
                </div>
                ${htmlCalendario}
            </div>
            <div class="ske-rol-modal-footer">
                <button class="ske-rol-btn-modal ske-rol-btn-cancelar" id="btnVolverPaso1">
                    <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    Atrás
                </button>
                <button class="ske-rol-btn-modal ske-rol-btn-guardar" id="btnGuardarRol">${editId ? 'Actualizar' : 'Guardar'} Rol</button>
            </div>
        `);

        modalElement.querySelector('.modal').classList.add('ske-rol-modal', 'ske-rol-modal-grande');
        modalElement.classList.add('ske-rol-modal-overlay');

        // ✅ Lógica para abrir el modal al tocar un día
        document.querySelectorAll('.ske-rol-dia:not(.ske-rol-dia-descanso)').forEach(celda => {
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

                const modalDiaElement = App.showModal(`
                    <div class="ske-rol-modal-header">
                        <h3 style="text-transform:capitalize; color:white; position:relative; z-index:1;">${diaNombre} ${fechaStr}</h3>
                    </div>
                    <div class="ske-rol-modal-body">
                        <div class="ske-rol-input-group">
                            <label>Servicio o Reserva</label>
                            <input type="text" id="modalServicioInput" class="ske-rol-input" value="${currentVal}" placeholder="Ej: 1234, MA, RA" style="text-align:center;font-size:18px;font-weight:700;">
                        </div>
                    </div>
                    <div class="ske-rol-modal-footer">
                        <button class="ske-rol-btn-modal ske-rol-btn-cancelar" id="btnCancelModalDia">Cancelar</button>
                        <button class="ske-rol-btn-modal ske-rol-btn-guardar" id="btnSaveModalDia">Guardar</button>
                    </div>
                `);

                modalDiaElement.querySelector('.modal').classList.add('ske-rol-modal');
                modalDiaElement.classList.add('ske-rol-modal-overlay');

                document.getElementById('btnCancelModalDia').addEventListener('click', () => modalDiaElement.remove());
                document.getElementById('btnSaveModalDia').addEventListener('click', () => {
                    const nuevoValor = document.getElementById('modalServicioInput').value.trim();
                    
                    // Actualizar la celda visualmente y en sus datos
                    celda.dataset.valor = nuevoValor;
                    const displayDiv = celda.querySelector('.ske-rol-dia-valor-display');
                    displayDiv.innerHTML = nuevoValor ? nuevoValor : '<span style="color:var(--primary);font-size:22px;font-weight:800;">+</span>';
                    
                    modalDiaElement.remove();
                    App.showToast('Dato guardado');
                });
            });
        });

        document.getElementById('btnVolverPaso1').addEventListener('click', () => {
            modalElement.remove();
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
            modalElement.remove();
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
                const celda = document.querySelector(`.ske-rol-dia[data-semana="${i}"][data-dia="${diaIdx}"]`);
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
                <div class="ske-rol-empty">
                    <div class="ske-rol-empty-icono">
                        <svg viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                    </div>
                    <h3>Sin roles registrados</h3>
                    <p>Haz clic en "Nuevo" para crear tu rol</p>
                </div>
            `;
            return;
        }

        list.innerHTML = `<div class="ske-rol-lista">` + roles.map(rol => {
            const linea = lineas.find(l => l.id === rol.lineaId);
            const terminal = terminales.find(t => t.id === rol.terminalId);
            
            return `
                <div class="ske-rol-card">
                    <div class="ske-rol-card-indicador"></div>
                    <div class="ske-rol-card-contenido">
                        <div class="ske-rol-card-header">
                            <div class="ske-rol-card-titulo">
                                <h3>Rol #${rol.numeroRol || 'N/A'}</h3>
                            </div>
                            <div class="ske-rol-card-info">
                                <span class="ske-rol-info-tag">
                                    <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                    ${linea ? linea.nombre : 'Sin línea'}
                                </span>
                                <span class="ske-rol-info-tag">
                                    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    ${terminal ? terminal.nombre : 'Sin terminal'}
                                </span>
                            </div>
                        </div>
                        <div class="ske-rol-card-acciones">
                            <button class="ske-rol-btn ske-rol-btn-editar" data-id="${rol.id}">
                                <svg viewBox="0 0 24 24">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Editar
                            </button>
                            <button class="ske-rol-btn ske-rol-btn-eliminar" data-id="${rol.id}">
                                <svg viewBox="0 0 24 24">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
                <div id="rolCalendario-${rol.id}"></div>
            `;
        }).join('') + `</div>`;

        list.querySelectorAll('.ske-rol-btn-editar').forEach(btn => {
            btn.addEventListener('click', () => this.paso1(btn.dataset.id));
        });
        list.querySelectorAll('.ske-rol-btn-eliminar').forEach(btn => {
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
            <div class="ske-rol-calendario-scroll">
                ${semanasOrdenadas.map(semana => this.renderSemanaCard(rol, semana, hoyStr)).join('')}
            </div>
        `;
    },

    renderSemanaCard(rol, semana, hoyStr) {
        const diasCortos = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        const fechaInicio = new Date(semana.fechaInicio);
        const mesInicio = meses[fechaInicio.getMonth()];
        const fechaFin = new Date(semana.fechaFin);
        const mesFin = meses[fechaFin.getMonth()];
        const mesTexto = mesInicio === mesFin ? mesInicio : `${mesInicio}-${mesFin}`;

        return `
            <div class="ske-rol-semana-card">
                <div class="ske-rol-semana-header">
                    <span class="ske-rol-semana-titulo">SEMANA ${semana.numeroSemana} - ${mesTexto}</span>
                </div>
                <div class="ske-rol-dias-grid">
                    ${semana.dias.map((dia, diaIdx) => {
                        const fechaDiaStr = dia.fecha || this.calcularFecha(semana.fechaInicio, diaIdx);
                        const esHoy = fechaDiaStr === hoyStr;
                        const esDescanso = dia.esDescanso || false;
                        const diaNumero = dia.numeroDia || new Date(fechaDiaStr).getDate();
                        
                        return `
                            <div class="ske-rol-dia ${esHoy ? 'ske-rol-dia-hoy' : ''} ${esDescanso ? 'ske-rol-dia-descanso' : ''}">
                                <div class="ske-rol-dia-header">
                                    <span class="ske-rol-dia-nombre">${diasCortos[diaIdx]}</span>
                                    <span class="ske-rol-dia-numero">${diaNumero}</span>
                                </div>
                                ${esDescanso ? 
                                    '<div class="ske-rol-descanso-badge">🛌</div>' :
                                    `<div class="ske-rol-dia-servicio">${dia.dato || '—'}</div>`
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