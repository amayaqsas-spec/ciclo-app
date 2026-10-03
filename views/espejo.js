// ============================================
// ESPEJO.JS - Módulo con Skeuomorphism y Firebase
// ============================================

const Espejo = {
    render() {
        const lineas = DB.load('lineas');
        return `
            <div class="view active ske-espejo">
                <div class="ske-espejo-header">
                    <div class="ske-espejo-icono"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg></div>
                    <div class="ske-espejo-texto">
                        <h2 class="ske-espejo-titulo">Espejo</h2>
                        <p class="ske-espejo-subtitulo">Busca trenes ida y regreso</p>
                    </div>
                </div>

                <div class="ske-espejo-form-card">
                    <div class="ske-espejo-input-group">
                        <label class="ske-espejo-label"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> Línea</label>
                        <select id="espejoLinea" class="ske-espejo-select">
                            <option value="">Selecciona una línea</option>
                            ${lineas.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('')}
                        </select>
                    </div>

                    <div class="ske-espejo-input-group">
                        <label class="ske-espejo-label"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Tipo de Semana</label>
                        <select id="espejoTipoSemana" class="ske-espejo-select" disabled><option value="">Selecciona línea primero</option></select>
                    </div>

                    <div class="ske-espejo-input-group">
                        <label class="ske-espejo-label"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg> Pon el número de tren</label>
                        <input type="text" id="espejoNumeroTren" class="ske-espejo-input" placeholder="Ej: 1234" disabled>
                    </div>

                    <button class="ske-espejo-btn-buscar" id="btnBuscarEspejo" disabled>
                        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <span>Buscar</span>
                    </button>
                </div>

                <div id="espejoResultado"></div>
            </div>
        `;
    },

    async init() {
        // ✅ Carga desde Firebase
        const lineas = await DB_FIREBASE.load('lineas');
        const semanas = await DB_FIREBASE.load('semanas');
        const servicios = await DB_FIREBASE.load('servicios');

        const selectLinea = document.getElementById('espejoLinea');
        const selectTipoSemana = document.getElementById('espejoTipoSemana');
        const inputNumeroTren = document.getElementById('espejoNumeroTren');
        const btnBuscar = document.getElementById('btnBuscarEspejo');
        const resultadoDiv = document.getElementById('espejoResultado');

        selectLinea?.addEventListener('change', (e) => {
            const lineaId = e.target.value;
            selectTipoSemana.innerHTML = '<option value="">Selecciona tipo de semana</option>';
            inputNumeroTren.value = '';
            inputNumeroTren.disabled = true;
            btnBuscar.disabled = true;
            resultadoDiv.innerHTML = '';

            if (lineaId) {
                const tiposSemana = [...new Set(semanas.map(s => s.tipo))];
                tiposSemana.forEach(tipo => {
                    selectTipoSemana.innerHTML += `<option value="${tipo}">${tipo}</option>`;
                });
                selectTipoSemana.disabled = false;
            } else {
                selectTipoSemana.disabled = true;
            }
        });

        selectTipoSemana?.addEventListener('change', (e) => {
            inputNumeroTren.value = '';
            btnBuscar.disabled = true;
            resultadoDiv.innerHTML = '';
            inputNumeroTren.disabled = e.target.value ? false : true;
        });

        inputNumeroTren?.addEventListener('input', (e) => {
            btnBuscar.disabled = !e.target.value.trim();
        });

        btnBuscar?.addEventListener('click', () => {
            const lineaId = selectLinea.value;
            const tipoSemana = selectTipoSemana.value;
            const numeroTren = inputNumeroTren.value.trim();

            if (!lineaId || !tipoSemana || !numeroTren) {
                App.showToast('⚠️ Completa todos los campos');
                return;
            }

            const linea = lineas.find(l => l.id === lineaId);
            const semana = semanas.find(s => s.tipo === tipoSemana);

            const servicio = servicios.find(s => {
                const trenes = s.trenes || [];
                return s.lineaId === lineaId && s.semanaId === semana?.id && trenes.some(t => String(t.numero) === numeroTren);
            });

            if (servicio) {
                const tren = servicio.trenes.find(t => String(t.numero) === numeroTren);
                resultadoDiv.innerHTML = this.renderResultado(servicio, linea, semana, tren);
            } else {
                resultadoDiv.innerHTML = `
                    <div class="ske-espejo-empty">
                        <div class="ske-espejo-empty-icono"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                        <h3>Tren no encontrado</h3>
                        <p>No existe el tren <strong>"${numeroTren}"</strong> para la configuración seleccionada.</p>
                    </div>
                `;
            }
        });
    },

    renderResultado(servicio, linea, semana, tren) {
        const trenes = servicio.trenes || [];
        const idxTren = trenes.findIndex(t => String(t.numero) === String(tren.numero));
        
        let trenEspejo = null;
        if (idxTren === 0 && trenes.length > 1) trenEspejo = trenes[1];
        else if (idxTren === trenes.length - 1 && trenes.length > 1) trenEspejo = trenes[idxTren - 1];
        else if (idxTren > 0) trenEspejo = trenes[idxTren - 1];

        return `
            <div class="ske-espejo-resultado">
                <div class="ske-espejo-resultado-header">
                    <div class="ske-espejo-numero-badge">Tren #${tren.numero}</div>
                    <div class="ske-espejo-info-row">
                        <span class="ske-espejo-info-tag"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> ${linea?.nombre || 'N/A'}</span>
                        <span class="ske-espejo-info-tag"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${semana?.tipo || 'N/A'}</span>
                    </div>
                </div>

                <div class="ske-espejo-flechas-container">
                    <div class="ske-espejo-flecha-box ske-espejo-ida">
                        <div class="ske-espejo-flecha-label">IDA</div>
                        <div class="ske-espejo-flecha-numero">#${tren.numero}</div>
                    </div>
                    <div class="ske-espejo-flecha-centro">
                        <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </div>
                    <div class="ske-espejo-flecha-box ske-espejo-regreso">
                        <div class="ske-espejo-flecha-label">REGRESO</div>
                        ${trenEspejo ? `<div class="ske-espejo-flecha-numero">#${trenEspejo.numero}</div>` : `<div class="ske-espejo-flecha-numero">—</div>`}
                    </div>
                </div>
            </div>
        `;
    }
};

export default Espejo;