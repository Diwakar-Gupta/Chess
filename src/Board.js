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
            selected: null
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

    movePiece(row, col){
        this.props.movePiece(this.state.selected, [row, col]);

        this.setState({
            boardStatus : Array(8).fill(null).map(()=>Array(8).fill(null)),
        });
    }

    killPiece(row, col){
        this.props.killPiece(this.state.selected, [row, col]);
        
        this.setState({
            boardStatus : Array(8).fill(null).map(()=>Array(8).fill(null)),
        });
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

    render() {

        const { board } = this.props;

        return (
            <div>
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
            </div>
        );
    }
}

export default Board;