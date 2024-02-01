import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { getConfig } from './config';




const containerStyle = {
  width: '200px',
  height: '200px'
};

const center = {
  lat: 51.5074,
  lng: -0.1278
};

const options = {
  streetViewControl: false,
  mapTypeControl: false,
  
};
const Directions = (props) => {

  const startPostcode=props.startPostcode;
  const endPostcode=props.endPostcode;

  const REACT_APP_GOOGLE_API_KEY = getConfig('REACT_APP_GOOGLE_API_KEY');
 // KEY=FMAP_MAP


  console.log("Directions using API Key: " + REACT_APP_GOOGLE_API_KEY + "\nStartPostcode: " + startPostcode + "\nEndPostcode: " + endPostcode);

 const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: REACT_APP_GOOGLE_API_KEY 
  });

  const [directions, setDirections] = useState(null);
  const [routeDistance, setRouteDistance] = useState('');
  const [routeDuration, setRouteDuration] = useState('');

  const calculateRoute = useCallback(() => {
    if (window.google) {
      const directionsService = new window.google.maps.DirectionsService();
  
      directionsService.route({
        origin: startPostcode, 
        destination: endPostcode,
        travelMode: window.google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
  
          // Accessing distance and duration
          const route = result.routes[0];
        const leg = route.legs[0];
        const distanceInMeters = leg.distance.value; // Distance in meters
        const distanceInMiles = distanceInMeters * 0.000621371; // Convert meters to miles

          const distance = distanceInMiles.toFixed(2) + ' miles';
          const duration = leg.duration.text; // e.g., "20 mins"
  
          console.log("Distance: " + distance + ", Duration: " + duration);
  
          // You can also set these values in your component's state
          setRouteDistance(distance);
          setRouteDuration(duration);
        } else {
          console.log(`error fetching directions ${result}`);
        }
      });
    }
  }, [startPostcode, endPostcode]);

  React.useEffect(() => {
    if (isLoaded) {
      calculateRoute();
    }
  }, [isLoaded, calculateRoute]);

  return isLoaded ? (
    <>
    <div className='summary-container-bordered'>
      <div className="summary-container-title">Details</div>
      <div className="map-display-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        options={options} 
      >
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
      <div className="map-display-legend">Coming from {startPostcode} is a distance of {routeDistance}</div>
      <div className="map-display-legend">Estimated travel time: {routeDuration}</div>
      </div>
    </div>
    </>
  ) : <></>;
}

export default Directions;
