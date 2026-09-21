// ============================================
// REGISTRO/ESPEJO.JS - Módulo de Espejo
// ============================================

const Espejo = {
    render() {
        return `
            <div class="view active">
                <div class="crud-header">
                    <h2 class="page-title" style="margin:0;">
                        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                        Espejo
                    </h2>
                    <button class="btn-add" id="btnAddEspejo">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nuevo
                    </button>
                </div>
                <div id="espejoList"></div>
            </div>
        `;
    },

    init() {
        document.getElementById('btnAddEspejo').addEventListener('click', () => this.openModal());
        this.renderList();
    },

    openModal(editId = null) {
        const data = editId ? DB.load('espejos').find(e => e.id === editId) : null;
        const lineas = DB.load('lineas');
        const semanas = DB.load('semanas');

        if (lineas.length === 0) {
            App.showToast('Primero debes registrar una línea');
            return;
        }

        const lineaOptions = lineas.map(l => 
            `<option value="${l.id}" ${data && data.lineaId === l.id ? 'selected' : ''}>${l.nombre}</option>`
        ).join('');

        const modal = App.showModal(`
            <h3>${editId ? 'Editar' : 'Nuevo'} Espejo</h3>
            <div class="input-group">
                <label>Línea</label>
                <select id="espejoLinea">
                    ${lineaOptions}
                </select>
            </div>
            <div class="input-group">
                <label>Tipo de Semana</label>
                <select id="espejoSemana">
                    <option value="">Selecciona línea primero</option>
                </select>
            </div>
            
            <h4 style="margin:12px 0 8px;color:var(--text);font-size:13px;">Trenes y Espejos</h4>
            <div id="espejoPares">
                ${data && data.pares ? data.pares.map((par, idx) => `
                    <div class="espejo-par">
                        <div class="input-group">
                            <label>Tren</label>
                            <input type="text" class="espejo-tren" value="${par.tren || ''}" placeholder="Número de tren">
                        </div>
                        <div class="input-group">
                            <label>Espejo</label>
                            <input type="text" class="espejo-espejo" value="${par.espejo || ''}" placeholder="Número de espejo">
                        </div>
                    </div>
                `).join('') : `
                    <div class="espejo-par">
                        <div class="input-group">
                            <label>Tren</label>
                            <input type="text" class="espejo-tren" value="" placeholder="Número de tren">
                        </div>
                        <div class="input-group">
                            <label>Espejo</label>
                            <input type="text" class="espejo-espejo" value="" placeholder="Número de espejo">
                        </div>
                    </div>
                `}
            </div>
            
            <button class="btn-secondary" id="btnAgregarPar" style="margin-top:10px;width:100%;">
                + Agregar otro par
            </button>

            <div class="modal-actions">
                <button class="btn-secondary" id="btnCancel">Cancelar</button>
                <button class="btn-primary" id="btnSave">${editId ? 'Actualizar' : 'Guardar'}</button>
            </div>
        `);

        const selectLinea = document.getElementById('espejoLinea');
        const selectSemana = document.getElementById('espejoSemana');

        const updateSemanas = () => {
            const lineaId = selectLinea.value;
            const semanasFiltradas = semanas.filter(s => s.lineaId === lineaId);
            
            selectSemana.innerHTML = semanasFiltradas.length === 0
                ? '<option value="">No hay semanas</option>'
                : semanasFiltradas.map(s => 
                    `<option value="${s.id}" ${data && data.semanaId === s.id ? 'selected' : ''}>${s.tipo}</option>`
                ).join('');
        };

        selectLinea.addEventListener('change', updateSemanas);
        updateSemanas();

        // Agregar más pares
        let paresExtra = data && data.pares ? data.pares.slice(1) : [];
        const contenedorPares = document.getElementById('espejoPares');

        const renderParesExtra = () => {
            const paresHTML = paresExtra.map((par, idx) => `
                <div class="espejo-par">
                    <div class="input-group">
                        <label>Tren</label>
                        <input type="text" class="espejo-tren" value="${par.tren || ''}" placeholder="Número de tren">
                    </div>
                    <div class="input-group">
                        <label>Espejo</label>
                        <input type="text" class="espejo-espejo" value="${par.espejo || ''}" placeholder="Número de espejo">
                    </div>
                </div>
            `).join('');
            
            // Mantener el primer par y agregar los extra
            const primerPar = contenedorPares.querySelector('.espejo-par');
            if (primerPar) {
                contenedorPares.innerHTML = primerPar.outerHTML + paresHTML;
            }
        };

        document.getElementById('btnAgregarPar').addEventListener('click', () => {
            paresExtra.push({ tren: '', espejo: '' });
            renderParesExtra();
        });

        document.getElementById('btnCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnSave').addEventListener('click', () => {
            const lineaId = document.getElementById('espejoLinea').value;
            const semanaId = document.getElementById('espejoSemana').value;

            if (!lineaId || !semanaId) {
                App.showToast('Selecciona línea y semana');
                return;
            }

            // Recopilar todos los pares
            const trenes = contenedorPares.querySelectorAll('.espejo-tren');
            const espejos = contenedorPares.querySelectorAll('.espejo-espejo');
            
            const pares = [];
            trenes.forEach((tren, idx) => {
                const trenVal = tren.value.trim();
                const espejoVal = espejos[idx] ? espejos[idx].value.trim() : '';
                
                if (trenVal || espejoVal) {
                    pares.push({ tren: trenVal, espejo: espejoVal });
                }
            });

            if (pares.length === 0) {
                App.showToast('Agrega al menos un par Tren-Espejo');
                return;
            }

            let espejos_data = DB.load('espejos');

            if (editId) {
                const idx = espejos_data.findIndex(e => e.id === editId);
                if (idx !== -1) {
                    espejos_data[idx] = { ...espejos_data[idx], lineaId, semanaId, pares };
                }
            } else {
                espejos_data.push({
                    id: DB.generateId(),
                    lineaId,
                    semanaId,
                    pares,
                    createdAt: Date.now()
                });
            }

            DB.save('espejos', espejos_data);
            modal.remove();
            this.renderList();
            App.showToast(editId ? 'Espejo actualizado' : 'Espejo guardado');
        });
    },

    renderList() {
        const list = document.getElementById('espejoList');
        const data = DB.load('espejos').sort((a, b) => b.createdAt - a.createdAt);
        const lineas = DB.load('lineas');
        const semanas = DB.load('semanas');

        if (data.length === 0) {
            list.innerHTML = `<div class="aviso-empty"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg><p>No hay espejos registrados</p></div>`;
            return;
        }

        list.innerHTML = data.map(item => {
            const linea = lineas.find(l => l.id === item.lineaId);
            const semana = semanas.find(s => s.id === item.semanaId);
            
            return `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">Espejo</div>
                    </div>
                    <div class="item-meta">
                        <span class="item-tag">Línea: ${linea ? linea.nombre : 'N/A'}</span>
                        <span class="item-tag">Semana: ${semana ? semana.tipo : 'N/A'}</span>
                    </div>
                    <div class="item-meta" style="margin-top:8px;">
                        ${item.pares.map((par) => `
                            <span class="item-tag">Tren: ${par.tren || '-'} → Espejo: ${par.espejo || '-'}</span>
                        `).join('')}
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" data-id="${item.id}">Editar</button>
                        <button class="btn-remove" data-id="${item.id}">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });
        list.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar este espejo?')) {
                    let data = DB.load('espejos').filter(e => e.id !== btn.dataset.id);
                    DB.save('espejos', data);
                    this.renderList();
                    App.showToast('Espejo eliminado');
                }
            });
        });
    }
};

export default Espejo;