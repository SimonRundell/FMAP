import React, { useState } from 'react';
import { Input, Dropdown, Menu, notification, Select, Tag } from 'antd';
import { InputNumber, Slider} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Avatar from './avatar';
import { getConfig } from './config';

function MyProfile (props) {

    const [userHash] = useState(props.userHash);
    const [profileData] = useState(props.profileData);

    // console.log(profileData);
    
    const [profileTitle, setProfileTitle] = useState(profileData.profileTitle);
    const [profileFirstName, setProfileFirstName] = useState(profileData.profileFirstName);
    const [profileSurname, setProfileSurname] = useState(profileData.profileSurname);
    const [profileAddress1, setProfileAddress1] = useState(profileData.profileAddress1);
    const [profileAddress2, setProfileAddress2] = useState(profileData.profileAddress2);
    const [profileAddress3, setProfileAddress3] = useState(profileData.profileAddress3);
    const [profileAddress4, setProfileAddress4] = useState(profileData.profileAddress4);
    const [profilePostcode, setProfilePostcode] = useState(profileData.profilePostcode);
    const [profileHomePhone, setProfileHomePhone] = useState(profileData.profileHomePhone);
    const [profileMobile, setProfileMobile] = useState(profileData.profileMobile);
    const [profileEmail, setProfileEmail] = useState(profileData.profileEmail);
    const [profileGender, setProfileGender] = useState(profileData.profileGender);
    const [profileSeminary, setProfileSeminary] = useState(profileData.profileSeminary);
    const [profileOrdainedBy, setProfileOrdainedBy] = useState(profileData.profileOrdainedBy);
    const [profilePTO, setProfilePTO] = useState(JSON.parse(profileData.profilePTO));
    const [profileAvatar, setProfileAvatar] = useState(profileData.profileAvatar);
    const [profileWorship, setProfileWorship] = useState(JSON.parse(profileData.profileWorship));
    const [profileTradition, setProfileTradition] = useState(JSON.parse(profileData.profileTradition));
    const [profileRadius, setProfileRadius] = useState(profileData.profileRadius);
    const [profileFee, setProfileFee] = useState(profileData.profileFee);
    const [profileTravel, setProfileTravel] = useState(profileData.profileTravel);
    const [profileLat, setProfileLat] = useState(profileData.profileLat);
    const [profileLong, setProfileLong] = useState(profileData.profileLong);


    //const myUserHash=getCookie("userHash");

    const [api, contextHolder] = notification.useNotification();
  
    const openNotification = () => {
        api.open({
        message: 'Profile Updated',
        description:
            'Your profile has been updated.',
        });
    };

    const handleProfileAvatarChange = (newAvatar) => {
        setProfileAvatar(newAvatar);
        console.log("NEW AVATAR: " + newAvatar);
    };


    const profileWorshipOptions = [   
                        { value: 'Holy Communion/Eucharist/Mass' },
                        { value: 'Holy Communion (etc) with Baptism' },
                        { value: 'Happy to preach' },
                        { value: 'Happy to lead intercessions/prayers' },
                        { value: 'Morning Prayer' },
                        { value: 'Evening Prayer' },
                        { value: 'All Age Worship' },
                        { value: 'Free Worship' },
                        { value: 'Baptism' },
                        { value: 'Wedding' },
                        { value: 'Funeral' },
                        { value: 'Compline' },
                        { value: 'Taize' },
                        { value: 'Alt.Worship' },
                        { value: 'Benediction' },
                        { value: 'Incense' },
    ]

    const profileTraditionOptions = [   
                        { value: 'Conservative Evangelical' },
                        { value: 'Charismatic' },
                        { value: 'Liberal Evangelical' },
                        { value: 'Central Evangelical' },
                        { value: 'Broad Church Traditon' },
                        { value: 'Book of Common Prayer' },
                        { value: 'Liberal Catholic' },
                        { value: 'Traditional Catholic' },
                        { value: 'Traditional Hymnody' },
                        { value: 'Contemporary Worship Music' },
                        { value: 'Contemplative' },
                        { value: 'Alt.Worship' }
]

    const profilePTOOptions = [   
                        { value: 'No PTO' },
                        { value: 'Bath and Wells' },
                        { value: 'Birmingham' },
                        { value: 'Blackburn' },
                        { value: 'Bristol' },
                        { value: 'Canterbury' },
                        { value: 'Carlisle' },
                        { value: 'Chelmsford' },
                        { value: 'Chester' },
                        { value: 'Chichester' },
                        { value: 'Coventry' },
                        { value: 'Derby' },
                        { value: 'Durham' },
                        { value: 'Ely' },
                        { value: 'Exeter' },
                        { value: 'Europe' },
                        { value: 'Gloucester' },
                        { value: 'Guildford' },
                        { value: 'Hereford' },
                        { value: 'Leeds' },
                        { value: 'Leicester' },
                        { value: 'Lichfield' },
                        { value: 'Lincoln' },
                        { value: 'Liverpool' },
                        { value: 'London' },
                        { value: 'Manchester' },
                        { value: 'Newcastle' },
                        { value: 'Norwich' },
                        { value: 'Oxford' },
                        { value: 'Peterborough' },
                        { value: 'Portsmouth' },
                        { value: 'Ripon and Leeds' },
                        { value: 'Rochester' },
                        { value: 'St Albans' },
                        { value: 'St Edmundsbury and Ipswich' },
                        { value: 'Salisbury' },
                        { value: 'Sheffield' },
                        { value: 'Sodor and Man' },
                        { value: 'Southwark' },
                        { value: 'Southwell and Nottingham' },
                        { value: 'Truro' },
                        { value: 'Wakefield' },
                        { value: 'Winchester' },
                        { value: 'Worcester' },
                        { value: 'York' },
                        { value: 'Bangor' },
                        { value: 'Llandaff' },
                        { value: 'Monmouth' },
                        { value: 'St Asaph' },
                        { value: 'St Davids' },
                        { value: 'Swansea and Brecon' },
                        { value: 'Aberdeen and Orkney' },
                        { value: 'Argyll and The Isles' },
                        { value: 'Brechin' },
                        { value: 'Edinburgh' },
                        { value: 'Glasgow and Galloway' },
                        { value: 'Moray, Ross, and Caithness' },
                        { value: 'St Andrews, Dunkeld and Dunblane' },
                        { value: 'Armagh' },
                        { value: 'Clogher' },
                        { value: 'Connor' },
                        { value: 'Derry and Raphoe' },
                        { value: 'Down and Dromore' },
                        { value: 'Kilmore, Elphin, and Ardagh' },
                        { value: 'Tuam, Killala, and Achonry' },
                        { value: 'Dublin and Glendalough' },
                        { value: 'Cashel, Ferns, and Ossory' },
                        { value: 'Cork, Cloyne, and Ross' },
                        { value: 'Limerick and Killaloe' },
                        { value: 'Meath and Kildare' }];

    const tagRender = (props) => {
        const { label, closable, onClose } = props;
        const onPreventMouseDown = (event) => {
                event.preventDefault();
                event.stopPropagation();
             };
    return (
                <Tag
                    color="grey"
                    onMouseDown={onPreventMouseDown}
                    closable={closable}
                    onClose={onClose}
                    style={{ marginRight: 3 }}
                >
                {label}
                </Tag>
            );
    };

    const handleTitleClick = (event) => {
        setProfileTitle(event.key);
    }

    const handleGenderClick = (event) => {
        setProfileGender(event.key);
    }

    const handleOrdainedByClick = (event) => {
        setProfileOrdainedBy(event.key);
    }

    const handleFirstNameChange = (event) => {
        setProfileFirstName(event.target.value);
    }

    const handleSurnameChange = (event) => {
        setProfileSurname(event.target.value);
    }

    const handleAddress1Change = (event) => {
        setProfileAddress1(event.target.value);
    }

    const handleAddress2Change = (event) => {
        setProfileAddress2(event.target.value);
    }

    const handleAddress3Change = (event) => {
        setProfileAddress3(event.target.value);
    }

    const handleAddress4Change = (event) => {
        setProfileAddress4(event.target.value);
    }

    const isValidUKPostcode = (postcode) => {
        const postcodeRegex = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))\s?[0-9][A-Za-z]{2})$/;
        return postcodeRegex.test(postcode);
    }

    const handlePostcodeChange = (event) => {
        setProfilePostcode(event.target.value);
        // check postcode validity and get Lat Long values

        if (isValidUKPostcode(event.target.value)) {

        var jsonData = {
            profilePostcode: event.target.value
        };
    
        console.log(`Postcode Check: ${JSON.stringify(jsonData)}`);
                
        fetch(getConfig('CM_NODE') + '/updateLatLong', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        })
        .then(response => response.json()) 
        .then(responseData => {
            if (responseData['status']==='SUCCESS') {
                console.log(JSON.stringify(responseData.message));
                const firstItem = responseData.message[0]; // Get the first item in the array
            const latitude = firstItem.lat; // Extract latitude
            const longitude = firstItem.long; // Extract longitude
                setProfileLat(latitude);
                setProfileLong(longitude);
            }

            if (responseData['status']==='FAIL') {
                console.log(JSON.stringify(responseData.message));
                setProfileLat('Invalid Postcode');
                setProfileLong('Please check postcode again');
            }
        })
        .catch(error => {
            console.log('Error in the Postcode Validation', error);
        }); 
    } // valid postcode
    }
    
    const handleHomePhoneChange = (event) => {
        setProfileHomePhone(event.target.value);
    }

    const handleMobileChange = (event) => {
        setProfileMobile(event.target.value);
    }

    const handleEmailChange = (event) => {
        setProfileEmail(event.target.value);
    }

    const handleSeminaryChange = (event) => {
        setProfileSeminary(event.target.value);
    }

    const handleProfileRadius = (value) => {
        setProfileRadius(value);
    }

    const handleFeeChange = (value) => {
        setProfileFee(value);
    }

    const handleTravelChange = (value) => {
        setProfileTravel(value);
    }

    const profileTitleMenu = (
            <Menu onClick={handleTitleClick}>
                <Menu.Item key="[Christian Name]">{"[Christian Name]"}</Menu.Item>
                <Menu.Item key="Rev [Christian Name]">Rev {"[Christian Name]"}</Menu.Item>
                <Menu.Item key="Rev [Surname]">Rev {"[Surname]"}</Menu.Item>
                <Menu.Item key="Fr [Christian Name]">Fr  {"[Christian Name]"}</Menu.Item>
                <Menu.Item key="Fr [Surname]">Fr {"[Surname]"}</Menu.Item>
                <Menu.Item key="Mthr [Christian Name]">Mthr  {"[Christian Name]"}</Menu.Item>
                <Menu.Item key="Mthr [Surname]">Mthr {"[Surname]"}</Menu.Item>
                <Menu.Item key="Pastor [Christian Name]">Pastor  {"[Christian Name]"}</Menu.Item>
                <Menu.Item key="Pastor [Surname]">Pastor {"[Surname]"}</Menu.Item>
                <Menu.Item key="Brother [Christian Name]">Brother  {"[Christian Name]"}</Menu.Item>
                <Menu.Item key="Brother [Surname]">Brother {"[Surname]"}</Menu.Item>
                <Menu.Item key="Bishop [Christian Name]">Bishop  {"[Christian Name]"}</Menu.Item>
                <Menu.Item key="Bishop [Surname]">Bishop {"[Surname]"}</Menu.Item>
            </Menu>
        );

        const profileGenderMenu = (
            <Menu onClick={handleGenderClick}>
                <Menu.Item key="Male">Male</Menu.Item>
                <Menu.Item key="Female">Female</Menu.Item>
                <Menu.Item key="Not Disclosed">My business alone</Menu.Item>
            </Menu>
        );

        const profileOrdainedByMenu = (
            <Menu onClick={handleOrdainedByClick}>
                <Menu.Item default key="A Male Bishop">A Male Bishop</Menu.Item>
                <Menu.Item key="A Female Bishop">A Female Bishop</Menu.Item>
            </Menu>
        );
        
        const handleSubmitProfile = () => {
            // validate data
        
            // proceed to insert into database
            var jsonData = {
                userHash: userHash,
                profileTitle: profileTitle,
                profileFirstName: profileFirstName,
                profileSurname: profileSurname,
                profileAddress1: profileAddress1,
                profileAddress2: profileAddress2,
                profileAddress3: profileAddress3,
                profileAddress4: profileAddress4,
                profilePostcode: profilePostcode,
                profileLat: profileLat,
                profileLong: profileLong,
                profileHomePhone: profileHomePhone,
                profileMobile: profileMobile,
                profileEmail: profileEmail,
                profileGender: profileGender,
                profileAvatar: profileAvatar,
                profileSeminary: profileSeminary,
                profileOrdainedBy: profileOrdainedBy,
                profilePTO: JSON.stringify(profilePTO),
                profileWorship: JSON.stringify(profileWorship),
                profileTradition: JSON.stringify(profileTradition),
                profileFee: profileFee,
                profileTravel: profileTravel,
                profileRadius:profileRadius
            };
        
            console.log(JSON.stringify(jsonData));
            
                    
            fetch(getConfig('CM_NODE') + '/updateProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData),
            })
            .then(response => response.json()) 
            .then(responseData => {
                if (responseData['status']==='SUCCESS') {
                    // Handle success 
                    openNotification();
                }
            })
            .catch(error => {
                console.log('Error in the update process...', error);
            }); 
        
        }; // handleSubmitProfile
        
