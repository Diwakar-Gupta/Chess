import React from 'react';

import Board from './Board';
import { Pawn } from './Pieces';

import './index.css';
import './App.css';


class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            history: [],
            boardState: Array(8).fill(null).map(()=>Array(8).fill(null)),
            stepNumber: 0,
            whiteIsNext: true,
            killedPieces:{
                black:[],
                white:[],
            }
        }
    }

    componentDidMount(){
      this.resetGame();
    }

    resetGame() {
      let boardState = Array(8).fill(null).map(()=>Array(8).fill(null));
      
      for(let j=0;j<8;j++){
        boardState[1][j] = new Pawn('black');
        boardState[6][j] = new Pawn('white');
      }

      this.setState({
        boardState
      });
    }

    movePiece(from, to) {
        const { boardState, whiteIsNext, history } = this.state;

        let boardStateNew = boardState.map((row) => row.slice());

        const movedPiece = boardStateNew[from[0]][from[1]];

        boardStateNew[to[0]][to[1]] = movedPiece;
        boardStateNew[from[0]][from[1]] = null;

        history.push({
            from:from,
            to:to,
            movedPiece: movedPiece,
            killedPiece: null
        });

        this.setState({
            boardState: boardStateNew,
            whiteIsNext : !whiteIsNext
        });
    }
    
    killPiece(from, to) {
        const { boardState, whiteIsNext, history, killedPieces } = this.state;

        let boardStateNew = boardState.map((row) => row.slice());
        const movedPiece = boardStateNew[from[0]][from[1]];
        const killedPiece = boardState[to[0]][to[1]];

        boardStateNew[to[0]][to[1]] = movedPiece;
        boardStateNew[from[0]][from[1]] = null;

        history.push({
            from:from,
            to:to,
            movedPiece: movedPiece,
            killedPiece: killedPiece,
        });

        this.setState({
            boardState: boardStateNew,
            whiteIsNext : !whiteIsNext
        });
    }
    

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            whiteIsNext: (step % 2) === 0,
        });
    }
    
    render() {

        const { boardState, whiteIsNext } = this.state;

        return (
        <div className="game">
            <div className="game-board">
                <Board
                    board = {boardState}
                    whiteIsNext={whiteIsNext}
                    movePiece = { (from, to) => { this.movePiece(from, to) } }
                    killPiece = { (from, to) => { this.killPiece(from, to) } }
                    onClick={(i) => this.handleClick(i)}
                />
            </div>
            <div className="game-info">
                <div>{ 'status' }</div>
                <ol>{ 'moves' }</ol>
            </div>
        </div>
        );
    }
}

export default App;