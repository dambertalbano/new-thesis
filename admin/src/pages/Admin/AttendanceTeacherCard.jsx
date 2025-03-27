import React, { useCallback, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaClock, FaSearch, FaTimes } from 'react-icons/fa';
import { useAdminContext } from '../../context/AdminContext';

const AttendanceTeacherCard = () => {
    const { teachers, aToken, fetchAttendanceRecords } = useAdminContext();
    const [isViewingTimeIn, setIsViewingTimeIn] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const records = await fetchAttendanceRecords(currentDate);
                if (!records || !Array.isArray(records)) {
                }

                // Filter records to only include teachers
                const teacherRecords = records.filter(record => record.userType === 'Teacher');

                setAttendanceRecords(teacherRecords);
            } catch (err) {
                setError(err.message || 'Failed to fetch attendance records');
                setAttendanceRecords([]);
            } finally {
                setLoading(false);
            }
        };

        if (aToken) {
            fetchData();
        } else {
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

    const handleDateChange = useCallback((date) => {
        setCurrentDate(date);
        setIsCalendarOpen(false);
    }, [setCurrentDate, setIsCalendarOpen]);

    const toggleCalendar = useCallback(() => {
        setIsCalendarOpen(prev => !prev);
    }, [setIsCalendarOpen]);

    const userRows = React.useMemo(() => {
        const rows = filteredAttendanceRecords
            .filter(record => {
                const eventTypeMatches = isViewingTimeIn ? record.eventType === 'sign-in' : record.eventType === 'sign-out';
                return eventTypeMatches;
            })
            .map((record) => {
                if (!record.user) {
                    return null;
                }

                return (
                    <tr key={record._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{`${record.user.firstName} ${record.user.middleName || ''} ${record.user.lastName}`}</td>
                        <td className="px-4 py-2">Teacher</td>
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
                    className="bg-gray-200 hover:bg-gray-300 rounded-full p-2"
                    onClick={toggleCalendar}
                >
                    <FaCalendarAlt />
                </button>
                <span className="font-semibold mx-4">{currentDate.toLocaleDateString()}</span>
                {isCalendarOpen && (
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-10">
                        <div className="flex justify-end">
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={toggleCalendar}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <DatePicker
                            selected={currentDate}
                            onChange={handleDateChange}
                            inline
                        />
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse mt-5">
                    <thead>
                        <tr className="border-b bg-gray-100">
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

export default AttendanceTeacherCard;