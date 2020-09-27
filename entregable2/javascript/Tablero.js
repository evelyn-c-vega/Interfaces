import Casilla from '../javascript/Casilla.js';

export default class Tablero {

    #tablero;
    #posicion;
    #altoCasilla;
    #anchoCasilla;
    #filas;
    #columnas;

    constructor(area, filas, columnas) {
        this.#filas = filas;
        this.#columnas = columnas;
        this.#posicion = area;
        this.#altoCasilla = this.height /filas;
        this.#anchoCasilla = this.width /columnas;
        this.#tablero = new Array();
        
        for (let i = 0, y = this.posY; i < filas; i++, y += this.#altoCasilla) { //FIXME: si lo hago al reves da error
            this.#tablero.push(new Array());
            for (let j = 0, x = this.posX; j < columnas; j++, x += this.#anchoCasilla) {
                this.#tablero[i].push(new Casilla(x, y, this.#altoCasilla,this.#anchoCasilla, i , j));
            }
        }
    }

    get tablero() { return this.#tablero; }
    get posX() { return this.#posicion.x; }
    get posY() { return this.#posicion.y; }
    get width() { return this.#posicion.xFinal - this.posX; }
    get height() { return this.#posicion.yFinal - this.posY; }
    get espacios(){ return (this.#filas * this.#columnas); }

    addFicha(x, y, ficha) {//posicion que cae
        let posX = this.sectorCorrespondienteX(x);//sector
        let casillaY = this.sectorCorrespondienteY(posX);
        if(casillaY != null){
            let posY = casillaY.fila;//casilla.sector
            this.#tablero[posY][posX].ficha = ficha;//primero filas despues columnas
            if (this.revisarGanador(posX,posY, ficha)) {//le paso posicion en el tablero de la ultima ficha
                console.log("ganador : ", ficha.jugador);
            }
            return true;
        } else {
            return false;
        }
    }

    sectorCorrespondienteX(x){
        let ubicacion = 0;
        for (let i = this.#posicion.x, j = i+this.#anchoCasilla, k = 0; k <= this.#columnas; i+= this.#anchoCasilla, j+= this.#anchoCasilla, k++ ) {
            //i -> pos inicio casilla actual en x
            //j -> pos fin casilla actual en x
            //k -> pos en arreglo de la casilla en x
            if((x >= i) && (x <= j)){
                ubicacion = k;
                break;
            }
        }
        return ubicacion;
    }

    sectorCorrespondienteY(x){
        for (const casilla of this.iteradorColumna(x)) {
            if (casilla.esVacia()) {
                return casilla;// lugar para insertar
            }
        }
        return null; //no hay casilla libre
    }

    /**
     * Iterador de las casillas de la columna x, en orden inverso (de la ultima (la mas abajo) a la primera)
     * en js un iterador se hace con una funcion con antes un *, para devolver un elemento se usa la palabra clave 'yield'
     */
    * iteradorColumna(x) {
        for (let i = this.#filas -1; i >= 0; i--) { // recorro filas al reve
            yield this.#tablero[i][x]; // devuelvo la casilla en la columna 'x' de la fila actual
        }
    }
    
    * iteradorRevisionColumna(x){
        for(let i = x; i < this.#filas; i++){ //desde mi posicion hacia abajo, porque voy a ser la ultima posicion de la ficha ingresada 
            yield this.#tablero[i][x];
        }
    }
    * iteradorRevisionfilaDerecha(y){
        for(let i = y; i < this.#columnas; i++){ //desde mi posicion hacia derecha
            yield this.#tablero[y][i];
        }
    }
    * iteradorRevisionfilaIzquierda(y){
        for(let i = y; i >= 0; i--){ //desde mi posicion hacia izquierda
            yield this.#tablero[y][i];
        }
    }

    * iteradorRevisionDiagonalCrecienteSup(x,y){
        for(let i = x, j = y; i < this.#filas -1, j >= 0; i++, j--){ //desde mi posicion hacia arriba diagonal derecha
            console.log("DiagonalCrecienteSup",i,j);
            yield this.#tablero[j][i]  //y,x -> alto, ancho
        }
    }
    * iteradorRevisionDiagonalCrecienteInf(x,y){
        for(let i = x, j = y; i >= 0 , j < this.#filas -1; i--, j++){ //desde mi posicion hacia abajo diagonal derecha
            console.log("DiagonalCrecienteInf",i,j);
            yield this.#tablero[j][i] 
        }
    }
    * iteradorRevisionDiagonalDecrecienteInf(x,y){
        for(let i = x, j = y ; i < this.#filas -1, j < this.#columnas -1; i++, j++){ //desde mi posicion hacia abajo diagonal derecha
            console.log("DiagonalDecrecienteInf",i,j);
            yield this.#tablero[j][i] 
        }
    }
    * iteradorRevisionDiagonalDecrecienteSup(x,y){
        for(let i = x , j = y ; i >= 0, j >= 0; i--, j--){ //desde mi posicion hacia arriba diagonal izquierda
            console.log("DiagonalDecrecienteSup",i,j);
            yield this.#tablero[j][i] 
        }
    }

    contadorGenerico(x,y,jugador,iterador){
        let contador = 0; 
        for (const casilla of  iterador(x,y)) {
            if ((casilla != null) && (!casilla.esVacia())) {
                if(casilla.ficha.jugador == jugador){
                    contador ++;
                }
            }
        }
        return contador;
    }

    contadorDiagonalCreciente(x,y,jugador){
        let diagCrecienteSup = () => this.iteradorRevisionDiagonalCrecienteSup(x,y);
        let diagCrecienteInf = () => this.iteradorRevisionDiagonalCrecienteInf(x,y);
        let valor1 = 0, valor2 = 0;
        valor1 = this.contadorGenerico(x,y,jugador,diagCrecienteSup);
        valor2 = this.contadorGenerico(x,y,jugador,diagCrecienteInf);

        return valor1 + valor2;
    }

    contadorDiagonalDecreciente(x,y,jugador){
        let diagDecrecienteSup = () => this.iteradorRevisionDiagonalDecrecienteSup(x,y);
        let diagDecrecienteInf = () => this.iteradorRevisionDiagonalDecrecienteInf(x,y);
        let valor1 = 0, valor2 = 0;
        valor1 = this.contadorGenerico(x,y,jugador,diagDecrecienteSup);
        valor2 = this.contadorGenerico(x,y,jugador,diagDecrecienteInf);
        
        return valor1 + valor2;
    }

    contadorHorizontal(x,y,jugador){
        let horizontalDer = () => this.iteradorRevisionfilaDerecha(y);
        let horizontalIzq = () => this.iteradorRevisionfilaIzquierda(y);
        
        let valor1 = this.contadorGenerico(x,y,jugador,horizontalDer);
        let valor2 = this.contadorGenerico(x,y,jugador,horizontalIzq);
        console.log("horiz", valor1 + valor2);
        return valor1 + valor2;
    }

    contadorVertical(x,y,jugador){
        let fila = () => this.iteradorRevisionColumna(x);
        let valor = this.contadorGenerico(x,y,jugador,fila);
        console.log("vertic",valor);
        return valor;
    }

    revisarGanador(x,y,ficha){ //cuando ingreso ficha, a partir de su posicion, retorno si es ficha de ganador
        let jugador = ficha.jugador;
        if( ( this.contadorDiagonalCreciente(x,y,jugador) >= 4) ||  (this.contadorDiagonalDecreciente(x,y,jugador) >= 4) ||  (this.contadorHorizontal(x,y,jugador) >= 4) || (this.contadorVertical(x,y,jugador) >=4)){
            return true;
        } else{
            return false;
        }
    }

    dibujar(context) {
        for (const fila of this.#tablero) {
            for (const casilla of fila) {
                casilla.dibujar(context);
            }
        }
    }
}