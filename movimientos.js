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

    static obtenerMovimientosRey(fila, columna, esBlanca, tablero) {
        const movimientos = [];
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
        return movimientos;
    }

    static dentroTablero(fila, columna) {
        return fila >= 0 && fila < 8 && columna >= 0 && columna < 8;
    }

    static esPiezaEnemiga(pieza, esBlanca) {
        return esBlanca ? '♚♛♜♝♞♟'.includes(pieza) : '♔♕♖♗♘♙'.includes(pieza);
    }
}
