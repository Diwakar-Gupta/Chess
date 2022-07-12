import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChessPawn, faChessBishop, faChessKing, faChessKnight, faChessRook, faChessQueen } from '@fortawesome/free-solid-svg-icons';


class ChessPiece{
    constructor(color) {
        this.color = color;
        this.name = null;
    }

    getView(child){
        return (<FontAwesomeIcon icon={child} color={this.color} style={{'height':'auto'}} />);
    }

    isValidMove(boardState, row, col){
        if(row<0 || row>7 || col<0 || col>7 || boardState[row][col]?.color === this.color)return false;
        return true;
    }

    isKillMove(boardState, row, col){
        if(boardState[row][col] == null)return false;
        if(boardState[row][col].color === 'white' && this.color === 'black')return true;
        if(boardState[row][col].color === 'black' && this.color === 'white')return true;
        return false;
    }

    filterMoves(boardState, moves){
        return moves.filter( ([row, col]) => this.isValidMove(boardState, row, col));
    }

    splitMoveKill(boardState, allMoves){
        const moves = [];
        const kills = [];

        for(let [row, col] of allMoves){
            if( boardState[row][col] === null ){
                moves.push([row, col]);
            }else if(boardState[row][col].color === this.color){
                moves.push([row, col]);
            }else if(boardState[row][col].color !== this.color){
                kills.push([row, col])
            }
        }
        return {
            'moves' : moves,
            'kills' : kills
        };
    }

    getAllMoves(row, col, boardState) {
        return null;
    }

    getMoves(row, col, boardState){
        let moves = this.getAllMoves(row, col, boardState);
        moves = this.filterMoves(boardState, moves);
        return this.splitMoveKill(boardState, moves);
    }

    getDirection(){
        return this.color === 'black'?1:-1;
    }
}

class Pawn extends ChessPiece{
    constructor(color){
        super(color);
        this.name = 'Pawn';
    }

    getView(){
        return super.getView(faChessPawn);
    }

    getMoves(row, col, boardState) {
        let moves = [];
        let kills = [];

        if(this.color === 'black'){
            moves.push([row+1, col]);
            if(row === 1 && boardState[row+1][col] === null){
                moves.push([row+2, col]);
            }
            kills.push([row+1, col+1]);
            kills.push([row+1, col-1]);
        }else{
            moves.push([row-1, col]);
            if(row === 7-1 && boardState[row-1][col] === null){
                moves.push([row-2, col]);
            }
            kills.push([row-1, col+1]);
            kills.push([row-1, col-1]);
        }

        moves = this.filterMoves(boardState, moves);
        kills = this.filterMoves(boardState, kills);
        
        moves = this.splitMoveKill(boardState, moves).moves;
        kills = this.splitMoveKill(boardState, kills).kills;

        return {
            'moves' : moves,
            'kills' : kills,
        };
    }
}

class Bishop extends ChessPiece{
    constructor(color){
        super(color);
        this.name = 'Bishop';
    }

    getView(){
        return super.getView(faChessBishop);
    }

    getAllMoves(row, col, boardState) {

        const moves = [];

        for(let xDir of [-1, 1]){
            for(let yDir of [-1, 1]){
                for(let i=row+xDir,j=col+yDir;this.isValidMove(boardState, i, j); i=i+xDir,j=j+yDir){
                    moves.push([i, j]);
                    if(this.isKillMove(boardState, i, j))break;
                }
            }
        }

        return moves;
    }
}

class Knight extends ChessPiece{
    constructor(color){
        super(color);
        this.name = 'Knight';
    }

    getView(){
        return super.getView(faChessKnight);
    }

    getAllMoves(row, col, boardState) {

        const moves = [];

        const allDir = [
            [+1, +2],
            [+1, -2],
            [-1, +2],
            [-1, -2],
            [+2, +1],
            [-2, +1],
            [+2, -1],
            [-2, -1],
        ];

        for(let [x, y] of allDir){
            moves.push([row+x, col+y])
        }

        return moves;
    }
}

class Rook extends ChessPiece{
    constructor(color){
        super(color);
        this.name = 'Rook';
    }

    getView(){
        return super.getView(faChessRook);
    }

    getAllMoves(row, col, boardState) {

        const moves = [];

        const dirs = [
            [+1, 0],
            [-1, 0],
            [0, +1],
            [0, -1],
        ];

        for(let [xDir, yDir] of dirs){
            for(let i=row+xDir,j=col+yDir;this.isValidMove(boardState, i, j); i=i+xDir,j=j+yDir){
                moves.push([i, j]);

                if(this.isKillMove(boardState, i, j))break;
            }
        }

        return moves;
    }
}

class Queen extends ChessPiece{
    constructor(color){
        super(color);
        this.name = 'Queen';
    }

    getView(){
        return super.getView(faChessQueen);
    }

    getAllMoves(row, col, boardState) {

        const moves = [];

        const dirs = [
            [+1, 0],
            [-1, 0],
            [0, +1],
            [0, -1],
        ];

        for(let [xDir, yDir] of dirs){
            for(let i=row+xDir,j=col+yDir;this.isValidMove(boardState, i, j); i=i+xDir,j=j+yDir){
                moves.push([i, j]);

                if(this.isKillMove(boardState, i, j))break;
            }
        }
        for(let xDir of [-1, 1]){
            for(let yDir of [-1, 1]){
                for(let i=row+xDir,j=col+yDir;this.isValidMove(boardState, i, j); i=i+xDir,j=j+yDir){
                    moves.push([i, j]);
                    if(this.isKillMove(boardState, i, j))break;
                }
            }
        }

        return moves;
    }
}

class King extends ChessPiece{
    constructor(color){
        super(color);
        this.name = 'King';
    }

    getView(){
        return super.getView(faChessKing);
    }

    getAllMoves(row, col, boardState) {

        const moves = [];

        const dirs = [
            [+1, 0],
            [-1, 0],
            [0, +1],
            [0, -1],
            [+1, +1],
            [+1, -1],
            [-1, +1],
            [-1, -1],
        ];

        for(let [xDir, yDir] of dirs){
            moves.push([row+xDir, col+yDir]);
        }

        return moves;
    }
}

export default {
    Pawn,
    Bishop,
    Knight,
    Rook,
    Queen,
    King,
};

export {
    Pawn,
    Bishop,
    Knight,
    Rook,
    Queen,
    King,
};


/*
faChess, faChessBishop, faChessBoard, faChessKing, faChessKnight, faChessPawn, faChessQueen, faChessRook
*/