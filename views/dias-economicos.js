// ============================================
// DIAS-ECONOMICOS.JS - Módulo de Días Económicos (Almacenamiento Local por Año)
// ============================================

const DiasEconomicos = {
    // ✅ Obtener todos los días económicos del usuario desde localStorage
    getDias() {
        return DB.get('diasEconomicos', {});
    },

    // ✅ Guardar todos los días económicos del usuario
    saveDias(data) {
        DB.set('diasEconomicos', data);
    },

    // ✅ Obtener días de un año específico
    getDiasByYear(year) {
        const all = this.getDias();
        return all[year] || [];
    },

    // ✅ Obtener lista de años con registros (ordenados descendente)
    getAniosDisponibles() {
        const all = this.getDias();
        const anios = Object.keys(all).map(Number).sort((a, b) => b - a);
        const yearActual = new Date().getFullYear();
        if (!anios.includes(yearActual)) {
            anios.unshift(yearActual);
        }
        return anios;
    },

    render() {
        const yearActual = new Date().getFullYear();
        const anios = this.getAniosDisponibles();

        return `
            <div class="view active">
                <div style="padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div>
                            <h2 style="margin: 0; font-size: 22px; color: var(--text);">Días Económicos</h2>
                            <p style="margin: 4px 0 0 0; color: var(--text-soft); font-size: 14px;">Gestión de tus días permitidos</p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <button id="btnAyudaDias" style="background: var(--bg-soft); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-soft);">
                                <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            </button>
                            <button id="btnAddDia" style="background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Nuevo
                            </button>
                        </div>
                    </div>

                    <!-- ✅ SELECTOR DE AÑO -->
                    <div style="background: var(--surface); padding: 12px 16px; border-radius: 12px; box-shadow: var(--clay-shadow-sm); margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--bg-soft);">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: none; stroke: var(--text-soft); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span style="font-size: 13px; font-weight: 600; color: var(--text-soft);">Año:</span>
                        </div>
                        <select id="selectorAnio" style="background: var(--bg-soft); color: var(--text); border: none; padding: 8px 12px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; outline: none;">
                            ${anios.map(a => `<option value="${a}" ${a === yearActual ? 'selected' : ''}>${a}${a === yearActual ? ' (Actual)' : ''}</option>`).join('')}
                        </select>
                    </div>

                    <!-- CONTADOR -->
                    <div id="contadorDias" style="background: var(--surface); padding: 16px; border-radius: 12px; box-shadow: var(--clay-shadow-sm); margin-bottom: 20px; text-align: center; border: 1px solid var(--bg-soft);">
                        <div style="font-size: 13px; color: var(--text-soft); margin-bottom: 4px;">Días económicos restantes este año</div>
                        <div id="numeroRestantes" style="font-size: 32px; font-weight: 800; color: var(--primary);">Cargando...</div>
                    </div>

                    <div id="listaDias">
                        <div style="text-align: center; padding: 40px; color: var(--text-soft);">
                            <div class="spinner" style="border-color: var(--primary-soft); border-top-color: var(--primary); width: 32px; height: 32px; margin: 0 auto 16px;"></div>
                            <p>Cargando registros...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddDia')?.addEventListener('click', () => {
            const yearSeleccionado = parseInt(document.getElementById('selectorAnio').value);
            const yearActual = new Date().getFullYear();
            if (yearSeleccionado !== yearActual) {
                App.showToast('⚠️ Solo puedes agregar registros al año actual');
                return;
            }
            this.abrirModal();
        });
        document.getElementById('btnAyudaDias')?.addEventListener('click', () => this.mostrarInstrucciones());
        document.getElementById('selectorAnio')?.addEventListener('change', () => this.cargarDias());
        this.cargarDias();
    },

    cargarDias() {
        const lista = document.getElementById('listaDias');
        const yearSeleccionado = parseInt(document.getElementById('selectorAnio').value);
        const yearActual = new Date().getFullYear();
        const dias = this.getDiasByYear(yearSeleccionado);

        // Ordenar por fecha descendente
        dias.sort((a, b) => {
            if (a.fecha < b.fecha) return 1;
            if (a.fecha > b.fecha) return -1;
            return 0;
        });

        const restantes = 10 - dias.length;
        const contadorEl = document.getElementById('numeroRestantes');
        const btnAdd = document.getElementById('btnAddDia');
        const contadorDiv = document.getElementById('contadorDias');

        // Actualizar contador
        if (contadorEl) {
            if (yearSeleccionado === yearActual) {
                contadorEl.textContent = restantes;
                contadorEl.style.color = restantes <= 2 ? '#c62828' : 'var(--primary)';
                contadorDiv.querySelector('div:first-child').textContent = 'Días económicos restantes este año';
            } else {
                contadorEl.textContent = dias.length;
                contadorEl.style.color = 'var(--text-soft)';
                contadorDiv.querySelector('div:first-child').textContent = `Registros del año ${yearSeleccionado}`;
            }
        }

        // Mostrar/ocultar botón "Nuevo" según el año
        if (btnAdd) {
            if (yearSeleccionado !== yearActual || restantes <= 0) {
                btnAdd.style.display = 'none';
            } else {
                btnAdd.style.display = 'flex';
            }
        }

        if (dias.length === 0) {
            lista.innerHTML = `
                <div style="text-align: center; padding: 40px; background: var(--surface); border-radius: 12px; box-shadow: var(--clay-shadow-sm);">
                    <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; fill: none; stroke: var(--text-soft); stroke-width: 1.5; margin-bottom: 12px;">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <h3 style="margin: 0 0 8px 0; color: var(--text);">Sin registros</h3>
                    <p style="margin: 0; color: var(--text-soft); font-size: 14px;">No hay registros para el año ${yearSeleccionado}.</p>
                </div>
            `;
            return;
        }

        this.renderizarLista(dias, yearSeleccionado);
    },

    renderizarLista(dias, yearSeleccionado) {
        const lista = document.getElementById('listaDias');
        const yearActual = new Date().getFullYear();
        const esAnioActual = yearSeleccionado === yearActual;
        
        let html = `<div style="display: flex; flex-direction: column; gap: 12px;">`;

        html += dias.map(dia => {
            return `
                <div onclick="DiasEconomicos.verDetalle('${dia.id}', ${yearSeleccionado})" style="background: var(--surface); padding: 16px; border-radius: 12px; box-shadow: var(--clay-shadow-sm); cursor: pointer; border: 1px solid var(--bg-soft); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: var(--primary); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span style="font-size: 14px; font-weight: 700; color: var(--text);">${dia.fecha}</span>
                        </div>
                        ${esAnioActual ? `
                        <div style="display: flex; gap: 8px;" onclick="event.stopPropagation()">
                            <button onclick="DiasEconomicos.abrirModal('${dia.id}')" style="background: var(--bg-soft); border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--primary);">
                                <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button onclick="DiasEconomicos.eliminarDia('${dia.id}')" style="background: var(--bg-soft); border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #c62828;">
                                <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                        ` : ''}
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 4px;">${dia.titulo}</div>
                    <div style="font-size: 13px; color: var(--text-soft); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${dia.descripcion}</div>
                </div>
            `;
        }).join('');

        html += `</div>`;
        lista.innerHTML = html;
    },

    mostrarInstrucciones() {
        App.showModal(`
            <div style="background: var(--surface); padding: 24px; border-radius: 16px; max-width: 90%; width: 420px; text-align: center;">
                <div style="background: var(--bg-soft); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                    <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; fill: none; stroke: var(--primary); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <h3 style="margin: 0 0 12px 0; color: var(--text);">Instrucciones</h3>
                <p style="margin: 0 0 16px 0; color: var(--text-soft); font-size: 14px; line-height: 1.6; text-align: left;">
                    • Este módulo te permite registrar tus <strong>Días Económicos</strong> (los días que te son otorgados por la empresa).<br><br>
                    • Puedes registrar un máximo de <strong>10 días por año</strong>.<br><br>
                    • El contador en la parte superior te mostrará cuántos días te quedan disponibles en el año actual.<br><br>
                    • Toca cualquier registro para ver su contenido completo.<br><br>
                    • Los datos se guardan de forma privada en tu dispositivo.<br><br>
                    • <strong>Separación por año:</strong> Los registros se guardan automáticamente separados por año. Cuando inicie un nuevo año, los registros del año anterior se conservarán y podrás consultarlos en cualquier momento usando el selector de año en la parte superior. Esto te permite tener un historial completo para cualquier aclaración futura.
                </p>
                <button onclick="this.closest('.modal-overlay').remove()" style="width: 100%; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">Entendido</button>
            </div>
        `);
    },

    verDetalle(id, yearSeleccionado) {
        const dias = this.getDiasByYear(yearSeleccionado);
        const dia = dias.find(d => d.id === id);
        
        if (!dia) return;

        App.showModal(`
            <div style="background: var(--surface); padding: 24px; border-radius: 16px; max-width: 90%; width: 450px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--bg-soft);">
                    <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: none; stroke: var(--primary); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span style="font-size: 18px; font-weight: 700; color: var(--text);">${dia.fecha}</span>
                    <span style="margin-left: auto; font-size: 12px; color: var(--text-soft); background: var(--bg-soft); padding: 4px 10px; border-radius: 12px; font-weight: 600;">Año ${yearSeleccionado}</span>
                </div>
                <h3 style="margin: 0 0 12px 0; color: var(--text); font-size: 20px;">${dia.titulo}</h3>
                <div style="background: var(--bg-soft); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0; color: var(--text); font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${dia.descripcion}</p>
                </div>
                <button onclick="this.closest('.modal-overlay').remove()" style="width: 100%; padding: 12px; background: var(--bg-soft); color: var(--text); border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">Cerrar</button>
            </div>
        `);
    },

    abrirModal(editId = null) {
        const yearActual = new Date().getFullYear();
        const dias = this.getDiasByYear(yearActual);
        const diaEdit = editId ? dias.find(d => d.id === editId) : null;

        const data = diaEdit || { titulo: '', descripcion: '', fecha: '' };

        App.showModal(`
            <div style="background: var(--surface); padding: 24px; border-radius: 16px; max-width: 90%; width: 450px;">
                <h3 style="margin: 0 0 20px 0; color: var(--text); font-size: 20px;">${editId ? 'Editar' : 'Nuevo'} Día Económico</h3>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-soft);">Fecha *</label>
                    <input type="date" id="deFecha" value="${data.fecha}" style="width: 100%; padding: 12px; border: 1px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text); box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-soft);">Título *</label>
                    <input type="text" id="deTitulo" value="${data.titulo}" placeholder="Ej: Trámite personal" style="width: 100%; padding: 12px; border: 1px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text); box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 24px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-soft);">Descripción *</label>
                    <textarea id="deDescripcion" rows="4" placeholder="Motivo o detalles del día..." style="width: 100%; padding: 12px; border: 1px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text); resize: vertical; box-sizing: border-box;">${data.descripcion}</textarea>
                </div>

                <div style="display: flex; gap: 12px;">
                    <button id="btnCancelDE" style="flex: 1; padding: 12px; background: var(--bg-soft); color: var(--text); border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">Cancelar</button>
                    <button id="btnSaveDE" style="flex: 1; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">${editId ? 'Actualizar' : 'Guardar'}</button>
                </div>
            </div>
        `);

        document.getElementById('btnCancelDE').addEventListener('click', () => document.querySelector('.modal-overlay').remove());
        document.getElementById('btnSaveDE').addEventListener('click', () => this.guardarDia(editId, yearActual));
    },

    guardarDia(editId, yearActual) {
        const fecha = document.getElementById('deFecha').value;
        const titulo = document.getElementById('deTitulo').value.trim();
        const descripcion = document.getElementById('deDescripcion').value.trim();

        if (!fecha || !titulo || !descripcion) {
            App.showToast('️ Todos los campos son obligatorios');
            return;
        }

        const allDias = this.getDias();
        let diasYear = allDias[yearActual] || [];

        // Si es nuevo, verificar límite de 10
        if (!editId) {
            if (diasYear.length >= 10) {
                App.showToast('⚠️ Has alcanzado el límite de 10 días por año');
                return;
            }

            const nuevoDia = {
                id: 'de_' + Date.now(),
                fecha,
                titulo,
                descripcion,
                anio: yearActual,
                creado: new Date().toISOString()
            };
            diasYear.push(nuevoDia);
            App.showToast('✅ Registro guardado');
        } else {
            // Editar existente
            const index = diasYear.findIndex(d => d.id === editId);
            if (index !== -1) {
                diasYear[index] = {
                    ...diasYear[index],
                    fecha,
                    titulo,
                    descripcion,
                    actualizado: new Date().toISOString()
                };
                App.showToast('✅ Registro actualizado');
            }
        }

        allDias[yearActual] = diasYear;
        this.saveDias(allDias);

        document.querySelector('.modal-overlay').remove();
        this.cargarDias();
    },

    eliminarDia(id) {
        if (!confirm('¿Estás seguro de eliminar este registro?')) return;
        
        const yearActual = new Date().getFullYear();
        const allDias = this.getDias();
        let diasYear = allDias[yearActual] || [];
        
        diasYear = diasYear.filter(d => d.id !== id);
        allDias[yearActual] = diasYear;
        this.saveDias(allDias);
        
        App.showToast('🗑️ Registro eliminado');
        this.cargarDias();
    }
};

// ✅ EXPOSICIÓN GLOBAL para que los onclick inline funcionen
window.DiasEconomicos = DiasEconomicos;

export default DiasEconomicos;