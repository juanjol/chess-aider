class Ajedrez {
    constructor() {
        this.tablero = document.getElementById('tablero');
        this.turno = 'blancas';
        this.tabletMode = true;
        this.peonAPromocionar = null;
        document.body.classList.add('tablet-mode');
        this.seleccionada = null;
        this.matrizTablero = Array(8).fill().map(() => Array(8).fill(''));
        this.configurarEventosIniciales();
        this.piezasCapturadas = { blancas: [], negras: [] };
        this.nombreJugadores = {
            blancas: '',
            negras: ''
        };
        this.juegoTerminado = false;
        this.configurarPanelControl();
        
        // Marcar el turno inicial
        const infoBlancas = document.querySelector('.info-jugador-blanco');
        infoBlancas.classList.add('turno-activo');
    }

    configurarPanelControl() {
        const panel = document.getElementById('panel-control');
        const toggleButton = panel.querySelector('.toggle-button');
        const reiniciarButton = document.getElementById('reiniciar');

        toggleButton.addEventListener('click', () => {
            panel.classList.toggle('visible');
        });

        // Mostrar/ocultar botón de reiniciar según la vista
        const configuracionInicial = document.getElementById('configuracionInicial');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    reiniciarButton.style.display = 
                        configuracionInicial.style.display === 'none' ? 'block' : 'none';
                }
            });
        });
        observer.observe(configuracionInicial, { attributes: true });
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
                const pieza = configuracion[fila][columna];
                if (pieza) {
                    const esNegra = '♚♛♜♝♞♟'.includes(pieza);
                    const contenedorPieza = document.createElement('span');
                    contenedorPieza.textContent = pieza;
                    if (esNegra) {
                        contenedorPieza.className = 'pieza-negra';
                    }
                    casilla.appendChild(contenedorPieza);
                }
                this.tablero.appendChild(casilla);
            }
        }
    }

    configurarEventosIniciales() {
        document.getElementById('tabletMode').addEventListener('click', () => {
            this.tabletMode = !this.tabletMode;
            document.body.classList.toggle('tablet-mode', this.tabletMode);
        });

        // Configurar botón de pantalla completa
        document.getElementById('pantallaCompleta').addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
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
            if (!casilla || !casilla.firstChild) return;

            const piezaTexto = casilla.textContent;
            const esBlanca = '♔♕♖♗♘♙'.includes(piezaTexto);
            const esNegra = '♚♛♜♝♞♟'.includes(piezaTexto);

            if ((this.turno === 'blancas' && esBlanca) || (this.turno === 'negras' && esNegra)) {
                const piezaElement = document.createElement('div');
                piezaElement.textContent = casilla.textContent;
                piezaElement.className = 'pieza-arrastrada' + (casilla.firstChild?.classList.contains('pieza-negra') ? ' pieza-negra' : '');
                document.body.appendChild(piezaElement);
                
                piezaArrastrada = piezaElement;
                casillaOrigen = casilla;
                this.seleccionarPieza(casilla);
                casilla.firstChild.style.opacity = '0.3';
                
                // Actualizar posición inicial
                const rect = casilla.getBoundingClientRect();
                piezaElement.style.left = (e.clientX) + 'px';
                piezaElement.style.top = (e.clientY) + 'px';
            }
        };

        const manejarDrag = (e) => {
            if (!piezaArrastrada) return;
            e.preventDefault();
            
            // Actualizar la posición de la pieza arrastrada
            piezaArrastrada.style.left = (e.clientX) + 'px';
            piezaArrastrada.style.top = (e.clientY) + 'px';
        };

        const manejarFinDrag = (e) => {
            if (!piezaArrastrada) return;

            const casilla = document.elementFromPoint(e.clientX, e.clientY)?.closest('.casilla');
            if (casilla && casilla !== casillaOrigen) {
                this.moverPieza(casillaOrigen, casilla);
            }

            if (piezaArrastrada) {
                piezaArrastrada.remove();
                if (casillaOrigen?.firstChild) {
                    casillaOrigen.firstChild.style.opacity = '1';
                }
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
            
            // Verificar si es un enroque
            const piezaMovida = this.matrizTablero[filaOrigen][columnaOrigen];
            const esRey = piezaMovida === '♔' || piezaMovida === '♚';
            const esEnroque = esRey && Math.abs(columnaDestino - columnaOrigen) === 2;

            // Verificar si es un peón que llega al final
            const pieza = this.matrizTablero[filaOrigen][columnaOrigen];
            const esBlanca = '♔♕♖♗♘♙'.includes(pieza);
            if ((pieza === '♙' && filaDestino === 0) || (pieza === '♟' && filaDestino === 7)) {
                this.mostrarPopupPromocion(esBlanca, filaDestino, columnaDestino);
                this.peonAPromocionar = {
                    origen: origen,
                    destino: destino,
                    fila: filaDestino,
                    columna: columnaDestino,
                    esBlanca: esBlanca
                };
                return;
            }

            // Simular el movimiento para verificar si deja al rey en jaque
            const tableroTemporal = JSON.parse(JSON.stringify(this.matrizTablero));
            tableroTemporal[filaDestino][columnaDestino] = tableroTemporal[filaOrigen][columnaOrigen];
            tableroTemporal[filaOrigen][columnaOrigen] = '';

            const esBlancaTemporal = '♔♕♖♗♘♙'.includes(this.matrizTablero[filaOrigen][columnaOrigen]);
            if (MovimientosPieza.estaEnJaque(tableroTemporal, esBlancaTemporal)) {
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
            
            // Manejar enroque
            if (esEnroque) {
                const esEnroqueCorto = columnaDestino > columnaOrigen;
                const fila = filaOrigen;
                const columnaInicialTorre = esEnroqueCorto ? 7 : 0;
                const columnaFinalTorre = esEnroqueCorto ? 5 : 3;
                
                // Mover torre
                const torre = this.matrizTablero[fila][columnaInicialTorre];
                this.matrizTablero[fila][columnaFinalTorre] = torre;
                this.matrizTablero[fila][columnaInicialTorre] = '';
                
                // Actualizar DOM de la torre
                const casillaInicialTorre = this.tablero.children[fila * 8 + columnaInicialTorre];
                const casillaFinalTorre = this.tablero.children[fila * 8 + columnaFinalTorre];
                const esNegraTorre = casillaInicialTorre.firstChild?.classList.contains('pieza-negra');
                
                const nuevaTorre = document.createElement('span');
                nuevaTorre.textContent = torre;
                if (esNegraTorre) {
                    nuevaTorre.className = 'pieza-negra';
                }
                casillaFinalTorre.innerHTML = '';
                casillaFinalTorre.appendChild(nuevaTorre);
                casillaInicialTorre.innerHTML = '';
            }

            // Actualizar matriz y DOM para la pieza principal
            this.matrizTablero[filaDestino][columnaDestino] = this.matrizTablero[filaOrigen][columnaOrigen];
            this.matrizTablero[filaOrigen][columnaOrigen] = '';
            
            // Preservar la clase pieza-negra si es necesario
            const esNegra = origen.firstChild?.classList.contains('pieza-negra');
            origen.innerHTML = '';
            
            const nuevaPieza = document.createElement('span');
            nuevaPieza.textContent = this.matrizTablero[filaDestino][columnaDestino];
            if (esNegra) {
                nuevaPieza.className = 'pieza-negra';
            }
            destino.innerHTML = '';
            destino.appendChild(nuevaPieza);
            
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
        
        // Actualizar bordes de los contenedores de información
        const infoBlancas = document.querySelector('.info-jugador-blanco');
        const infoNegras = document.querySelector('.info-jugador-negro');
        
        infoBlancas.classList.toggle('turno-activo', this.turno === 'blancas');
        infoNegras.classList.toggle('turno-activo', this.turno === 'negras');
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
        nombreBlancasElement.textContent = `${this.nombreJugadores.blancas} (blancas):`;
        nombreNegrasElement.textContent = `${this.nombreJugadores.negras} (negras):`;
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

    mostrarPopupPromocion(esBlanca, fila, columna) {
        const popup = document.getElementById('popupPromocion');
        const opciones = popup.querySelectorAll('.opcion-promocion');
        
        // Configurar las piezas en el popup
        const piezas = esBlanca ? ['♕', '♖', '♗', '♘'] : ['♛', '♜', '♝', '♞'];
        opciones.forEach((opcion, index) => {
            opcion.textContent = piezas[index];
            if (!esBlanca) {
                opcion.classList.add('pieza-negra');
            } else {
                opcion.classList.remove('pieza-negra');
            }
            
            // Añadir evento click
            opcion.onclick = () => this.promocionarPeon(piezas[index]);
        });
        
        popup.style.display = 'block';
    }

    promocionarPeon(nuevaPieza) {
        if (!this.peonAPromocionar) return;
        
        const { origen, destino, fila, columna, esBlanca } = this.peonAPromocionar;
        
        // Actualizar la matriz y el DOM
        this.matrizTablero[fila][columna] = nuevaPieza;
        
        // Realizar el movimiento original
        if (destino.textContent) {
            const piezaCapturada = destino.textContent;
            const color = this.turno === 'blancas' ? 'blancas' : 'negras';
            this.piezasCapturadas[color].push(piezaCapturada);
            this.actualizarPiezasCapturadas();
        }
        
        // Limpiar la casilla de origen
        this.matrizTablero[parseInt(origen.dataset.fila)][parseInt(origen.dataset.columna)] = '';
        origen.innerHTML = '';
        
        // Colocar la nueva pieza
        const nuevaPiezaSpan = document.createElement('span');
        nuevaPiezaSpan.textContent = nuevaPieza;
        if (!esBlanca) {
            nuevaPiezaSpan.classList.add('pieza-negra');
        }
        destino.innerHTML = '';
        destino.appendChild(nuevaPiezaSpan);
        
        // Ocultar el popup
        document.getElementById('popupPromocion').style.display = 'none';
        
        // Cambiar el turno
        this.turno = this.turno === 'blancas' ? 'negras' : 'blancas';
        this.actualizarTurno();
        
        // Reiniciar el estado
        this.peonAPromocionar = null;
        
        // Verificar jaque
        const esBlancaOponente = this.turno === 'blancas';
        if (MovimientosPieza.estaEnJaque(this.matrizTablero, esBlancaOponente)) {
            if (this.esJaqueMate()) {
                document.getElementById('avisoMate').style.display = 'block';
                const ganador = this.turno === 'negras' ? 'Blancas' : 'Negras';
                setTimeout(() => alert(`¡Jaque Mate! Ganan las ${ganador}`), 100);
                this.juegoTerminado = true;
            } else {
                document.getElementById('avisoJaque').style.display = 'block';
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Ajedrez();
});
