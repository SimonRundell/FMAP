import React from 'react';
import { GoogleMap, LoadScriptNext, Marker, Circle } from '@react-google-maps/api';
import { getConfig } from './config';
 

const containerStyle = {
  width: '100%',
  height: '400px' 
};

const options = {
  streetViewControl: false,
  mapTypeControl: false,
  
};

const MapComponent = ({ lat, lng, radiusInMiles }) => {
  
  // convert miles to km
  const radiusInKm = radiusInMiles * 1.609;
  
  // Convert kilometers to meters for the radius

  const radiusInMeters = radiusInKm * 1000;

  const center = {
    lat: parseFloat(lat),
    lng: parseFloat(lng)
  };



  return (
    <LoadScriptNext googleMapsApiKey={getConfig('CM_API_URL')}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={16}
        options={options}
      >
        {/* Marker */}
        <Marker position={center} />

        {/* Circle */}
        <Circle
          center={center}
          radius={radiusInMeters}
          options={{
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.30,
          }}
        />
      </GoogleMap>
    </LoadScriptNext>
  );
};


export default MapComponent;

