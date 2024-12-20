class Ajedrez {
    constructor() {
        this.tablero = document.getElementById('tablero');
        this.turno = 'blancas';
        this.seleccionada = null;
        this.inicializarTablero();
        this.configurarEventos();
    }

    inicializarTablero() {
        // Configuración inicial de piezas
        const configuracion = [
            ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
            ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
        ];

        for (let fila = 0; fila < 8; fila++) {
            for (let columna = 0; columna < 8; columna++) {
                const casilla = document.createElement('div');
                casilla.className = `casilla ${(fila + columna) % 2 === 0 ? 'clara' : 'oscura'}`;
                casilla.dataset.fila = fila;
                casilla.dataset.columna = columna;
                casilla.textContent = configuracion[fila][columna];
                this.tablero.appendChild(casilla);
            }
        }
    }

    configurarEventos() {
        this.tablero.addEventListener('click', (e) => {
            const casilla = e.target.closest('.casilla');
            if (!casilla) return;

            const pieza = casilla.textContent;
            const esBlanca = '♔♕♖♗♘♙'.includes(pieza);
            const esNegra = '♚♛♜♝♞♟'.includes(pieza);

            if (this.seleccionada) {
                // Mover pieza
                if (casilla !== this.seleccionada) {
                    this.moverPieza(this.seleccionada, casilla);
                }
                this.limpiarSeleccion();
            } else if ((this.turno === 'blancas' && esBlanca) || 
                      (this.turno === 'negras' && esNegra)) {
                this.seleccionarPieza(casilla);
            }
        });

        document.getElementById('reiniciar').addEventListener('click', () => {
            this.tablero.innerHTML = '';
            this.inicializarTablero();
            this.turno = 'blancas';
            this.actualizarTurno();
        });
    }

    seleccionarPieza(casilla) {
        casilla.classList.add('seleccionada');
        this.seleccionada = casilla;
        this.mostrarMovimientosPosibles(casilla);
    }

    limpiarSeleccion() {
        this.seleccionada?.classList.remove('seleccionada');
        this.seleccionada = null;
        document.querySelectorAll('.movimiento-posible').forEach(casilla => {
            casilla.classList.remove('movimiento-posible');
        });
    }

    moverPieza(origen, destino) {
        if (destino.classList.contains('movimiento-posible')) {
            destino.textContent = origen.textContent;
            origen.textContent = '';
            this.turno = this.turno === 'blancas' ? 'negras' : 'blancas';
            this.actualizarTurno();
        }
    }

    actualizarTurno() {
        document.getElementById('turno').textContent = `Turno: ${this.turno.charAt(0).toUpperCase() + this.turno.slice(1)}`;
    }

    mostrarMovimientosPosibles(casilla) {
        // Implementación básica de movimientos posibles
        // Esto se puede expandir para incluir las reglas específicas de cada pieza
        const fila = parseInt(casilla.dataset.fila);
        const columna = parseInt(casilla.dataset.columna);
        
        // Ejemplo simple: mostrar casillas adyacentes como movimientos posibles
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const nuevaFila = fila + i;
                const nuevaColumna = columna + j;
                
                if (nuevaFila >= 0 && nuevaFila < 8 && nuevaColumna >= 0 && nuevaColumna < 8) {
                    const casillaPosible = this.tablero.children[nuevaFila * 8 + nuevaColumna];
                    if (!casillaPosible.textContent) {
                        casillaPosible.classList.add('movimiento-posible');
                    }
                }
            }
        }
    }
}

// Iniciar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new Ajedrez();
});
