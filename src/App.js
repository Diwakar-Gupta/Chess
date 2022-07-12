import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';

import Board from './Board';
import Pieces from './Pieces';

import './index.css';
import './App.css';

import initGame from './initGameState.json';

class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            history: [],
            stepNumber: 0,
            boardState: Array(8).fill(null).map(()=>Array(8).fill(null)),
            whiteIsNext: true,
            killedPieces:{
                black:[],
                white:[],
            }
        }
    }

    componentDidMount(){
      this.resetGame(initGame);
    }

    resetGame(gameState) {

      let boardState = gameState.map((row) => row.map(((cell) => {
        if(cell == null)return null;
        return new Pieces[cell.name](cell.color);
      })))

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

        const historyNew = this.state.history.slice(0, this.state.stepNumber);
        historyNew.push({
            from:from,
            to:to,
            movedPiece: movedPiece,
            killedPiece: null
        });

        this.setState({
            history: historyNew,
            stepNumber: historyNew.length,
            boardState: boardStateNew,
            whiteIsNext : !whiteIsNext
        });
    }
    
    killPiece(from, to) {
        const { boardState, whiteIsNext, history, killedPieces } = this.state;

        let boardStateNew = boardState.map((row) => row.slice());
        let killedPiecesNew = {...killedPieces};
        const movedPiece = boardStateNew[from[0]][from[1]];
        const killedPiece = boardState[to[0]][to[1]];

        boardStateNew[to[0]][to[1]] = movedPiece;
        boardStateNew[from[0]][from[1]] = null;

        if(killedPiece.color === 'black'){
            killedPiecesNew.black.push(killedPiece);
        }else{
            killedPiecesNew.white.push(killedPiece);
        }

        const historyNew = this.state.history.slice(0, this.state.stepNumber);
        historyNew.push({
            from:from,
            to:to,
            movedPiece: movedPiece,
            killedPiece: killedPiece,
        });

        this.setState({
            history: historyNew,
            stepNumber: historyNew.length,
            boardState: boardStateNew,
            whiteIsNext : !whiteIsNext,
            killedPieces : killedPiecesNew
        });
    }
    
    undoMove() {
        const { history, stepNumber, whiteIsNext, boardState } = this.state;

        if(stepNumber==0)return;

        const move = history[stepNumber-1];

        let boardStateNew = boardState.map((row) => row.slice());

        boardStateNew[move.from[0]][move.from[1]] = move.movedPiece;
        boardStateNew[move.to[0]][move.to[1]] = move.killedPiece;

        this.setState({
            stepNumber: stepNumber-1,
            whiteIsNext: !whiteIsNext,
            boardState : boardStateNew,
        });
    }
    
    redoMove() {
        const { history, stepNumber, whiteIsNext, boardState } = this.state;

        if(stepNumber == history.length)return;

        const move = history[stepNumber];

        let boardStateNew = boardState.map((row) => row.slice());

        boardStateNew[move.from[0]][move.from[1]] = null;
        boardStateNew[move.to[0]][move.to[1]] = move.movedPiece;

        this.setState({
            stepNumber: stepNumber+1,
            whiteIsNext: !whiteIsNext,
            boardState : boardStateNew,
        });
    }
    
    
    render() {

        const { boardState, whiteIsNext } = this.state;

        return (
        <div className="game">
            <div className="game-info game-info-left">
            </div>
            <div className="game-board">
                <Board
                    board = {boardState}
                    whiteIsNext={whiteIsNext}
                    movePiece = { (from, to) => { this.movePiece(from, to) } }
                    killPiece = { (from, to) => { this.killPiece(from, to) } }
                    onClick={(i) => this.handleClick(i)}
                />
                <div className="game-info game-info-bottom">
                    <BottomControl undoMove={() => {this.undoMove()}} redoMove={() => {this.redoMove()}} />
                </div>
            </div>
            <div className="game-info game-info-right">
            </div>
        </div>
        );
    }

    
}

function BottomControl(props){
    return (
        <div>
            <div>
                <button onClick={props.undoMove}><FontAwesomeIcon icon={faCaretLeft} /></button>
                <button onClick={props.redoMove}><FontAwesomeIcon icon={faCaretRight} /></button>
            </div>
        </div>
    );
}
export default App;