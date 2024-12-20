class Ajedrez {
    constructor() {
        this.tablero = document.getElementById('tablero');
        this.turno = 'blancas';
        this.seleccionada = null;
        this.matrizTablero = Array(8).fill().map(() => Array(8).fill(''));
        this.inicializarTablero();
        this.configurarEventos();
        this.piezasCapturadas = { blancas: [], negras: [] };
    }

    inicializarTablero() {
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

        this.matrizTablero = JSON.parse(JSON.stringify(configuracion));

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
            const filaOrigen = parseInt(origen.dataset.fila);
            const columnaOrigen = parseInt(origen.dataset.columna);
            const filaDestino = parseInt(destino.dataset.fila);
            const columnaDestino = parseInt(destino.dataset.columna);
            
            // Capturar pieza si existe
            if (destino.textContent) {
                const piezaCapturada = destino.textContent;
                const color = this.turno === 'blancas' ? 'blancas' : 'negras';
                this.piezasCapturadas[color].push(piezaCapturada);
                this.actualizarPiezasCapturadas();
            }
            
            // Actualizar matriz y DOM
            this.matrizTablero[filaDestino][columnaDestino] = this.matrizTablero[filaOrigen][columnaOrigen];
            this.matrizTablero[filaOrigen][columnaOrigen] = '';
            
            destino.textContent = origen.textContent;
            origen.textContent = '';
            
            this.turno = this.turno === 'blancas' ? 'negras' : 'blancas';
            this.actualizarTurno();
        }
    }

    actualizarPiezasCapturadas() {
        // Implementar visualización de piezas capturadas
        console.log('Piezas capturadas:', this.piezasCapturadas);
    }

    actualizarTurno() {
        document.getElementById('turno').textContent = `Turno: ${this.turno.charAt(0).toUpperCase() + this.turno.slice(1)}`;
    }

    mostrarMovimientosPosibles(casilla) {
        const fila = parseInt(casilla.dataset.fila);
        const columna = parseInt(casilla.dataset.columna);
        const pieza = this.matrizTablero[fila][columna];
        const esBlanca = '♔♕♖♗♘♙'.includes(pieza);
        
        let movimientos = [];
        
        switch (pieza) {
            case '♙':
            case '♟':
                movimientos = MovimientosPieza.obtenerMovimientosPeon(fila, columna, esBlanca, this.matrizTablero);
                break;
            case '♖':
            case '♜':
                movimientos = MovimientosPieza.obtenerMovimientosTorre(fila, columna, esBlanca, this.matrizTablero);
                break;
            case '♗':
            case '♝':
                movimientos = MovimientosPieza.obtenerMovimientosAlfil(fila, columna, esBlanca, this.matrizTablero);
                break;
            case '♘':
            case '♞':
                movimientos = MovimientosPieza.obtenerMovimientosCaballo(fila, columna, esBlanca, this.matrizTablero);
                break;
            case '♕':
            case '♛':
                movimientos = MovimientosPieza.obtenerMovimientosReina(fila, columna, esBlanca, this.matrizTablero);
                break;
            case '♔':
            case '♚':
                movimientos = MovimientosPieza.obtenerMovimientosRey(fila, columna, esBlanca, this.matrizTablero);
                break;
        }

        movimientos.forEach(([f, c]) => {
            const casillaPosible = this.tablero.children[f * 8 + c];
            casillaPosible.classList.add('movimiento-posible');
        });
    }
}

// Iniciar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new Ajedrez();
});
