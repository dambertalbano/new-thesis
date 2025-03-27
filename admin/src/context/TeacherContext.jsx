import axios from 'axios';
import { createContext, useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useAdminContext } from './AdminContext'; // Import AdminContext

export const TeacherContext = createContext();

const TeacherContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [dToken, setDToken] = useState(() => localStorage.getItem('dToken') || null);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(null);

    // Access functions from AdminContext
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
        if (token) {
            localStorage.setItem('dToken', token);
        } else {
            localStorage.removeItem('dToken');
        }
    }, [setDToken]);

    const handleUnauthorized = useCallback(() => {
        toast.error('Session expired. Please log in again.');
        updateDToken(null);
    }, [updateDToken]);

    const getAppointments = useCallback(async () => {
        if (!dToken) return handleUnauthorized();
        try {
            const { data } = await axios.get(`${backendUrl}/api/teacher/appointments`, {
                headers: { Authorization: `Bearer ${dToken}` },
            });
            if (data.success) {
                setAppointments(data.appointments.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error fetching appointments.');
        }
    }, [dToken, backendUrl, handleUnauthorized, setAppointments]);

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

    const value = {
        dToken,
        setDToken: updateDToken,
        backendUrl,
        appointments,
        getAppointments,
        dashData,
        setDashData,
        loginTeacher, // Add loginTeacher to the context
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
    };

    return (
        <TeacherContext.Provider value={value}>
            {props.children}
        </TeacherContext.Provider>
    );
};

export default TeacherContextProvider;