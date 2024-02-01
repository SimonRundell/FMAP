
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

function Login({currentActivity, setCurrentActivity, setUserHash, loginPrompt}) {

    const [loginName, setLoginName] = useState("");
    const [password, setPassword] = useState("");

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
        
        var loginPassword=generateMD5(password);
    
        var jsonData = {
            action: 'login',
            userName: loginName,
            passwordHash: loginPassword,
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
    
           console.log(responseData);
    
            if (responseData['status']==='SUCCESS') {
    
                setCurrentActivity("SORTED");
                document.getElementById('loginEmail').value='';
                document.getElementById('loginPassword').value='';
                setUserHash(responseData['message']); 
                setCookie("userHash", responseData['message'], 1)              
            } else {
                // login must have failed
                document.getElementById('loginEmail').value='';
                document.getElementById('loginPassword').value='';
                document.getElementById('loginEmail').focus();
                document.getElementById('loginPrompt').innerHTML='<font color="#FF0000">' + responseData['message'] + '</font>';
                setCookie("userHash", '', 1)
    
            }});
    
    
    
    } // loginUser

    return (
        <>
        <div className="frontpage-container">
            <div className="frontpage-container-column">
                <div className="login-box" id="loginBox">
                    <div className="login-form">
                        <div id="loginPrompt" className="login-prompt">{loginPrompt}</div>
                        <Input id="loginEmail" value={loginName} type="text" placeholder="Username" onChange={handleLoginNameChange}/>
                        <Input id="loginPassword" value={password} type="password" placeholder="Password" onChange={handlePasswordChange}/>
                        <button id="loginButton" className="custom-antd-button" onClick={handleSubmit}>Login</button>
                    </div>
                        <span id="forgotPassword" onClick={forgotPassword} className="login-link-text">Forgot Password?</span>&nbsp;&nbsp;
                        <span id="registerNew" onClick={registerNew} className="login-link-text">Register</span>
                </div>
            </div>
            <div className="frontpage-container-column">
            <Card title="About Find Me a Priest!" bordered={false} style={{ width: 400 }}>
                It's hard to find clergy in your area to cover services, 
                so this site has been created (by a retired clergyman) to
                bring available clergy and parishes in need of cover together.
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