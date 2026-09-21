// ============================================
// ESPEJO.JS - Módulo de Búsqueda de Espejo
// ============================================

const Espejo = {
    render() {
        const lineas = DB.load('lineas');
        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona una línea</option>' + lineas.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('')
            : '<option value="">Primero registra una línea</option>';

        return `
            <div class="view active">
                <h2 class="page-title">
                    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                    Espejo
                </h2>

                <div class="espejo-buscador">
                    <div class="input-group">
                        <label>Línea</label>
                        <select id="espejoLinea">${lineaOptions}</select>
                    </div>
                    <div class="input-group">
                        <label>Tipo de Semana</label>
                        <select id="espejoSemana"><option value="">Selecciona línea primero</option></select>
                    </div>
                    <div class="input-group">
                        <label>Pon el número de Tren</label>
                        <input type="text" id="espejoTrenInput" placeholder="Ej: 1234" disabled>
                    </div>
                    <button class="btn-buscar-espejo" id="btnBuscarEspejo" disabled>
                        <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Buscar
                    </button>
                </div>

                <div id="espejoResultado"></div>
            </div>
        `;
    },

    init() {
        const lineas = DB.load('lineas');
        const semanas = DB.load('semanas');

        const selectLinea = document.getElementById('espejoLinea');
        const selectSemana = document.getElementById('espejoSemana');
        const inputTren = document.getElementById('espejoTrenInput');
        const btnBuscar = document.getElementById('btnBuscarEspejo');

        selectLinea.addEventListener('change', () => {
            const lineaId = selectLinea.value;
            selectSemana.innerHTML = '<option value="">Selecciona semana</option>';
            inputTren.disabled = true;
            btnBuscar.disabled = true;
            document.getElementById('espejoResultado').innerHTML = '';

            if (lineaId) {
                const semanasFiltradas = semanas.filter(s => s.lineaId === lineaId);
                semanasFiltradas.forEach(s => {
                    selectSemana.innerHTML += `<option value="${s.id}">${s.tipo}</option>`;
                });
            }
        });

        selectSemana.addEventListener('change', () => {
            const lineaId = selectLinea.value;
            const semanaId = selectSemana.value;

            if (lineaId && semanaId) {
                inputTren.disabled = false;
                inputTren.focus();
            } else {
                inputTren.disabled = true;
                btnBuscar.disabled = true;
            }
        });

        inputTren.addEventListener('input', () => {
            btnBuscar.disabled = inputTren.value.trim().length === 0;
        });

        inputTren.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !btnBuscar.disabled) {
                this.buscarEspejo();
            }
        });

        btnBuscar.addEventListener('click', () => this.buscarEspejo());
    },

    buscarEspejo() {
        const lineaId = document.getElementById('espejoLinea').value;
        const semanaId = document.getElementById('espejoSemana').value;
        const numeroTren = document.getElementById('espejoTrenInput').value.trim();

        if (!lineaId || !semanaId || !numeroTren) {
            App.showToast('Completa todos los campos');
            return;
        }

        const espejos = DB.load('espejos');
        
        const registro = espejos.find(e => 
            e.lineaId === lineaId && 
            e.semanaId === semanaId &&
            e.pares.some(par => par.tren === numeroTren)
        );

        if (!registro) {
            document.getElementById('espejoResultado').innerHTML = `
                <div class="espejo-no-resultado">
                    <svg viewBox="0 0 24 24" style="width:40px;height:40px;stroke:var(--text-light);fill:none;stroke-width:2;margin-bottom:8px;">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        <line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                    <p>No se encontró espejo para el tren <strong>${numeroTren}</strong></p>
                </div>
            `;
            return;
        }

        const par = registro.pares.find(p => p.tren === numeroTren);
        if (!par) {
            document.getElementById('espejoResultado').innerHTML = `
                <div class="espejo-no-resultado">
                    <p>No se encontró espejo para el tren <strong>${numeroTren}</strong></p>
                </div>
            `;
            return;
        }

        this.mostrarResultado(numeroTren, par.espejo);
    },

    mostrarResultado(tren, espejo) {
        document.getElementById('espejoResultado').innerHTML = `
            <div class="espejo-resultado-container">
                <div class="espejo-flechas">
                    <div class="espejo-lado ida">
                        <div class="espejo-etiqueta">IDA</div>
                        <div class="espejo-numero">${tren}</div>
                        <div class="espejo-flecha-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </div>
                    </div>
                    <div class="espejo-centro">
                        <div class="espejo-circulo">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <line x1="9" y1="3" x2="9" y2="21"/>
                            </svg>
                        </div>
                    </div>
                    <div class="espejo-lado regreso">
                        <div class="espejo-flecha-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                        </div>
                        <div class="espejo-numero">${espejo || '--'}</div>
                        <div class="espejo-etiqueta">REGRESO</div>
                    </div>
                </div>
            </div>
        `;
    }
};

export default Espejo;