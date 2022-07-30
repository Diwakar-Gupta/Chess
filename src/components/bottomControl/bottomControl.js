import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight, faGear } from '@fortawesome/free-solid-svg-icons';
import PopUp from 'components/util/popup/popup';

import './bottomControl.css';

function BottomControl(props){
    return (
        <div className='bottomControl'>
            <div>
                <button className='action childCenter' status={props.canUndo?'enabled':'disabled'} onClick={props.undoMove}>
                    <FontAwesomeIcon icon={faCaretLeft} />
                </button>
                <button className='action childCenter' status={props.canRedo?'enabled':'disabled'} onClick={props.redoMove}>
                    <FontAwesomeIcon icon={faCaretRight} />
                </button>
            </div>
            <div>
                <PopUp trigger={<button className='action childCenter'><FontAwesomeIcon icon={faGear} /></button>}>
                    <div style={{'background':'white', }}>
                        <button onClick={() => {props.newGame('white')}} className='action listButtons' style={{'width':'100%', 'margin':'0px'}}>New Game White</button>
                        <hr/>
                        <button onClick={() => {props.newGame('black')}} className='action listButtons' style={{'width':'100%', 'margin':'0px'}}>New Game Black</button>
                        <hr/>
                        {/* <button className='action' style={{'width': '100%', 'border': '0px', 'font-size': 'large', 'font-weight': 'bold', 'margin':0}}>Old Game</button> */}
                    </div>
                </PopUp>
            </div>
        </div>
    );
}

export default BottomControl;