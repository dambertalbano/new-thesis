import React, { useContext, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { EmployeeContext } from '../../context/EmployeeContext';

const EmployeeDashboard = () => {
    const { eToken, dashData, getDashData } = useContext(EmployeeContext);

    useEffect(() => {
        if (eToken) {
            getDashData();
        }
    }, [eToken, getDashData]);

    return dashData ? (
        <div className='m-5'>
            <div className='flex flex-wrap gap-3'>
                <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.appointments_icon} alt="" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{dashData.totalUsers}</p>
                        <p className='text-gray-400'>Total Users</p>
                    </div>
                </div>
                <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.patients_icon} alt="" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{dashData.activeUsers}</p>
                        <p className='text-gray-400'>Active Users</p>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div>Loading...</div>
    );
};

export default EmployeeDashboard;