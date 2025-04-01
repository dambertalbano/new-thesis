import React, { useContext, useEffect, useState } from 'react';
import { FaFileExcel } from 'react-icons/fa';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { EmployeeContext } from '../../context/EmployeeContext';

const EmployeeAttendance = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getEmployeeAttendance } = useContext(EmployeeContext);

    useEffect(() => {
        const fetchAttendanceRecords = async () => {
            setLoading(true);
            setError(null);
            try {
                const attendanceData = await getEmployeeAttendance();
                if (attendanceData) {
                    setAttendanceRecords(attendanceData);
                } else {
                    setError('Failed to fetch attendance records.');
                }
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceRecords();
    }, [getEmployeeAttendance]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US');
    };

    const formatTime = (timeString) => {
        return timeString; // Time is already formatted in EmployeeContext
    };

    const generateExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['Name', 'Position', 'Date', 'Sign In Time', 'Sign Out Time'],
            ...attendanceRecords.map(record => [
                record.name,
                record.position,
                record.date,
                record.signInTime,
                record.signOutTime,
            ])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Records');
        XLSX.writeFile(wb, 'Employee Attendance Records.xlsx');
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
                        <th className="px-4 py-2 text-left">Position</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Sign In Time</th>
                        <th className="px-4 py-2 text-left">Sign Out Time</th>
                    </tr>
                </thead>
                <tbody>
                    {attendanceRecords.map((record, index) => (
                        <tr key={index} className="border-b">
                            <td className="px-4 py-2">{record.name}</td>
                            <td className="px-4 py-2">{record.position}</td>
                            <td className="px-4 py-2">{record.date}</td>
                            <td className="px-4 py-2">{record.signInTime}</td>
                            <td className="px-4 py-2">{record.signOutTime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeAttendance;