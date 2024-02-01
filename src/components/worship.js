import React, { useState, useEffect, useCallback } from 'react';
import { Select, Tag } from 'antd';

function Worship(props) {
    const [profileWorship, setProfileWorship] = useState(JSON.parse(props.profileWorship));
    const [WorshipValue, setWorshipValue] = useState(props.profileWorshipValue);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const profileWorshipOptions = [   
        { value: 1, label: 'Eucharist/Mass' },
        { value: 2, label: 'Eucharist with Baptism' },
        { value: 4, label: 'Happy to preach' },
        { value: 8, label: 'Happy to lead intercessions/prayers' },
        { value: 16, label: 'Morning Prayer' },
        { value: 32, label: 'Evening Prayer' },
        { value: 64, label: 'All Age Worship' },
        { value: 128, label: 'Free Worship' },
        { value: 256, label: 'Baptism' },
        { value: 512, label: 'Wedding' },
        { value: 1024, label: 'Funeral' },
        { value: 2048, label: 'Compline' },
        { value: 4096, label: 'Taize' },
        { value: 8192, label: 'Alt.Worship' },
        { value: 16384, label: 'Benediction' },
        { value: 32768, label: 'Incense' }
]


const updateProfileWorshipFromValue = useCallback(() => {
    let value = WorshipValue;
    let selectedOptions = [];

    profileWorshipOptions.forEach(option => {
        if (value >= option.value) {
            selectedOptions.push(option.label);
            value -= option.value;
        }
    });

    setProfileWorship(selectedOptions);
}, [WorshipValue, profileWorshipOptions]);

useEffect(() => {
    updateProfileWorshipFromValue();
}, [updateProfileWorshipFromValue]);


const handleSelectionChange = (values) => {
    // Calculate the sum of the selected values
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    setWorshipValue(sum);
    props.onWorshipValueChange(sum);
};
const tagRender = (props) => {
    const { label, value, closable, onClose } = props;
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

return (
    <>
        <label className="profile-label">I am comfortable leading worship in the following Worships</label>
        <Select
            mode="multiple"
            tagRender={tagRender}
            style={{ width: '80%' }}
            options={profileWorshipOptions}
            placeholder="Please select"
            value={profileWorship.map(label => {
                const option = profileWorshipOptions.find(option => option.label === label);
                return option ? option.value : null;
            })}
            
            onChange={handleSelectionChange}
        />
        <div><label className="profile-label">Selected Worships: {profileWorship.join(', ')} - Total Value: {WorshipValue}</label></div>
    </>
);
}

export default Worship;