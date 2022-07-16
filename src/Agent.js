class Agent{
    init(color, select, move, kill){
        this.color = color;
        this.selectCell = select;
        this.moveCell = move;
        this.killCell = kill;
    }

    // override this function from Local Agent.
    cellClickListener(type, location){}

    // receives after opponent moves & kills.
    opponentMoved(from, to, board){console.log(this.color, 'opponentMoved')}
    opponentKilled(from, to, board){console.log(this.color, 'opponentKilled')}
    opponentSelected(location){console.log(this.color, 'opponentSelected')}
}

class LocalAgent extends Agent {

    cellClickListener(type, location){

        if(type === 'select'){
            this.selectedLocation = location;
            this.selectCell(location);
        }else if(type === 'move'){
            this.moveCell(this.selectedLocation, location);
        }else if(type === 'kill'){
            this.killCell(this.selectedLocation, location);
        }
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