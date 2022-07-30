import React from 'react';

import moveSoundFile from './WoodHardHit.wav';
import Board from './Board';
import { LocalAgent } from './Agent';
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
            localColor: 'white',
            playWithoutKing: true,
            whiteIsNext: true,
            killedPieces:{
                black: {},
                white: {},
            },
            isWhiteKingCheck:false,
            isBlackKingCheck:false,
            agents:{
                white: new LocalAgent(),
                black: new LocalAgent(),
            }
        }
        this.moveAudio = new Audio(moveSoundFile);
    }

    componentDidMount(){
      this.resetGame(initGame);
    }

    resetGame(gameState) {

      let kingCount = 0;
      let boardState = gameState.board.map((row) => row.map(((cell) => {
        if(cell == null)return null;
        if(cell.name === 'King')kingCount++;
        return new Pieces[cell.name](cell.color);
      })))

      this.setState({
        whiteIsNext: gameState.whiteIsNext,
        localColor: gameState.localColor,
        boardState,
        playWithoutKing:kingCount < 2,
        history: [],
        stepNumber: 0,
        killedPieces:{
            black: {},
            white: {},
        },
      });
    }
    

    execureMove(move) {
        const { boardState, killedPieces } = this.state;

        let boardStateNew = boardState.map((row) => row.slice());

        if(move.isKill()){
            let killedPiecesNew = {...killedPieces};
            move.redo(boardStateNew, killedPiecesNew);
            this.setState({
                killedPieces : killedPiecesNew
            });
        }else{
            move.redo(boardStateNew);
        }

        return boardStateNew
    }
    
    movePiece(moveObj) {
        const history = this.state.history;
        const whiteIsNext = this.state.whiteIsNext;

        const historyNew = history.slice(0, this.state.stepNumber);
        historyNew.push(moveObj);
        
        this.moveAudio.play();
        
        const boardStateNew = this.execureMove(moveObj);
        
        this.setState({
            history: historyNew,
            stepNumber: historyNew.length,
            whiteIsNext: !whiteIsNext,
            boardState : boardStateNew,
        });

        return boardStateNew;
    }
    
    undoMove() {
        const { history, stepNumber, whiteIsNext, boardState, killedPieces } = this.state;

        if(stepNumber===0)return;

        const move = history[stepNumber-1];
        
        let boardStateNew = boardState.map((row) => row.slice());
        
        if(move.isKill()){
            let killedPiecesNew = {...killedPieces};
            move.undo(boardStateNew, killedPiecesNew);
            this.setState({
                killedPieces : killedPiecesNew
            });
        }else{
            move.undo(boardStateNew);
        }

        this.setState({
            stepNumber: stepNumber-1,
            whiteIsNext: !whiteIsNext,
            boardState : boardStateNew,
        });
    }

    promotePawn(location, promoteTo){
        const currentPiece = this.state.boardState[location[0]][location[1]];
        const boardStateNew = this.state.boardState.map((row) => row.slice());

        boardStateNew[location[0]][location[1]] = new Pieces[promoteTo](currentPiece.color);

        this.setState({
            boardState:boardStateNew
        });
    }

    setKingCheckStatus(color, isCheck){
        if(color === 'white'){
            this.setState({
                isWhiteKingCheck:isCheck,
            })
        }else{
            this.setState({
                isBlackKingCheck:isCheck,
            })
        }
    }
    
    redoMove() {
        const { history, stepNumber, whiteIsNext } = this.state;

        if(stepNumber === history.length)return;

        const moveObj = history[stepNumber];

        const boardStateNew = this.execureMove(moveObj);

        const state = {
            stepNumber: stepNumber+1,
            whiteIsNext: !whiteIsNext,
            boardState : boardStateNew,
        };

        this.setState(state);

        return boardStateNew;
    }

    render() {

        const { boardState, whiteIsNext, playWithoutKing } = this.state;
        const canUndo = this.state.stepNumber>0;
        const canRedo = this.state.stepNumber<this.state.history.length;

        return (
        <div className="game">
            <div className="game-info game-info-left">
                <LostPieces color='black' pieces={this.state.killedPieces.black}/>
                {
                    this.state.isBlackKingCheck?(
                        <span style={{'color':'white'}}>black king in check</span>
                    ):(
                        <span></span>
                    )
                }
            </div>
            <div className="game-board">
                <Board
                    board = {boardState}
                    localColor = { this.state.localColor }
                    whiteAgent = { this.state.agents.white }
                    blackAgent = { this.state.agents.black }
                    playWithoutKing = {playWithoutKing}
                    whiteIsNext={whiteIsNext}
                    movePiece = { (obj) => { this.movePiece(obj) } }
                    killPiece = { (obj) => { this.movePiece(obj) } }
                    setKingCheckStatus = { (color, isCheck) => this.setKingCheckStatus(color, isCheck) }
                    promotePawn = { (location, promoteTo) => {this.promotePawn(location, promoteTo); }  }
                    onClick={(i) => this.handleClick(i)}
                />
                <div className="game-info game-info-bottom">
                    <BottomControl canUndo={canUndo} canRedo={canRedo} newGame={(color) => {let initGameColor = {...initGame, localColor:color};this.resetGame(initGameColor);}} undoMove={() => {this.undoMove()}} redoMove={() => {this.redoMove()}} />
                </div>
            </div>
            <div className="game-info game-info-right">
                <LostPieces color='white' pieces={this.state.killedPieces.white}/>
                {
                    this.state.isWhiteKingCheck?(
                        <span style={{'color':'white'}}>white king in check</span>
                    ):(
                        <span></span>
                    )
                }
            </div>
        </div>
        );
    }

    
}

export default Game;
