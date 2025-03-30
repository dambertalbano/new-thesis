import axios from 'axios';
import { createContext, useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useAdminContext } from './AdminContext'; // Import AdminContext

export const TeacherContext = createContext();

const TeacherContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [dToken, setDToken] = useState(() => localStorage.getItem('dToken') || null);
    const [dashData, setDashData] = useState(null);

    const {
        updateTeacher,
        deleteTeacher,
        addTeacherClassSchedule,
        removeTeacherClassSchedule,
        editTeacherClassSchedule,
        addTeacherEducationLevel,
        removeTeacherEducationLevel,
        editTeacherEducationLevel,
        addTeacherGradeYearLevel,
        removeTeacherGradeYearLevel,
        editTeacherGradeYearLevel,
        addTeacherSection,
        removeTeacherSection,
        addTeacherSubjects,
        removeTeacherSubjects,
        editTeacherSubjects,
    } = useAdminContext();

    const updateDToken = useCallback((token) => {
        setDToken(token);
        try {
            if (token) {
                localStorage.setItem('dToken', token);
            } else {
                localStorage.removeItem('dToken');
            }
        } catch (error) {
            console.error('Error updating dToken in localStorage:', error);
            toast.error('Failed to update authentication token.');
        }
    }, [setDToken]);


    const loginTeacher = useCallback(async (email, password) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/teacher/login`, { email, password });
            if (data.success) {
                updateDToken(data.token);
                toast.success('Login successful!');
                return true; // Indicate successful login
            } else {
                toast.error(data.message);
                return false; // Indicate failed login
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Failed to login.');
            return false; // Indicate failed login
        }
    }, [backendUrl, updateDToken]);

    const logoutTeacher = useCallback(async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/teacher/logout`, {}, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                updateDToken(null); // Clear the token on logout
                setDashData(null); // Clear dashData on logout
                toast.success('Logout successful!');
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error(error.response?.data?.message || 'Failed to logout.');
            return false;
        }
    }, [backendUrl, dToken, updateDToken, setDashData]);

    const updateTeacherByProfile = useCallback(async (teacherId, updates) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/teacher/profile/${teacherId}`, updates, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (data.success) {
                toast.success(data.message || 'Teacher profile updated successfully!');
                return true;
            } else {
                toast.error(data.message || 'Failed to update teacher profile.');
                return false;
            }
        } catch (error) {
            console.error('Error updating teacher profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update teacher profile.');
            return false;
        }
    }, [backendUrl, dToken]);

    const value = {
        dToken,
        setDToken: updateDToken,
        backendUrl,
        dashData,
        setDashData,
        loginTeacher,
        logoutTeacher, // Add logoutTeacher to the context
        updateTeacher, // Include AdminContext functions
        deleteTeacher,
        addTeacherClassSchedule,
        removeTeacherClassSchedule,
        editTeacherClassSchedule,
        addTeacherEducationLevel,
        removeTeacherEducationLevel,
        editTeacherEducationLevel,
        addTeacherGradeYearLevel,
        removeTeacherGradeYearLevel,
        editTeacherGradeYearLevel,
        addTeacherSection,
        removeTeacherSection,
        addTeacherSubjects,
        removeTeacherSubjects,
        editTeacherSubjects,
        updateTeacherByProfile,
    };

    return (
        <TeacherContext.Provider value={value}>
            {props.children}
        </TeacherContext.Provider>
    );
};

export default TeacherContextProvider;