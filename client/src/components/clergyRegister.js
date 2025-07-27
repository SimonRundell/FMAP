import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getConfig } from './config';

function extractTextBetween(str, start, end) {
    const startIndex = str.indexOf(start);
    const endIndex = str.indexOf(end, startIndex + start.length);
    
    if (startIndex !== -1 && endIndex !== -1) {
      // Adding start.length to startIndex to not include the starting string itself
      return str.substring(startIndex + start.length, endIndex);
    } else {
      return ''; // Or null, or undefined, depending on how you want to handle not found cases
    }
  }

  function convertTableToDivs(htmlString) {
    // Replace the table headers
    htmlString = htmlString.replace(/<thead>[\s\S]*?<\/thead>/g, (match) => {
      return match
        .replace(/<tr>/g, '<div class="clergy-row header-row">')
        .replace(/<\/tr>/g, '</div>')
        .replace(/<th class="(.*?)">(.*?)<\/th>/g, '<div class="cell-content">$2</div>');
    });
  
    // Replace the table body
    htmlString = htmlString.replace(/<tbody[\s\S]*?<\/tbody>/g, (match) => {
      return match
        .replace(/<tr>/g, '<div class="clergy-row">')
        .replace(/<\/tr>/g, '</div>')
        .replace(/<td class="(.*?)">(.*?)<\/td>/g, '<div class="cell-content">$2</div>');
    });
  
    // Remove the table, thead, tbody tags but keep the content inside
    htmlString = htmlString.replace(/<\/?(table|tbody)>/g, '');

    // remove the View All Roles column
    htmlString = htmlString.replace('<a href="#" class="expand-toggle-natreg">View all roles</a>', '');
  
    // Optional: Wrap the resulting structure in a div if needed
    htmlString = `<div class="clergy-data">${htmlString}</div>`;
  
    return htmlString;
  }

  function HtmlContent({ htmlString }) {
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
  }

const ClergyDetails = ({ memberName }) => {
  const [clergyData, setClergyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        var jsonData = {
            memberName: memberName
        }

      setIsLoading(true);
      try {
        
        const response = await axios.post(getConfig('CM_NODE') + '/getClergyRegister', jsonData);
        
        setClergyData(response.data);
      } catch (error) {
        console.error('Error fetching clergy data:', error);
        setClergyData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (memberName) {
      fetchData();
    }
  }, [memberName]);

  if (isLoading) return <p>Loading...</p>;
  if (!clergyData) return <p>No data from the National Clergy Register found</p>;

 

  const renderClergyData = () => {
    var clergyTable = extractTextBetween(clergyData, '<table class="national-register-table">', '</table>');
    clergyTable.replace('class', 'className');
    clergyTable = convertTableToDivs(clergyTable);
    return (
        <>
        <div className="summary-label">Details matching my name from the Church of England National Register</div>
        <div>&nbsp;</div>
         <HtmlContent htmlString={clergyTable} />
         <div>&nbsp;</div>
         <div className="summary-label">About the National Register Entry</div>
         <div className="summary-small">The National Register is only about those who are authorised. It will not say who is not authorised or why. There may be very good reasons why someone is not authorised, and conclusions should not be made on the basis of non-inclusion.  For example, they could be taking a temporary break from ministry, or have retired, or be between roles. But if someone is carrying out ministry they do need to be authorised. If someone is suspended or had their PTO/licence removed, or their PTO has lapsed, they also will not appear.</div>
         <div>For more information, please see the <a href="https://www.churchofengland.org/about/national-register-clergy#FAQ">Church of England National Register FAQ</a></div>
        </>
    )
  };

  return (
    <div className="clergy-data">
      {renderClergyData()}
    </div>
  );
};

export default ClergyDetails;
