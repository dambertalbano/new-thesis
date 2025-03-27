import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';

const Dashboard = () => {
    const { aToken, getDashData, dashData } = useContext(AdminContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (aToken) {
            getDashData();
        } else {
            navigate('/'); // Redirect to login if no token
        }
    }, [aToken, getDashData, navigate, location.pathname]); // Added location.pathname

    const handleCardClick = (category) => {
        switch (category) {
            case 'Students':
                navigate('/student-list');
                break;
            case 'Teachers':
                navigate('/teacher-list');
                break;
            case 'Employees':
                navigate('/employee-list');
                break;
            default:
                break;
        }
    };

    return (
        <div className="m-5">
            <div className="flex flex-wrap gap-5 justify-center">
                {/* Students Card */}
                {dashData ? (
                    <div
                        className="flex items-center gap-2 bg-white p-5 min-w-[220px] max-w-[300px] rounded-xl border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-lg"
                        onClick={() => handleCardClick('Students')}
                    >
                        <img className="w-16" src={assets.people_icon} alt="Students" />
                        <div>
                            <p className="text-2xl font-semibold text-gray-600">{dashData.students}</p>
                            <p className="text-gray-500">Students</p>
                        </div>
                    </div>
                ) : (
                    <div>Loading Students...</div>
                )}

                {/* Teachers Card */}
                {dashData ? (
                    <div
                        className="flex items-center gap-2 bg-white p-5 min-w-[220px] max-w-[300px] rounded-xl border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-lg"
                        onClick={() => handleCardClick('Teachers')}
                    >
                        <img className="w-16" src={assets.people_icon} alt="Teachers" />
                        <div>
                            <p className="text-2xl font-semibold text-gray-600">{dashData.teachers}</p>
                            <p className="text-gray-500">Teachers</p>
                        </div>
                    </div>
                ) : (
                    <div>Loading Teachers...</div>
                )}

                {/* Employees Card */}
                {dashData ? (
                    <div
                        className="flex items-center gap-2 bg-white p-5 min-w-[220px] max-w-[300px] rounded-xl border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all shadow-lg"
                        onClick={() => handleCardClick('Employees')}
                    >
                        <img className="w-16" src={assets.people_icon} alt="Employees" />
                        <div>
                            <p className="text-2xl font-semibold text-gray-600">{dashData.employees}</p>
                            <p className="text-gray-500">Employees</p>
                        </div>
                    </div>
                ) : (
                    <div>Loading Employees...</div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;