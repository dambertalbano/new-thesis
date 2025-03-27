import axios from 'axios';
import { createContext, useCallback, useState } from "react";
import { toast } from 'react-toastify';

export const EmployeeContext = createContext();

const EmployeeContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [eToken, setEToken] = useState(() => localStorage.getItem('eToken') || null);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(null);
    const [profileData, setProfileData] = useState(null);

    // Update token in local storage
    const updateEToken = useCallback((token) => {
        setEToken(token);
        if (token) {
            localStorage.setItem('eToken', token);
        } else {
            localStorage.removeItem('eToken');
        }
    }, [setEToken]);

    // Getting Employee dashboard data using API
    const getDashData = useCallback(async () => {
        if (!eToken) {
            toast.error('Not authenticated. Please log in.');
            return;
        }
        try {
            const { data } = await axios.get(`${backendUrl}/api/employee/dashboard`, {
                headers: { Authorization: `Bearer ${eToken}` }
            });

            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error fetching dashboard data.');
        }
    }, [backendUrl, eToken, setDashData]);

    // Getting Employee appointment data from Database using API
    const getAppointments = useCallback(async () => {
        if (!eToken) {
            toast.error('Not authenticated. Please log in.');
            return;
        }
        try {
            const { data } = await axios.get(`${backendUrl}/api/employee/appointments`, {
                headers: { Authorization: `Bearer ${eToken}` }
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
    }, [backendUrl, eToken, setAppointments]);

    // Function to cancel employee appointment using API
    const cancelAppointment = useCallback(async (appointmentId) => {
        if (!eToken) {
            toast.error('Not authenticated. Please log in.');
            return;
        }
        try {
            const { data } = await axios.post(`${backendUrl}/api/employee/cancel-appointment`, { appointmentId }, {
                headers: { Authorization: `Bearer ${eToken}` }
            });

            if (data.success) {
                toast.success(data.message);
                getAppointments();
                getDashData(); // after creating dashboard
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error cancelling appointment.');
        }
    }, [backendUrl, eToken, getAppointments, getDashData]);

    // Function to Mark appointment completed using API
    const completeAppointment = useCallback(async (appointmentId) => {
        if (!eToken) {
            toast.error('Not authenticated. Please log in.');
            return;
        }
        try {
            const { data } = await axios.post(`${backendUrl}/api/employee/complete-appointment`, { appointmentId }, {
                headers: { Authorization: `Bearer ${eToken}` }
            });

            if (data.success) {
                toast.success(data.message);
                getAppointments();
                getDashData(); // Later after creating getDashData Function
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error completing appointment.');
        }
    }, [backendUrl, eToken, getAppointments, getDashData]);

    // Getting Employee profile data from Database using API
    const getProfileData = useCallback(async () => {
        if (!eToken) {
            toast.error('Not authenticated. Please log in.');
            return;
        }
        try {
            const { data } = await axios.get(`${backendUrl}/api/employee/profile`, {
                headers: { Authorization: `Bearer ${eToken}` }
            });
            setProfileData(data.profileData);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error fetching profile data.');
        }
    }, [backendUrl, eToken, setProfileData]);

    const value = {
        eToken,
        setEToken: updateEToken,
        backendUrl,
        appointments,
        getAppointments,
        cancelAppointment,
        completeAppointment,
        dashData,
        getDashData,
        profileData,
        getProfileData,
    };

    return (
        <EmployeeContext.Provider value={value}>
            {props.children}
        </EmployeeContext.Provider>
    );
};

export default EmployeeContextProvider;