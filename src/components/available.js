import React, {useState} from 'react';
import { DatePicker, notification, Tag } from 'antd';
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

function MyAvailability (props) {

    const [userHash] = useState(props.userHash);
    const [profileData] = useState(props.profileData);
    const [api, contextHolder] = notification.useNotification();
  
    const openNotification = () => {
    api.open({
      message: 'Availability Updated',
      description:
        'Your availability has been updated.',
    });
  };

    const [dateList, setDateList] = useState(JSON.parse(profileData.userAvailability));
    // const [dateList, setDateList] = useState('');

    let currentDateList=dateList;

    const TagRender = (props) => {
        const { label, closable, onClose } = props;
    
        const onPreventMouseDown = (event) => {
            event.preventDefault();
            event.stopPropagation();
        };
    
        let tagList = label.split(',');
        tagList = sortDates(tagList);
    
        return tagList.map((element, index) => (
            <Tag
                key={index}
                color="grey"
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={() => onClose(element)}
                style={{ marginRight: 3 }}
            >
                {element}
            </Tag>
        ));
    };
    
    const handleTagClose = (closedTag) => {
        const newDateList = currentDateList.split(',')
                           .filter(tag => tag !== closedTag)
                           .join(',');
        setDateList(newDateList);
    };

    const upDateDateList=(date, dateString) => {
        
        if (currentDateList.length!==0) {
            currentDateList=currentDateList + ','
        }

        currentDateList=currentDateList + dateString;

        setDateList(currentDateList);
    
    }

    const handleSubmitAvailability = () => {
        // validate data
    
        // proceed to insert into database
        var jsonData = {
            action: 'updateAvailability',
            userHash: userHash,
            userAvailability: JSON.stringify(dateList)
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
                openNotification();
            }
        })
        .catch(error => {
            console.log('Error in the update Availability process...', error);
        }); 
    
    }; // handleSubmitAvailability

return (
    <>
    <div className="profileDialog">
             < div className="profile-container-title">My Availability {userHash}</div>
                <label className="profile-label"  htmlFor="imAvailable">Click below to select a date which you are available 
                for, and it will be added to the list below.<br />To remove a date, 
                click on the 'x' next to the date.</label>
                <div style={{ marginTop: 10 }}><DatePicker id="imAvailable" onChange={upDateDateList} format={'DD/MM/YYYY'} /></div>
                <div style={{ marginTop: 10, marginBottom: 5 }}>List of available dates</div>
                <div><TagRender
                    label={currentDateList}
                    closable
                    onClose={handleTagClose}
                    />
                </div>
            <button
                    className='custom-antd-button'
                    style={{ marginTop: 10, marginBottom: 5 }}
                    onClick={() => handleSubmitAvailability()}
                >
                    Update my Availability
                </button>
    </div>
    {contextHolder}
    </>
)

} 

export default MyAvailability;

