// ============================================
// SERVICIOS.JS - Módulo de Registro de Servicios
// ============================================

const Servicios = {
    render() {
        const servicios = DB.load('servicios');

        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Servicios
                    </h2>
                    <button class="btn-add" id="btnAddServicio">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nuevo
                    </button>
                </div>
                <div id="servicioList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddServicio').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('servicios').find(s => s.id === editId) : null;
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        const haceGarage = data ? (data.garage === true || data.garage === 'Si' || data.garage === 'Sí') : false;

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Servicio</h3>
            <div class="modal-scroll-content">
                <div class="input-group">
                    <label>Línea</label>
                    <select id="servicioLinea">${lineaOptions}</select>
                </div>
                <div class="input-group">
                    <label>Terminal</label>
                    <select id="servicioTerminal">
                        <option value="">Selecciona línea primero</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Día</label>
                    <select id="servicioSemana">
                        <option value="">Selecciona línea primero</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Nombre del Servicio (Número)</label>
                    <input type="text" id="servicioNombre" value="${data ? data.nombre : ''}" placeholder="Ej. 1234">
                </div>
                
                <!-- Checkbox de Garage general -->
                <div class="input-group">
                    <div class="garage-row" style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--bg-soft);border-radius:8px;">
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
                <div class="trenes-section">
                    <h4 style="margin-bottom:12px;font-size:14px;color:var(--text);">Trenes</h4>
                    <div id="trenesContainer">
                        ${this.renderTrenesForm(data ? data.trenes : [])}
                    </div>
                    <button class="btn-add-tren" id="btnAddTren" style="margin-top:10px;width:100%;padding:10px;background:var(--bg-soft);border:2px dashed var(--primary-soft);border-radius:8px;color:var(--primary);cursor:pointer;font-weight:600;font-size:13px;">
                        + Agregar Tren
                    </button>
                </div>

                <!-- DESCANSO -->
                <div class="input-row" style="margin-top:16px;display:flex;gap:10px;">
                    <div class="input-group" style="flex:1;">
                        <label>Inicio de Descanso</label>
                        <input type="time" id="servicioDescansoInicio" value="${data ? data.descansoInicio : ''}">
                    </div>
                    <div class="input-group" style="flex:1;">
                        <label>Final de Descanso</label>
                        <input type="time" id="servicioDescansoFinal" value="${data ? data.descansoFinal : ''}">
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
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

        const updateTerminales = () => {
            const lineaId = selectLinea.value;
            const terminalesFiltradas = terminales.filter(t => t.lineaId === lineaId);
            selectTerminal.innerHTML = terminalesFiltradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + terminalesFiltradas.map(t => 
                    `<option value="${t.id}" ${data && data.terminalId === t.id ? 'selected' : ''}>${t.nombre}</option>`
                ).join('');
        };

        const updateSemanas = () => {
            const lineaId = selectLinea.value;
            const semanasFiltradas = semanas.filter(s => s.lineaId === lineaId);
            selectSemana.innerHTML = semanasFiltradas.length === 0
                ? '<option value="">No hay días</option>'
                : '<option value="">Selecciona tipo de día</option>' + semanasFiltradas.map(s => 
                    `<option value="${s.id}" ${data && data.semanaId === s.id ? 'selected' : ''}>${s.tipo}</option>`
                ).join('');
        };

        selectLinea.addEventListener('change', () => {
            updateTerminales();
            updateSemanas();
        });
        updateTerminales();
        updateSemanas();

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

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const lineaId = selectLinea.value;
            const terminalId = selectTerminal.value;
            const semanaId = selectSemana.value;
            const nombre = document.getElementById('servicioNombre').value.trim();
            const garage = document.getElementById('servicioGarage').checked;
            const descansoInicio = document.getElementById('servicioDescansoInicio').value;
            const descansoFinal = document.getElementById('servicioDescansoFinal').value;

            if (!lineaId || !terminalId || !semanaId || !nombre) {
                App.showToast('Completa los campos obligatorios');
                return;
            }

            const trenes = this.getTrenesFromForm();

            let servicios = DB.load('servicios');

            if (editId) {
                const idx = servicios.findIndex(s => s.id === editId);
                if (idx !== -1) {
                    servicios[idx] = { 
                        ...servicios[idx], 
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
                servicios.push({
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

            DB.save('servicios', servicios);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Servicio actualizado' : 'Servicio guardado');
        });
    },

    // ✅ Inicializar toggles de garage en trenes
    initTrenGarageToggles() {
        document.querySelectorAll('.tren-garage-toggle').forEach(toggle => {
            const checkbox = toggle.querySelector('input[type="checkbox"]');
            const track = toggle.querySelector('.tren-garage-track');
            const circle = toggle.querySelector('.tren-garage-circle');
            
            if (checkbox && track && circle) {
                // Estado inicial
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
                    <div class="input-group" style="flex:1;margin:0;">
                        <label style="font-size:11px;font-weight:600;color:var(--text-soft);">Número de Tren</label>
                        <input type="text" class="tren-numero" value="${tren ? tren.numero || '' : ''}" placeholder="Ej. 1" style="width:100%;padding:8px;border:2px solid var(--bg);border-radius:6px;background:var(--surface);color:var(--text);font-size:13px;">
                    </div>
                    <div class="input-group" style="flex:1;margin:0;">
                        <label style="font-size:11px;font-weight:600;color:var(--text-soft);">Vueltas</label>
                        <input type="number" class="tren-vueltas" value="${tren ? tren.vueltas || '' : ''}" placeholder="Ej. 2" min="1" style="width:100%;padding:8px;border:2px solid var(--bg);border-radius:6px;background:var(--surface);color:var(--text);font-size:13px;">
                    </div>
                </div>
                <div style="display:flex;gap:10px;margin-bottom:8px;">
                    <div class="input-group" style="flex:1;margin:0;">
                        <label style="font-size:11px;font-weight:600;color:var(--text-soft);">Hora Salida</label>
                        <input type="time" class="tren-salida" value="${tren ? tren.salida || '' : ''}" style="width:100%;padding:8px;border:2px solid var(--bg);border-radius:6px;background:var(--surface);color:var(--text);font-size:13px;">
                    </div>
                    <div class="input-group" style="flex:1;margin:0;">
                        <label style="font-size:11px;font-weight:600;color:var(--text-soft);">Hora Llegada</label>
                        <input type="time" class="tren-llegada" value="${tren ? tren.llegada || '' : ''}" style="width:100%;padding:8px;border:2px solid var(--bg);border-radius:6px;background:var(--surface);color:var(--text);font-size:13px;">
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
        
        // Si es el primer tren, limpiar el mensaje de "no hay trenes"
        const mensajeVacio = container.querySelector('p');
        if (mensajeVacio) mensajeVacio.remove();
        
        const trenIndex = container.querySelectorAll('.tren-item').length;
        
        const trenHTML = this.crearHTMLTren(null, trenIndex);
        
        container.insertAdjacentHTML('beforeend', trenHTML);
        
        // Inicializar el toggle del nuevo tren
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

    renderList() {
        const list = document.getElementById('servicioList');
        const servicios = DB.load('servicios');
        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const semanas = DB.load('semanas');

        if (servicios.length === 0) {
            list.innerHTML = `
                <div class="aviso-empty">
                    <svg viewBox="0 0 24 24" style="width:38px;height:38px;stroke:var(--text-light);fill:none;margin-bottom:10px;opacity:0.5;">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p>No hay servicios registrados</p>
                </div>
            `;
            return;
        }

        list.innerHTML = servicios.map(s => {
            const linea = lineas.find(l => l.id === s.lineaId);
            const terminal = terminales.find(t => t.id === s.terminalId);
            const semana = semanas.find(w => w.id === s.semanaId);
            const trenes = s.trenes || [];
            const trenesCount = trenes.length;
            
            // ✅ Contar trenes con garage
            const trenesConGarage = trenes.filter(t => t.garage === true).length;
            
            // ✅ Determinar si hace garage (general o por tren)
            const haceGarageGeneral = s.garage === true || s.garage === 'Si' || s.garage === 'Sí';
            const tieneGarage = haceGarageGeneral || trenesConGarage > 0;
            
            return `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">Servicio #${s.nombre}</div>
                        <div class="item-date ${tieneGarage ? 'garage-si' : 'garage-no'}">
                            ${tieneGarage ? 'Hace Garage' : 'Sin Garage'}
                        </div>
                    </div>
                    <div class="item-meta">
                        <span class="item-tag">📍 ${linea ? linea.nombre : 'Sin línea'}</span>
                        <span class="item-tag">🚇 ${terminal ? terminal.nombre : 'Sin terminal'}</span>
                        <span class="item-tag">📅 ${semana ? semana.tipo : 'Sin día'}</span>
                    </div>
                    ${trenesCount > 0 ? `<div class="item-desc" style="margin-top:6px;font-size:12px;color:var(--text-soft);">${trenesCount} tren(es) registrado(s) ${trenesConGarage > 0 ? `• ${trenesConGarage} con garage` : ''}</div>` : ''}
                    <div class="item-actions">
                        <button class="btn-edit" data-id="${s.id}">Editar</button>
                        <button class="btn-remove" data-id="${s.id}">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });
        list.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar este servicio?')) {
                    let data = DB.load('servicios').filter(s => s.id !== btn.dataset.id);
                    DB.save('servicios', data);
                    this.renderList();
                    App.showToast('Servicio eliminado');
                }
            });
        });
    }
};

export default Servicios;