import React, { useState } from 'react';
import { DatePicker, Input, Modal, Popover, Select, Tag, Slider, InputNumber } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import FormatSummary from './formatSummary';
import Directions from './Directions';
import { getConfig } from './config';

function convertToDDMMYYYY(timestamp) {
    var date = new Date(timestamp);
    var day = date.getDate().toString().padStart(2, '0');
    var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    var year = date.getFullYear();
    
    return day + '/' + month + '/' + year;
}

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
    const [matchesFound, setMatchesFound] = useState(0);
    const [isModalChurchLocationOpen, setIsModalChurchLocationOpen] = useState(false);
    const [isModalDateRequiredOpen, setIsModalDateRequiredOpen] = useState(false);
    const [selectedPriestPostcode, setSelectedPriestPostcode] = useState('');
    const [hoveredRecord, setHoveredRecord] = useState([]);
    
    const handleDateSearch = (dateString) => {
        setDateSearch(dateString);
        console.log(dateString);
    }

    const handleSearchRadius = (value) => {
        setSearchRadius(value);

        //redo search if searchData is already populated
        if (searchData) {
            handleButtonClick();
        }

    };

    const handlePostcodeChange = (event) => {
        setInputPostcode(event.target.value);
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



const handleButtonClick = () => {

let goodToGo = true;
setSearchData([]);
setSelectedPriestPostcode('');

    if (inputPostcode.length<6) {
        goodToGo=false;
        showModalChurchLocation();
    } 

    if (dateSearch===null) {
        goodToGo=false;
        showModalDateRequired();
    }

if (goodToGo) {

    const dSearch = convertTimestampToDateString(dateSearch);

    console.log("Date Search:\n" + dSearch);

    const start = performance.now();

            setIsLoadingSearch(true);
            var jsonData = {
                action: 'searchProfile',
                dateRequired: dSearch,
                worshipRequired: JSON.stringify(searchWorship),
                traditionRequired: JSON.stringify(searchTradition),
                searchRadius: searchRadius,
                churchPostcode: inputPostcode,
            };

            console.log(jsonData);


            fetch(getConfig('CM_NODE') + '/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData),
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'SUCCESS') {
                    const end = performance.now();
                    console.log(`Fetch took ${end - start} milliseconds`);
                    const messageObject = data.message;
                    setSearchData(messageObject);
                    setMatchesFound(messageObject.length);
                } else {
                    console.log('Failed to fetch data during searchProfile:', data);
                }
            })
            .catch(error => {
                console.log('Error fetching data during searchProfile:', error);
            })
            .finally(() => {
                setIsLoadingSearch(false);
            });
    } // good to Go
};

const handlePostcodeHover = (postcode) => {
    console.log('Hovered Postcode: ' + postcode); 

    const postcodeToFind = postcode;
    const matchingRecord = searchData.find(element => element.profilePostcode === postcodeToFind);
    if (matchingRecord) {
        setHoveredRecord(matchingRecord);      
    } else {
        console.log("No record found with the postcode:", postcodeToFind);
    }
    setSelectedPriestPostcode(postcode);
};

const RenderSearchResults = ({searchData }) => {

    return (
        <div>
            {searchData.map(element => (
                    <div key={element.id}>
                        <Popover content={<FormatSummary
                                        data={element}
                                        churchPostcode={inputPostcode}
                                        dateofService={convertToDDMMYYYY(dateSearch)}
                 />
                 } title="Details" trigger="click">
                    <div className="search-results-text" onMouseOver={() => handlePostcodeHover(element.profilePostcode)} key={element.id}>{element.profileTitle.replace(/\[.*?\]/g, '')} {element.profileFirstName} {element.profileSurname} <span className="distance-text">{element.distanceValue !== 'Unavailable' ? `${element.distanceText}` : 'Distance not available'}</span></div>
                </Popover>
                    </div>
                ))
                }
        </div>
    );
            }

return (
    <>
      <Modal title="Warning!" open={isModalChurchLocationOpen} onOk={handleChurchLocationOk} onCancel={handleChurchLocationCancel}>
        <p>Church location is required</p>
      </Modal>
      <Modal title="Warning!" open={isModalDateRequiredOpen} onOk={handleDateRequiredOk} onCancel={handleDateRequiredCancel}>
        <p>Date Required is not set</p>
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
            
                <div>Postcode of Church<sup>*</sup>: 
                    <Input
                        size="small"
                        onChange={handlePostcodeChange}
                        value={inputPostcode}
                    />
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
                    <div className="wait-image">Calculating matches and distances... this may take a few moments <LoadingOutlined /></div>
                )}
                {searchData && (
                    <>
                        <div>Search results - Found {matchesFound} results</div>
                        <div className="search-border">
                            <RenderSearchResults
                                inputPostcode={inputPostcode}
                                searchData={searchData} />
                        </div>
                    </>
                )}
            

            
                    { selectedPriestPostcode && (
                        <>
                        <div><Directions
                                key={selectedPriestPostcode}
                                startPostcode={selectedPriestPostcode}
                                endPostcode={inputPostcode}
                        />
                        </div>
                        <div></div>
                        <div><FormatSummary
                                    data={hoveredRecord}
                                    churchPostcode={inputPostcode}
                                    dateofService={convertToDDMMYYYY(dateSearch)}
                        />
                        </div>
                        </>
                    )
                    }
            
        </div>
    </div>
</>
);
}

export default SearchScreen;