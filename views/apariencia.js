// ============================================
// APARIENCIA.JS - Módulo de Temas
// ============================================

const Apariencia = {
    themes: {
        lavender: {
            name: 'Lavanda',
            colors: ['#F0E6F6', '#E8D5F5', '#9B7FD4', '#7C5CBF'],
            vars: {
                '--bg': '#F0E6F6', '--bg-soft': '#E8D5F5', '--surface': '#F5EEFA',
                '--primary': '#9B7FD4', '--primary-soft': '#B8A5E0', '--accent': '#7C5CBF',
                '--text': '#3D2E5C', '--text-soft': '#7A6B8E', '--text-light': '#A89BBE',
                '--clay-shadow': '8px 8px 16px #D4C4E0, -8px -8px 16px #FFFFFF',
                '--clay-shadow-sm': '4px 4px 8px #D4C4E0, -4px -4px 8px #FFFFFF',
                '--clay-inset': 'inset 4px 4px 8px #D4C4E0, inset -4px -4px 8px #FFFFFF'
            }
        },
        ocean: {
            name: 'Océano',
            colors: ['#E6F4F6', '#D5EEF5', '#5FB8D4', '#3D9ABF'],
            vars: {
                '--bg': '#E6F4F6', '--bg-soft': '#D5EEF5', '--surface': '#EEF8FA',
                '--primary': '#5FB8D4', '--primary-soft': '#8CCCE0', '--accent': '#3D9ABF',
                '--text': '#2E4A5C', '--text-soft': '#6B828E', '--text-light': '#9BB0BE',
                '--clay-shadow': '8px 8px 16px #C4DCE0, -8px -8px 16px #FFFFFF',
                '--clay-shadow-sm': '4px 4px 8px #C4DCE0, -4px -4px 8px #FFFFFF',
                '--clay-inset': 'inset 4px 4px 8px #C4DCE0, inset -4px -4px 8px #FFFFFF'
            }
        },
        mint: {
            name: 'Menta',
            colors: ['#E6F6EE', '#D5F5E8', '#5FD4A8', '#3DBF8A'],
            vars: {
                '--bg': '#E6F6EE', '--bg-soft': '#D5F5E8', '--surface': '#EEFAF4',
                '--primary': '#5FD4A8', '--primary-soft': '#8CE0C0', '--accent': '#3DBF8A',
                '--text': '#2E5C4A', '--text-soft': '#6B8E7A', '--text-light': '#9BBEA8',
                '--clay-shadow': '8px 8px 16px #C4E0D4, -8px -8px 16px #FFFFFF',
                '--clay-shadow-sm': '4px 4px 8px #C4E0D4, -4px -4px 8px #FFFFFF',
                '--clay-inset': 'inset 4px 4px 8px #C4E0D4, inset -4px -4px 8px #FFFFFF'
            }
        },
        peach: {
            name: 'Durazno',
            colors: ['#F6EEE6', '#F5E0D5', '#D49B7F', '#BF7C5C'],
            vars: {
                '--bg': '#F6EEE6', '--bg-soft': '#F5E0D5', '--surface': '#FAF4EE',
                '--primary': '#D49B7F', '--primary-soft': '#E0B8A5', '--accent': '#BF7C5C',
                '--text': '#5C3D2E', '--text-soft': '#8E7A6B', '--text-light': '#BEA89B',
                '--clay-shadow': '8px 8px 16px #E0D4C4, -8px -8px 16px #FFFFFF',
                '--clay-shadow-sm': '4px 4px 8px #E0D4C4, -4px -4px 8px #FFFFFF',
                '--clay-inset': 'inset 4px 4px 8px #E0D4C4, inset -4px -4px 8px #FFFFFF'
            }
        },
        night: {
            name: 'Noche',
            colors: ['#2A2438', '#352F44', '#5C5470', '#DBD8E3'],
            vars: {
                '--bg': '#2A2438', '--bg-soft': '#352F44', '--surface': '#3D3650',
                '--primary': '#5C5470', '--primary-soft': '#7A7290', '--accent': '#DBD8E3',
                '--text': '#FFFFFF', '--text-soft': '#C8C4D4', '--text-light': '#9A96A8',
                '--clay-shadow': '8px 8px 16px #1A1528, -8px -8px 16px #3A3448',
                '--clay-shadow-sm': '4px 4px 8px #1A1528, -4px -4px 8px #3A3448',
                '--clay-inset': 'inset 4px 4px 8px #1A1528, inset -4px -4px 8px #3A3448'
            }
        },
        rose: {
            name: 'Rosa',
            colors: ['#000000', '#1A0010', '#E41F7B', '#FF8BA0'],
            vars: {
                '--bg': '#000000', '--bg-soft': '#1A0010', '--surface': '#2A0018',
                '--primary': '#E41F7B', '--primary-soft': '#FF4D94', '--accent': '#FF8BA0',
                '--text': '#FFFFFF', '--text-soft': '#FFB3C6', '--text-light': '#CC8899',
                '--clay-shadow': '8px 8px 16px #000000, -8px -8px 16px #330020',
                '--clay-shadow-sm': '4px 4px 8px #000000, -4px -4px 8px #330020',
                '--clay-inset': 'inset 4px 4px 8px #000000, inset -4px -4px 8px #330020'
            }
        },
        orange: {
            name: 'Naranja',
            colors: ['#EEEEEE', '#E0E0E0', '#FD7014', '#FF6B00'],
            vars: {
                '--bg': '#EEEEEE', '--bg-soft': '#E0E0E0', '--surface': '#F5F5F5',
                '--primary': '#FD7014', '--primary-soft': '#FF8C3A', '--accent': '#FF6B00',
                '--text': '#222831', '--text-soft': '#5A6070', '--text-light': '#8A90A0',
                '--clay-shadow': '8px 8px 16px #C8C8C8, -8px -8px 16px #FFFFFF',
                '--clay-shadow-sm': '4px 4px 8px #C8C8C8, -4px -4px 8px #FFFFFF',
                '--clay-inset': 'inset 4px 4px 8px #C8C8C8, inset -4px -4px 8px #FFFFFF'
            }
        },
        red: {
            name: 'Rojo',
            colors: ['#1A0000', '#2A0000', '#950101', '#FF0000'],
            vars: {
                '--bg': '#1A0000', '--bg-soft': '#2A0000', '--surface': '#330000',
                '--primary': '#950101', '--primary-soft': '#CC0000', '--accent': '#FF0000',
                '--text': '#FFFFFF', '--text-soft': '#FFB3B3', '--text-light': '#CC8888',
                '--clay-shadow': '8px 8px 16px #0A0000, -8px -8px 16px #2A0000',
                '--clay-shadow-sm': '4px 4px 8px #0A0000, -4px -4px 8px #2A0000',
                '--clay-inset': 'inset 4px 4px 8px #0A0000, inset -4px -4px 8px #2A0000'
            }
        },
        lime: {
            name: 'Lima',
            colors: ['#0F0F0F', '#1A1A1A', '#C7FF2E', '#AADD00'],
            vars: {
                '--bg': '#0F0F0F', '--bg-soft': '#1A1A1A', '--surface': '#2E2E2E',
                '--primary': '#C7FF2E', '--primary-soft': '#D4FF5C', '--accent': '#AADD00',
                '--text': '#FFFFFF', '--text-soft': '#CCCCCC', '--text-light': '#888888',
                '--clay-shadow': '8px 8px 16px #050505, -8px -8px 16px #1A1A1A',
                '--clay-shadow-sm': '4px 4px 8px #050505, -4px -4px 8px #1A1A1A',
                '--clay-inset': 'inset 4px 4px 8px #050505, inset -4px -4px 8px #1A1A1A'
            }
        }
    },

    render() {
        const savedTheme = DB.get('theme', 'lavender');
        
        const themeCards = Object.keys(this.themes).map(key => {
            const theme = this.themes[key];
            const isSelected = key === savedTheme ? 'selected' : '';
            
            return `
                <div class="theme-card ${isSelected}" data-theme="${key}" onclick="Apariencia.selectTheme('${key}')">
                    <div class="theme-preview">
                        <div style="background:${theme.colors[0]}"></div>
                        <div style="background:${theme.colors[1]}"></div>
                        <div style="background:${theme.colors[2]}"></div>
                        <div style="background:${theme.colors[3]}"></div>
                    </div>
                    <div class="theme-name">${theme.name}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="view active">
                <h2 class="page-title">
                    <svg viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                    Apariencia
                </h2>
                <div class="theme-section">
                    <h3>Paleta de colores</h3>
                    <div class="theme-grid">
                        ${themeCards}
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const savedTheme = DB.get('theme', 'lavender');
        this.applyTheme(savedTheme, false);
    },

    selectTheme(themeName) {
        console.log('🎨 Seleccionando tema:', themeName);
        this.applyTheme(themeName, true);
    },

    applyTheme(themeName, save = true) {
        const theme = this.themes[themeName];
        
        if (!theme) {
            console.error('❌ Tema no encontrado:', themeName);
            return;
        }

        console.log('✅ Aplicando tema:', theme.name);

        const root = document.documentElement;
        Object.entries(theme.vars).forEach(([prop, val]) => {
            root.style.setProperty(prop, val);
        });

        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('selected');
            if (card.getAttribute('data-theme') === themeName) {
                card.classList.add('selected');
            }
        });

        if (save) {
            DB.set('theme', themeName);
            App.showToast(`Tema ${theme.name} aplicado ✓`);
        }
    }
};

// Hacer Apariencia accesible globalmente para onclick
window.Apariencia = Apariencia;

export default Apariencia;