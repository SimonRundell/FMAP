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

  useEffect(() => {
    const storedUserHash = getCookie("userHash");
    if (storedUserHash) {
      setUserHash(storedUserHash);
      setCurrentActivity("SORTED");
    }
  }, []);

  if (currentActivity==="SORTED" || currentActivity==="MYDETAILS" || currentActivity==="MYPROFILE"  || currentActivity==="MYAVAILABILITY") {

    var jsonData = {
      action: 'getProfile',
      userHash: userHash
    };

    console.log(jsonData);
    
      fetch(getConfig('REACT_APP_FMAP_API_URL'), {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
      })
      .then(response => response.json())
      .then(data => {
          if (data.status === 'SUCCESS') {
              const messageObject = JSON.parse(data.message);
              setProfileData(messageObject); // Update state with parsed profile data
          } else {
              console.log('Failed to fetch data during App.getProfile:', data);
          }
      })
      .catch(error => {
          console.log('Error fetching data during App.getProfile:', error);
      });

    };

  const handleLogOut = () => {
    setCurrentActivity("LOGIN");
    setUserHash("");
    setCookie("userHash", "", 1);
  };

  const handleMyProfile = () => {
    setCurrentActivity("MYPROFILE");

  };

  const handleMyAvailability = () => {
    setCurrentActivity("MYAVAILABILITY");

  };

  const handleMyDetails = () => {
    setCurrentActivity("SORTED");
  };

  const handleFindAPriest = () => {
    setCurrentActivity("SEARCH");
  };

  return (
    <div>
      <header className="title-bar">
        <h1 className="app-title">Find Me a Priest!</h1>
        {(currentActivity === "REGISTER" || currentActivity === "FORGOTPASSWORD") && (
        <>
        <button id="logOut" className="custom-antd-button-menu" onClick={handleLogOut}>
            Back to front page
          </button>
        </>
        )}
         {(currentActivity === "SORTED"  || currentActivity === "MYPROFILE" || currentActivity==="SEARCH" || currentActivity === "MYAVAILABILITY") && (
        <>
          <button id="logOut" className="custom-antd-button-menu" onClick={handleLogOut}>
            Log Out
          </button>
          <button id="myProfile" className="custom-antd-button-menu" onClick={handleMyProfile}>
            Edit my Profile
          </button>
          <button id="myAvailability" className="custom-antd-button-menu" onClick={handleMyAvailability}>
            Edit my Availability
          </button>
          <button id="myHomePage" className="custom-antd-button-menu" onClick={handleMyDetails}>
            My Details
          </button>
          <button id="findapriest" className="custom-antd-button-menu" onClick={handleFindAPriest}>
            Find a Priest
          </button>
          </>
        )}
        <img
          src="../assets/codemonkey-small.png"
          alt="CodeMonkey Design Ltd"
          className="logo"
        />
      </header>
      <div id="opInfo">
        <span id="currentActivity">
          {currentActivity} &nbsp; {userHash}
        </span>
      </div>
      <div className="clerical-collar"></div>
      {currentActivity === "LOGIN" && (
        <Login
          currentActivity={currentActivity}
          setCurrentActivity={setCurrentActivity}
          setUserHash={setUserHash}
          loginPrompt="User Login"
        ></Login>
      )} 
      {currentActivity === "LOGINAFTERFORGOTFAIL" && (
        <Login
          currentActivity={currentActivity}
          setCurrentActivity={setCurrentActivity}
          setUserHash={setUserHash}
          loginPrompt="That wasn't a proper eMail"
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
        <div className="login-box">
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

{currentActivity === "SORTED" && (
        <>
        <div className="myprofile-container">
        <MyDetails
              userHash={userHash}
              currentActivity={currentActivity}
              profileData={profileData}
            >
        </MyDetails>
            
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
    </div>
  );
}

export default App;
