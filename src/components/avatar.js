import React, { useState, useEffect } from 'react';
import { message, Upload } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';


const Avatar = ({ profileAvatar, onProfileAvatarChange }) => {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(profileAvatar);


    
    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
          message.error('You can only upload JPG/PNG file!');
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    useEffect(() => {
        if (profileAvatar) {
            setImageUrl(profileAvatar);
        }
    }, [profileAvatar]);


    const handleChange = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj, (url) => {
                setLoading(false);
                setImageUrl(url);
                onProfileAvatarChange(url); // Invoke the callback function
            });
        }
    };

    const handleChangeAvatar = () => {
        setImageUrl(''); // Reset imageUrl
        onProfileAvatarChange(''); // Reset the avatar in the parent component as well
    };
       

    const uploadButton = (
        <button
            style={{
                border: 0,
                background: 'none',
            }}
            type="button"
        >
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>
                Upload
            </div>
        </button>
    );

    return (
        <div>
            <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                beforeUpload={beforeUpload}
                onChange={handleChange} // Use handleChange here
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="avatar"
                        onClick={handleChangeAvatar} // Use handleChangeAvatar to reset the image on click
                        style={{ width: '100px' }}
                    />
                ) : (
                    uploadButton
                )}
            </Upload>
        </div>
    );
};

export default Avatar;
