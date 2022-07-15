import React from 'react';

import Board from './Board';
import Pieces from './Pieces';
import BottomControl from 'components/bottomControl/bottomControl';

import './index.css';
import './Game.css';

import initGame from './initGameState.json';


function LostPieces({ pieces, color }){

    let allPieces = [["Pawn","Knight","Bishop"],["Rook","Queen","King"]];

    return (
        <div className='pieces-tray'>
            {
                allPieces.map((list, i) => {
                    return (
                        <div key={i}>
                            {
                                list.map((name) => {
                                    return pieces[name]>0?
                                    <div key={name}>
                                        {new Pieces[name](color).getView()}
                                        <span>
                                            {pieces[name]}
                                        </span>
                                    </div>
                                    :
                                    <div key={name}></div>;
                                })
                            }
                        </div>
                    );
                })
            }
        </div>
    );
}


class Game extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            history: [],
            stepNumber: 0,
            boardState: Array(8).fill(null).map(()=>Array(8).fill(null)),
            whiteIsNext: true,
            killedPieces:{
                black: {},
                white: {},
            },
            whiteCheck:false,
            blackCheck:false,
        }
        this.moveAudio = new Audio(process.env.PUBLIC_URL + '/WoodHardHit.wav');
    }

    componentDidMount(){
      this.resetGame(initGame);
    }

    resetGame(gameState) {

      let boardState = gameState.board.map((row) => row.map(((cell) => {
        if(cell == null)return null;
        return new Pieces[cell.name](cell.color);
      })))

      this.setState({
        whiteIsNext: gameState.whiteIsNext,
        boardState,
        history: [],
        stepNumber: 0,
        killedPieces:{
            black: {},
            white: {},
        },
      });
    }

    movePiece(from, to) {
        const { boardState, whiteIsNext, history } = this.state;

        let boardStateNew = boardState.map((row) => row.slice());

        const movedPiece = boardStateNew[from[0]][from[1]];

        boardStateNew[to[0]][to[1]] = movedPiece;
        boardStateNew[from[0]][from[1]] = null;

        const historyNew = history.slice(0, this.state.stepNumber);
        historyNew.push({
            from:from,
            to:to,
            movedPiece: movedPiece,
            killedPiece: null
        });

        this.moveAudio.play();

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

        const historyNew = history.slice(0, this.state.stepNumber);
        historyNew.push({
            from:from,
            to:to,
            movedPiece: movedPiece,
            killedPiece: killedPiece,
        });

        this.moveAudio.play();

        this.setState({
            history: historyNew,
            stepNumber: historyNew.length,
            boardState: boardStateNew,
            whiteIsNext : !whiteIsNext,
            killedPieces : killedPiecesNew
        });
    }
    
    undoMove() {
        const { history, stepNumber, whiteIsNext, boardState, killedPieces } = this.state;

        if(stepNumber===0)return;

        const move = history[stepNumber-1];
        
        let boardStateNew = boardState.map((row) => row.slice());
        
        boardStateNew[move.from[0]][move.from[1]] = move.movedPiece;
        boardStateNew[move.to[0]][move.to[1]] = move.killedPiece;
        
        const state = {
            stepNumber: stepNumber-1,
            whiteIsNext: !whiteIsNext,
            boardState : boardStateNew,
        };

        if(move.killedPiece){
            let killedPiecesNew = {...killedPieces};
            killedPiecesNew[move.killedPiece.color][move.killedPiece.name]--;
            state['killedPieces'] = killedPiecesNew;
        }

        this.setState(state);
    }

    promotePawn(location, promoteTo){
        const currentPiece = this.state.boardState[location[0]][location[1]];
        const boardStateNew = this.state.boardState.map((row) => row.slice());

        boardStateNew[location[0]][location[1]] = new Pieces[promoteTo](currentPiece.color);

        this.setState({
            boardState:boardStateNew
        });
    }
    
    redoMove() {
        const { history, stepNumber, whiteIsNext, boardState } = this.state;

        if(stepNumber === history.length)return;

        const move = history[stepNumber];

        let boardStateNew = boardState.map((row) => row.slice());

        boardStateNew[move.from[0]][move.from[1]] = null;
        boardStateNew[move.to[0]][move.to[1]] = move.movedPiece;
        
        const state = {
            stepNumber: stepNumber+1,
            whiteIsNext: !whiteIsNext,
            boardState : boardStateNew,
        };

        if(move.killedPiece){
            let killedPiecesNew = {...this.state.killedPieces};
            killedPiecesNew[move.killedPiece.color][move.killedPiece.name]++;
            state['killedPieces'] = killedPiecesNew;
        }

        this.setState(state);
    }

    render() {

        const { boardState, whiteIsNext } = this.state;
        const canUndo = this.state.stepNumber>0;
        const canRedo = this.state.stepNumber<this.state.history.length;

        return (
        <div className="game">
            <div className="game-info game-info-left">
                <LostPieces color='black' pieces={this.state.killedPieces.black}/>
            </div>
            <div className="game-board">
                <Board
                    board = {boardState}
                    whiteIsNext={whiteIsNext}
                    movePiece = { (from, to) => { this.movePiece(from, to) } }
                    killPiece = { (from, to) => { this.killPiece(from, to) } }
                    promotePawn = { (location, promoteTo) => {this.promotePawn(location, promoteTo); }  }
                    onClick={(i) => this.handleClick(i)}
                />
                <div className="game-info game-info-bottom">
                    <BottomControl canUndo={canUndo} canRedo={canRedo} newGame={(color) => {this.resetGame(initGame);}} undoMove={() => {this.undoMove()}} redoMove={() => {this.redoMove()}} />
                </div>
            </div>
            <div className="game-info game-info-right">
                <LostPieces color='white' pieces={this.state.killedPieces.white}/>
            </div>
        </div>
        );
    }

    
}

export default Game;
