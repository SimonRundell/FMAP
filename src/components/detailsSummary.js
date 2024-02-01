import React, {useState, useEffect} from 'react';
import { getConfig } from './config';

function sortDates(dates) {
    return dates.sort((a, b) => {
        // Convert 'dd/mm/yyyy' to 'mm/dd/yyyy'
        const dateA = a.split('/').reverse().join('-');
        const dateB = b.split('/').reverse().join('-');

        // Convert to Date objects
        const newDateA = new Date(dateA);
        const newDateB = new Date(dateB);

        // Compare
        return newDateA - newDateB;
    });
}

function DetailsSummary(props) {
    const [userHash] = useState(props.userHash);
    const [profileData, setProfileData] = useState(null); 

    useEffect(() => {
        var jsonData = {
            action: 'getProfile',
            userHash: userHash
        };

        

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
                console.log('Failed to fetch data from DetailsSummary:', data);
            }
        })
        .catch(error => {
            console.log('Error fetching data from Details Summary:', error);
        });
    }, [userHash]);

    const ListAvailability = () => {

            let datesAvailable = profileData.userAvailability.split(',');
            datesAvailable = datesAvailable.map(date => 
                date
                .trim() // Remove whitespace
                .replace(/^"|"$/g, '') // Remove quotes at the start and end
            );
            datesAvailable=sortDates(datesAvailable);
            return (
                datesAvailable.map((element) => (
                <div>{element}</div>
            )));
    }; // listAvailability

    return (
        <>
            {profileData && (
                <>
                <div className='profileDialog'>
                        <div className="profile-container">
                            <div className="profile-container-column">

                                <div className="profile-horizontal-split">
                                    {/* Left Section for Textual Information */}
                                    <div className="profile-text-section">
                                        <div className="summary-container">
                                            <div className="summary-label">Name:&nbsp;&nbsp;&nbsp;</div>
                                            <div className="summary-details">
                                                <div>{profileData.profileTitle.replace(/\[.*?\]/g, '')} {profileData.profileFirstName} {profileData.profileSurname}</div>
                                            </div>
                                        </div>
                                        <div className="summary-container">
                                            <div className="summary-label">Address:</div>
                                            <div className="summary-details">
                                                <div>{profileData.profileAddress1}</div>
                                                <div>{profileData.profileAddress2}</div>
                                                <div>{profileData.profileAddress3}</div>
                                                <div>{profileData.profileAddress4}</div>
                                                <div>{profileData.profilePostcode}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                        { profileData.profileAvatar && (
                                        <div className="profile-image-section">
                                            <img src={profileData.profileAvatar} alt="Profile Avatar" className="profile-avatar-image" />
                                        </div>
                                    )}
                                </div>

                            </div>

                            <div className="profile-container-column">
                                Availability
                                <div>&nbsp;</div>
                                <ListAvailability />
                            </div>
                        </div>    
                    </div>

                </>
            )} 
        </>
    );
}

export default DetailsSummary;