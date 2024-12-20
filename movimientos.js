class MovimientosPieza {
    static obtenerMovimientosPeon(fila, columna, esBlanca, tablero) {
        const movimientos = [];
        const direccion = esBlanca ? -1 : 1;
        const filaInicial = esBlanca ? 6 : 1;

        // Movimiento hacia adelante
        if (this.dentroTablero(fila + direccion, columna) && 
            !tablero[fila + direccion][columna]) {
            movimientos.push([fila + direccion, columna]);
            
            // Movimiento doble inicial
            if (fila === filaInicial && !tablero[fila + direccion * 2][columna]) {
                movimientos.push([fila + direccion * 2, columna]);
            }
        }

        // Capturas en diagonal
        const diagonales = [[direccion, -1], [direccion, 1]];
        for (const [df, dc] of diagonales) {
            const nuevaFila = fila + df;
            const nuevaColumna = columna + dc;
            if (this.dentroTablero(nuevaFila, nuevaColumna)) {
                const piezaDestino = tablero[nuevaFila][nuevaColumna];
                if (piezaDestino && this.esPiezaEnemiga(piezaDestino, esBlanca)) {
                    movimientos.push([nuevaFila, nuevaColumna]);
                }
            }
        }
        return movimientos;
    }

    static obtenerMovimientosTorre(fila, columna, esBlanca, tablero) {
        const movimientos = [];
        const direcciones = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        for (const [df, dc] of direcciones) {
            let nuevaFila = fila + df;
            let nuevaColumna = columna + dc;
            
            while (this.dentroTablero(nuevaFila, nuevaColumna)) {
                const piezaDestino = tablero[nuevaFila][nuevaColumna];
                if (!piezaDestino) {
                    movimientos.push([nuevaFila, nuevaColumna]);
                } else {
                    if (this.esPiezaEnemiga(piezaDestino, esBlanca)) {
                        movimientos.push([nuevaFila, nuevaColumna]);
                    }
                    break;
                }
                nuevaFila += df;
                nuevaColumna += dc;
            }
        }
        return movimientos;
    }

    static obtenerMovimientosAlfil(fila, columna, esBlanca, tablero) {
        const movimientos = [];
        const direcciones = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        for (const [df, dc] of direcciones) {
            let nuevaFila = fila + df;
            let nuevaColumna = columna + dc;
            
            while (this.dentroTablero(nuevaFila, nuevaColumna)) {
                const piezaDestino = tablero[nuevaFila][nuevaColumna];
                if (!piezaDestino) {
                    movimientos.push([nuevaFila, nuevaColumna]);
                } else {
                    if (this.esPiezaEnemiga(piezaDestino, esBlanca)) {
                        movimientos.push([nuevaFila, nuevaColumna]);
                    }
                    break;
                }
                nuevaFila += df;
                nuevaColumna += dc;
            }
        }
        return movimientos;
    }

    static obtenerMovimientosCaballo(fila, columna, esBlanca, tablero) {
        const movimientos = [];
        const saltos = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [df, dc] of saltos) {
            const nuevaFila = fila + df;
            const nuevaColumna = columna + dc;
            
            if (this.dentroTablero(nuevaFila, nuevaColumna)) {
                const piezaDestino = tablero[nuevaFila][nuevaColumna];
                if (!piezaDestino || this.esPiezaEnemiga(piezaDestino, esBlanca)) {
                    movimientos.push([nuevaFila, nuevaColumna]);
                }
            }
        }
        return movimientos;
    }

    static obtenerMovimientosReina(fila, columna, esBlanca, tablero) {
        return [
            ...this.obtenerMovimientosTorre(fila, columna, esBlanca, tablero),
            ...this.obtenerMovimientosAlfil(fila, columna, esBlanca, tablero)
        ];
    }

    static obtenerMovimientosRey(fila, columna, esBlanca, tablero, permitirEnroque = true) {
        const movimientos = [];
        // Movimientos normales del rey
        for (let df = -1; df <= 1; df++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (df === 0 && dc === 0) continue;
                
                const nuevaFila = fila + df;
                const nuevaColumna = columna + dc;
                
                if (this.dentroTablero(nuevaFila, nuevaColumna)) {
                    const piezaDestino = tablero[nuevaFila][nuevaColumna];
                    if (!piezaDestino || this.esPiezaEnemiga(piezaDestino, esBlanca)) {
                        movimientos.push([nuevaFila, nuevaColumna]);
                    }
                }
            }
        }

        // Verificar enroques si está permitido
        if (permitirEnroque) {
            const filaRey = esBlanca ? 7 : 0;
            if (fila === filaRey && columna === 4) {
                // Enroque corto
                if (this.puedeEnrocarCorto(tablero, esBlanca)) {
                    movimientos.push([filaRey, 6]);
                }
                // Enroque largo
                if (this.puedeEnrocarLargo(tablero, esBlanca)) {
                    movimientos.push([filaRey, 2]);
                }
            }
        }
        
        return movimientos;
    }

    static puedeEnrocarCorto(tablero, esBlanca) {
        const fila = esBlanca ? 7 : 0;
        const rey = esBlanca ? '♔' : '♚';
        const torre = esBlanca ? '♖' : '♜';
        
        // Verificar posiciones iniciales
        if (tablero[fila][4] !== rey || tablero[fila][7] !== torre) return false;
        
        // Verificar casillas vacías
        if (tablero[fila][5] || tablero[fila][6]) return false;
        
        // Verificar que el rey no esté en jaque
        if (this.estaEnJaque(tablero, esBlanca)) return false;
        
        // Verificar que las casillas por las que pasa el rey no estén amenazadas
        const tableroTemp = JSON.parse(JSON.stringify(tablero));
        tableroTemp[fila][4] = '';
        
        // Verificar casilla f1/f8
        tableroTemp[fila][5] = rey;
        if (this.estaEnJaque(tableroTemp, esBlanca)) return false;
        tableroTemp[fila][5] = '';
        
        // Verificar casilla g1/g8
        tableroTemp[fila][6] = rey;
        if (this.estaEnJaque(tableroTemp, esBlanca)) return false;
        
        return true;
    }

    static puedeEnrocarLargo(tablero, esBlanca) {
        const fila = esBlanca ? 7 : 0;
        const rey = esBlanca ? '♔' : '♚';
        const torre = esBlanca ? '♖' : '♜';
        
        // Verificar posiciones iniciales
        if (tablero[fila][4] !== rey || tablero[fila][0] !== torre) return false;
        
        // Verificar casillas vacías
        if (tablero[fila][1] || tablero[fila][2] || tablero[fila][3]) return false;
        
        // Verificar que el rey no esté en jaque
        if (this.estaEnJaque(tablero, esBlanca)) return false;
        
        // Verificar que las casillas por las que pasa el rey no estén amenazadas
        const tableroTemp = JSON.parse(JSON.stringify(tablero));
        tableroTemp[fila][4] = '';
        
        // Verificar casilla d1/d8
        tableroTemp[fila][3] = rey;
        if (this.estaEnJaque(tableroTemp, esBlanca)) return false;
        tableroTemp[fila][3] = '';
        
        // Verificar casilla c1/c8
        tableroTemp[fila][2] = rey;
        if (this.estaEnJaque(tableroTemp, esBlanca)) return false;
        
        return true;
    }

    static dentroTablero(fila, columna) {
        return fila >= 0 && fila < 8 && columna >= 0 && columna < 8;
    }

    static esPiezaEnemiga(pieza, esBlanca) {
        return esBlanca ? '♚♛♜♝♞♟'.includes(pieza) : '♔♕♖♗♘♙'.includes(pieza);
    }

    static esRey(pieza) {
        return pieza === '♔' || pieza === '♚';
    }

    static obtenerPosicionRey(tablero, esBlanca) {
        const rey = esBlanca ? '♔' : '♚';
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (tablero[i][j] === rey) {
                    return [i, j];
                }
            }
        }
        return null;
    }

    static estaEnJaque(tablero, esBlanca) {
        const posRey = this.obtenerPosicionRey(tablero, esBlanca);
        if (!posRey) return false;

        // Verificar si alguna pieza enemiga puede atacar al rey
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const pieza = tablero[i][j];
                if (!pieza || this.esPiezaEnemiga(pieza, !esBlanca)) continue;

                const movimientos = this.obtenerMovimientosPieza(i, j, !esBlanca, tablero);
                if (movimientos.some(([f, c]) => f === posRey[0] && c === posRey[1])) {
                    return true;
                }
            }
        }
        return false;
    }

    static obtenerMovimientosPieza(fila, columna, esBlanca, tablero) {
        const pieza = tablero[fila][columna];
        switch (pieza) {
            case '♙':
            case '♟':
                return this.obtenerMovimientosPeon(fila, columna, esBlanca, tablero);
            case '♖':
            case '♜':
                return this.obtenerMovimientosTorre(fila, columna, esBlanca, tablero);
            case '♗':
            case '♝':
                return this.obtenerMovimientosAlfil(fila, columna, esBlanca, tablero);
            case '♘':
            case '♞':
                return this.obtenerMovimientosCaballo(fila, columna, esBlanca, tablero);
            case '♕':
            case '♛':
                return this.obtenerMovimientosReina(fila, columna, esBlanca, tablero);
            case '♔':
            case '♚':
                return this.obtenerMovimientosRey(fila, columna, esBlanca, tablero);
            default:
                return [];
        }
    }
}
