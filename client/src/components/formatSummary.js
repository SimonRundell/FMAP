import React, { useState } from 'react';
import { Modal, notification, Tag } from 'antd';
import InviteEmail from './inviteEmail'
import { getConfig } from './config';
import GetAvatar from './getAvatar';
import ClergyDetails from './clergyRegister';



const listTags = (tagList) => {
    return tagList.map((element, index) => (
        <Tag key={index} color="grey" style={{ marginRight: 3, marginBottom: 3 }}>
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
        let htmlOutput = `<figure class="image image-style-align-right image_resized" style="width:19.17%;">
        <img style="aspect-ratio:325/317;" src="data:image/png;base64,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" width="325" height="317">
    </figure>
    <p>
        <span style="font-family:'Trebuchet MS', Helvetica, sans-serif;font-size:20px;"><strong>Find Me A Priest!</strong></span>
    </p>
    <p>
        <span style="font-family:'Trebuchet MS', Helvetica, sans-serif;">Dear ###FULLNAME###</span>
    </p>
    <p>
        <span style="font-family:'Trebuchet MS', Helvetica, sans-serif;">I understand that you are available to conduct a service on <strong>###DATEOFSERVICE###</strong>.</span>
    </p>
    <p>
        <span style="font-family:'Trebuchet MS', Helvetica, sans-serif;">We have a ###SERVICEDESCRIPTION### at ###SERVICETIME### at</span>
    </p>
    <p>
        <span style="font-family:'Trebuchet MS', Helvetica, sans-serif;">###CHURCHNAME###, ###CHURCHADDRESS###.</span>
    </p>
    <p>
        <span style="font-family:'Trebuchet MS', Helvetica, sans-serif;">Other useful information for you:</span>
    </p>
    <div style="border:1px solid #747474;font-family:'Trebuchet MS';padding:10px;">
        ###OTHERINFORMATION###
    </div>
    <div>
        <div>
            &nbsp;
        </div>
        <div>
            <span style="font-family:'Trebuchet MS', Helvetica, sans-serif;"><span>I hope that you might be able to help us. Thank you</span></span>
        </div>
    </div>
    <p>
        <span style="font-family:'Trebuchet MS', Helvetica, sans-serif;">With every prayer and blessing</span>
    </p>
    <p>
        <span style="font-family:'Trebuchet MS', Helvetica, sans-serif;"><strong>###EMAILFROM###</strong></span><br>
        <span style="font-family:'Trebuchet MS', Helvetica, sans-serif;">###EMAILROLE###</span><br>
        <span style="font-family:'Trebuchet MS', Helvetica, sans-serif;">###EMAILADDRESS###</span>
    </p>
    <p>
        &nbsp;
    </p>
    <p>
        <span style="font-family:'Trebuchet MS', Helvetica, sans-serif;">FINDMEAPRIEST created by</span>
    </p>
    <p>
        <span style="font-family:'Trebuchet MS', Helvetica, sans-serif;">CodeMonkey Design Ltd. &nbsp;| &nbsp; 20 Clifton Ave, Plymouth PL7 4BJ &nbsp; | &nbsp; &nbsp;07976 802123 &nbsp; | &nbsp;&nbsp;</span><a href="mailto:simon@codemonkey.design"><span style="font-family:'Trebuchet MS', Helvetica, sans-serif;">simon@codemonkey.design</span></a>
    </p>`;

        htmlOutput=htmlOutput.replace('###FULLNAME###', fullName);
        htmlOutput=htmlOutput.replace('###DATEOFSERVICE###', dateofService);
        htmlOutput=htmlOutput.replace('###SERVICEDESCRIPTION###', serviceDescription);
        htmlOutput=htmlOutput.replace('###SERVICETIME###', serviceTime);
        htmlOutput=htmlOutput.replace('###CHURCHNAME###', churchName);
        htmlOutput=htmlOutput.replace('###CHURCHADDRESS###', churchAddress);
        htmlOutput=htmlOutput.replace('###OTHERINFORMATION###', otherInformation);
        htmlOutput=htmlOutput.replace('###EMAILFROM###', emailFrom);
        htmlOutput=htmlOutput.replace('###EMAILROLE###', emailRole);
        htmlOutput=htmlOutput.replace('###EMAILADDRESS###', emailAddress);

        var jsonData = {
            To: uName,
            Subject: "Find me a Priest: Invitation to conduct a service",
            Body: htmlOutput,
        };

        console.log(JSON.stringify(jsonData));
        
        fetch(getConfig('CM_NODE') + '/emS', {
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
        
            <div className="summary-container">
                <div>
                <GetAvatar userID={data.userID} />
                </div>
            </div>
        
 

    <div className="summary-container">
    <div className="summary-container-column">
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
            <div>Distance from Church: {data.distance} miles</div>
            <div>&nbsp;</div>
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
<div className="summary-container">
    <ClergyDetails memberName={`${data.profileFirstName} ${data.profileSurname}`} />
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
