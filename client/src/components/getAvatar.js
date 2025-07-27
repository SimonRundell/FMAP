import React, { useState, useEffect } from 'react';
import { getConfig } from './config';

function GetAvatar({userID}) {
    const [profileAvatarData, setProfileAvatarData] = useState([]);

    useEffect(() => {
        var jsonData = {
            userID: userID
        };
        // console.log("getProfile sending:\n" + JSON.stringify(jsonData));
        fetch(getConfig('CM_NODE') + '/getAvatar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'SUCCESS') {
                setProfileAvatarData(data.message[0]);
            } else {
                console.log('Failed to fetch data from getAvatar:', data);
            }
        })
        .catch(error => {
            console.log('Error fetching data from getAvatar:', error);
        });
    }, [userID]); // Fetch profile data

return (
    <img src={profileAvatarData.profileAvatar} alt="Profile Avatar" className="profile-avatar-image" />
    )
}

export default GetAvatar;