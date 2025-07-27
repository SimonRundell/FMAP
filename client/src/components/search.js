import React, { useState, useEffect } from 'react';
import { DatePicker, Input, Modal, Popover, Select, Tag, Slider, InputNumber } from 'antd';
import { getConfig } from './config';
import axios from 'axios'; 
import DistanceFilter from './distance';

function convertTimestampToDateString(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, add 1 to get the correct month
    const day = date.getDate().toString().padStart(2, '0') + "T00:00:00.000Z";
  
    return `${year}-${month}-${day}`;
  }

function SearchScreen(props) {

    const [dateSearch, setDateSearch] = useState(null);
    const [searchWorship, setSearchWorship] = useState([]);
    const [searchTradition, setSearchTradition] = useState([]);
    const [searchData, setSearchData] = useState(null);
    const [inputPostcode, setInputPostcode] = useState('');
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [searchRadius, setSearchRadius] = useState(25);
    const [searchChurchLat, setSearchChurchLat] = useState('');
    const [searchChurchLong, setSearchChurchLong] = useState('');  

    const [isModalChurchLocationOpen, setIsModalChurchLocationOpen] = useState(false);
    const [isModalDateRequiredOpen, setIsModalDateRequiredOpen] = useState(false);
    const [isModalNoRecordsOpen, setIsModalNoRecordsOpen] = useState(false);

    
    const handleDateSearch = (dateString) => {
        setDateSearch(dateString);
        console.log(dateString);
    }

    const handleSearchRadius = (value) => {
        setSearchRadius(value);

        if (searchData) {
            handleButtonClick();
        }

    };

    const handlePostcodeChange = (event) => {
        setInputPostcode(event.target.value);

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
                  setSearchChurchLat(latitude);
                  setSearchChurchLong(longitude);
              }
  
              if (responseData['status']==='FAIL') {
                  console.log(JSON.stringify(responseData.message));
                  setSearchChurchLat('Invalid Postcode');
                  setSearchChurchLong('Please check postcode again');
              }
          })
          .catch(error => {
              console.log('Error in the Postcode Validation', error);
          }); 
      } // valid postcode

    }

    const showModalChurchLocation = () => {
        setIsModalChurchLocationOpen(true);
    };
    const handleChurchLocationOk = () => {
        setIsModalChurchLocationOpen(false);
    };
    const handleChurchLocationCancel = () => {
        setIsModalChurchLocationOpen(false);
    };

    const showModalDateRequired = () => {
        setIsModalDateRequiredOpen(true);
    };
    const handleDateRequiredOk = () => {
        setIsModalDateRequiredOpen(false);
    };
    const handleDateRequiredCancel = () => {
        setIsModalDateRequiredOpen(false);
    };

    const handleNoRecordsOk = () => {
      setIsModalNoRecordsOpen(false);
  };
  const handleNoRecordsCancel = () => {
      setIsModalNoRecordsOpen(false);
  };

    const searchWorshipOptions = [   
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

const searchTraditionOptions = [   
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

const isValidUKPostcode = (postcode) => {
  const postcodeRegex = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))\s?[0-9][A-Za-z]{2})$/;
  return postcodeRegex.test(postcode);
}



const handleButtonClick = async () => {
  let goodToGo = true;
  setSearchData([]);

  if (!isValidUKPostcode(inputPostcode)) {
    goodToGo = false;
    showModalChurchLocation();
  }

  if (dateSearch === null) {
    goodToGo = false;
    showModalDateRequired();
  }

  if (goodToGo) {
    // setIsLoadingSearch(true);
    const jsonData = {
      dateRequired: convertTimestampToDateString(dateSearch),
      worshipRequired: JSON.stringify(searchWorship),
      traditionRequired: JSON.stringify(searchTradition),
      churchLat: searchChurchLat,
      churchLong: searchChurchLong,
      searchRadius: searchRadius,
    };

    try {
      const response = await axios.post(getConfig('CM_NODE') + '/search', jsonData);

      if (response.data.status === 'SUCCESS') {
        setSearchData(response.data.data); 
         console.log(`Search found ${response.data.data.length} entries`);
      } else {
        console.log('Failed to fetch data during search:', response.data.message);
        setIsModalNoRecordsOpen(true);
      }
    } catch (error) {
      setIsLoadingSearch(false);
      console.error('Error fetching data during search:', error);
    }
  }
};

return (
    <>
      <Modal title="Warning!" open={isModalChurchLocationOpen} onOk={handleChurchLocationOk} onCancel={handleChurchLocationCancel}>
        <p>Church location is required</p>
      </Modal>
      <Modal title="Warning!" open={isModalDateRequiredOpen} onOk={handleDateRequiredOk} onCancel={handleDateRequiredCancel}>
        <p>Date Required is not set</p>
      </Modal>
      <Modal title="Warning!" open={isModalNoRecordsOpen} onOk={handleNoRecordsOk} onCancel={handleNoRecordsCancel}>
        <p>No matches have been found for that search</p>
      </Modal>
    <div className="profileDialog">
        <div className="summary-container-title">Find a Priest!</div>
        <div className="profile-container">
            
                <div className="searchDialog">
                    <div>Date Required<sup>*</sup>: <DatePicker id="searchDate" onChange={handleDateSearch} format={'DD/MM/YYYY'} /></div>
                </div>

                <label className="profile-label">Tradition/Practice</label>
            <div><Select
                mode="multiple"
                tagRender={tagRender}
                style={{ width: '80%' }}
                options={searchTraditionOptions}
                placeholder="Please select"
                value={searchTradition}
                onChange={setSearchTradition}
            />
            </div>
            <div><label className="profile-label">Service</label></div>
            <div><Select
                mode="multiple"
                tagRender={tagRender}
                style={{ width: '80%' }}
                options={searchWorshipOptions}
                placeholder="Please select"
                value={searchWorship}
                onChange={setSearchWorship}
            />
            </div>
            
                <div><label className="profile-label">Postcode of Church<sup>*</sup></label>: 
                    <Input
                        size="small"
                        onChange={handlePostcodeChange}
                        value={inputPostcode}
                    />
                  <div className='profile-checkbox'>{searchChurchLat}, {searchChurchLong}</div>
                </div>
                <div>
                    <label className="profile-label">Search Radius</label>
                </div>
                <div className='profile-container'>
                
                        <Slider 
                            defaultValue={5}
                            min={5}
                            max={50}
                            step={5} 
                            value={searchRadius} 
                            onChange={handleSearchRadius}
                            variant="filled"
                        />
                    
                    
                        <InputNumber
                            value={searchRadius}
                            onChange={handleSearchRadius}
                            addonAfter="miles from postcode"
                            variant="filled"
                        />
                    
                </div>

                <button className="custom-antd-button" onClick={handleButtonClick}>Search</button>
                {isLoadingSearch && (
                    <>
                    <div className="wait-image">Calculating matches and distances... this may take a few moments
                    </div>
                    </>
                )}
                {searchData && (
                    <>
                        <div className="search-border">
                            <DistanceFilter
                                inputPostcode={inputPostcode}
                                initialRecords={searchData} 
                                searchRadius={searchRadius}
                                dateSearch={dateSearch}/>
                        </div>
                    </>
                )}            
        </div>
    </div>
</>
);
}

export default SearchScreen;