return (
    <>
        
        <div className="profileDialog">
             <div className="summary-container-title">My Profile - {profileTitle.replace(/\[.*?\]/g, '')} {profileFirstName} {profileSurname}</div>
                <div className="profile-container">
                
                    <div>
                    <Dropdown 
                        overlay={profileTitleMenu}
                        trigger="hover"
                    >
                         <a href="https://codemonkey.design" onClick={(e) => e.preventDefault()}>
                        I like to be referred to as:
                        <DownOutlined />
                        </a>
                    </Dropdown>
                    <div>{profileTitle}</div>
                    </div>
                    <div>
                        <label className="profile-label">Christian Name</label>
                        <Input
                            id="firstName"
                            size="small"
                            variant="filled"
                            value={profileFirstName}
                            onChange={handleFirstNameChange}
                        />
                        <label className="profile-label">Surname</label>
                        <Input
                            id="surname"
                            size="small"
                            variant="filled"
                            value={profileSurname}
                            onChange={handleSurnameChange}
                        />
                        <div className="summary-small">It is recommended that your Christian Name and Surname match your entry in the <a href="https://www.churchofengland.org/about/national-register-clergy">National Clergy Register</a>, so your details from that may be corroborated.</div>
                        <label className="profile-label">Address</label>
                        <Input
                            id="address1"
                            size="small"
                            variant="filled"
                            value={profileAddress1}
                            onChange={handleAddress1Change}
                        />
                        <Input
                            id="address2"
                            size="small"
                            variant="filled"
                            value={profileAddress2}
                            onChange={handleAddress2Change}
                        />
                        <Input
                            id="address3"
                            size="small"
                            variant="filled"
                            value={profileAddress3}
                            onChange={handleAddress3Change}
                        />
                        <Input
                            id="address4"
                            size="small"
                            variant="filled"
                            value={profileAddress4}
                            onChange={handleAddress4Change}
                        />
                        <label className="profile-label">Postcode</label>
                        <Input
                            id="postcode"
                            size="small"
                            variant="filled"
                            value={profilePostcode}
                            onChange={handlePostcodeChange}
                        />
                        <div className="profile-checkbox">{profileLat}, {profileLong}</div>

                        <label className="profile-label">Home Phone</label>
                        <Input
                            id="homephone"
                            size="small"
                            variant="filled"
                            value={profileHomePhone}
                            onChange={handleHomePhoneChange}
                            placeholder="00000000000"
                        />
                        <label className="profile-label">Mobile Phone</label>
                        <Input
                            id="mobile"
                            size="small"
                            variant="filled"
                            value={profileMobile}
                            onChange={handleMobileChange}
                            placeholder="00000000000"
                        />
                        <label className="profile-label">Email</label>
                        <Input
                            id="email"
                            size="small"
                            variant="filled"
                            value={profileEmail}
                            onChange={handleEmailChange}
                            placeholder="name@domain.com"   
                        />
                        <div>&nbsp;</div>
                       
                            
                                <label className="profile-label" >Fee for Service</label>
                                    <div>
                                        <InputNumber
                                        value={profileFee}
                                        defaultValue={0}
                                        addonBefore="£"
                                        onChange={handleFeeChange}
                                        variant="filled"
                                        controlwidth={5}
                                        max={45}
                                        min={0}
                                    />
                                    </div>
                            </div>
                            
                                    <label className="profile-label" >Travel</label>
                                    <div>
                                        <InputNumber
                                        value={profileTravel}
                                        defaultValue={0}
                                        addonAfter="p per mile"
                                        onChange={handleTravelChange}
                                        variant="filled"
                                        controlwidth={5}
                                        min={0}
                                    />
                                    </div>
        
                
                
                <label className="profile-label">My Picture</label>
                <div>
                    <Avatar profileAvatar={profileAvatar} 
                            onProfileAvatarChange={handleProfileAvatarChange} 
                    />
                </div>           
                    <div>&nbsp;</div>
                    <div className="shaded-background">
                    <div className="shaded-title">Some Parishes would value the following information:</div>
                    <Dropdown 
                        overlay={profileGenderMenu}
                        trigger="hover"
                    >
                        <a href="https://codemonkey.design" onClick={(e) => e.preventDefault()}>
                        Gender
                        <DownOutlined />
                        </a>
                    </Dropdown>
                    <div><label>{profileGender}</label></div>
                    <Dropdown 
                        overlay={profileOrdainedByMenu}
                        trigger="hover"
                    >
                        <a href="https://codemonkey.design" onClick={(e) => e.preventDefault()}>
                        I was ordained by
                        <DownOutlined />
                        </a>
                    </Dropdown>
                    <div><label>{profileOrdainedBy}</label></div>
                    <label className="profile-label">Theological College / Course / Seminary / Bible College</label>
                        <Input
                            id="seminary"
                            size="small"
                            variant="filled"
                            value={profileSeminary}
                            onChange={handleSeminaryChange}
                        />
                        </div>
                    <label className="profile-label">I am comfortable leading worship in the following traditions</label>
                    <Select
                        mode="multiple"
                        tagRender={tagRender}
                        style={{ width: '80%' }}
                        options={profileTraditionOptions}
                        placeholder="Please select"
                        value={profileTradition}
                        onChange={setProfileTradition}
                    />
                    <div><label className="profile-label">I have PTO in the following Dioceses</label></div>
                    <Select
                        mode="multiple"
                        tagRender={tagRender}
                        style={{ width: '80%' }}
                        options={profilePTOOptions}
                        placeholder="Please select"
                        value={profilePTO}
                        onChange={setProfilePTO}
                    />
                    <div><label className="profile-label">I am happy to lead the following forms of worship</label></div>
                    <Select
                        mode="multiple"
                        tagRender={tagRender}
                        style={{ width: '80%' }}
                        options={profileWorshipOptions}
                        placeholder="Please select"
                        value={profileWorship}
                        onChange={setProfileWorship}
                    />
                    <div><label className="profile-label">Radius of Availability</label></div>
                    
                    <div className='profile-container-column-noborder'>
                        <Slider 
                            defaultValue={5}
                            min={5}
                            max={50}
                            step={5} 
                            value={profileRadius} 
                            onChange={handleProfileRadius}
                            variant="filled"
                        />
                    </div>
                
                    <div className='profile-container-column-noborder'>
                        <InputNumber
                            value={profileRadius}
                            onChange={handleProfileRadius}
                            addonAfter="miles from home"
                            variant="filled"
                        />
                    </div>
                    
            
                
                <button
                className='custom-antd-button'
                onClick={() => handleSubmitProfile()}
            >
            Update my Profile
            </button>
    
        {contextHolder}
        </div>
    
    </div>
    </>
)

}

export default MyProfile;