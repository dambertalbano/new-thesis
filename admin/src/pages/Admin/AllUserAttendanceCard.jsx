import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaClock, FaSearch } from 'react-icons/fa';
import { useAdminContext } from '../../context/AdminContext';

const AllUserAttendanceCard = () => {
    const { students, teachers, aToken, fetchAttendanceRecords } = useAdminContext();
    const [isViewingTimeIn, setIsViewingTimeIn] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [userListsLoading, setUserListsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setUserListsLoading(true);
            setLoading(true);
            setError(null);

            try {
                const records = await fetchAttendanceRecords(currentDate);
                setAttendanceRecords(records);
            } catch (err) {
                setError(err.message || 'Failed to fetch attendance records');
                setAttendanceRecords([]);
            } finally {
                setLoading(false);
                setUserListsLoading(false);
            }
        };

        if (aToken) {
            fetchData();
        }
    }, [aToken, fetchAttendanceRecords, currentDate]);

    const toggleView = useCallback((view) => {
        setIsViewingTimeIn(view === 'timeIn');
    }, [setIsViewingTimeIn]);

    const handleSearch = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, [setSearchTerm]);

    const formatName = useCallback((user) => {
        if (!user) return 'N/A';
        return `${user.lastName || ''}, ${user.firstName || ''} ${user.middleName ? `${user.middleName.charAt(0)}.` : ''}`.trim();
    }, []);

    const formatDate = useCallback((date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    }, []);

    const formatTime = useCallback((date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleTimeString();
    }, []);

    const goToPreviousDay = useCallback(() => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() - 1);
            return newDate;
        });
    }, []);

    const goToNextDay = useCallback(() => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() + 1);
            return newDate;
        });
    }, []);

    const userRows = useMemo(() => {
        if (!Array.isArray(attendanceRecords)) {
            console.warn("attendanceRecords is not an array:", attendanceRecords);
            return [];
        }

        // Filter attendance records based on isViewingTimeIn
        const filteredAttendanceRecords = attendanceRecords.filter(record => {
            return isViewingTimeIn ? record.eventType === 'sign-in' : record.eventType === 'sign-out';
        });

        return filteredAttendanceRecords.map((record) => {
            const user = record.user;
            const role = record.userType;

            return (
                <tr key={record._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{user.studentNumber || user._id}</td>
                    <td className="px-4 py-2">{formatName(user)}</td>
                    <td className="px-4 py-2">{role}</td>
                    <td className="px-4 py-2">{formatDate(record.timestamp)}</td>
                    <td className="px-4 py-2">{formatTime(record.timestamp)}</td>
                </tr>
            );
        });
    }, [attendanceRecords, formatName, formatDate, formatTime, isViewingTimeIn]); // Add isViewingTimeIn to dependencies

    if (loading) {
        return <div className="flex justify-center items-center h-full">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="p-6 bg-white w-full">
            <div className="mb-6 flex justify-between items-center">
                <div className="relative">
                    <input
                        type="text"
                        className="border rounded px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search by Name"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <FaSearch className="absolute top-3 right-3 text-gray-400" />
                </div>
                <div className="flex space-x-2">
                    <button
                        className={`bg-green-500 text-white text-sm font-medium py-2 px-4 rounded hover:bg-green-700 transition duration-200 ${isViewingTimeIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => toggleView('timeIn')}
                        disabled={isViewingTimeIn}
                        title="View Time-In"
                    >
                        <FaClock className="inline mr-2" /> View Time-In
                    </button>
                    <button
                        className={`bg-customRed text-white text-sm font-medium py-2 px-4 rounded hover:bg-red-700 transition duration-200 ${!isViewingTimeIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => toggleView('timeOut')}
                        disabled={!isViewingTimeIn}
                        title="View Time-Out"
                    >
                        <FaClock className="inline mr-2" /> View Time-Out
                    </button>
                </div>
            </div>

            <div className="flex justify-center items-center mb-4">
                <button
                    className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 mr-2"
                    onClick={goToPreviousDay}
                >
                    <FaArrowLeft />
                </button>
                <span className="font-semibold">{currentDate.toLocaleDateString()}</span>
                <button
                    className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 ml-2"
                    onClick={goToNextDay}
                >
                    <FaArrowRight />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse mt-5">
                    <thead>
                        <tr className="border-b bg-gray-100">
                            <th className="px-4 py-2 text-left text-gray-600">ID Number</th>
                            <th className="px-4 py-2 text-left text-gray-600">Name</th>
                            <th className="px-4 py-2 text-left text-gray-600">Role</th>
                            <th className="px-4 py-2 text-left text-gray-600">Date</th>
                            <th className="px-4 py-2 text-left text-gray-600">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userRows}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllUserAttendanceCard;