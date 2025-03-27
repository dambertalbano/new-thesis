import React, { useCallback, useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaClock, FaSearch } from 'react-icons/fa';
import { useAdminContext } from '../../context/AdminContext';

const AttendanceEmployeeCard = () => {
    const { employees, aToken, fetchAttendanceRecords } = useAdminContext();
    const [isViewingTimeIn, setIsViewingTimeIn] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const records = await fetchAttendanceRecords(currentDate);
                if (!records || !Array.isArray(records)) {
                    console.error("fetchAttendanceRecords did not return an array:", records);
                }

                // Filter records to only include employees
                const employeeRecords = records.filter(record => record.userType === 'Employee');

                setAttendanceRecords(employeeRecords);
            } catch (err) {
                console.error('Error fetching attendance records:', err);
                setError(err.message || 'Failed to fetch attendance records');
                setAttendanceRecords([]);
            } finally {
                setLoading(false);
            }
        };

        if (aToken) {
            fetchData();
        } else {
            console.warn('aToken is missing. Skipping fetchData.');
        }
    }, [aToken, fetchAttendanceRecords, currentDate]);

    const toggleView = useCallback((view) => {
        setIsViewingTimeIn(view === 'timeIn');
    }, [setIsViewingTimeIn]);

    const handleSearch = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, [setSearchTerm]);

    const filteredAttendanceRecords = React.useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();

        const filtered = attendanceRecords.filter(record => {
            if (!record.user) {
                console.warn(`User data missing for record: ${record._id}`);
                return false;
            }

            const fullName = `${record.user.firstName} ${record.user.middleName || ''} ${record.user.lastName}`.toLowerCase();
            return fullName.includes(lowerSearchTerm);
        });

        return filtered;
    }, [attendanceRecords, searchTerm]);

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

    const userRows = React.useMemo(() => {
        const rows = filteredAttendanceRecords
            .filter(record => {
                const eventTypeMatches = isViewingTimeIn ? record.eventType === 'sign-in' : record.eventType === 'sign-out';
                return eventTypeMatches;
            })
            .map((record) => {
                if (!record.user) {
                    console.warn(`User data missing for record: ${record._id}`);
                    return null;
                }

                return (
                    <tr key={record._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{`${record.user.firstName} ${record.user.middleName || ''} ${record.user.lastName}`}</td>
                        <td className="px-4 py-2">Employee</td>
                        <td className="px-4 py-2">{record.user.position || 'N/A'}</td>
                        <td className="px-4 py-2">{formatDate(record.timestamp)}</td>
                        <td className="px-4 py-2">{formatTime(record.timestamp)}</td>
                    </tr>
                );
            }).filter(row => row !== null);

        return rows;
    }, [filteredAttendanceRecords, formatDate, formatTime, isViewingTimeIn]);

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

            {/* Date Navigation */}
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
                            <th className="px-4 py-2 text-left text-gray-600">Name</th>
                            <th className="px-4 py-2 text-left text-gray-600">Role</th>
                            <th className="px-4 py-2 text-left text-gray-600">Position</th>
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

export default AttendanceEmployeeCard;