import React, { useState, useEffect, useCallback } from 'react';
import { Select, Tag } from 'antd';

function Tradition(props) {
    const [profileTradition, setProfileTradition] = useState(JSON.parse(props.profileTradition));
    const [traditionValue, setTraditionValue] = useState(props.profileTraditionValue);

    const profileTraditionOptions = [   
        { value: 1, label: 'Conservative Evangelical' },
        { value: 2, label: 'Charismatic' },
        { value: 4, label: 'Liberal Evangelical' },
        { value: 8, label: 'Central Evangelical' },
        { value: 16, label: 'Broad Church Traditon' },
        { value: 32, label: 'Book of Common Prayer' },
        { value: 64, label: 'Liberal Catholic' },
        { value: 128, label: 'Traditional Catholic' },
        { value: 256, label: 'Traditional Hymnody' },
        { value: 512, label: 'Contemporary Worship Music' },
        { value: 1024, label: 'Contemplative' },
        { value: 2048, label: 'Alt.Worship' }
]

        const updateProfileTraditionFromValue = useCallback(() => {
            let value = traditionValue;
            let selectedOptions = [];

            profileTraditionOptions.forEach(option => {
                if (value >= option.value) {
                    selectedOptions.push(option.label);
                    value -= option.value;
                }
            });

            setProfileTradition(selectedOptions);
        }, [traditionValue, profileTraditionOptions]);

        useEffect(() => {
            updateProfileTraditionFromValue();
        }, [updateProfileTraditionFromValue]);

        const handleSelectionChange = (values) => {
            // Calculate the sum of the selected values
            const sum = values.reduce((acc, curr) => acc + curr, 0);
            setTraditionValue(sum);
            props.onTraditionValueChange(sum);
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
                <label className="profile-label">I am comfortable leading worship in the following traditions</label>
                <Select
                    mode="multiple"
                    tagRender={tagRender}
                    style={{ width: '80%' }}
                    options={profileTraditionOptions}
                    placeholder="Please select"
                    value={profileTradition.map(label => {
                        const option = profileTraditionOptions.find(option => option.label === label);
                        return option ? option.value : null;
                    })}
                    onChange={handleSelectionChange}
                />
                <div><label className="profile-label">Selected Traditions: {profileTradition.join(', ')} - Total Value: {traditionValue}</label></div>
            </>
        );
    }
    
    export default Tradition;