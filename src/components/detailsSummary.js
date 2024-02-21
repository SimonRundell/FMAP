import React, { useState, useEffect } from 'react';
import { getConfig } from './config';
import GetAvatar from './getAvatar';

function formatDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
}

function DetailsSummary(props) {
    const [profileData, setProfileData] = useState(props.profileData);
    const [listAvailability, setListAvailability] = useState([]);
    const [userHash, setUserHash] = useState(props.userHash);

    useEffect(() => {
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
    }, [userHash]); // Fetch profile data

    useEffect(() => {
        
        var jsonData = {
            action: 'getAvailability',
            userHash: userHash
        };
        fetch(getConfig('CM_NODE') + '/getAvailability', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'SUCCESS') {
                setListAvailability(data.message);
            } else {
                console.log('Failed to fetch data from getAvailability:', data);
            }
        })
        .catch(error => {
            console.log('Error fetching data from getAvailability:', error);
        });
    }, [userHash]);

return (
        <>
        { profileData && (
                <div className='profileDialog'>
                <div className="summary-container-title">My Details</div>
                        <div className="summary-container">
                                    <div className="profile-text-section">
                                        <div className="summary-container">
                                        <div className='summary-details-card'>
                                            <div className="summary-label">Name:</div>
                                            <div className="summary-details">
                                                <div>{profileData.profileTitle.replace(/\[.*?\]/g, '')} {profileData.profileFirstName} {profileData.profileSurname}</div>
                                            </div>
                                        </div>
                                            <div className='summary-details-card'>
                                            <div className="summary-label">Address:</div>
                                            <div className="summary-details">
                                                <div>{profileData.profileAddress1}</div>
                                                <div>{profileData.profileAddress2}</div>
                                                <div>{profileData.profileAddress3}</div>
                                                <div>{profileData.profileAddress4}</div>
                                                <div>{profileData.profilePostcode}</div>
                                            </div>
                                            </div>
                                                <div className="summary-label">My Portrait:</div>
                                                <div className="profile-image-section">
                                                    <GetAvatar userID={profileData.userID} />
                                            </div></div>
                                            <div className='summary-details-card'>
                                            <div className="summary-label">Availability:</div>
                                            <div>
                                                {listAvailability.map((element) => (
                                                    <span key={element.availableDate}>{formatDDMMYYYY(element.availableDate)} </span>
                                                ))}
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                        </div> 
                 
                 )}
                </>
    );
}

export default DetailsSummary;