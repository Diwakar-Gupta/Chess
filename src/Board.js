import React from 'react';

import Cell from './Cell';
import Moves from './Moves';


const CellStatus = {
    EMPTY: null,
	MOVE: 0,
	KILL: 1,
	SELECTED: 2,
    SAFE: 3,
}

const CellAction = {
    MOVE: 0,
    KILL: 1,
    SELECT: 2,
    SAFE: 3,
}

class Board extends React.Component {

    constructor(props){
        super(props);
        
        const {whiteKingLocation, blackKingLocation} = Board.getKingLocations(props.board);

        this.state = {
            boardStatus : Array(8).fill(null).map(()=>Array(8).fill(null)),
            selected: null,
            pawnPromoteSubscribe: null,
            kingLocation:{
                whiteKingLocation,
                blackKingLocation,
            },
            checkKingCheck:false,
        }

        this.initAgent('white', props.whiteAgent);
        this.initAgent('black', props.blackAgent);
    }
    
    initAgent(color, agent){
        agent.init(
            color,
            (location) => {this.agentMoveListener(color, CellAction.SELECT, location)},
            (from, to) => {this.agentMoveListener(color, CellAction.SAFE, from, to)},
            (from, to) => {this.agentMoveListener(color, CellAction.KILL, from, to)},
            (move) => {this.agentMoveListener(color, CellAction.MOVE, move)},
            () => {this.requestPawnPromotePrompt(color)}
        );
    }

    requestPawnPromotePrompt(color){
        if(color === this.getCurrentTurn()){
            this.setState({
                pawnPromoteSubscribe: {
                    color: color,
                    callBack: (promoteTo) => {
                        this.setState({
                            pawnPromoteSubscribe: null,
                        });
                        this.getAgent().pawnPromoteListener(promoteTo);
                    },
                }
            });
            return true;
        }else{
            return false;
        }
    }

