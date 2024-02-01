import React, {useState} from 'react';
import md5 from 'crypto-js/md5';
import { Input } from 'antd';
import { getConfig } from './config';

function isValidEmail(email) {
    // Regular expression for a basic email validation
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function generateMD5(input) {
    // Using MD5 from crypto-js library
    const md5Hash = md5(input);
    const md5HexString = md5Hash.toString();
  
    return md5HexString;
  }

function ChangePassword ({apiUrl, currentActivity, setCurrentActivity, setUserHash}) {

    const [resetemail, setResetEmail] = useState('');
    const [resetpass1, setResetPass1] = useState('');
    const [resetpass2, setResetPass2] = useState('');

    const resetemailChange = (event) => {
        setResetEmail(event.target.value);
    }

    const resetpass1Change = (event) => {
        setResetPass1(event.target.value);
    }

    const resetpass2Change = (event) => {
        setResetPass2(event.target.value);
    }

    const handleChangePassword = (event) => {
        event.preventDefault();
        resetPassword(resetemail, resetpass2);
    }

    function resetPassword(resetemail, resetpass2) {
        // validate password
        if (resetpass1 !== resetpass2) {
            return;
        }
    
        if (!isValidEmail(resetemail)) {

            return;
        }
    
        // proceed to insert into database
        const uName = resetemail;
        const pWrd  = generateMD5(resetpass2);
    
        var jsonData = {
            action: 'changePassword',
            userName: uName,
            passwordHash: pWrd,
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
            if (responseData['status']==='SUCCESS') {
    
                // Use GET to send the data
    
                var htmlOutput = '<html><body>';
                htmlOutput += '<p>Your password has been changed</p>';
                htmlOutput += '<p>(nicer message soon)</p>';
                htmlOutput += '</body></html>';
    
                var jsonData = {
                    action: 'sendEmail',
                    To: uName,
                    Subject: "Password Changed",
                    Body: htmlOutput,
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
                .then( responseData => {
    
                    setCurrentActivity("LOGINAFTERPASSCHANGE")
                    
                });
            }
        })
        .catch(error => {
            console.log("Error in Change Password");
        });
    
    
      } //change password
    

    return (
        <>
        <div id="changePasswordDialog" className="change-password-box">
        Change your password
        <div className="register-form" >
            <Input id="resetemail" value={resetemail} onChange={resetemailChange} type="text" placeholder="eMail" />
            <Input id="resetpass1" value={resetpass1} onChange={resetpass1Change} type="password" placeholder="Password" />
            <Input id="resetpass2" value={resetpass2} onChange={resetpass2Change} type="password" placeholder="Retype Password" />
            <div id="resetpass2Strength" className="password-strength">Password Strength: </div>
            <button id="changePasswordButton" onClick={handleChangePassword}>Change Password</button>
        </div>
    </div>
        </>
    )
}

export default ChangePassword;