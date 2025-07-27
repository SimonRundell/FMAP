import React from 'react';

const ProgressBar = ({ progress }) => {
  const ProgressBarStyle = {
    height: '20px',
    width: '100%',
    backgroundColor: '#ddd',
  };

  const FillerStyle = {
    height: '100%',
    width: `${progress}%`,
    backgroundColor: 'grey',
    textAlign: 'right',
    transition: 'width 1s ease-in-out',
  };

  const LabelStyle = {
    padding: '5px',
    color: 'white',
    fontWeight: 'bold'
  };

  return (
    <div style={ProgressBarStyle}>
      <div style={FillerStyle}>
        <span style={LabelStyle}>{`${Math.round(progress)}%`}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
