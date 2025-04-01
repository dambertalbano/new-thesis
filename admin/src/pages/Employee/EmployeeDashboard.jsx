import axios from 'axios';
import { Loader } from "lucide-react";
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { EmployeeContext } from '../../context/EmployeeContext';

const EmployeeDashboard = () => {
    const [employeeInfo, setEmployeeInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { eToken, backendUrl } = useContext(EmployeeContext);

    const fetchEmployeeInfo = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${backendUrl}/api/employee/profile`, {
                headers: {
                    Authorization: `Bearer ${eToken}`,
                },
            });
            if (response.data.success) {
                setEmployeeInfo(response.data.profileData);
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
    }, [eToken, backendUrl]);

    useEffect(() => {
        fetchEmployeeInfo();
    }, [fetchEmployeeInfo]);

    const formatName = (user) => {
        if (!user) return '';
        return `${user?.firstName} ${user?.middleName ? user?.middleName + ' ' : ''}${user?.lastName}`;
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-2xl w-full">
                <div className="flex items-center justify-center mb-4 text-customRed">
                    {!loading && (
                        <div className="flex items-center justify-center mb-4 text-customRed">
                            <FiInfo className="w-8 h-8" />
                            <h2 className="text-3xl font-bold ml-2">Employee Information</h2>
                        </div>
                    )}
                </div>
                {loading ? (
                    <div className="flex justify-center items-center">
                        <Loader className="w-5 h-5 text-customRed animate-spin mr-2" />
                        <span className="text-customRed">Scanning ...</span>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : employeeInfo ? (
                    <UserInfoDisplay userInfo={employeeInfo} formatName={formatName} />
                ) : (
                    <p>No employee information available.</p>
                )}
            </div>
        </div>
    );
};

const UserInfoDisplay = ({ userInfo, formatName }) => {
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'No Data';
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
                <img
                    src={userInfo?.image || defaultImage}
                    alt={`Profile of ${formatName(userInfo)}`}
                    className="w-28 h-28 rounded-full border"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultImage; // Use default image as fallback
                    }}
                />
                <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold truncate">{formatName(userInfo)}</p>
                    <p className="text-sm text-gray-500">{userInfo?.email}</p>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-base text-gray-700 break-words">
                <p><strong>Email:</strong> {userInfo?.email}</p>
                <p><strong>Address:</strong> {userInfo?.address}</p>
                <p><strong>Contact Number:</strong> {userInfo?.number}</p>
                {userInfo?.position && <p><strong>Position:</strong> {userInfo?.position}</p>}
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

export default EmployeeDashboard;