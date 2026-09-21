// ============================================
// ROL.JS - Módulo Mi Rol (Estilo Organizador)
// ============================================

const Rol = {
    diasSemana: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    diasCortos: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    meses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],

    // Normalizar nombre de día para comparación (sin acentos, minúsculas)
    normalizarDia(dia) {
        return dia.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    },

    // Obtener lista de días de descanso normalizados
    obtenerDiasDescanso(descansos) {
        if (!descansos) return [];
        return descansos.split(',')
            .map(d => this.normalizarDia(d))
            .filter(d => d.length > 0);
    },

    // Verificar si un día es de descanso
    esDiaDescanso(dia, descansos) {
        const diasDescanso = this.obtenerDiasDescanso(descansos);
        const diaNormalizado = this.normalizarDia(dia);
        return diasDescanso.includes(diaNormalizado);
    },

    // Función para obtener fecha local en formato YYYY-MM-DD
    getFechaLocal(fecha) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    render() {
        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
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

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Rol</h3>
            <div class="input-group">
                <label>Número de Rol</label>
                <input type="text" id="rolNumero" value="${data ? data.numeroRol : ''}" placeholder="Ej: 6">
            </div>
            <div class="input-group">
                <label>Descansos</label>
                <input type="text" id="rolDescansos" value="${data ? data.descansos : ''}" placeholder="Ej: Martes, Miércoles">
                <small style="color:var(--text-light);font-size:10px;margin-top:4px;display:block;">Separa los días con coma. Ej: Martes, Miércoles</small>
            </div>
            <div class="input-group">
                <label>Semana Actual (la que contiene hoy)</label>
                <input type="number" id="rolNumeroSemana" value="${data ? data.numeroSemana : ''}" placeholder="Ej: 2" min="1" max="5">
                <small style="color:var(--text-light);font-size:10px;margin-top:4px;display:block;">Esta semana será la número que ingreses. Las demás se calculan automáticamente.</small>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const numeroRol = document.getElementById('rolNumero').value.trim();
            const descansos = document.getElementById('rolDescansos').value.trim();
            const numeroSemanaActual = parseInt(document.getElementById('rolNumeroSemana').value);

            if (!numeroRol || !descansos || !numeroSemanaActual) {
                App.showToast('Completa todos los campos');
                return;
            }

            if (numeroSemanaActual < 1 || numeroSemanaActual > 5) {
                App.showToast('El número de semana debe ser entre 1 y 5');
                return;
            }

            let roles = DB.load('roles');

            if (editId) {
                const idx = roles.findIndex(r => r.id === editId);
                if (idx !== -1) {
                    roles[idx] = { ...roles[idx], numeroRol, descansos, numeroSemana: numeroSemanaActual };
                }
            } else {
                const hoy = new Date();
                const domingoSemanaActual = new Date(hoy);
                domingoSemanaActual.setDate(hoy.getDate() - hoy.getDay());

                const semanas = [];
                
                for (let i = 0; i < 5; i++) {
                    const fechaInicio = new Date(domingoSemanaActual);
                    fechaInicio.setDate(domingoSemanaActual.getDate() + (i * 7));
                    
                    const fechaFin = new Date(fechaInicio);
                    fechaFin.setDate(fechaInicio.getDate() + 6);

                    const numeroSemana = ((numeroSemanaActual - 1 + i) % 5) + 1;

                    const dias = this.diasSemana.map((dia, idx) => {
                        const fechaDia = new Date(fechaInicio);
                        fechaDia.setDate(fechaInicio.getDate() + idx);
                        
                        return {
                            dia: dia,
                            diaCorto: this.diasCortos[idx],
                            numeroDia: fechaDia.getDate(),
                            mes: fechaDia.getMonth(),
                            anio: fechaDia.getFullYear(),
                            fecha: this.getFechaLocal(fechaDia),
                            dato: ''
                        };
                    });

                    semanas.push({
                        numeroSemana: numeroSemana,
                        fechaInicio: this.getFechaLocal(fechaInicio),
                        fechaFin: this.getFechaLocal(fechaFin),
                        dias: dias
                    });
                }

                roles.push({
                    id: DB.generateId(),
                    numeroRol,
                    descansos,
                    numeroSemana: numeroSemanaActual,
                    semanas: semanas,
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
        const data = DB.load('roles').sort((a, b) => b.createdAt - a.createdAt);

        if (data.length === 0) {
            list.innerHTML = `<div class="aviso-empty"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><p>No hay roles registrados</p></div>`;
            return;
        }

        const hoy = new Date();
        const hoyStr = this.getFechaLocal(hoy);
        const mesActual = this.meses[hoy.getMonth()];
        const anioActual = hoy.getFullYear();

        list.innerHTML = data.map(rol => {
            const semanaActual = rol.semanas.find(semana => hoyStr >= semana.fechaInicio && hoyStr <= semana.fechaFin);
            const semanasOrdenadas = [...rol.semanas].sort((a, b) => a.numeroSemana - b.numeroSemana);
            
            return `
                <div class="rol-container">
                    <div class="rol-header-info">
                        <div class="rol-info-left">
                            <span class="rol-info-tag">Rol #${rol.numeroRol}</span>
                            <span class="rol-info-tag">Descansos: ${rol.descansos}</span>
                            ${semanaActual ? `<span class="rol-info-tag active">Semana: ${semanaActual.numeroSemana}</span>` : `<span class="rol-info-tag">Semana: ${rol.numeroSemana}</span>`}
                        </div>
                        <div class="rol-fecha-general">
                            <span class="rol-mes">${mesActual}</span>
                            <span class="rol-anio">${anioActual}</span>
                        </div>
                    </div>

                    <div class="rol-semanas">
                        ${semanasOrdenadas.map(semana => {
                            const esSemanaActual = semanaActual && semanaActual.numeroSemana === semana.numeroSemana;
                            
                            return `
                                <div class="rol-semana ${esSemanaActual ? 'semana-actual' : ''}">
                                    <h4 class="rol-semana-titulo">Semana ${semana.numeroSemana}</h4>
                                    <div class="rol-dias-grid">
                                        ${semana.dias.map(dia => {
                                            const esDiaActual = dia.fecha === hoyStr;
                                            const esDescanso = this.esDiaDescanso(dia.dia, rol.descansos);
                                            const diaCorto = dia.diaCorto || this.diasCortos[this.diasSemana.indexOf(dia.dia)] || dia.dia.substring(0, 3);
                                            const numeroDia = dia.numeroDia || new Date(dia.fecha).getDate();
                                            
                                            return `
                                                <div class="rol-dia ${esDiaActual ? 'dia-actual' : ''} ${esDescanso ? 'dia-descanso' : ''}">
                                                    <div class="rol-dia-nombre">${diaCorto}</div>
                                                    <div class="rol-dia-numero">${numeroDia}</div>
                                                    <input type="text" class="rol-dia-dato" data-rol-id="${rol.id}" data-semana="${semana.numeroSemana}" data-dia="${dia.dia}" value="${dia.dato || ''}" placeholder="—" ${esDescanso ? 'disabled' : ''}>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="rol-actions">
                        <button class="btn-edit" data-id="${rol.id}">Editar</button>
                        <button class="btn-save-datos" data-id="${rol.id}">Guardar</button>
                        <button class="btn-remove" data-id="${rol.id}">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');

        // Event listeners
        list.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });

        list.querySelectorAll('.btn-save-datos').forEach(btn => {
            btn.addEventListener('click', () => this.guardarDatos(btn.dataset.id));
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

        list.querySelectorAll('.rol-dia-dato:not([disabled])').forEach(input => {
            input.addEventListener('change', (e) => {
                const rolId = e.target.dataset.rolId;
                const semanaNum = parseInt(e.target.dataset.semana);
                const diaNombre = e.target.dataset.dia;
                const valor = e.target.value.trim();

                const roles = DB.load('roles');
                const rol = roles.find(r => r.id === rolId);
                
                if (rol) {
                    const semana = rol.semanas.find(s => s.numeroSemana === semanaNum);
                    if (semana) {
                        const dia = semana.dias.find(d => d.dia === diaNombre);
                        if (dia) {
                            dia.dato = valor;
                            DB.save('roles', roles);
                        }
                    }
                }
            });
        });
    },

    guardarDatos(rolId) {
        const roles = DB.load('roles');
        const rol = roles.find(r => r.id === rolId);
        
        if (!rol) return;

        const inputs = document.querySelectorAll(`.rol-dia-dato[data-rol-id="${rolId}"]:not([disabled])`);
        
        inputs.forEach(input => {
            const semanaNum = parseInt(input.dataset.semana);
            const diaNombre = input.dataset.dia;
            const valor = input.value.trim();

            const semana = rol.semanas.find(s => s.numeroSemana === semanaNum);
            if (semana) {
                const dia = semana.dias.find(d => d.dia === diaNombre);
                if (dia) {
                    dia.dato = valor;
                }
            }
        });

        DB.save('roles', roles);
        App.showToast('Datos guardados correctamente');
    }
};

export default Rol;