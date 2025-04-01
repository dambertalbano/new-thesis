import React, { useCallback, useContext, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaFileExcel, FaSearch, FaTimes } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { TeacherContext } from '../../context/TeacherContext';

const TeacherAttendance = () => {
    const { dToken, backendUrl } = useContext(TeacherContext);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teacherId, setTeacherId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [teachingAssignments, setTeachingAssignments] = useState([]);

    const fetchTeacherInfo = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${backendUrl}/api/teacher/profile`, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setTeacherId(data.profileData._id);
                setTeachingAssignments(data.profileData.teachingAssignments || []);
            } else {
                setError(data.message || 'Failed to fetch teacher profile.');
            }
        } catch (err) {
            console.error('Error fetching teacher profile:', err);
            setError(err.message || 'Failed to fetch teacher profile.');
        } finally {
            setLoading(false);
        }
    }, [dToken, backendUrl]);

    const fetchStudents = useCallback(async () => {
        if (!teacherId) {
            console.log('Missing teacherId:', { teacherId });
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const formattedDate = currentDate.toISOString();
            const url = `${backendUrl}/api/teacher/students/${teacherId}?date=${formattedDate}`;

            console.log('Fetching students from URL:', url);

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Students data from API:', data.students);
                setStudents(data.students);
            } else {
                setError('Failed to fetch students.');
                setStudents([]);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            setError(err.message || 'Failed to fetch students.');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }, [teacherId, dToken, backendUrl, currentDate]);

    useEffect(() => {
        fetchTeacherInfo();
    }, [fetchTeacherInfo]);

    useEffect(() => {
        if (teacherId) {
            fetchStudents();
        }
    }, [fetchStudents, teacherId, currentDate]);

    useEffect(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const filtered = students.filter(student => {
            const fullName = `${student.firstName} ${student.middleName || ''} ${student.lastName}`.toLowerCase();
            return fullName.includes(lowerSearchTerm) || student.studentNumber.toLowerCase().includes(lowerSearchTerm);
        });
        setFilteredStudents(filtered);
    }, [students, searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDateChange = useCallback((date) => {
        setCurrentDate(date);
        setIsCalendarOpen(false);
    }, [setCurrentDate]);

    const toggleCalendar = useCallback(() => {
        setIsCalendarOpen(prev => !prev);
    }, [setIsCalendarOpen]);

    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }, []);

    const formatTime = useCallback((dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    const generateExcel = () => {
        const data = filteredStudents.map(student => ({
            'Student Number': student.studentNumber,
            'Name': `${student.firstName} ${student.lastName}`,
            'Education Level': student.educationLevel,
            'Grade Year Level': student.gradeYearLevel,
            'Section': student.section,
            'Sign-in Time': getSignInTime(student._id),
            'Sign-out Time': getSignOutTime(student._id)
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Students');
        XLSX.writeFile(wb, 'students_attendance.xlsx');
    };

    const getSignInTime = (studentId) => {
        const student = students.find(s => s._id === studentId);
        const signInRecord = student?.attendance?.find(record => record.eventType === 'sign-in');
        return signInRecord ? formatTime(signInRecord?.timestamp) : 'N/A';
    };

    const getSignOutTime = (studentId) => {
        const student = students.find(s => s._id === studentId);
        const signOutRecord = student?.attendance?.find(record => record.eventType === 'sign-out');
        return signOutRecord ? formatTime(signOutRecord?.timestamp) : 'N/A';
    };

    // Filter students who have either sign-in or sign-out time
    const studentsWithAttendance = filteredStudents.filter(student => {
        const hasSignIn = student.attendance?.some(record => record.eventType === 'sign-in');
        const hasSignOut = student.attendance?.some(record => record.eventType === 'sign-out');
        return hasSignIn || hasSignOut;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 p-6">
                <div className="loader">Loading...</div>
            </div>
        );
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Students</h1>
            <div className="relative mb-4">
                <input
                    type="text"
                    className="border rounded px-4 py-2 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by Name, Student Number, Education Level, Grade Year Level, or Section"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-500" />
                </div>
            </div>
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
            <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
                onClick={generateExcel}
            >
                <FaFileExcel className="inline mr-2" /> Generate Excel
            </button>

            {studentsWithAttendance.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left">Student Number</th>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Education Level</th>
                                <th className="px-4 py-2 text-left">Grade Year Level</th>
                                <th className="px-4 py-2 text-left">Section</th>
                                <th className="px-4 py-2 text-left">Sign-in Time</th>
                                <th className="px-4 py-2 text-left">Sign-out Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentsWithAttendance.map(student => {
                                const studentId = student._id;
                                const signInTime = getSignInTime(studentId);
                                const signOutTime = getSignOutTime(studentId);

                                return (
                                    <tr key={student._id} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2">{student.studentNumber}</td>
                                        <td className="border px-4 py-2">{`${student.firstName} ${student.lastName}`}</td>
                                        <td className="border px-4 py-2">{student.educationLevel}</td>
                                        <td className="border px-4 py-2">{student.gradeYearLevel}</td>
                                        <td className="border px-4 py-2">{student.section}</td>
                                        <td className="border px-4 py-2">{signInTime}</td>
                                        <td className="border px-4 py-2">{signOutTime}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 p-6">
                    <p className="text-gray-500">No students found for this teacher.</p>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendance;