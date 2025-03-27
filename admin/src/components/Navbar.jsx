import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { EmployeeContext } from '../context/EmployeeContext';
import { StudentContext } from '../context/StudentContext';
import { TeacherContext } from '../context/TeacherContext';

const Navbar = () => {
    const { aToken, setAToken } = useContext(AdminContext);
    const { dToken, setDToken } = useContext(TeacherContext);
    const { sToken, setSToken } = useContext(StudentContext);
    const { eToken, setEToken } = useContext(EmployeeContext);

    const navigate = useNavigate();
    const [_, setRender] = useState(false); // Force re-render

    const logout = () => {
        // Clear tokens first
        if (aToken) {
            setAToken(null);
            localStorage.removeItem('aToken');
        }
        if (dToken) {
            setDToken(null);
            localStorage.removeItem('dToken');
        }
        if (sToken) {
            setSToken(null);
            localStorage.removeItem('sToken');
        }
        if (eToken) {
            setEToken(null);
            localStorage.removeItem('eToken');
        }

        setRender(prev => !prev); // Force re-render

        navigate('/'); // Redirect to login page
    };

    let logoutButtonText = 'Sign Out';
    if (aToken) {
        logoutButtonText = 'Admin | Sign Out';
    } else if (dToken) {
        logoutButtonText = 'Teacher | Sign Out';
    } else if (sToken) {
        logoutButtonText = 'Student | Sign Out';
    } else if (eToken) {
        logoutButtonText = 'Employee | Sign Out';
    }

    return (
        <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-black'>
            <div className='flex items-center gap-2 text-xs'>
                <img onClick={() => navigate('/admin-dashboard')} className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="" />
            </div>
            <button onClick={logout} className='bg-customRed text-white text-sm px-5 py-2 rounded'>{logoutButtonText}</button>
        </div>
    );
};

export default Navbar;