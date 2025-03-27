import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import { TeacherContext } from '../../context/TeacherContext';

const TeacherDashboard = () => {
    const [teacherData, setTeacherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { dToken, backendUrl } = useContext(TeacherContext);

    useEffect(() => {
        const fetchTeacherData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${backendUrl}/api/teacher/profile`, {
                    headers: { Authorization: `Bearer ${dToken}` },
                });
                if (response.data.success) {
                    setTeacherData(response.data.teacher);
                } else {
                    setError(response.data.message);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherData();
    }, [dToken, backendUrl]);

    if (loading) {
        return <div>Loading teacher data...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return teacherData && (
        <div className="m-5">
            <div className="text-xl font-semibold text-gray-600 mb-4">
                <p>Welcome, {teacherData.firstName}</p>
            </div>
            <div className="flex flex-wrap gap-3">
                {/* Total Students */}
                <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
                    <img className="w-14" src={assets.people_icon} alt="" />
                    <div>
                        <p className="text-xl font-semibold text-gray-600">{teacherData.totalStudents}</p>
                        <p className="text-gray-400">Total Students</p>
                    </div>
                </div>
                {/* Attendance Records */}
                <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
                    <img className="w-14" src={assets.appointment_icon} alt="" />
                    <div>
                        <p className="text-xl font-semibold text-gray-600">{teacherData.teacherAttendance}</p>
                        <p className="text-gray-400">Attendance Record</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;