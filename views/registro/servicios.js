// ============================================
// SERVICIOS.JS - Módulo de Registro de Servicios con Firebase y Diseño Mejorado
// ============================================

const Servicios = {
    render() {
        const servicios = DB.load('servicios');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        console.log('📋 Renderizando servicios:', servicios.length);

        return `
            <div class="view active ske-registro">
                <div class="ske-registro-header">
                    <div class="ske-registro-icono">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div class="ske-registro-texto">
                        <h2 class="ske-registro-titulo">Registro de Servicios</h2>
                        <p class="ske-registro-subtitulo">${servicios.length} servicios registrados</p>
                    </div>
                    <button class="ske-registro-btn-nuevo" id="btnAddServicio">
                        <svg viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span>Nuevo</span>
                    </button>
                </div>

                <div id="servicioList">
                    ${servicios.length === 0 ? `
                        <div class="ske-registro-empty">
                            <p>No hay servicios registrados</p>
                        </div>
                    ` : `
                        <div class="ske-registro-lista">
                            ${servicios.map(s => {
                                const linea = lineas.find(l => l.id === s.lineaId);
                                const terminal = terminales.find(t => t.id === s.terminalId);
                                const semana = semanas.find(w => w.id === s.semanaId);
                                const trenes = s.trenes || [];
                                const haceGarage = s.garage === true || s.garage === 'Si' || s.garage === 'Sí';

                                return `
                                    <div class="ske-registro-card" style="padding:0; overflow:hidden;">
                                        <!-- HEADER DE LA TARJETA -->
                                        <div style="background:linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); padding:16px 20px; color:white;">
                                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                                <div>
                                                    <h3 style="margin:0; font-size:24px; font-weight:800;">Servicio #${s.nombre || 'N/A'}</h3>
                                                    <p style="margin:4px 0 0 0; opacity:0.9; font-size:13px;">
                                                        ${linea ? linea.nombre : 'Sin línea'} • ${terminal ? terminal.nombre : 'Sin terminal'}
                                                    </p>
                                                </div>
                                                <div style="background:${haceGarage ? '#4CAF50' : '#FF9800'}; padding:6px 12px; border-radius:20px; font-size:11px; font-weight:700; text-transform:uppercase; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                                    ${haceGarage ? '✓ Hace Garage' : 'Sin Garage'}
                                                </div>
                                            </div>
                                        </div>

                                        <!-- CONTENIDO -->
                                        <div style="padding:16px 20px;">
                                            <!-- TIPO DE DÍA -->
                                            <div style="margin-bottom:16px; padding:10px; background:var(--bg-soft); border-radius:8px; border-left:4px solid var(--primary);">
                                                <div style="font-size:11px; color:var(--text-soft); text-transform:uppercase; font-weight:700; margin-bottom:4px;">📅 Tipo de Día</div>
                                                <div style="font-size:15px; font-weight:700; color:var(--text);">${semana ? semana.tipo : 'Sin tipo de día'}</div>
                                            </div>

                                            <!-- TRENES -->
                                            ${trenes.length > 0 ? `
                                                <div style="margin-bottom:16px;">
                                                    <div style="font-size:12px; color:var(--text-soft); text-transform:uppercase; font-weight:700; margin-bottom:10px;">🚂 Trenes (${trenes.length})</div>
                                                    <div style="display:flex; flex-direction:column; gap:8px;">
                                                        ${trenes.map((tren, idx) => {
                                                            const tieneGarageTren = tren.garage === true;
                                                            return `
                                                                <div style="background:var(--surface); padding:12px; border-radius:8px; border:2px solid var(--bg-soft);">
                                                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                                                        <span style="font-weight:700; color:var(--primary); font-size:14px;">Tren #${tren.numero || idx + 1}</span>
                                                                        ${tieneGarageTren ? '<span style="background:#4CAF50; color:white; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:700;">GARAGE</span>' : ''}
                                                                    </div>
                                                                    <div style="display:flex; gap:12px; font-size:13px;">
                                                                        <div style="flex:1;">
                                                                            <div style="font-size:10px; color:var(--text-soft);">Salida</div>
                                                                            <div style="font-weight:700; color:var(--text);">${tren.salida || '--:--'}</div>
                                                                        </div>
                                                                        <div style="flex:1;">
                                                                            <div style="font-size:10px; color:var(--text-soft);">Llegada</div>
                                                                            <div style="font-weight:700; color:var(--text);">${tren.llegada || '--:--'}</div>
                                                                        </div>
                                                                        ${tren.vueltas ? `
                                                                            <div style="flex:1;">
                                                                                <div style="font-size:10px; color:var(--text-soft);">Vueltas</div>
                                                                                <div style="font-weight:700; color:var(--text);">${tren.vueltas}</div>
                                                                            </div>
                                                                        ` : ''}
                                                                    </div>
                                                                </div>
                                                            `;
                                                        }).join('')}
                                                    </div>
                                                </div>
                                            ` : ''}

                                            <!-- DESCANSO / ALIMENTOS -->
                                            ${(s.descansoInicio || s.descansoFinal) ? `
                                                <div style="margin-bottom:16px; padding:12px; background:#FFF3E0; border-radius:8px; border-left:4px solid #FF9800;">
                                                    <div style="font-size:11px; color:#E65100; text-transform:uppercase; font-weight:700; margin-bottom:4px;">🍽️ Tiempo de Alimentos</div>
                                                    <div style="font-size:14px; font-weight:700; color:#E65100;">
                                                        ${s.descansoInicio || '--:--'} → ${s.descansoFinal || '--:--'}
                                                    </div>
                                                </div>
                                            ` : ''}

                                            <!-- ACCIONES -->
                                            <div style="display:flex; gap:8px; padding-top:12px; border-top:2px solid var(--bg-soft);">
                                                <button class="ske-registro-btn-editar" data-id="${s.id}" style="flex:1;">Editar</button>
                                                <button class="ske-registro-btn-eliminar" data-id="${s.id}" style="flex:1;">Eliminar</button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    async init() {
        // ✅ 1. Cargar todos los datos desde Firebase
        await DB_FIREBASE.load('servicios');
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');
        await DB_FIREBASE.load('semanas');

        console.log('✅ Datos de Servicios cargados en init()');

        // ✅ 2. Renderizar la vista
        const container = document.getElementById('viewContainer');
        container.innerHTML = this.render();

        // ✅ 3. Adjuntar eventos
        document.getElementById('btnAddServicio')?.addEventListener('click', () => this.openModal());

        document.querySelectorAll('.ske-registro-btn-editar').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });

        document.querySelectorAll('.ske-registro-btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => this.eliminar(btn.dataset.id));
        });
    },

    async openModal(editId = null) {
        // ✅ Asegurar datos frescos
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');
        await DB_FIREBASE.load('semanas');

        const servicios = DB.load('servicios');
        const data = editId ? servicios.find(s => s.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const haceGarage = data ? (data.garage === true || data.garage === 'Si' || data.garage === 'Sí') : false;

        const modalOverlay = App.showModal(`
            <div class="ske-registro-modal-inner" style="max-width:650px; max-height:90vh; overflow-y:auto;">
                <div class="ske-registro-modal-header">
                    <h3>${editId ? 'Editar' : 'Nuevo'} Servicio</h3>
                </div>
                <div class="ske-registro-modal-body">
                    <div class="ske-registro-input-group">
                        <label>Línea *</label>
                        <select id="servicioLinea" class="ske-registro-select">${lineaOptions}</select>
                    </div>
                    <div class="ske-registro-input-group">
                        <label>Terminal *</label>
                        <select id="servicioTerminal" class="ske-registro-select">
                            <option value="">Selecciona línea primero</option>
                        </select>
                    </div>
                    <div class="ske-registro-input-group">
                        <label>Tipo de Día *</label>
                        <select id="servicioSemana" class="ske-registro-select">
                            <option value="">Selecciona línea y terminal primero</option>
                        </select>
                    </div>
                    <div class="ske-registro-input-group">
                        <label>Nombre del Servicio (Número) *</label>
                        <input type="text" id="servicioNombre" class="ske-registro-input" value="${data ? data.nombre : ''}" placeholder="Ej. 1234">
                    </div>
                    
                    <!-- Checkbox de Garage general -->
                    <div class="ske-registro-input-group">
                        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--bg-soft);border-radius:8px;">
                            <label style="font-size:13px;font-weight:600;color:var(--text);">Hace Garage (General)</label>
                            <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;">
                                <input type="checkbox" id="servicioGarage" ${haceGarage ? 'checked' : ''} style="opacity:0;width:0;height:0;">
                                <span id="garageToggle" style="position:absolute;top:0;left:0;right:0;bottom:0;background:${haceGarage ? 'var(--primary)' : 'var(--bg)'};border-radius:24px;transition:0.3s;box-shadow:var(--clay-shadow-sm);">
                                    <span id="garageToggleCircle" style="position:absolute;height:18px;width:18px;left:${haceGarage ? '22px' : '3px'};bottom:3px;background:white;border-radius:50%;transition:0.3s;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <!-- TRENES -->
                    <div style="margin-top:16px;">
                        <h4 style="margin-bottom:12px;font-size:14px;color:var(--text);font-weight:700;">🚂 Trenes</h4>
                        <div id="trenesContainer">
                            ${this.renderTrenesForm(data ? data.trenes : [])}
                        </div>
                        <button class="ske-registro-btn-modal" id="btnAddTren" style="margin-top:10px;width:100%;padding:10px;background:var(--bg-soft);border:2px dashed var(--primary-soft);color:var(--primary);font-weight:600;font-size:13px;">
                            + Agregar Tren
                        </button>
                    </div>

                    <!-- DESCANSO -->
                    <div style="margin-top:16px;display:flex;gap:12px;">
                        <div class="ske-registro-input-group" style="flex:1;">
                            <label>Inicio de Descanso</label>
                            <input type="time" id="servicioDescansoInicio" class="ske-registro-input" value="${data ? data.descansoInicio : ''}">
                        </div>
                        <div class="ske-registro-input-group" style="flex:1;">
                            <label>Final de Descanso</label>
                            <input type="time" id="servicioDescansoFinal" class="ske-registro-input" value="${data ? data.descansoFinal : ''}">
                        </div>
                    </div>
                </div>
                <div class="ske-registro-modal-footer">
                    <button class="ske-registro-btn-modal" id="btnCancel">Cancelar</button>
                    <button class="ske-registro-btn-modal ske-registro-btn-guardar" id="btnSave">
                        ${editId ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </div>
        `);

        // Toggle del garage general
        const checkboxGarage = document.getElementById('servicioGarage');
        const garageToggle = document.getElementById('garageToggle');
        const garageToggleCircle = document.getElementById('garageToggleCircle');
        
        if (checkboxGarage && garageToggle && garageToggleCircle) {
            checkboxGarage.addEventListener('change', () => {
                if (checkboxGarage.checked) {
                    garageToggle.style.background = 'var(--primary)';
                    garageToggleCircle.style.left = '22px';
                } else {
                    garageToggle.style.background = 'var(--bg)';
                    garageToggleCircle.style.left = '3px';
                }
            });
        }

        const selectLinea = document.getElementById('servicioLinea');
        const selectTerminal = document.getElementById('servicioTerminal');
        const selectSemana = document.getElementById('servicioSemana');

        // ✅ Lógica en cascada actualizada (Línea -> Terminal -> Semana)
        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const filtradas = terminales.filter(t => t.lineaId === lineaId);
            
            selectTerminal.innerHTML = filtradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + filtradas.map(t => 
                    `<option value="${t.id}" ${data && data.terminalId === t.id ? 'selected' : ''}>${t.nombre}</option>`
                ).join('');
            updateSemanas();
        };

        const updateSemanas = () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            
            let filtradas = semanas.filter(s => s.lineaId === lineaId);
            if (terminalId) {
                filtradas = filtradas.filter(s => s.terminalId === terminalId);
            }
            
            selectSemana.innerHTML = filtradas.length === 0
                ? '<option value="">No hay tipos de día</option>'
                : '<option value="">Selecciona tipo de día</option>' + filtradas.map(s => 
                    `<option value="${s.id}" ${data && data.semanaId === s.id ? 'selected' : ''}>${s.tipo}</option>`
                ).join('');
        };

        selectLinea.addEventListener('change', () => {
            updateTerminales();
        });
        selectTerminal.addEventListener('change', () => {
            updateSemanas();
        });
        
        // Ejecutar al abrir para pre-seleccionar si es edición
        updateTerminales();

        // Agregar tren
        document.getElementById('btnAddTren').addEventListener('click', () => {
            this.addTrenField();
        });

        // Eventos de eliminar trenes existentes
        document.querySelectorAll('.btn-remove-tren').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.parentElement.remove();
                this.updateTrenRemoveButtons();
            });
        });

        // Inicializar toggles de garage en trenes existentes
        this.initTrenGarageToggles();

        document.getElementById('btnCancel').addEventListener('click', () => modalOverlay.remove());
        
        document.getElementById('btnSave').addEventListener('click', async () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const semanaId = selectSemana.value;
            const nombre = document.getElementById('servicioNombre').value.trim();
            const garage = document.getElementById('servicioGarage').checked;
            const descansoInicio = document.getElementById('servicioDescansoInicio').value;
            const descansoFinal = document.getElementById('servicioDescansoFinal').value;

            if (!lineaId || !terminalId || !semanaId || !nombre) {
                App.showToast('⚠️ Completa los campos obligatorios');
                return;
            }

            const trenes = this.getTrenesFromForm();

            let serviciosData = DB.load('servicios');

            if (editId) {
                const idx = serviciosData.findIndex(s => s.id === editId);
                if (idx !== -1) {
                    serviciosData[idx] = { 
                        ...serviciosData[idx], 
                        lineaId, 
                        terminalId, 
                        semanaId, 
                        nombre, 
                        garage,
                        trenes,
                        descansoInicio,
                        descansoFinal
                    };
                }
            } else {
                serviciosData.push({
                    id: DB.generateId(),
                    lineaId,
                    terminalId,
                    semanaId,
                    nombre,
                    garage,
                    trenes,
                    descansoInicio,
                    descansoFinal,
                    createdAt: Date.now()
                });
            }

            // ✅ Guardar local y en Firebase
            await DB_FIREBASE.sync('servicios', serviciosData);

            modalOverlay.remove();
            App.showToast(editId ? '✅ Servicio actualizado' : '✅ Servicio guardado');

            // ✅ Recargar la vista
            await this.init();
        });
    },

    // ✅ Inicializar toggles de garage en trenes
    initTrenGarageToggles() {
        document.querySelectorAll('.tren-garage-toggle').forEach(toggle => {
            const checkbox = toggle.querySelector('input[type="checkbox"]');
            const track = toggle.querySelector('.tren-garage-track');
            const circle = toggle.querySelector('.tren-garage-circle');
            
            if (checkbox && track && circle) {
                if (checkbox.checked) {
                    track.style.background = 'var(--primary)';
                    circle.style.left = '22px';
                }
                
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        track.style.background = 'var(--primary)';
                        circle.style.left = '22px';
                    } else {
                        track.style.background = 'var(--bg)';
                        circle.style.left = '3px';
                    }
                });
            }
        });
    },

    // ✅ Actualizar botones de eliminar trenes
    updateTrenRemoveButtons() {
        const items = document.querySelectorAll('.tren-item');
        items.forEach((item, idx) => {
            const btn = item.querySelector('.btn-remove-tren');
            if (btn) btn.dataset.idx = idx;
        });
    },

    renderTrenesForm(trenes) {
        if (!trenes || trenes.length === 0) {
            return '<p style="color:var(--text-soft);font-size:13px;text-align:center;padding:20px;">No hay trenes registrados. Agrega al menos uno.</p>';
        }
        return trenes.map((tren, idx) => this.crearHTMLTren(tren, idx)).join('');
    },

    crearHTMLTren(tren, idx) {
        const tieneGarage = tren && tren.garage;
        return `
            <div class="tren-item" style="background:var(--bg-soft);padding:12px;border-radius:8px;margin-bottom:10px;position:relative;border:1px solid var(--primary-soft);">
                <button class="btn-remove-tren" data-idx="${idx}" style="position:absolute;top:8px;right:8px;background:#ff4444;color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:14px;line-height:1;">×</button>
                <div style="display:flex;gap:10px;margin-bottom:8px;">
                    <div class="ske-registro-input-group" style="flex:1;margin:0;">
                        <label style="font-size:11px;font-weight:600;color:var(--text-soft);">Número de Tren</label>
                        <input type="text" class="tren-numero ske-registro-input" value="${tren ? tren.numero || '' : ''}" placeholder="Ej. 1" style="padding:8px;">
                    </div>
                    <div class="ske-registro-input-group" style="flex:1;margin:0;">
                        <label style="font-size:11px;font-weight:600;color:var(--text-soft);">Vueltas</label>
                        <input type="number" class="tren-vueltas ske-registro-input" value="${tren ? tren.vueltas || '' : ''}" placeholder="Ej. 2" min="1" style="padding:8px;">
                    </div>
                </div>
                <div style="display:flex;gap:10px;margin-bottom:8px;">
                    <div class="ske-registro-input-group" style="flex:1;margin:0;">
                        <label style="font-size:11px;font-weight:600;color:var(--text-soft);">Hora Salida</label>
                        <input type="time" class="tren-salida ske-registro-input" value="${tren ? tren.salida || '' : ''}" style="padding:8px;">
                    </div>
                    <div class="ske-registro-input-group" style="flex:1;margin:0;">
                        <label style="font-size:11px;font-weight:600;color:var(--text-soft);">Hora Llegada</label>
                        <input type="time" class="tren-llegada ske-registro-input" value="${tren ? tren.llegada || '' : ''}" style="padding:8px;">
                    </div>
                </div>
                <!-- ✅ Toggle de Garage por tren -->
                <div class="tren-garage-toggle" style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--surface);border-radius:6px;border:1px solid var(--bg-soft);">
                    <label style="font-size:12px;font-weight:600;color:var(--text);">Hace Garage</label>
                    <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;margin:0;">
                        <input type="checkbox" class="tren-garage-checkbox" ${tieneGarage ? 'checked' : ''} style="opacity:0;width:0;height:0;">
                        <span class="tren-garage-track" style="position:absolute;top:0;left:0;right:0;bottom:0;background:${tieneGarage ? 'var(--primary)' : 'var(--bg)'};border-radius:24px;transition:0.3s;box-shadow:var(--clay-shadow-sm);">
                            <span class="tren-garage-circle" style="position:absolute;height:18px;width:18px;left:${tieneGarage ? '22px' : '3px'};bottom:3px;background:white;border-radius:50%;transition:0.3s;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></span>
                        </span>
                    </label>
                </div>
            </div>
        `;
    },

    addTrenField() {
        const container = document.getElementById('trenesContainer');
        const mensajeVacio = container.querySelector('p');
        if (mensajeVacio) mensajeVacio.remove();
        
        const trenIndex = container.querySelectorAll('.tren-item').length;
        const trenHTML = this.crearHTMLTren(null, trenIndex);
        
        container.insertAdjacentHTML('beforeend', trenHTML);
        
        const nuevoTren = container.lastElementChild;
        const checkbox = nuevoTren.querySelector('.tren-garage-checkbox');
        const track = nuevoTren.querySelector('.tren-garage-track');
        const circle = nuevoTren.querySelector('.tren-garage-circle');
        const btnRemove = nuevoTren.querySelector('.btn-remove-tren');
        
        if (checkbox && track && circle) {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    track.style.background = 'var(--primary)';
                    circle.style.left = '22px';
                } else {
                    track.style.background = 'var(--bg)';
                    circle.style.left = '3px';
                }
            });
        }
        
        if (btnRemove) {
            btnRemove.addEventListener('click', () => {
                btnRemove.parentElement.remove();
                this.updateTrenRemoveButtons();
            });
        }
    },

    getTrenesFromForm() {
        const trenes = [];
        const trenItems = document.querySelectorAll('.tren-item');
        
        trenItems.forEach(item => {
            const numero = item.querySelector('.tren-numero').value.trim();
            const vueltas = item.querySelector('.tren-vueltas').value.trim();
            const salida = item.querySelector('.tren-salida').value;
            const llegada = item.querySelector('.tren-llegada').value;
            const garageCheckbox = item.querySelector('.tren-garage-checkbox');
            const garage = garageCheckbox ? garageCheckbox.checked : false;
            
            if (numero || salida || llegada) {
                trenes.push({
                    numero,
                    vueltas: vueltas ? parseInt(vueltas) : 1,
                    salida,
                    llegada,
                    garage: garage
                });
            }
        });
        
        return trenes;
    },

    async eliminar(id) {
        if (!confirm('¿Eliminar este servicio?')) return;

        let serviciosData = DB.load('servicios').filter(s => s.id !== id);

        // ✅ Guardar local y en Firebase
        await DB_FIREBASE.sync('servicios', serviciosData);

        App.showToast('🗑️ Servicio eliminado');

        // ✅ Recargar la vista
        await this.init();
    }
};

export default Servicios;