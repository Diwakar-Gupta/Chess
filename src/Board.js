import React from 'react';

import Cell from './Cell';


const CellStatus = {
	MOVE: 0,
	KILL: 1,
	SELECTED: 2,
}

class Board extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            boardStatus : Array(8).fill(null).map(()=>Array(8).fill(null)),
            selected: null,
            showPromotePawn: null,
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
                boardStatusNew[r][c] = CellStatus.MOVE;
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

    didPawnReachedEnd(row, col){
        const {selected} = this.state;
        if(this.props.board[selected[0]][selected[1]]?.name === 'Pawn' && (row === 0 || row === 7 ))return true;
        return false;
    }

    movePiece(row, col){
        this.props.movePiece(this.state.selected, [row, col]);

        this.setState({
            boardStatus : Array(8).fill(null).map(()=>Array(8).fill(null)),
        });
        this.postMoveCheck(row, col);
    }

    killPiece(row, col){
        this.props.killPiece(this.state.selected, [row, col]);
        
        this.setState({
            boardStatus : Array(8).fill(null).map(()=>Array(8).fill(null)),
        });
        this.postMoveCheck(row, col);
    }

    postMoveCheck(row, col){
        if(this.didPawnReachedEnd(row, col)){
            this.setState({
                showPromotePawn: [row, col],
            });
        }
    }

    onCellClick(row, col){
        const { boardStatus } = this.state;
        
        if(boardStatus[row][col] === CellStatus.MOVE){
            this.movePiece(row, col);
        }else if(boardStatus[row][col] === CellStatus.KILL){
            this.killPiece(row, col);
        }else {
            this.selectPiece(row, col);
        }
    }

    renderCell(row, col) {
        return (
            <Cell
                key={col}
                selected={this.state.boardStatus[row][col] === CellStatus.SELECTED}
                move={this.state.boardStatus[row][col] === CellStatus.MOVE}
                kill={this.state.boardStatus[row][col] === CellStatus.KILL}
                
                color={(row+col) %2 === 0 ? 'white': 'black'}
                value={ this.props.board[row][col] }
                onClick={() => this.onCellClick(row, col)}
                />
            );
    }

    promotePawnTo(name){
        this.props.promotePawn(this.state.showPromotePawn, name);
        this.setState({
            showPromotePawn: null
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
                                    <button onClick={ () => {this.promotePawnTo(name);}} className='action listButtons' style={{'width':'100%', 'margin':'0px', 'marginBottom':'5px'}}>{name}</button>
                                    {/* <hr/> */}
                                </React.Fragment>
                            );
                        }
                    )
                }
            </React.Fragment>
        );
    }

    render() {

        const { board } = this.props;

        return (
            <div style={{'height':'32rem', 'width':'32rem', 'marginTop': '10px', 'position':'relative'}}>
                {
                    board.map((row, i) => {
                        return (
                            <div key={i} className="board-row">
                                {
                                    row.map((e, j) => this.renderCell(i, j) )
                                }
                            </div>
                        );
                    })
                }
                <div className="pawnPromotePrompt" style={{
                    'visibility':this.state.showPromotePawn?'visible':'hidden',
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