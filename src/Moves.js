class Move {

    isKill(){
        return false;
    }

    isSafe(){
        return false;
    }

}

class Safe extends Move {

    constructor(board, from, to){
        super();
        this.from = from;
        this.to = to;
        this.movedPiece = board[this.from[0]][this.from[1]];
    }

    isSafe(){
        return true;
    }

    redo(board){
        const movedPiece = this.movedPiece;

        board[this.to[0]][this.to[1]] = movedPiece;
        board[this.from[0]][this.from[1]] = null;
    }

    undo(board){
        const movedPiece = this.movedPiece;

        board[this.to[0]][this.to[1]] = null;
        board[this.from[0]][this.from[1]] = movedPiece;
    }
}

class Kill extends Move {

    constructor(board, from, to){
        super();
        this.from = from;
        this.to = to;
        this.movedPiece = board[this.from[0]][this.from[1]];
        this.killedPiece = board[this.to[0]][this.to[1]];
    }

    isKill(){
        return true;
    }

    getKilledPiece(){
        return this.killedPiece;
    }

    redo(board, killedPiecesNew){
        const movedPiece = this.movedPiece;
        const killedPiece = this.killedPiece;

        // Don't kill king else pass playWithoutKing=true in state
        if(killedPiece.name === 'King')return;

        board[this.to[0]][this.to[1]] = movedPiece;
        board[this.from[0]][this.from[1]] = null;

        if(killedPiece.color === 'black'){
            if(killedPiecesNew.black[killedPiece.name]){
                killedPiecesNew.black[killedPiece.name] = killedPiecesNew.black[killedPiece.name]+1;
            }else{
                killedPiecesNew.black[killedPiece.name]=1;
            }
        }else{
            if(killedPiecesNew.white[killedPiece.name]){
                killedPiecesNew.white[killedPiece.name] = killedPiecesNew.white[killedPiece.name]+1;
            }else{
                killedPiecesNew.white[killedPiece.name]=1;
            }
        }
    }

    undo(board, killedPiecesNew){
        const movedPiece = this.movedPiece;
        const killedPiece = this.killedPiece;

        board[this.from[0]][this.from[1]] = movedPiece;
        board[this.to[0]][this.to[1]] = killedPiece;

        killedPiecesNew[killedPiece.color][killedPiece.name]--;
    }
}

const exportMoves = {
    Kill,
    Safe,
};

export default exportMoves;

export {
    Kill,
    Safe,
};
