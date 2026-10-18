// ============================================
// MI-ROL.JS - Calendario con Cálculo Automático de Semana
// ============================================

const MiRol = {
    // ✅ FECHA FIJA DE INICIO DEL CICLO (Domingo de la Semana 1)
    FECHA_INICIO_CICLO: new Date(2026, 9, 11), // 11 de octubre 2026 (mes 9 = octubre)
    TOTAL_SEMANAS_CICLO: 5,

    getFechaLocal(fecha) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // ✅ CÁLCULO SIMPLE Y DIRECTO
    calcularSemanaActual() {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const fechaInicio = new Date(this.FECHA_INICIO_CICLO);
        fechaInicio.setHours(0, 0, 0, 0);

        // Calcular diferencia en días
        const diferenciaDias = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24));
        
        console.log('📅 Cálculo de semana:');
        console.log('  Fecha inicio:', fechaInicio.toISOString().split('T')[0]);
        console.log('  Hoy:', hoy.toISOString().split('T')[0]);
        console.log('  Días transcurridos:', diferenciaDias);

        // Si es antes de la fecha de inicio, mostrar semana 1
        if (diferenciaDias < 0) {
            console.log('  Antes del inicio, retornando semana 1');
            return 1;
        }

        // Calcular semanas transcurridas
        const semanasTranscurridas = Math.floor(diferenciaDias / 7);
        console.log('  Semanas transcurridas:', semanasTranscurridas);

        // Calcular semana actual (ciclo de 5 semanas, empieza en 1)
        const semanaActual = (semanasTranscurridas % this.TOTAL_SEMANAS_CICLO) + 1;
        console.log('  Semana actual:', semanaActual);

        return semanaActual;
    },

    render() {
        const userLineaId = DB.get('userLineaId');
        const userTerminalId = DB.get('userTerminalId');
        const userNumeroRol = DB.get('userNumeroRol');

        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');
        const rolesSemanal = DB.load('rolesSemanal');

        const miLinea = lineas.find(l => l.id === userLineaId);
        const miTerminal = terminales.find(t => t.id === userTerminalId);

        let miRol = null;
        
        const semanaActualNum = this.calcularSemanaActual();
        
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const diaActualNombre = diasSemana[hoy.getDay()];

        if (userNumeroRol && rolesSemanal.length > 0) {
            miRol = rolesSemanal.find(r => String(r.numeroRol) === String(userNumeroRol) && r.lineaId === userLineaId);
        }

        const diaDeSemanaHoy = hoy.getDay();
        const domingoSemanaActual = new Date(hoy);
        domingoSemanaActual.setDate(hoy.getDate() - diaDeSemanaHoy);

        const semanasConFechas = miRol ? miRol.semanas.map(semana => {
            let diferencia = semana.numero - semanaActualNum;
            
            if (diferencia < 0) {
                diferencia += this.TOTAL_SEMANAS_CICLO;
            }
            
            const domingoSemana = new Date(domingoSemanaActual);
            domingoSemana.setDate(domingoSemanaActual.getDate() + (diferencia * 7));

            const diasConFechas = diasSemana.map((dia, idx) => {
                const fechaDia = new Date(domingoSemana);
                fechaDia.setDate(domingoSemana.getDate() + idx);
                return {
                    nombre: dia,
                    fecha: fechaDia,
                    diaNumero: fechaDia.getDate(),
                    esHoy: this.getFechaLocal(fechaDia) === this.getFechaLocal(hoy)
                };
            });

            const sabadoSemana = new Date(domingoSemana);
            sabadoSemana.setDate(domingoSemana.getDate() + 6);
            const mesInicio = domingoSemana.toLocaleDateString('es-MX', { month: 'long' });
            const mesFin = sabadoSemana.toLocaleDateString('es-MX', { month: 'long' });
            const etiquetaMes = mesInicio === mesFin ? mesInicio : `${mesInicio}/${mesFin}`;

            return {
                ...semana,
                diasConFechas: diasConFechas,
                etiquetaMes: etiquetaMes
            };
        }) : [];

        const hayRolRegistrado = miRol !== null;
        const textoBoton = hayRolRegistrado ? '✏️ Editar' : '✏️ Nuevo';

        return `
            <div class="view active" style="padding: 20px;">
                <div style="background: var(--surface); padding: 20px; border-radius: 16px; box-shadow: var(--clay-shadow-sm); margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 style="margin: 0; font-size: 22px; color: var(--primary);">📅 Mi Rol</h2>
                        <button id="btnEditarPerfil" style="background: var(--primary); color: white; border: none; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                            ${textoBoton}
                        </button>
                    </div>
                    
                    ${miRol ? `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                            <div style="background: var(--bg-soft); padding: 12px; border-radius: 8px;">
                                <div style="font-size: 11px; color: var(--text-soft); margin-bottom: 4px;">🚌 Línea</div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--text);">${miLinea ? miLinea.nombre : 'N/A'}</div>
                            </div>
                            <div style="background: var(--bg-soft); padding: 12px; border-radius: 8px;">
                                <div style="font-size: 11px; color: var(--text-soft); margin-bottom: 4px;">🚇 Terminal</div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--text);">${miTerminal ? miTerminal.nombre : 'N/A'}</div>
                            </div>
                            <div style="background: var(--bg-soft); padding: 12px; border-radius: 8px;">
                                <div style="font-size: 11px; color: var(--text-soft); margin-bottom: 4px;"> Número de Rol</div>
                                <div style="font-size: 18px; font-weight: 800; color: var(--primary);">#${userNumeroRol || 'N/A'}</div>
                            </div>
                            <div style="background: var(--primary); color: white; padding: 12px; border-radius: 8px;">
                                <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">📆 Semana Actual</div>
                                <div style="font-size: 18px; font-weight: 800;">Semana ${semanaActualNum}</div>
                            </div>
                        </div>

                        <div style="background: var(--bg-soft); padding: 12px; border-radius: 8px; text-align: center; border-left: 4px solid var(--primary);">
                            <div style="font-size: 12px; color: var(--text-soft); margin-bottom: 4px;">Hoy es</div>
                            <div style="font-size: 18px; font-weight: 800; color: var(--primary);">${diaActualNombre} ${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}</div>
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 20px; color: var(--text-soft);">
                            <p style="margin: 0 0 8px 0;">No se encontró tu rol.</p>
                            <p style="font-size: 13px;">Toca "Nuevo" para configurar tu perfil.</p>
                        </div>
                    `}
                </div>

                ${miRol ? `
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        ${semanasConFechas.map(semana => {
                            const esSemanaActual = semana.numero === semanaActualNum;
                            
                            return `
                                <div style="background: var(--surface); padding: 16px; border-radius: 12px; box-shadow: var(--clay-shadow-sm); border: 2px solid ${esSemanaActual ? 'var(--primary)' : 'var(--bg-soft)'};">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <div>
                                            <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: ${esSemanaActual ? 'var(--primary)' : 'var(--text)'};">
                                                ${esSemanaActual ? '📍 ' : ''}Semana ${semana.numero}
                                            </h3>
                                            <div style="font-size: 11px; color: var(--text-soft); margin-top: 4px; text-transform: capitalize;">
                                                ${semana.etiquetaMes}
                                            </div>
                                        </div>
                                        ${esSemanaActual ? '<span style="background: var(--primary); color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;">ACTUAL</span>' : ''}
                                    </div>

                                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
                                        ${semana.diasConFechas.map(diaInfo => {
                                            const diaData = semana.dias[diaInfo.nombre] || { posicion: '' };
                                            const posicion = diaData.posicion || '-';
                                            
                                            return `
                                                <div style="background: ${diaInfo.esHoy ? 'var(--primary)' : 'var(--bg-soft)'}; padding: 8px 4px; border-radius: 8px; text-align: center; border: 2px solid ${diaInfo.esHoy ? 'var(--accent)' : 'transparent'};">
                                                    <div style="font-size: 9px; font-weight: 700; color: ${diaInfo.esHoy ? 'white' : 'var(--text-soft)'}; margin-bottom: 4px; text-transform: uppercase;">
                                                        ${diaInfo.nombre.substring(0, 3)}
                                                    </div>
                                                    <div style="font-size: 16px; font-weight: 800; color: ${diaInfo.esHoy ? 'white' : 'var(--text)'}; margin-bottom: 4px; line-height: 1;">
                                                        ${diaInfo.diaNumero}
                                                    </div>
                                                    <div style="font-size: 13px; font-weight: 700; color: ${diaInfo.esHoy ? 'white' : 'var(--text)'};">
                                                        ${posicion}
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    async init() {
        await DB_FIREBASE.load('rolesSemanal');
        await DB_FIREBASE.load('configuracionGlobal');
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');
        
        console.log('📅 Mi Rol - rolesSemanal cargado:', DB.load('rolesSemanal').length);

        const btnEditarPerfil = document.getElementById('btnEditarPerfil');
        if (btnEditarPerfil) {
            btnEditarPerfil.addEventListener('click', (e) => {
                e.preventDefault();
                this.abrirModalEditar();
            });
        }
    },

    async abrirModalEditar() {
        await DB_FIREBASE.load('lineas');
        await DB_FIREBASE.load('terminales');

        const userLineaId = DB.get('userLineaId');
        const userTerminalId = DB.get('userTerminalId');
        const userNumeroRol = DB.get('userNumeroRol');

        const lineas = DB.load('lineas');
        const terminales = DB.load('terminales');

        const lineaOptions = lineas.length > 0
            ? '<option value="">Selecciona línea</option>' + lineas.map(l => `<option value="${l.id}" ${l.id === userLineaId ? 'selected' : ''}>${l.nombre}</option>`).join('')
            : '<option value="">No hay líneas disponibles</option>';

        const terminalesFiltradas = terminales.filter(t => t.lineaId === userLineaId);
        const terminalOptions = terminalesFiltradas.length > 0
            ? '<option value="">Selecciona terminal</option>' + terminalesFiltradas.map(t => `<option value="${t.id}" ${t.id === userTerminalId ? 'selected' : ''}>${t.nombre}</option>`).join('')
            : '<option value="">Selecciona línea primero</option>';

        const esEdicion = userNumeroRol && userLineaId;
        const tituloModal = esEdicion ? '✏️ Editar Perfil' : '✏️ Nuevo Perfil';

        const modalOverlay = App.showModal(`
            <div style="background: var(--surface); padding: 24px; border-radius: 16px; max-width: 90%; width: 400px; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin: 0 0 16px 0; font-size: 20px; color: var(--primary);">${tituloModal}</h3>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text);">Línea *</label>
                    <select id="editLinea" style="width: 100%; padding: 12px; border: 2px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text);">
                        ${lineaOptions}
                    </select>
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text);">Terminal *</label>
                    <select id="editTerminal" style="width: 100%; padding: 12px; border: 2px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text);">
                        ${terminalOptions}
                    </select>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text);">Número de Rol *</label>
                    <input type="text" id="editNumeroRol" value="${userNumeroRol || ''}" placeholder="Ej. 1234" style="width: 100%; padding: 12px; border: 2px solid var(--bg-soft); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text); box-sizing: border-box;">
                </div>

                <div style="display: flex; gap: 10px;">
                    <button id="btnCancelarEdit" style="flex: 1; padding: 12px; background: var(--bg-soft); color: var(--text); border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                        Cancelar
                    </button>
                    <button id="btnGuardarEdit" style="flex: 1; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                        💾 Guardar
                    </button>
                </div>
            </div>
        `);

        const selectLinea = document.getElementById('editLinea');
        const selectTerminal = document.getElementById('editTerminal');

        selectLinea.addEventListener('change', () => {
            const lineaId = selectLinea.value;
            const filtradas = terminales.filter(t => t.lineaId === lineaId);
            
            selectTerminal.innerHTML = filtradas.length === 0
                ? '<option value="">No hay terminales</option>'
                : '<option value="">Selecciona terminal</option>' + filtradas.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('');
        });

        document.getElementById('btnCancelarEdit').addEventListener('click', () => modalOverlay.remove());
        
        document.getElementById('btnGuardarEdit').addEventListener('click', () => {
            document.getElementById('editLinea').blur();
            document.getElementById('editTerminal').blur();
            document.getElementById('editNumeroRol').blur();

            const nuevaLineaId = selectLinea.value;
            const nuevaTerminalId = selectTerminal.value;
            const nuevoNumeroRol = document.getElementById('editNumeroRol').value.trim();

            if (!nuevaLineaId || !nuevaTerminalId || !nuevoNumeroRol) {
                App.showToast('️ Completa todos los campos');
                return;
            }

            DB.set('userLineaId', nuevaLineaId);
            DB.set('userTerminalId', nuevaTerminalId);
            DB.set('userNumeroRol', nuevoNumeroRol);
            DB.set('perfilConfigurado', true);

            App.showToast('✅ Perfil actualizado correctamente');
            modalOverlay.remove();

            setTimeout(() => {
                if (window.Views && window.Views.load) {
                    window.Views.load('home', false);
                } else {
                    window.location.href = '#home';
                }
            }, 300);
        });
    }
};

export default MiRol;
