import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { FaFileExcel } from 'react-icons/fa';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { StudentContext } from '../../context/StudentContext';

const StudentAttendance = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const { sToken, backendUrl } = useContext(StudentContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttendanceRecords = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${backendUrl}/api/student/attendance`, {
                    headers: {
                        Authorization: `Bearer ${sToken}`,
                    },
                });
                if (response.data.success) {
                    setAttendanceRecords(response.data.attendance);
                    console.log('attendanceRecords:', response.data.attendance); // Add this line
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
        };

        fetchAttendanceRecords();
    }, [sToken, backendUrl]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US');
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const generateExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['Name', 'Education Level', 'Grade Year Level', 'Section', 'Date', 'Sign In Time', 'Sign Out Time'],
            ...attendanceRecords.map(record => [
                `${record.user.firstName} ${record.user.middleName ? record.user.middleName.charAt(0) + '.' : ''} ${record.user.lastName}`,
                record.user.educationLevel,
                record.user.gradeYearLevel,
                record.user.section,
                formatDate(record.date),
                record.signInTime ? formatTime(record.signInTime) : 'N/A',
                record.signOutTime ? formatTime(record.signOutTime) : 'N/A',
            ])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Records');
        XLSX.writeFile(wb, 'Student Attendance Records.xlsx');
    };

    if (loading) {
        return <div>Loading attendance records...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Your Attendance Records</h1>
            <div className="flex justify-end mb-4">
                <button
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
                                onClick={generateExcel}
                            >
                                <FaFileExcel className="inline mr-2" /> Generate Excel
                            </button>
            </div>
            <table className="min-w-full table-auto border-collapse">
                <thead>
                    <tr className="border-b bg-gray-100">
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Education Level</th>
                        <th className="px-4 py-2 text-left">Grade Year Level</th>
                        <th className="px-4 py-2 text-left">Section</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Sign In Time</th>
                        <th className="px-4 py-2 text-left">Sign Out Time</th>
                    </tr>
                </thead>
                <tbody>
                    {attendanceRecords.map((record) => (
                        <tr key={record._id} className="border-b">
                            <td className="px-4 py-2">
                                {record.user.firstName} {record.user.middleName ? record.user.middleName.charAt(0) + '.' : ''} {record.user.lastName}
                            </td>
                            <td className="px-4 py-2">{record.user.educationLevel}</td>
                            <td className="px-4 py-2">{record.user.gradeYearLevel}</td>
                            <td className="px-4 py-2">{record.user.section}</td>
                            <td className="px-4 py-2">{formatDate(record.date)}</td>
                            <td className="px-4 py-2">{record.signInTime ? formatTime(record.signInTime) : 'N/A'}</td>
                            <td className="px-4 py-2">{record.signOutTime ? formatTime(record.signOutTime) : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StudentAttendance;