import React from 'react';
import { getConfig } from './config';

function getCookie(name) {
        let cookies = document.cookie.split(';');
        for(let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            let parts = cookie.split('=');
            if (parts[0].trim() === name) {
                return parts[1];
            }
        }
        return "";
      }

function DebugInfo(props) {

return (
<>
<div className='debug-info'>Debug: API: <span className='showAsLink'>{getConfig('CM_NODE')}</span>   Activity: <span className='showAsLink'>{props.currentActivity}</span>   userHash: <span className='showAsLink'>{getCookie('userHash')}</span></div>
</>
)

};

export default DebugInfo;
