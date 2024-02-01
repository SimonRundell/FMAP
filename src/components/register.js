import React, {useState} from 'react';
import md5 from 'crypto-js/md5';
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

//   function checkPasswordStrength(location) {
//     let pwStrength ='';
//     let password = document.getElementById(location).value;

//     if (password.length<8) {
//             pwStrength = 'Minimum of 8 Characters required';
//     } else {
//             let strengths = 0;
//             if (password.length >= 8) strengths++;
//             if (/\d/.test(password)) strengths++;
//             if (/[A-Z]/.test(password)) strengths++;
//             if (/[a-z]/.test(password)) strengths++;
//             if (/[^A-Za-z0-9]/.test(password)) strengths++;

//             switch (strengths) {
//                 case 0:
//                     pwStrength = 'Password Strength:'
//                     break;
//                 case 1:
//                     pwStrength = 'Password Strength: Very Weak';
//                     break;
//                 case 2:
//                     pwStrength = 'Password Strength: Weak';
//                     break;
//                 case 3:
//                     pwStrength = 'Password Strength: Moderate';
//                     break;
//                 case 4:
//                     pwStrength = 'Password Strength: Strong';
//                     break;
//                 case 5:
//                     pwStrength = 'Password Strength: Very Strong';
//                     break;
//                 default:
//                     pwStrength = 'Unknown';
//             }

//     }
//     document.getElementById(location +'Strength').innerHTML=pwStrength;
// }

function registerNewUser({currentActivity, setCurrentActivity, email, pass1, pass2}) {

    document.getElementById('registerUserDialog').innerHTML="<div><img src='./assets/wait.gif' /><div>Please wait...</div></div>"
    
    if (pass1 !== pass2) {
        document.getElementById('registerUserDialog').innerHTML="<div><img src='<div>Passwords do not match. Please type more carefully.</div></div>";
        return;
    }

    if (!isValidEmail(email)) {
        document.getElementById('registerUserDialog').innerHTML="<div>That isn't a valid eMail address</div></div>";
        return;
    }

    // proceed to insert into database
    const uName = email;
    const pWrd  = generateMD5(pass2);

    var jsonData = {
        action: 'register',
        userName: uName,
        passwordHash: pWrd,
        userPrivilege: 1,
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

            console.log(JSON.stringify(responseData));

            var htmlOutput = '<html><body>';
            htmlOutput += '<p>Click this linK</p>';
            htmlOutput += '<p>http://findmeapriest.site/api/bend.php?action=verify&data=' + responseData['message'] +'</p>';
            htmlOutput += '<p>to verify your email. (nicer message soon)</p>';
            htmlOutput += '</body></html>';

          var jsonData = {
              action: 'sendEmail',
              To: uName,
              Subject: "Verify your FMAP Account email",
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
                console.log(responseData);
                setCurrentActivity("AWAITINGAUTH")
        });
        }
    })
    .catch(error => {
        console.log('Error in the eMail send process...');
    }
        );
} // registerUser

function Register ({currentActivity, setCurrentActivity}) {

// keep for later
// onChange={checkPasswordStrength('pass2')}

    const [email, setEmail] = useState('');
    const [pass1, setPass1] = useState('');
    const [pass2, setPass2] = useState('');

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePass1Change = (event) => {
        setPass1(event.target.value);
    };

    const handlePass2Change = (event) => {
        setPass2(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        registerNewUser({currentActivity, setCurrentActivity, email, pass1, pass2});
    };
return (
<>
    <div id="registerUserDialog" className="register-box">
        Please register to be able to use the system
        <div className="register-form">
            <input id="email" value={email} onChange={handleEmailChange} type="text" placeholder="eMail" />
            <input id="pass1" value={pass1} onChange={handlePass1Change} type="password" placeholder="Password" />
            <input id="pass2" value={pass2} onChange={handlePass2Change} type="password" placeholder="Retype Password"  />
            <div id="pass2Strength" className="password-strength">Password Strength:</div>
            <button id="registerButton" onClick={handleSubmit}>Register</button>
        </div>
    </div>
</>

);


}

export default Register;