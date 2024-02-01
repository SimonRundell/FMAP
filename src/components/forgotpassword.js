import React, {useState} from 'react';
// import md5 from 'crypto-js/md5';
import { Input } from 'antd';
import { getConfig } from './config';


function isValidEmail(email) {
    // Regular expression for a basic email validation
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

//   function generateMD5(input) {
//     // Using MD5 from crypto-js library
//     const md5Hash = md5(input);
//     const md5HexString = md5Hash.toString();
  
//     return md5HexString;
//   }

  

  function ForgotPassword({currentActivity, setCurrentActivity, setUserHash}) {

    const [forgotEmail, setForgotEmail] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        resetPassword(forgotEmail);
    }

    const forgotEmailChange = (event) => {
        setForgotEmail(event.target.value);

    }

    function resetPassword(resetEmail) {

    
        if (! isValidEmail(resetEmail)) {
            setCurrentActivity("LOGINAFTERFORGOTFAIL")
            return;
        }
    
        var jsonData = {
            action: 'forgotPassword',
            userMail: resetEmail,
        };
    
        console.log(JSON.stringify(jsonData));

    
        fetch(getConfig('REACT_APP_FMAP_API_URL'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        })
        .then(response => response.json()) 
        .then(responseData => {
    
            // console.log(responseData);
              
            if (responseData['status']==='SUCCESS') {
                  
                var htmlOutput = '<html><body>';
                htmlOutput += '<p>Click this linK</p>';
                htmlOutput += '<p>' + getConfig('REACT_APP_FMAP_API_URL') + '?action=reset&data=' + responseData['message'] +'</p>';
                htmlOutput += '<p>to reset your password. (nicer message soon)</p>';
                htmlOutput += '</body></html>';
    
                var jsonData = {
                    action: 'sendEmail',
                    To: resetEmail,
                    Subject: "FMAP Password Recovery",
                    Body: htmlOutput,
                };
            
                console.log(JSON.stringify(jsonData));
                const REACT_APP_FMAP_API_URL = getConfig('REACT_APP_FMAP_API_URL');
            
                fetch(REACT_APP_FMAP_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jsonData),
                })
                .then(response => response.json()) 
                .then( responseData => {
    
                    setCurrentActivity("PASSWORDRESETAUTH");
                        
                });
            }
        })
     
    
    } // reset password

    return (
        <>
        <div className="login-box">
            <div className='text-information'>Please enter your eMail and you will be sent a message enabling you to reset your password.</div>
            <div><Input type="text" value={forgotEmail} onChange={forgotEmailChange} className="text-input" width="30" id="forgotEmail" placeholder="Email" />
                <button className="button" onClick={handleSubmit}>Reset</button>
            </div>
        </div>
        </>
    )

  }

  export default ForgotPassword;