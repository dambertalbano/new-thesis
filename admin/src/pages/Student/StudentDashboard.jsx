import React, { useContext, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { StudentContext } from '../../context/StudentContext';

const StudentDashboard = () => {
    const { sToken, dashData, getDashData } = useContext(StudentContext);

    useEffect(() => {
        if (sToken) {
            getDashData();
        }
    }, [sToken, getDashData]);

    return dashData ? (
        <div className='m-5'>
            <div className='flex flex-wrap gap-3'>
                <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.appointments_icon} alt="" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
                        <p className='text-gray-400'>Attendance</p>
                    </div>
                </div>
                <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.patients_icon} alt="" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
                        <p className='text-gray-400'>Student</p>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div>Loading...</div>
    );
};

export default StudentDashboard;