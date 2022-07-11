import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChessBishop } from '@fortawesome/free-solid-svg-icons';


class ChessPiece{
    constructor(color) {
        this.color = color;
        this.name = null;
    }

    filterMoves(boardState, moves){
        return moves.filter( ([row, col]) => {
            if(row<0 || row>7 || col<0 || col>7 || boardState[row][col]?.color === this.color)return false;
            return true;
        } );
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
        return [];
    }

    getMoves(row, col, boardState){
        let moves = this.getAllMoves(row, col, boardState);
        moves = this.filterMoves(boardState, moves);
        return this.splitMoveKill(moves);
    }
}

class Pawn extends ChessPiece{
    constructor(color){
        super(color);
        this.name = 'Pawn';
    }

    getView(){
        return (<FontAwesomeIcon icon={faChessBishop} color={this.color} style={{'height':'3rem'}} />);
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

export {
    Pawn,
};


/*
faChess, faChessBishop, faChessBoard, faChessKing, faChessKnight, faChessPawn, faChessQueen, faChessRook
*/