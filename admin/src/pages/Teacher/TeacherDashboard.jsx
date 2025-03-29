import axios from 'axios';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FiInfo } from 'react-icons/fi'; // Import FiInfo icon
import { toast } from 'react-toastify';
import { TeacherContext } from '../../context/TeacherContext';

const TeacherDashboard = () => {
    const [teacherInfo, setTeacherInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { dToken, backendUrl } = useContext(TeacherContext);

    const fetchTeacherInfo = useCallback(async () => {
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
            } else {
                toast.error(response.data.message);
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [dToken, backendUrl]);

    useEffect(() => {
        fetchTeacherInfo();
    }, [fetchTeacherInfo]);

    const formatName = (user) => {
        if (!user) return '';
        return `${user?.firstName} ${user?.middleName ? user?.middleName + ' ' : ''}${user?.lastName}`;
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-2xl w-full">
                <div className="flex items-center justify-center mb-4 text-customRed">
                    <FiInfo className="w-8 h-8" />
                    <h2 className="text-3xl font-semibold ml-2">Teacher Information</h2>
                </div>
                {loading ? (
                    <p className="text-blue-500 text-center">⏳ Loading...</p>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : teacherInfo ? (
                    <UserInfoDisplay userInfo={teacherInfo} formatName={formatName} />
                ) : (
                    <p>No teacher information available.</p>
                )}
            </div>
        </div>
    );
};

const UserInfoDisplay = ({ userInfo, formatName }) => {
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return 'Invalid Date';
        }
    };

    return (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow-md text-left w-full">
            <div className="flex flex-wrap items-center gap-4">
                <img src={userInfo?.image || 'blank-image-url'} alt="Teacher" className="w-28 h-28 rounded-full border" />
                <div className="flex-1 min-w-0">
                    <p className="text-xl font-semibold truncate">{formatName(userInfo)}</p>
                    <p className="text-sm text-gray-500">{userInfo?.email}</p>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-base text-gray-700 break-words">
                <p><strong>Email:</strong> {userInfo?.email}</p>
                <p><strong>Address:</strong> {userInfo?.address}</p>
                <p><strong>Contact Number:</strong> {userInfo?.number}</p>
                {userInfo?.position && <p><strong>Position:</strong> {userInfo?.position}</p>}
                {userInfo?.educationLevel && <p><strong>Education Level:</strong> {userInfo?.educationLevel}</p>}
                {userInfo?.gradeYearLevel && <p><strong>Grade/Year Level:</strong> {userInfo?.gradeYearLevel}</p>}
                {userInfo?.section && <p><strong>Section:</strong> {userInfo?.section}</p>}
                {userInfo?.subjects && <p><strong>Subjects:</strong> {userInfo?.subjects}</p>}
            </div>
            <div className="col-span-1 sm:col-span-2 flex justify-between border-t pt-2">
                <p className="text-green-500"><strong>Sign In Time:</strong> {formatDateTime(userInfo?.signInTime)}</p>
                {userInfo?.signOutTime && (
                    <p className="text-red-500"><strong>Sign Out Time:</strong> {formatDateTime(userInfo?.signOutTime)}</p>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;