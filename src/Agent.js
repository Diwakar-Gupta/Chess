import Moves from './Moves';

class Agent{
    init(color, select, safe, kill, move, requestPawnPromotePrompt){
        this.color = color;
        this.selectCell = select;
        this.safeCell = safe;
        this.killCell = kill;
        this.moveCell = move;
        this.requestPawnPromotePrompt = requestPawnPromotePrompt;
    }

    willPawnReachEnd(board, from, to){
        if(board[from[0]][from[1]]?.name === 'Pawn' && (to[0] === 0 || to[0] === 7 ))return true;
        return false;
    }

    // override this function from Local Agent.
    cellClickListener(type, location){}

    // receives after opponent moves & kills.
    opponentMoved(move, board){console.log(this.color, 'opponentMoved')}
    opponentSafe(from, to, board){console.log(this.color, 'opponentSafe')}
    opponentKilled(from, to, board){console.log(this.color, 'opponentKilled')}
    opponentSelected(location){console.log(this.color, 'opponentSelected')}
}

class LocalAgent extends Agent {

    cellClickListener(type, board, location){

        if(type === 'select'){
            this.selectedLocation = location;
            this.selectCell(location);
        }else if(type === 'safe'){
            if(this.willPawnReachEnd(board, this.selectedLocation, location)){
                this.pawnPromoteBaseMove = new Moves.Safe(board, this.selectedLocation, location);
                this.requestPawnPromotePrompt();
            }else{
                this.safeCell(this.selectedLocation, location);
            }
        }else if(type === 'kill'){
            if(this.willPawnReachEnd(board, this.selectedLocation, location)){
                this.pawnPromoteBaseMove = new Moves.Kill(board, this.selectedLocation, location);
                this.requestPawnPromotePrompt();
            }else{
                this.killCell(this.selectedLocation, location);
            }
        }
    }

    pawnPromoteListener(promoteTo){
        const board = this.pawnPromoteBaseMove.board;
        const from = this.pawnPromoteBaseMove.from;
        const to = this.pawnPromoteBaseMove.to;
        
        const move = new Moves.PawnPromote(board, from, to, this.pawnPromoteBaseMove, promoteTo);

        this.moveCell(move);
    }

}

const exportPieces = {
    Agent,
    LocalAgent,
};

export default exportPieces;

export {
    Agent,
    LocalAgent,
};
