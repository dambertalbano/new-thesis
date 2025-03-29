import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { TeacherContext } from '../../context/TeacherContext';

const TeacherProfile = () => {
    const [teacherInfo, setTeacherInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedInfo, setEditedInfo] = useState({});
    const { dToken, backendUrl, updateTeacher } = useContext(TeacherContext);

    useEffect(() => {
        const fetchTeacherProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${backendUrl}/api/teacher/profile`, {
                    headers: {
                        Authorization: `Bearer ${dToken}`,
                    },
                });
                if (response.data.success) {
                    setTeacherInfo(response.data.profileData);
                    setEditedInfo(response.data.profileData); // Initialize editedInfo with fetched data
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherProfile();
    }, [dToken, backendUrl]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedInfo({
            ...editedInfo,
            [name]: value,
        });
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        try {
            const response = await axios.put(
                `${backendUrl}/api/teacher/update-profile`,
                editedInfo,
                {
                    headers: {
                        Authorization: `Bearer ${dToken}`,
                    },
                }
            );

            if (response.data.success) {
                setTeacherInfo(editedInfo); // Update local state with edited info
                setIsEditing(false);
                alert('Profile updated successfully!');
            } else {
                setError(response.data.message);
                alert('Failed to update profile.');
            }
        } catch (error) {
            setError(error.message);
            alert('Error updating profile.');
        }
    };

    if (loading) {
        return <div className="text-center">Loading teacher profile...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4">
                    <h2 className="text-gray-800 text-2xl font-semibold mb-2">Teacher Profile</h2>
                    {teacherInfo && (
                        <div>
                            {isEditing ? (
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                                            First Name
                                        </label>
                                        <input
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="firstName"
                                            type="text"
                                            name="firstName"
                                            value={editedInfo.firstName || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                                            Last Name
                                        </label>
                                        <input
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="lastName"
                                            type="text"
                                            name="lastName"
                                            value={editedInfo.lastName || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                            Email
                                        </label>
                                        <input
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={editedInfo.email || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="button"
                                        onClick={handleSaveClick}
                                    >
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-gray-600 mt-4">
                                        <strong>First Name:</strong> {teacherInfo.firstName}
                                    </p>
                                    <p className="text-gray-600 mt-4">
                                        <strong>Last Name:</strong> {teacherInfo.lastName}
                                    </p>
                                    <p className="text-gray-600 mt-4">
                                        <strong>Email:</strong> {teacherInfo.email}
                                    </p>
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
                                        type="button"
                                        onClick={handleEditClick}
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;