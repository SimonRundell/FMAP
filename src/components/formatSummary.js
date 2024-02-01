import React, { useState } from 'react';
import { Modal, notification, Tag } from 'antd';
import InviteEmail from './inviteEmail'
import { getConfig } from './config';

function getRandomColor() {
    const colors = ["#2db7f5", "#87d068", "#108ee9", "#f50", 'black', 'grey'];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

const listTags = (tagList) => {
    return tagList.map((element, index) => (
        <Tag key={index} color={getRandomColor()} style={{ marginRight: 3, marginBottom: 3 }}>
            {element}
        </Tag>
    ));
};

function FormatSummary(props) {
    const data = props.data;
    const dateofService = props.dateofService;
    const [emailopen, setEmailOpen] = useState(false);
    const [confirmEmailLoading, setConfirmEmailLoading] = useState(false);
    const [serviceDescription, setServiceDescription] = useState('');
    const [serviceTime, setServiceTime] = useState('');
    const [churchName, setChurchName] = useState('');
    const [churchAddress, setChurchAddress] = useState('');
    const [otherInformation, setOtherInformation] = useState('');
    const [emailFrom, setEmailFrom] = useState('');
    const [emailRole, setEmailRole] = useState('');
    const [emailAddress, setEmailAddress] = useState('');

    const [api] = notification.useNotification();
  
    const openNotification = () => {
        api.open({
        message: 'eMail Sent',
        description:
            'Your invitation has been sent.',
        });
    };


    const fullName = `${data.profileTitle.replace(/\[.*?\]/g, '')} ${data.profileFirstName} ${data.profileSurname}`;
    const uName = data.profileEmail;

    const showEmailModal = () => {
        setEmailOpen(true);
    };

const handleEmailOk = () => {
        console.log('Sending the eMail to ' + fullName + ' Service: ' + serviceDescription + ' on ' + dateofService + ' at ' + serviceTime + ' ' + churchName + ', ' + churchAddress);
        setConfirmEmailLoading(true);

        //create api email call
        const htmlOutput = `
        <div>Dear ${fullName},</div>
        <div>&nbsp;</div>
        <div>I understand you are available to conduct a service on ${dateofService}.</div>
        <div>The time of our Service is: ${serviceTime}</div>
        <div>and will be ${serviceDescription}</div>
        <div>The Church is ${churchName} </div>
        <div>Address: ${churchAddress} </div>
        <div>&nbsp;</div>
        <div>Other useful information: ${otherInformation}</div>
        <div>&nbsp;</div>
        <div>I hope that you might be able to help us. Thank you</div>
        <div>&nbsp;</div>
        <div><b>${emailFrom}</b></div>
        <div>${emailRole}</div>
        <div>${emailAddress}</div>
        <div>&nbsp;</div>
        <div>Message sent via <i>Send Me A Priest!</i></div>`;

        var jsonData = {
            action: 'sendEmail',
            To: uName,
            Subject: "Find me a Priest: Invitation to conduct a service",
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
        .then(responseData => {
            console.log("Email sent to "+ uName);
            /// Handle success 
            openNotification();
        })
        .catch(error => {
            console.error("Error sending email:", error);
        })
        .finally(() => {
            setEmailOpen(false);
            setConfirmEmailLoading(false);
        });
    };

    const handleEmailCancel = () => {
        setEmailOpen(false);
    };

    // Callbacks for InviteEmail component
    const handleServiceDescriptionChange = (newDescription) => {
        setServiceDescription(newDescription);
    };
  
    const handleServiceTimeChange = (newTime) => {
        setServiceTime(newTime);
    };

    const handleChurchNameChange = (newName) => {
        setChurchName(newName);
    };

    const handleChurchAddressChange = (newAddress) => {
        setChurchAddress(newAddress);
    };

    const handleOtherInformationChange = (newInfo) => {
        setOtherInformation(newInfo);
    };

    const handleEmailFromChange = (newEmail) => {
        setEmailFrom(newEmail);
    };

    const handleEmailRoleChange = (newRole) => {
        setEmailRole(newRole);
    };

    const handleEmailAddressChange = (newEmail) => {
        setEmailAddress(newEmail);
    };

    return (
<>
<div>
<div className="summary-container-bordered">
        {data.profileAvatar && (
            <div className="summary-container">
                <div>
                    <img 
                        src={data.profileAvatar} 
                        alt={fullName} 
                        style={{ width: '100px' }} 
                    />
                </div>
            </div>
        )}
 

    <div className="summary-container">
    <div className="summary-container-column">
        {/* Name and Address */}
        <div className="summary-row">
            <div className="summary-label">Name:</div>
            <div className="summary-details">{fullName}</div>
        </div>
        <div className="summary-row">
            <div className="summary-label">Address:</div>
            <div className="summary-details">
                <div>{data.profileAddress1}</div>
                <div>{data.profileAddress2}</div>
                <div>{data.profileAddress3}</div>
                <div>{data.profileAddress4}</div>
                <div>{data.profilePostcode}</div>

            </div>
        </div>
    </div>
        <div className="summary-container-column">
        <button className="custom-antd-button" onClick={showEmailModal}>Offer Service to {fullName}</button>
        </div>
    </div>
  
    <div className="summary-container">
        <div className="summary-label">Contact:</div>
        <div className="summary-details">
            <div>{data.profileHomePhone}</div>
            <div>{data.profileMobile}</div>
            <div>{data.profileEmail}</div>
        </div>
    </div>
<div style={{ paddingTop: 5 }}></div>
    <div className="summary-container">
        <div className="summary-label">Tradition:</div>
        <div className="summary-details">{listTags(JSON.parse(data.profileTradition))}</div>
    </div>

    <div className="summary-container">
        <div className="summary-label">Worship:</div>
        <div className="summary-details">{listTags(JSON.parse(data.profileWorship))}</div>
    </div>

    <div className="summary-container">
        <div className="summary-label">PTO:</div>
        <div className="summary-details">{listTags(JSON.parse(data.profilePTO))}</div>
    </div>
</div>
</div>
            <Modal
                title="Invitation to conduct service"
                open={emailopen}
                onOk={handleEmailOk}
                confirmLoading={confirmEmailLoading}
                onCancel={handleEmailCancel}
            >      
                <InviteEmail 
                    data={data}
                    dateofService={dateofService}
                    onServiceDescriptionChange={handleServiceDescriptionChange}
                    onServiceTimeChange={handleServiceTimeChange}
                    onChurchNameChange={handleChurchNameChange}
                    onChurchAddressChange={handleChurchAddressChange}
                    onOtherInformationChange={handleOtherInformationChange}
                    onEmailFromChange={handleEmailFromChange}
                    onEmailRoleChange={handleEmailRoleChange}
                    onEmailAddressChange={handleEmailAddressChange}
                />
            </Modal>
</>
    );
}

export default FormatSummary;
