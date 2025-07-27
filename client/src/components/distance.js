import React, { useState } from 'react';
import FormatSummary from './formatSummary';

function convertToDDMMYYYY(timestamp) {
  var date = new Date(timestamp);
  var day = date.getDate().toString().padStart(2, '0');
  var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  var year = date.getFullYear();
  
  return day + '/' + month + '/' + year;
}

const DistanceFilter = ({ inputPostcode, searchRadius, dateSearch, initialRecords }) => {
  const [selectedPriestPostcode, setSelectedPriestPostcode] = useState('');
  const [hoveredRecord, setHoveredRecord] = useState([]);

  const RecordComponent = ({ element, inputPostcode, dateSearch }) => {

    const handlePostcodeHover = (postcode) => {
      console.log('Hovered Postcode: ' + postcode); 
  
      const postcodeToFind = postcode;
      const matchingRecord = initialRecords.find(element => element.profilePostcode === postcodeToFind);
      if (matchingRecord) {
          setHoveredRecord(matchingRecord);      
      } else {
          console.log("No record found with the postcode:", postcodeToFind);
      }
      setSelectedPriestPostcode(postcode);
  };
  
  
    return (
      <div key={element.id}>
          <div className="search-results-text" onMouseOver={() => handlePostcodeHover(element.profilePostcode)}>
            {element.profileTitle.replace(/\[.*?\]/g, '')} {element.profileFirstName} {element.profileSurname} 
            <span className="distance-text">{element.distance ? `${element.distance} miles` : 'Distance not available'}</span>
          </div>
      </div>
    );
  };
  
  return (
    <div>
    <div className='search-border'>Found {initialRecords.length} results:</div>
    {initialRecords.map(element => (
        <RecordComponent
          key={element.id}
          element={element}
          inputPostcode={inputPostcode}
          searchRadius={searchRadius}
          dateSearch={dateSearch}
        />
      ))}
    { selectedPriestPostcode && (
      <>
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
  );

};

export default DistanceFilter;
