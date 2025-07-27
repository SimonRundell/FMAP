
import React, { useState } from 'react';
import md5 from 'crypto-js/md5';
import { Card, Input } from 'antd';
import '../App.css';
import { getConfig } from './config';

function generateMD5(input) {
    // Using MD5 from crypto-js library
    const md5Hash = md5(input);
    const md5HexString = md5Hash.toString();
  
    return md5HexString;
  }

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function Login({currentActivity, setCurrentActivity, setUserHash, loginPromptText}) {

    const [loginName, setLoginName] = useState("");
    const [password, setPassword] = useState("");
    const [loginPrompt, setLoginPrompt] = useState(loginPromptText);
    const [isLoadingLogin, setIsLoadingLogin] = useState(false);

    const registerNew = () => {
        setCurrentActivity("REGISTER");       
    }

    const forgotPassword = () => {
        setCurrentActivity("FORGOTPASSWORD");
    }

    const handleLoginNameChange = (event) => {
        setLoginName(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        loginUser();
    };


    const loginUser = () => {
        
        setIsLoadingLogin(true);

        var loginPassword=generateMD5(password);
    
        var jsonData = {
            userName: loginName,
            passwordHash: loginPassword,
        };
    
        console.log(JSON.stringify(jsonData));
            
        fetch(getConfig('CM_NODE')+'/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        })
        .then(response => response.json()) 
        .then(responseData => {
    
           console.log(responseData);
    
            if (responseData['status']==='SUCCESS') {
    
                setCurrentActivity("SORTED");
                setLoginName('');
                setPassword('');
                setUserHash(responseData['message']); 
                setCookie("userHash", responseData['message'], 1)              
            } else {
                // login must have failed
                setLoginName('');
                setPassword('');
                document.getElementById('loginEmail').focus();
                setLoginPrompt(responseData['message']);
                setCookie("userHash", '', 1)
    
            }})
            .finally(() => {
                setIsLoadingLogin(false);
            });
    } // loginUser

    function renderLoginPrompt() {
        if (loginPrompt !== 'User Login') {
          return <div className="warning">{loginPrompt}</div>;
        }
        return <div>{loginPrompt}</div>;
      }

    return (
        <>
        <div className="frontpage-container">
            
                <div className="login-box" id="loginBox">
                    <div className="login-form">
                    {isLoadingLogin && (
                    <div className="wait-image">Logging in...<img src="./assets/wait.gif" alt="Please Wait..." /></div>
                )}
                        <div id="loginPrompt" className="login-prompt">
                        {renderLoginPrompt()}
                        </div>
                        <Input id="loginEmail" value={loginName} type="text" placeholder="Username" onChange={handleLoginNameChange}/>
                        <Input id="loginPassword" value={password} type="password" placeholder="Password" onChange={handlePasswordChange}/>
                        <button id="loginButton" className="custom-antd-button" onClick={handleSubmit}>Login</button>
                    </div>
                        <span id="forgotPassword" onClick={forgotPassword} className="login-link-text">Forgot Password?</span>&nbsp;&nbsp;
                        <span id="registerNew" onClick={registerNew} className="login-link-text">Register</span>
                </div>
                <div>&nbsp;</div>
            <div className="card-centred">
                <Card title="About Find Me a Priest!" bordered={false} style={{ width: 300 }}>
                    <p>THIS IS A DEMONSTRATION / PUBLIC TEST site. It is filled with 1500 Fake Clergy randomly generated 
                    to test the system. These clergy may have the wrong names or titles for their stated gender or any
                    number of other anomolies because they are just fake names. Postcodes have been selected at random
                    from the ONS database and if by some freak chance it is your postcode it is not intentional.
                    </p>
                    <p>However, you can register on this site and test it for me. I'd be very grateful for feedback
                        to <a href="mailto:simon@codemonkey.design">simon@codemonkey.design</a> if you see any issues or
                        have suggestions for improvements.
                    </p>
                    <p>It's hard to find clergy in your area to cover services, 
                    so this site has been created (by a retired clergyman) to
                    bring available clergy and parishes in need of cover together.</p>
                    <p>Both parishes and available clergy can register <span className='showAsLink' onClick={registerNew}>here</span> and then
                    clergy are able to list their availability and location and
                    parishes can search for them. 
                    </p>
                    <p>Best of all, it is FREE!</p>
                    <p className='profile-label'>Created by @frsimon for CodeMonkey Design Ltd.<br />
                    Websites handcrafted by Clever Apes.<br /> &copy; 2024 CodeMonkey Design Ltd. All Rights Reserved.</p>
                </Card>
            </div>
            </div>
          <div className='profile-label'>&copy; 2024 CodeMonkey Design Ltd.  |  20 Clifton Ave, Plymouth, UK, PL7 4BJ  |  Tel: 07976 802123   |  eMail: <a href="mailto:support@codemonkey.design">support@codemonkey.design</a></div>
        </>
    )

}

export default Login;