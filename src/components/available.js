import React, {useState, useEffect} from 'react';
import { DatePicker, notification, Tag } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { getConfig } from './config';

function formatDDMMYYYY(dateString) {

    const date = new Date(dateString);

    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // getUTCMonth() returns month from 0 to 11
    const year = date.getUTCFullYear();

    // Format the date as dd/mm/yyyy
    return `${day}/${month}/${year}`;
}

function MyAvailability (props) {

    const [userHash] = useState(props.userHash);
    const [api, contextHolder] = notification.useNotification();
    const [userAvailability, setUserAvailability] = useState([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  
    const openNotification = () => {
    api.open({
      message: 'Availability Updated',
      description:
        'Your availability has been updated.',
    });
  };

  useEffect(() => {
  var jsonData = {
    action: 'getAvailability',
    userHash: userHash
};

setIsLoadingAvailability(true);

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
        console.log("Returned from fmap_available:\n" + JSON.stringify(data.message));
        setUserAvailability(data.message);
      
    } else {
        console.log('Failed to fetch data from getAvailability:', data);
    }
})
.catch(error => {
    console.log('Error fetching data from getAvailability:', error);
})
.finally(() => {
    setIsLoadingAvailability(false);
});

}, [userHash]);

const TagRender = (props) => {
    const { label, closable, onClose } = props;

    const onPreventMouseDown = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return label.map((element, index) => (
        <Tag
            key={index}
            color="grey"
            onMouseDown={onPreventMouseDown}
            closable={closable}
            onClose={() => onClose(element)}
            style={{ marginRight: 3 }}
        >
            {formatDDMMYYYY(element.availableDate)}
        </Tag>
    ));
};

    
    const handleTagClose = (closedTag) => {
        const newDateList = userAvailability.filter(tag => tag !== closedTag);
        setUserAvailability(newDateList);
    };
    
    const upDateDateList = (date, dateString) => {
        const parts = dateString.split('/');
        const isoDateString = `${parts[2]}-${parts[1]}-${parts[0]}`;
    
        console.log("Date selected:\n" + isoDateString + "T00:00:00.000Z");
    
        setUserAvailability(prevDates => [...prevDates, { availableDate: isoDateString + "T00:00:00.000Z" }]);
    };
    

    const handleSubmitAvailability = () => {

        var jsonData = {
            action: 'updateAvailability',
            userHash: userHash,
            userAvailability: JSON.stringify(userAvailability),
        };
    
        console.log(JSON.stringify(jsonData));
                
        fetch(getConfig('CM_NODE') + '/updateAvailability', {
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
                <div>
                {isLoadingAvailability && (
                    <div className="wait-image">Getting your list of available dates...<LoadingOutlined /></div>
                )}
                    { userAvailability && (
                    <TagRender
                    label={userAvailability}
                    closable
                    onClose={handleTagClose}
                    />
                    )}
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

