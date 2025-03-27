import React, { useContext, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditCard from './components/EditCard';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UserCard from './components/UserCard';
import { AdminContext } from './context/AdminContext';
import { EmployeeContext } from './context/EmployeeContext';
import { StudentContext } from './context/StudentContext';
import { TeacherContext } from './context/TeacherContext';
import AddEmployee from './pages/Admin/AddEmployee';
import AddStudent from './pages/Admin/AddStudent';
import AddTeacher from './pages/Admin/AddTeacher';
import AddUsers from './pages/Admin/AddUsers';
import AllUserAttendanceCard from './pages/Admin/AllUserAttendanceCard';
import AllUsers from './pages/Admin/AllUsers';
import Attendance from './pages/Admin/Attendance';
import AttendanceEmployeeCard from './pages/Admin/AttendanceEmployeeCard';
import AttendanceStudentCard from './pages/Admin/AttendanceStudentCard';
import AttendanceTeacherCard from './pages/Admin/AttendanceTeacherCard';
import Dashboard from './pages/Admin/Dashboard';
import EditUser from './pages/Admin/EditUser';
import EmployeeList from './pages/Admin/EmployeeList';
import RFID_Scan from './pages/Admin/RFID_Scan';
import StudentsList from './pages/Admin/StudentsList';
import TeachersList from './pages/Admin/TeacherList';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import EmployeeProfile from './pages/Employee/EmployeeProfile';
import Login from './pages/Login';
import StudentDashboard from './pages/Student/StudentDashboard';
import StudentProfile from './pages/Student/StudentProfile';
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import TeacherProfile from './pages/Teacher/TeacherProfile';

const App = () => {
    const { aToken } = useContext(AdminContext);
    const { dToken } = useContext(TeacherContext);
    const { sToken } = useContext(StudentContext);
    const { eToken } = useContext(EmployeeContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log('App.jsx useEffect triggered');
        console.log('aToken:', aToken);
        console.log('dToken:', dToken);
        console.log('sToken:', sToken);
        console.log('eToken:', eToken);
        console.log('location.pathname:', location.pathname);

        const initialRoute = () => {
            if (aToken) {
                if (location.pathname === '/') {
                    navigate('/admin-dashboard', { replace: true });
                }
            } else if (dToken) {
                if (location.pathname === '/') {
                    navigate('/teacher-dashboard', { replace: true });
                }
            } else if (sToken) {
                if (location.pathname === '/') {
                    navigate('/student-dashboard', { replace: true });
                }
            } else if (eToken) {
                if (location.pathname === '/') {
                    navigate('/employee-dashboard', { replace: true });
                }
            } else {
                navigate('/', { replace: true });
            }
        };

        initialRoute();
    }, [aToken, dToken, sToken, eToken, navigate, location.pathname]);

    const handleLogout = () => {
        console.log('handleLogout triggered');
        // Centralized logout logic (clear tokens in all contexts)
        localStorage.removeItem('aToken');
        localStorage.removeItem('dToken');
        localStorage.removeItem('sToken');
        localStorage.removeItem('eToken');
        // Force a re-render to trigger the useEffect
        navigate(0); // This forces a full re-render
    };

    return (
        <>
            <ToastContainer />
            {(aToken || dToken || sToken || eToken) ? (
                <div className='bg-[#F8F9FD]'>
                    <Navbar onLogout={handleLogout} />
                    <div className='flex items-start'>
                        <Sidebar />
                        <Routes>
                            <Route path='/admin-dashboard' element={<Dashboard />} />
                            <Route path='/teacher-dashboard' element={<TeacherDashboard />} />
                            <Route path='/student-dashboard' element={<StudentDashboard />} />
                            <Route path='/employee-dashboard' element={<EmployeeDashboard />} />
                            <Route path='/rfid-scan' element={<RFID_Scan />} />
                            <Route path='/add-student' element={<AddStudent />} />
                            <Route path='/add-teacher' element={<AddTeacher />} />
                            <Route path='/add-employee' element={<AddEmployee />} />
                            <Route path='/student-list' element={<StudentsList />} />
                            <Route path='/teacher-list' element={<TeachersList />} />
                            <Route path='/employee-list' element={<EmployeeList />} />
                            <Route path='/user-card' element={<UserCard />} />
                            <Route path='/edit-card' element={<EditCard />} />
                            <Route path='/attendance-all' element={<AllUserAttendanceCard />} />
                            <Route path='/attendance' element={<Attendance />} />
                            <Route path='/attendance-student' element={<AttendanceStudentCard />} />
                            <Route path='/attendance-teacher' element={<AttendanceTeacherCard />} />
                            <Route path='/attendance-employee' element={<AttendanceEmployeeCard />} />
                            <Route path='/student-profile' element={<StudentProfile />} />
                            <Route path='/employee-profile' element={<EmployeeProfile />} />
                            <Route path='/teacher-profile' element={<TeacherProfile />} />
                            <Route path='/all-users' element={<AllUsers />} />
                            <Route path='/add-users' element={<AddUsers />} />
                            <Route path='/edit-users' element={<EditUser />} />
                        </Routes>
                    </div>
                </div>
            ) : (
                <>
                    <ToastContainer />
                    <Routes>
                        <Route path="/" element={<Login />} />
                    </Routes>
                </>
            )}
        </>
    );
};

export default App;