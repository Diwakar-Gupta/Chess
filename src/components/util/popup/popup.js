import React, { useState }  from 'react';

import './popup.css';

function PopUp(props){
    const [visible, setVisiblity] = useState(false);

    const toggleVisiblity = () => {
        setVisiblity(!visible);
    };

    return (
        <div style={{'position':'relative'}}>
            <div className='trigger' onClick={toggleVisiblity}>{props.trigger}</div>
            <div className="popupContent" onClick={toggleVisiblity} style={{'visibility':visible?'visible':'hidden'}}>{props.children}</div>
        </div>
    );
}

export default PopUp;
