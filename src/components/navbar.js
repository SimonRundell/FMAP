import React, { useState, useEffect, useRef } from 'react';

function DropdownMenu ( {  onMenuChoice } ) {
    const [isVisible, setIsVisible] = useState(false);
    const dropdownRef = useRef(null);
    // const isAdmin = currentUser && 'userPrivilege' in currentUser && currentUser['userPrivilege'] === 3;
    // const isLoggedIn = currentUser && 'userPrivilege' in currentUser && currentUser['userPrivilege'] > 1;


  
    const toggleVisibility = () => {
      setIsVisible(prev => !prev);
    };
  
    // This effect handles the case when you click outside of the dropdown menu.
    useEffect(() => {
      function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsVisible(false);
        }
      }
  
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [dropdownRef]);

    const handleMenuChoice = (value) => {
        setIsVisible(false);
        onMenuChoice(value);
    }
  
    return (
      <div className="dropdown-container" ref={dropdownRef}>
        <button onClick={toggleVisibility} className="menu-icon">
          ☰
        </button>
        {isVisible && (
          <div className="dropdown">
            <ul>
        {/* { isLoggedIn && ( */}
          <>
            <li><span onClick={()=>{handleMenuChoice(0)}}>Home</span></li>
            <li><span onClick={()=>{handleMenuChoice(1)}}>My Profile</span></li>
            <li><span onClick={()=>{handleMenuChoice(2)}}>My Availability</span></li>
            <li><span onClick={()=>{handleMenuChoice(4)}}>Search</span></li>
            </>
        {/* )} */}

            <li><span onClick={()=>{handleMenuChoice(7)}}>Log Out</span></li>



          </ul>
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;
