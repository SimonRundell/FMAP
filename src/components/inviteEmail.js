import React, { useState } from 'react';
import { Input, TimePicker } from 'antd';
import dayjs from 'dayjs';

function extractTime(timestamp) {
    var date = new Date(timestamp);
    var hours = date.getUTCHours().toString().padStart(2, '0');
    var minutes = date.getUTCMinutes().toString().padStart(2, '0');
    // var seconds = date.getUTCSeconds().toString().padStart(2, '0');

    return hours + ':' + minutes; // seconds not required + ':' + seconds
}

function InviteEmail ({ data, dateofService, onServiceDescriptionChange, onServiceTimeChange, onChurchNameChange, onChurchAddressChange, onOtherInformationChange, onEmailFromChange, onEmailRoleChange, onEmailAddressChange }) {
    
    const format = 'HH:mm';
    const { TextArea } = Input;
    const [serviceDescription, setServiceDescription] = useState('');
    const [serviceTime, setServiceTime] = useState('09:00');
    const [churchName, setChurchName] = useState('');
    const [churchAddress, setChurchAddress] = useState('');
    const [otherInformation, setOtherInformation] = useState('');
    const [emailFrom, setEmailFrom] = useState('');
    const [emailRole, setEmailRole] = useState('');
    const [emailAddress, setEmailAddress] = useState('');

    
    const handleServiceDescription=(event) => {
          setServiceDescription(event.target.value);
          onServiceDescriptionChange(event.target.value);
    }

    const handleServiceTime = (timeString) => {
          setServiceTime(extractTime(timeString));
          onServiceTimeChange(extractTime(timeString));
    }

    const handleChurchName = (event) => {
        setChurchName(event.target.value);
        onChurchNameChange(event.target.value);
    }

    const handleChurchAddress = (event) => {
        setChurchAddress(event.target.value);
        onChurchAddressChange(event.target.value);
    }

    const handleOtherInformation = (event) => {
        setOtherInformation(event.target.value);
        onOtherInformationChange(event.target.value);
    }

    const handleEmailFrom = (event) => {
        setEmailFrom(event.target.value);
        onEmailFromChange(event.target.value);
    }

    const handleEmailRole = (event) => {
        setEmailRole(event.target.value);
        onEmailRoleChange(event.target.value);
    }

    const handleEmailAddress = (event) => {
        setEmailAddress(event.target.value);
        onEmailAddressChange(event.target.value);
    }

return (
    <>
    <div>Dear {data.profileEmail},</div>
    <div>I understand you are available to conduct a service on {dateofService}.</div>
    <div>The time of our Service is: <TimePicker minuteStep={15} onChange={handleServiceTime} defaultValue={dayjs(serviceTime, format)} format={format} /></div>
    <div>and will be <Input onChange={handleServiceDescription} value={serviceDescription} placeholder="Name of Act of Worship (ie Communion etc)"/></div>
    <div>The Church is <Input onChange={handleChurchName} value={churchName} placeholder="Name of Church"/></div>
    <div>Address: <Input onChange={handleChurchAddress} value={churchAddress} placeholder="Church Address and Postcode"/></div>
    <div>Other useful information: <TextArea value={otherInformation} onChange={handleOtherInformation} rows={6} placeholder="Parking, Fees, Advice" /></div>
    <div>Thank you</div>
    <div><Input onChange={handleEmailFrom} value={emailFrom} placeholder="From (Name)"/></div>
    <div><Input onChange={handleEmailRole} value={emailRole} placeholder="Your role in the Church (ie Vicar, Minister, Adminstrator)"/></div>
    <div><Input onChange={handleEmailAddress} value={emailAddress} placeholder="From (Email Address)"/></div>
    </>
);
}

export default InviteEmail;