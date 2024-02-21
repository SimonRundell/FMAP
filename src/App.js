import "./App.css";
import React, { useState, useEffect } from "react";
import Login from "./components/login";
import Register from "./components/register";
import ForgotPassword from "./components/forgotpassword";
import ChangePassword from "./components/changePassword";
import MyProfile from "./components/myprofile";
import MyAvailability from "./components/available";
import MyDetails from "./components/detailsSummary";
import SearchScreen from "./components/search";
import { getConfig } from './components/config';
import CMFloatAd from "./components/cmFloatAd";
import { Layout } from 'antd';
import DropdownMenu from "./components/navbar";
import DebugInfo from "./components/debug";
import CryptoJS from 'crypto-js';

const { Content } = Layout;

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

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function App() {
  const [currentActivity, setCurrentActivity] = useState("LOGIN");
  const [userHash, setUserHash] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [decrypted, setDecrypted] = useState('');
  const [queryParams, setQueryParams] = useState({});

  useEffect(() => {
    const storedUserHash = getCookie("userHash");
    if (storedUserHash) {
      setUserHash(storedUserHash);
      setCurrentActivity("SORTED");
    }
  }, [userHash]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryParams = {};
    params.forEach((value, key) => {
      queryParams[key] = value;
    });
    setQueryParams(queryParams);
    console.log("Passed Values:\n"+ JSON.stringify(queryParams));
    if (queryParams['a']==='cp') {
      setCurrentActivity("PASSWORDRESETAUTHCOMPLETE");
      setUserHash(decryptMessage(decodeURIComponent(queryParams['user'])));

      // console.log("password reset requested for " + decryptMessage(decodeURIComponent(queryParams['user'])));
    }


  }, []);

  useEffect(() => {
        if (currentActivity==="SORTED" || currentActivity==="MYDETAILS" || currentActivity==="MYPROFILE"  || currentActivity==="MYAVAILABILITY") {

          var jsonData = {
            action: 'getProfile',
            userHash: userHash
        };
        // console.log("getProfile sending:\n" + JSON.stringify(jsonData));
        fetch(getConfig('CM_NODE') + '/getProfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'SUCCESS') {
                setProfileData(data.message[0]);
            } else {
                console.log('Failed to fetch data from DetailsSummary:', data);
            }
        })
        .catch(error => {
            console.log('Error fetching data from Details Summary:', error);
        });

}}, [userHash, currentActivity]);

const decryptMessage = (encrypted) => {
  const secretKey = getConfig('CM_SECRET'); // Use the same key used for encryption
  const decryptedBytes = CryptoJS.AES.decrypt(encrypted, secretKey);
  const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
  return decryptedText;
};

  const onMenuChoice = (value) => {

    if (value === 0 && currentActivity !== "LOGIN") {
      setUserHash(getCookie("userHash"));
      setCurrentActivity("SORTED");
    }

    if (value === 1 && currentActivity !== "LOGIN") {
      setUserHash(getCookie("userHash"));
      setCurrentActivity("MYPROFILE");
    }

    if (value === 2 && currentActivity !== "LOGIN") {
      setUserHash(getCookie("userHash"));
      setCurrentActivity("MYAVAILABILITY");
    }

    if (value === 4 && currentActivity !== "LOGIN") {
      setUserHash(getCookie("userHash"));
      setCurrentActivity("SEARCH");
    }      

    if (value === 7) {
      setCurrentActivity("LOGIN");
      setUserHash("");
      setCookie("userHash", "", 1);
    }
}

  return (
    <>
    <div>
      <header className="title-bar">
        <h1 className="app-title">Find Me a Priest!</h1>       
        <img
          src="../assets/FMAP.png"
          alt="CodeMonkey Design Ltd"
          className="logo"
        />
      </header>
      <DebugInfo
          userHash={userHash}
          currentActivity={currentActivity}
          profileData={profileData}
      />
      <div className="clerical-collar"></div>
      <Layout>
        <Content>
        <DropdownMenu onMenuChoice={onMenuChoice}/>
          {currentActivity === "SORTED" && (
              <>
              <div className="myprofile-container">
              <MyDetails
                    userHash={userHash}
                    currentActivity={currentActivity}
                    profileData={profileData}
                  />          
              </div>

              </>
          )}

          {currentActivity === "LOGIN" && (
            <Login
              currentActivity={currentActivity}
              setCurrentActivity={setCurrentActivity}
              setUserHash={setUserHash}
              loginPromptText="User Login"
            ></Login>
          )} 

          {currentActivity === "LOGINAFTERFORGOTFAIL" && (
            <Login
              currentActivity={currentActivity}
              setCurrentActivity={setCurrentActivity}
              setUserHash={setUserHash}
              loginPromptText="That wasn't a proper eMail"
            ></Login>
          )}
          
          {currentActivity === "REGISTER" && (
            <Register
              currentActivity={currentActivity}
              setCurrentActivity={setCurrentActivity}
            ></Register>
          )}

        {currentActivity === "FORGOTPASSWORD" && (
            <ForgotPassword
              currentActivity={currentActivity}
              setCurrentActivity={setCurrentActivity}
              setUserHash={setUserHash}
            ></ForgotPassword>
          )}

          {currentActivity === "AWAITINGAUTH" && (
            <div className="login-box" style={{ width: 300 }}>
              <div>
                We have sent you an email to confirm your details. Please check your
                inbox
              </div>
            </div>
          )}
      
          {currentActivity === "PASSWORDRESETAUTHCOMPLETE" && (
            <ChangePassword
              currentActivity={currentActivity}
              setCurrentActivity={setCurrentActivity}
              setUserHash={setUserHash}
            >
            </ChangePassword>
          )}

        {currentActivity === "MYPROFILE" && (
            <>
            <div className="myprofile-container">
                <MyProfile
                  userHash={userHash}
                  currentActivity={currentActivity}
                  setCurrentActivity={setCurrentActivity}
                  profileData={profileData}
                ></MyProfile>
            </div>
            </>
          )}

          {currentActivity === "MYAVAILABILITY" && (
                  <>
                  <div className="myprofile-container">
                      <MyAvailability
                        userHash={userHash}
                        currentActivity={currentActivity}
                        setCurrentActivity={setCurrentActivity}
                        profileData={profileData}
                      ></MyAvailability>
                  </div>
                  </>
                
                )}

                {currentActivity === "SEARCH" && (
                        <>
                        <div className="myprofile-container">
                        <SearchScreen
                        />
                        </div>
                        </>
                      
                )}
        </Content>
      </Layout>
  </div>

    <CMFloatAd />
    </>
    
  );
}

export default App;
