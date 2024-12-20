class Ajedrez {
    constructor() {
        this.tablero = document.getElementById('tablero');
        this.turno = 'blancas';
        this.tabletMode = false;
        this.seleccionada = null;
        this.matrizTablero = Array(8).fill().map(() => Array(8).fill(''));
        this.configurarEventosIniciales();
        this.piezasCapturadas = { blancas: [], negras: [] };
        this.nombreJugadores = {
            blancas: '',
            negras: ''
        };
        this.juegoTerminado = false;
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

    configurarEventosIniciales() {
        document.getElementById('tabletMode').addEventListener('click', () => {
            this.tabletMode = !this.tabletMode;
            document.body.classList.toggle('tablet-mode', this.tabletMode);
            document.getElementById('tabletMode').textContent = 
                this.tabletMode ? 'Modo Normal' : 'Modo Tablet';
        });

        document.getElementById('comenzarPartida').addEventListener('click', () => {
            // Obtener configuración
            this.nombreJugadores.blancas = document.getElementById('nombreBlancas').value;
            this.nombreJugadores.negras = document.getElementById('nombreNegras').value;
            const tiempoBlancas = parseInt(document.getElementById('tiempoBlancas').value);
            const tiempoNegras = parseInt(document.getElementById('tiempoNegras').value);
            
            // Configurar tiempos
            this.tiempoInicial = {
                blancas: tiempoBlancas * 60,
                negras: tiempoNegras * 60
            };
            this.tiempoRestante = {
                blancas: this.tiempoInicial.blancas,
                negras: this.tiempoInicial.negras
            };
            
            // Ocultar configuración y mostrar juego
            document.getElementById('configuracionInicial').style.display = 'none';
            document.getElementById('contenedorJuego').style.display = 'flex';
            
            // Iniciar juego
            this.inicializarTablero();
            this.configurarEventosJuego();
            this.iniciarTemporizador();
        });
    }

    configurarEventosJuego() {
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
            // Mostrar configuración inicial con valores actuales
            document.getElementById('nombreBlancas').value = this.nombreJugadores.blancas;
            document.getElementById('nombreNegras').value = this.nombreJugadores.negras;
            document.getElementById('tiempoBlancas').value = Math.floor(this.tiempoInicial.blancas / 60);
            document.getElementById('tiempoNegras').value = Math.floor(this.tiempoInicial.negras / 60);
            
            // Ocultar juego y mostrar configuración
            document.getElementById('contenedorJuego').style.display = 'none';
            document.getElementById('configuracionInicial').style.display = 'block';
            
            // Limpiar el estado del juego
            clearInterval(this.temporizador);
            this.tablero.innerHTML = '';
            this.turno = 'blancas';
            this.piezasCapturadas = { blancas: [], negras: [] };
            this.actualizarPiezasCapturadas();
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

            // Simular el movimiento para verificar si deja al rey en jaque
            const tableroTemporal = JSON.parse(JSON.stringify(this.matrizTablero));
            tableroTemporal[filaDestino][columnaDestino] = tableroTemporal[filaOrigen][columnaOrigen];
            tableroTemporal[filaOrigen][columnaOrigen] = '';

            const esBlanca = '♔♕♖♗♘♙'.includes(this.matrizTablero[filaOrigen][columnaOrigen]);
            if (MovimientosPieza.estaEnJaque(tableroTemporal, esBlanca)) {
                alert('¡Movimiento inválido! Tu rey quedaría en jaque');
                return;
            }

            // Ocultar avisos al mover
            document.getElementById('avisoJaque').style.display = 'none';
            document.getElementById('avisoMate').style.display = 'none';

            // Cambiar el temporizador al mover
            this.cambiarTemporizador();
            
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
            
            // Verificar si el movimiento pone en jaque al oponente
            const esBlancaOponente = this.turno === 'negras';
            if (MovimientosPieza.estaEnJaque(this.matrizTablero, esBlancaOponente)) {
                if (this.esJaqueMate()) {
                    document.getElementById('avisoMate').style.display = 'block';
                    const ganador = this.turno === 'blancas' ? 'Blancas' : 'Negras';
                    setTimeout(() => alert(`¡Jaque Mate! Ganan las ${ganador}`), 100);
                    this.juegoTerminado = true;
                } else {
                    document.getElementById('avisoJaque').style.display = 'block';
                }
            } else {
                document.getElementById('avisoJaque').style.display = 'none';
                document.getElementById('avisoMate').style.display = 'none';
            }

            this.turno = this.turno === 'blancas' ? 'negras' : 'blancas';
            this.actualizarTurno();
        }
    }

    esJaqueMate() {
        const esBlanca = this.turno === 'blancas';
        const rey = esBlanca ? '♔' : '♚';
        
        // Encontrar posición del rey
        let posRey = null;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.matrizTablero[i][j] === rey) {
                    posRey = [i, j];
                    break;
                }
            }
            if (posRey) break;
        }
        
        if (!posRey) return false;

        // Verificar si hay algún movimiento legal para cualquier pieza del jugador actual
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const pieza = this.matrizTablero[i][j];
                if (!pieza) continue;
                
                const esBlancaPieza = '♔♕♖♗♘♙'.includes(pieza);
                if (esBlancaPieza === esBlanca) {
                    const movimientos = this.obtenerMovimientosLegales(i, j);
                    if (movimientos.length > 0) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    obtenerMovimientosLegales(fila, columna) {
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
        
        return movimientos;
    }

    reiniciarJuego() {
        clearInterval(this.temporizador);
        this.tablero.innerHTML = '';
        this.inicializarTablero();
        this.turno = 'blancas';
        this.actualizarTurno();
        this.piezasCapturadas = { blancas: [], negras: [] };
        this.actualizarPiezasCapturadas();
        this.reiniciarTemporizador();
    }

    actualizarPiezasCapturadas() {
        const contenedorBlancas = document.getElementById('piezasCapturadasBlancas');
        const contenedorNegras = document.getElementById('piezasCapturadasNegras');
        
        contenedorBlancas.innerHTML = this.piezasCapturadas.blancas.join('');
        contenedorNegras.innerHTML = this.piezasCapturadas.negras.join('');
    }

    actualizarTurno() {
        const turnoElement = document.getElementById('turno');
        turnoElement.textContent = `Turno: ${this.turno.charAt(0).toUpperCase() + this.turno.slice(1)}`;
        turnoElement.className = this.turno === 'negras' ? 'turno-negras' : '';
    }

    mostrarMovimientosPosibles(casilla) {
        const fila = parseInt(casilla.dataset.fila);
        const columna = parseInt(casilla.dataset.columna);
        const pieza = this.matrizTablero[fila][columna];
        const esBlanca = '♔♕♖♗♘♙'.includes(pieza);
        
        // Obtener todos los movimientos posibles
        const movimientos = MovimientosPieza.obtenerMovimientosPieza(fila, columna, esBlanca, this.matrizTablero);
        
        // Filtrar movimientos que dejarían al rey en jaque
        const movimientosLegales = movimientos.filter(([nuevaFila, nuevaColumna]) => {
            const tableroTemporal = JSON.parse(JSON.stringify(this.matrizTablero));
            tableroTemporal[nuevaFila][nuevaColumna] = tableroTemporal[fila][columna];
            tableroTemporal[fila][columna] = '';
            return !MovimientosPieza.estaEnJaque(tableroTemporal, esBlanca);
        });

        // Mostrar los movimientos legales
        movimientosLegales.forEach(([f, c]) => {
            const casillaPosible = this.tablero.children[f * 8 + c];
            casillaPosible.classList.add('movimiento-posible');
        });
    }
    iniciarTemporizador() {
        if (this.temporizador) {
            clearInterval(this.temporizador);
        }
        this.temporizador = setInterval(() => {
            if (this.tiempoRestante[this.turno] > 0) {
                this.tiempoRestante[this.turno]--;
                this.actualizarVisualizacionTemporizador();
                
                if (this.tiempoRestante[this.turno] <= 0) {
                    this.finalizarPartidaPorTiempo();
                }
            }
        }, 1000);
        this.actualizarVisualizacionTemporizador();
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

        const tiempoBlancasElement = document.querySelector('.temporizador:first-child span:last-child');
        const tiempoNegrasElement = document.querySelector('.temporizador:last-child span:last-child');
        const nombreBlancasElement = document.querySelector('.temporizador:first-child span:first-child');
        const nombreNegrasElement = document.querySelector('.temporizador:last-child span:first-child');

        tiempoBlancasElement.textContent = formatearTiempo(this.tiempoRestante.blancas);
        tiempoNegrasElement.textContent = formatearTiempo(this.tiempoRestante.negras);
        nombreBlancasElement.textContent = `${this.nombreJugadores.blancas}:`;
        nombreNegrasElement.textContent = `${this.nombreJugadores.negras}:`;
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

document.addEventListener('DOMContentLoaded', () => {
    new Ajedrez();
});
