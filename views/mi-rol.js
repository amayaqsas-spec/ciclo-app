// ============================================
// MI-ROL.JS - Calendario Organizador de 5 Semanas
// ============================================

const MiRol = {
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
        let semanaActualNum = 1;
        let diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        let hoy = new Date();
        let diaActualNombre = diasSemana[hoy.getDay()];
        let fechaHoyStr = this.getFechaLocal(hoy);

        if (userNumeroRol && rolesSemanal.length > 0) {
            miRol = rolesSemanal.find(r => String(r.numeroRol) === String(userNumeroRol) && r.lineaId === userLineaId);

            if (miRol) {
                const fechaInicio = new Date(miRol.fechaInicio);
                fechaInicio.setHours(0, 0, 0, 0);
                const diasTranscurridos = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24));
                semanaActualNum = Math.floor(diasTranscurridos / 7) % 5 + 1;
            }
        }

        return `
            <div class="view active" style="padding: 20px;">
                <!-- HEADER -->
                <div style="background: var(--surface); padding: 20px; border-radius: 16px; box-shadow: var(--clay-shadow-sm); margin-bottom: 20px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 22px; color: var(--primary);"> Mi Rol</h2>
                    
                    ${miRol ? `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                            <div style="background: var(--bg-soft); padding: 10px; border-radius: 8px;">
                                <div style="font-size: 11px; color: var(--text-soft);">Línea</div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--text);">${miLinea ? miLinea.nombre : 'N/A'}</div>
                            </div>
                            <div style="background: var(--bg-soft); padding: 10px; border-radius: 8px;">
                                <div style="font-size: 11px; color: var(--text-soft);">Terminal</div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--text);">${miTerminal ? miTerminal.nombre : 'N/A'}</div>
                            </div>
                            <div style="background: var(--bg-soft); padding: 10px; border-radius: 8px;">
                                <div style="font-size: 11px; color: var(--text-soft);">Rol</div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--text);">#${userNumeroRol || 'N/A'}</div>
                            </div>
                            <div style="background: var(--primary); color: white; padding: 10px; border-radius: 8px;">
                                <div style="font-size: 11px; opacity: 0.9;">Semana Actual</div>
                                <div style="font-size: 14px; font-weight: 700;">Semana ${semanaActualNum}</div>
                            </div>
                        </div>

                        <div style="background: var(--bg-soft); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 12px; color: var(--text-soft); margin-bottom: 4px;">Hoy es</div>
                            <div style="font-size: 18px; font-weight: 800; color: var(--primary);">${diaActualNombre} ${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}</div>
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 20px; color: var(--text-soft);">
                            <p>No se encontró tu rol. Contacta al administrador.</p>
                        </div>
                    `}
                </div>

                <!-- CALENDARIO DE 5 SEMANAS -->
                ${miRol ? `
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        ${miRol.semanas.map(semana => {
                            const esSemanaActual = semana.numero === semanaActualNum;
                            
                            return `
                                <div style="background: var(--surface); padding: 16px; border-radius: 12px; box-shadow: var(--clay-shadow-sm); border: 2px solid ${esSemanaActual ? 'var(--primary)' : 'var(--bg-soft)'};">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: ${esSemanaActual ? 'var(--primary)' : 'var(--text)'};">
                                            ${esSemanaActual ? '📍 ' : ''}Semana ${semana.numero}
                                        </h3>
                                        ${esSemanaActual ? '<span style="background: var(--primary); color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;">ACTUAL</span>' : ''}
                                    </div>

                                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
                                        ${diasSemana.map(dia => {
                                            const diaData = semana.dias[dia] || { posicion: '' };
                                            const esHoy = esSemanaActual && dia === diaActualNombre;
                                            const posicion = diaData.posicion || '-';
                                            
                                            return `
                                                <div style="background: ${esHoy ? 'var(--primary)' : 'var(--bg-soft)'}; padding: 8px 4px; border-radius: 8px; text-align: center; border: 2px solid ${esHoy ? 'var(--accent)' : 'transparent'};">
                                                    <div style="font-size: 9px; font-weight: 700; color: ${esHoy ? 'white' : 'var(--text-soft)'}; margin-bottom: 4px; text-transform: uppercase;">
                                                        ${dia.substring(0, 3)}
                                                    </div>
                                                    <div style="font-size: 14px; font-weight: 800; color: ${esHoy ? 'white' : 'var(--text)'};">
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

    getFechaLocal(fecha) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    init() {
        // No necesita inicialización adicional
        console.log('📅 Mi Rol cargado');
    }
};

export default MiRol;