    static getKingLocations(board){
        let whiteKingLocation = null;
        let blackKingLocation = null;

        board.forEach((row, i) => {
            row.forEach((piece, j) => {
                if(piece?.name === 'King'){
                    if(piece.color === 'white'){
                        whiteKingLocation = [i, j];
                    }else{
                        blackKingLocation = [i, j];
                    }
                }
            })
        });
        return {
            whiteKingLocation,
            blackKingLocation
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        if (this.props.playWithoutKing===false && (
            this.state.kingLocation.whiteKingLocation === null ||
            this.state.kingLocation.blackKingLocation === null ||
            this.props.board[this.state.kingLocation.whiteKingLocation[0]][this.state.kingLocation.whiteKingLocation[1]]?.name !== 'King' ||
            this.props.board[this.state.kingLocation.blackKingLocation[0]][this.state.kingLocation.blackKingLocation[1]]?.name !== 'King'
            )) {
            const {whiteKingLocation, blackKingLocation} = Board.getKingLocations(this.props.board);
            this.setState({
                kingLocation:{
                    whiteKingLocation,
                    blackKingLocation,
                }
            });
        }
        if(this.state.checkKingCheck){
            this.isKingInCheck(this.props.whiteIsNext?'white':'black');
            this.setState({
                checkKingCheck:false
            })
        }
    }

    selectPiece(row, col){
        const { board } = this.props;
        const { boardStatus } = this.state;

        if(board[row][col] === null)return;
        if((board[row][col].color === 'white') !== this.props.whiteIsNext )return;

        let boardStatusNew = Array(8).fill(null).map(()=>Array(8).fill(null));
        let selected = null;

        if(boardStatus[row][col] === null){

            let { moves, kills } = board[row][col].getMoves(row, col, board);

            boardStatusNew[row][col] = CellStatus.SELECTED;
            selected = [row, col];
            
            for(let [r, c] of moves){
                boardStatusNew[r][c] = CellStatus.SAFE;
            }
            for(let [r, c] of kills){
                boardStatusNew[r][c] = CellStatus.KILL;
            }
        } else if(boardStatus[row][col] === CellStatus.SELECTED){

        }
        this.setState({
            boardStatus: boardStatusNew,
            selected
        });
    }

    movePiece(move){
        const latestBoard = this.props.movePiece(move);

        this.setState({
            boardStatus : Array(8).fill(null).map(()=>Array(8).fill(null)),
        });

        return latestBoard;
    }

    safeMovePiece(from, [row, col]){
        const obj = new Moves.Safe(this.props.board, from, [row, col]);
        const latestBoard = this.props.movePiece(obj);

        this.setState({
            boardStatus : Array(8).fill(null).map(()=>Array(8).fill(null)),
        });

        return latestBoard;
    }

    killMovePiece(from, to){
        const obj = new Moves.Kill(this.props.board, from, to);
        const latestBoard = this.props.killPiece(obj);
        
        this.setState({
            boardStatus : Array(8).fill(null).map(()=>Array(8).fill(null)),
        });

        return latestBoard;
    }

    postMoveCheck(from, [row, col]){
        this.setState({
            checkKingCheck:true,
        });

        // update king position
        const {selected} = this.state;
        if(this.props.board[selected[0]][selected[1]]?.name === 'King'){
            const kingLocation = {...this.state.kingLocation};

            if(this.props.board[selected[0]][selected[1]]?.color === 'white'){
                kingLocation.whiteKingLocation = [row, col];
            }else{
                kingLocation.blackKingLocation = [row, col];
            }

            this.setState({
                kingLocation,
            });
        }
        
    }

    preMoveCheck(from, to){
    }

    getAgent(opponent=false){
        let color=null;
        if(opponent){
            color = this.props.whiteIsNext?'black':'white';
        }else{
            color = this.props.whiteIsNext?'white':'black';
        }

        if(color === 'white'){
            return this.props.whiteAgent;
        } else {
            return this.props.blackAgent;
        }
    }

    getCurrentTurn(){
        return this.props.whiteIsNext?'white':'black';
    }

    agentMoveListener(color, cellAction, from, to){

        const opponentAgent = this.getAgent(true);

        if(color !== this.getCurrentTurn())return;

        let latersBoard = null;
        switch (cellAction) {

            case CellAction.SELECT:
                this.selectPiece(...from);
                opponentAgent.opponentSelected(from);
                break;
            
            case CellAction.KILL:
                this.preMoveCheck(from, to);
                latersBoard = this.killMovePiece(from, to);
                this.postMoveCheck(from, to, latersBoard);
                opponentAgent.opponentKilled(from, to, latersBoard);
                break;
            
            case CellAction.SAFE:
                this.preMoveCheck(from, to);
                latersBoard = this.safeMovePiece(from, to);
                this.postMoveCheck(from, to, latersBoard);
                opponentAgent.opponentSafe(from, to, latersBoard);
                break;
            
            case CellAction.MOVE:
                const move = from;
                this.preMoveCheck(move.from, move.to);
                latersBoard = this.movePiece(move);
                opponentAgent.opponentMoved(move, latersBoard);
                break;
			
            default:
                
        }
    }

    onCellClick(row, col){
        const { boardStatus } = this.state;

        const currentAgent = this.getAgent();
        
        if(boardStatus[row][col] === CellStatus.SAFE){
            currentAgent.cellClickListener('safe', this.props.board, [row, col]);
        }else if(boardStatus[row][col] === CellStatus.KILL){
            currentAgent.cellClickListener('kill', this.props.board, [row, col]);
        }else if(this.props.board[row][col]?.color === this.getCurrentTurn()){
            currentAgent.cellClickListener('select', this.props.board, [row, col]);
        }
    }

    renderCell(row, col) {
        return (
            <Cell
                key={col}
                selected={this.state.boardStatus[row][col] === CellStatus.SELECTED}
                move={this.state.boardStatus[row][col] === CellStatus.SAFE}
                kill={this.state.boardStatus[row][col] === CellStatus.KILL}
                
                color={(row+col) %2 === 0 ? 'white': 'black'}
                value={ this.props.board[row][col] }
                onClick={() => this.onCellClick(row, col)}
                />
            );
    }

    promotePawnTo(name){
        this.props.promotePawn(this.state.pawnPromoteLocation, name);
        this.setState({
            pawnPromoteLocation: null
        });
    }

    pawnPromoteOptions() {
        const options = ['Queen', 'Rook', 'Bishop', 'Knight'];

        return (
            <React.Fragment>
                <h2 style={{'textAlign': 'center'}}>Promote Pawn</h2>
                {
                    options.map(
                        (name) => {
                            return (
                                <React.Fragment key={name}>
                                    <button onClick={ () => {this.state.pawnPromoteSubscribe.callBack(name);}} className='action listButtons' style={{'width':'100%', 'margin':'0px', 'marginBottom':'5px'}}>{name}</button>
                                    {/* <hr/> */}
                                </React.Fragment>
                            );
                        }
                    )
                }
            </React.Fragment>
        );
    }

    getPiece(location){
        if(location){
            return this.props.board[location[0]][location[1]];
        }
        return null;
    }
    
    isKingInCheck(color){
        console.log('isKingInCheck');
        const kingLocation = this.state.kingLocation[color === 'white'?'whiteKingLocation':'blackKingLocation'];
        const piece = this.getPiece(kingLocation);

        this.props.setKingCheckStatus('black', false);
        this.props.setKingCheckStatus('white', false);

        if(piece){
            const isCheck = piece.isUnderAttack(this.props.board, kingLocation);
            this.props.setKingCheckStatus(piece.color, isCheck);
        }
    }

    render() {

        const { board, localColor } = this.props;
    	const pawnPromotePrompt = this.state.pawnPromoteSubscribe;

        let boardView;
        
        if(localColor === 'white'){
            boardView = board.map((row, i) => {
                return (
                    <div key={i} className="board-row">
                        {
                            row.map((e, j) => this.renderCell(i, j ))
                        }
                    </div>
                );
            });
        }else{
            boardView = board.map(( row , i) => {
                return (
                    <div key={i} className="board-row">
                        {
                            row.map((e, j) => this.renderCell(board.length - 1 - i, row.length - 1 - j))
                        }
                    </div>
                );
            });
        }

        return (
            <div style={{'height':'32rem', 'width':'32rem', 'marginTop': '10px', 'position':'relative'}}>
                { boardView }
                <div className="pawnPromotePrompt" style={{
                    'visibility': pawnPromotePrompt?'visible':'hidden',
                    'position': 'absolute',
                    'left': '25%',
                    'width': '50%',
                    'bottom': '6rem',
                    'background': 'white',
                    'padding': '1rem',
                    }}>
                    {this.pawnPromoteOptions()}
                </div>
            </div>
        );
    }
}

export default Board;
