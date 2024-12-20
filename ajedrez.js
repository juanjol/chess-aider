class Ajedrez {
    constructor() {
        this.tablero = document.getElementById('tablero');
        this.turno = 'blancas';
        this.seleccionada = null;
        this.matrizTablero = Array(8).fill().map(() => Array(8).fill(''));
        this.inicializarTablero();
        this.configurarEventos();
        this.piezasCapturadas = { blancas: [], negras: [] };
        this.tiempoInicial = 600; // 10 minutos en segundos
        this.tiempoRestante = {
            blancas: this.tiempoInicial,
            negras: this.tiempoInicial
        };
        this.temporizador = null;
        this.iniciarTemporizador();
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
        let piezaArrastrada = null;
        let casillaOrigen = null;

        const manejarInicioDrag = (e) => {
            const casilla = e.target.closest('.casilla');
            if (!casilla) return;

            const pieza = casilla.textContent;
            const esBlanca = '♔♕♖♗♘♙'.includes(pieza);
            const esNegra = '♚♛♜♝♞♟'.includes(pieza);

            if ((this.turno === 'blancas' && esBlanca) || (this.turno === 'negras' && esNegra)) {
                const pieza = document.createElement('div');
                pieza.textContent = casilla.textContent;
                pieza.className = 'pieza-arrastrada';
                document.body.appendChild(pieza);
                
                piezaArrastrada = pieza;
                casillaOrigen = casilla;
                this.seleccionarPieza(casilla);
                casilla.style.opacity = '0.3';
            }
        };

        const manejarDrag = (e) => {
            if (!piezaArrastrada) return;
            e.preventDefault();
            
            // Actualizar la posición de la pieza arrastrada
            piezaArrastrada.style.left = e.clientX + 'px';
            piezaArrastrada.style.top = e.clientY + 'px';
        };

        const manejarFinDrag = (e) => {
            if (!piezaArrastrada) return;

            const casilla = e.target.closest('.casilla');
            if (casilla && casilla !== casillaOrigen) {
                this.moverPieza(casillaOrigen, casilla);
            }

            if (piezaArrastrada) {
                piezaArrastrada.remove();
                casillaOrigen.style.opacity = '1';
                piezaArrastrada = null;
            }
            casillaOrigen = null;
            this.limpiarSeleccion();
        };

        // Configurar eventos de drag and drop
        this.tablero.addEventListener('mousedown', manejarInicioDrag);
        this.tablero.addEventListener('dragstart', (e) => e.preventDefault());
        document.addEventListener('mousemove', manejarDrag);
        document.addEventListener('mouseup', manejarFinDrag);

        // Mantener el evento de click para compatibilidad
        this.tablero.addEventListener('click', (e) => {
            const casilla = e.target.closest('.casilla');
            if (!casilla) return;

            const pieza = casilla.textContent;
            const esBlanca = '♔♕♖♗♘♙'.includes(pieza);
            const esNegra = '♚♛♜♝♞♟'.includes(pieza);

            if (this.seleccionada) {
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
            this.reiniciarTemporizador();
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
            // Cambiar el temporizador al mover
            this.cambiarTemporizador();
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
    iniciarTemporizador() {
        this.temporizador = setInterval(() => {
            this.tiempoRestante[this.turno]--;
            this.actualizarVisualizacionTemporizador();
            
            if (this.tiempoRestante[this.turno] <= 0) {
                this.finalizarPartidaPorTiempo();
            }
        }, 1000);
    }

    cambiarTemporizador() {
        // No es necesario detener/reiniciar el intervalo
        // Solo cambiamos el turno y el temporizador seguirá
        // descontando del jugador correcto
    }

    reiniciarTemporizador() {
        clearInterval(this.temporizador);
        this.tiempoRestante = {
            blancas: this.tiempoInicial,
            negras: this.tiempoInicial
        };
        this.actualizarVisualizacionTemporizador();
        this.iniciarTemporizador();
    }

    actualizarVisualizacionTemporizador() {
        const formatearTiempo = (segundos) => {
            const minutos = Math.floor(segundos / 60);
            const segs = segundos % 60;
            return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
        };

        document.getElementById('tiempoBlancas').textContent = 
            formatearTiempo(this.tiempoRestante.blancas);
        document.getElementById('tiempoNegras').textContent = 
            formatearTiempo(this.tiempoRestante.negras);
    }

    finalizarPartidaPorTiempo() {
        clearInterval(this.temporizador);
        const ganador = this.turno === 'blancas' ? 'Negras' : 'Blancas';
        alert(`¡Tiempo agotado! Ganan las ${ganador}`);
        this.reiniciarTemporizador();
        this.tablero.innerHTML = '';
        this.inicializarTablero();
        this.turno = 'blancas';
        this.actualizarTurno();
    }
}

// Iniciar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new Ajedrez();
});
