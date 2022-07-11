import './Cell.css';


function Cell(props) {

    let innerClass = '';
    if(props.move){
        innerClass = 'cell-move';
    }else if(props.kill){
        innerClass = 'cell-kill';
    }

    return (
        <button
            className={`cell ${props.color} ${props.selected?'selected':''} ${props.move?'move':''} ${props.kill?'kill':''}`}
            onClick={ props.onClick }
        >
            {/* { props.value?.name } */}
            {props.value?.getView()}
            <div className={innerClass}></div>
        </button>
    );
}

export default Cell;