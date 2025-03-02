import axios from "axios";
import { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const initialAToken = localStorage.getItem('aToken') || '';
    const [aToken, setAToken] = useState(initialAToken);
    const [students, setStudents] = useState([]);
    const [administrators, setAdministrators] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [utilitys, setUtilitys] = useState([]);
    const [dashData, setDashData] = useState(false);

    // Function to fetch user by RFID code
    const getUserByCode = async (code) => {
        try {
            const studentResponse = await axios.get(`${backendUrl}/api/students/${code}`, { headers: { aToken } });
            if (studentResponse.data) return { ...studentResponse.data, type: 'student' };

            const teacherResponse = await axios.get(`${backendUrl}/api/teachers/${code}`, { headers: { aToken } });
            if (teacherResponse.data) return { ...teacherResponse.data, type: 'teacher' };

            const administratorResponse = await axios.get(`${backendUrl}/api/administrators/${code}`, { headers: { aToken } });
            if (administratorResponse.data) return { ...administratorResponse.data, type: 'administrator' };

            const utilityResponse = await axios.get(`${backendUrl}/api/utilitys/${code}`, { headers: { aToken } });
            if (utilityResponse.data) return { ...utilityResponse.data, type: 'utility' };

            return null;
        } catch (error) {
            console.error('Error fetching user by code:', error);
            toast.error('Error fetching user by code');
            throw error;
        }
    };

    // Function to fetch all students
    const getAllStudents = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/all-students`, {
                headers: { aToken }
            });
            if (data.success) {
                setStudents(data.students);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Function to fetch all utilities
    const getAllUtilitys = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/all-utilitys`, {
                headers: { aToken }
            });
            if (data.success) {
                setUtilitys(data.utilitys);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Function to update utility
    const updateUtility = async (utility) => {
        try {
            const response = await axios.put(`${backendUrl}/api/admin/utilitys/${utility._id}`, utility, {
                headers: { aToken },
            });

            if (response.data.success) {
                toast.success("Utility updated successfully");
                getAllUtilitys(); // Refresh the list of utilities
            } else {
                toast.error(response.data.message || "Failed to update utility");
            }
        } catch (error) {
            toast.error("Error updating utility: " + error.message);
        }
    };

    // Function to fetch dashboard data
    const getDashData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, { headers: { aToken } });
            console.log(data);  // Log the full response to verify the structure
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    // Function to fetch all administrators
    const getAllAdministrators = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/all-administrators`, {
                headers: { aToken }
            });
            if (data.success) {
                setAdministrators(data.administrators);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Function to update administrator
    const updateAdministrator = async (administrator) => {
        try {
            const response = await axios.put(`${backendUrl}/api/admin/administrators/${administrator._id}`, administrator, {
                headers: { aToken },
            });

            if (response.data.success) {
                toast.success("Administrator updated successfully");
                getAllAdministrators(); // Refresh the list of administrators
            } else {
                toast.error(response.data.message || "Failed to update administrator");
            }
        } catch (error) {
            toast.error("Error updating administrator: " + error.message);
        }
    };

    // Function to update teacher
    const updateTeacher = async (teacher) => {
        try {
            const response = await axios.put(`${backendUrl}/api/admin/teachers/${teacher._id}`, teacher, {
                headers: { aToken },
            });

            if (response.data.success) {
                toast.success("Teacher updated successfully");
                getAllTeachers(); // Refresh the list of teachers
            } else {
                toast.error(response.data.message || "Failed to update teacher");
            }
        } catch (error) {
            toast.error("Error updating teacher: " + error.message);
        }
    };

    // Function to fetch all teachers
    const getAllTeachers = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/all-teachers`, {
                headers: { aToken }
            });
            if (data.success) {
                setTeachers(data.teachers);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Function to delete teacher
    const deleteTeacher = async (teacherId) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/teachers/${teacherId}`, {
                headers: { aToken },
            });

            if (response.data.success) {
                toast.success("Teacher deleted successfully");
                getAllTeachers(); // Refresh the list of teachers
            } else {
                toast.error(response.data.message || "Failed to delete teacher");
            }
        } catch (error) {
            toast.error("Error deleting teacher: " + error.message);
        }
    };

    // Function to update student
    const updateStudent = async (student) => {
        try {
            const response = await axios.put(`${backendUrl}/api/admin/students/${student._id}`, student, {
                headers: { aToken },
            });

            if (response.data.success) {
                toast.success("Student updated successfully");
                getAllStudents(); // Refresh the list of students
            } else {
                toast.error(response.data.message || "Failed to update student");
            }
        } catch (error) {
            toast.error("Error updating student: " + error.message);
        }
    };

    // Function to delete student
    const deleteStudent = async (studentId) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/students/${studentId}`, {
                headers: { aToken },
            });

            if (response.data.success) {
                toast.success("Student deleted successfully");
                getAllStudents(); // Refresh the list of students
            } else {
                toast.error(response.data.message || "Failed to delete student");
            }
        } catch (error) {
            toast.error("Error deleting student: " + error.message);
        }
    };

    // Function to delete administrator
    const deleteAdministrator = async (administratorId) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/administrators/${administratorId}`, {
                headers: { aToken },
            });

            if (response.data.success) {
                toast.success("Administrator deleted successfully");
                getAllAdministrators(); // Refresh the list of administrators
            } else {
                toast.error(response.data.message || "Failed to delete administrator");
            }
        } catch (error) {
            toast.error("Error deleting administrator: " + error.message);
        }
    };

    // Function to delete utility
    const deleteUtility = async (utilityId) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/utilitys/${utilityId}`, {
                headers: { aToken },
            });

            if (response.data.success) {
                toast.success("Utility deleted successfully");
                getAllUtilitys(); // Refresh the list of utilities
            } else {
                toast.error(response.data.message || "Failed to delete utility");
            }
        } catch (error) {
            toast.error("Error deleting utility: " + error.message);
        }
    };

    const value = {
        aToken,
        setAToken,
        students,
        administrators,
        teachers,
        utilitys,
        getAllUtilitys,
        updateUtility,
        getAllStudents,
        getDashData,
        dashData,
        getAllAdministrators,
        updateAdministrator,
        updateTeacher,
        getAllTeachers,
        getUserByCode,
        deleteTeacher,
        updateStudent,
        deleteStudent,
        deleteAdministrator,
        deleteUtility,
    };

    return <AdminContext.Provider value={value}>{props.children}</AdminContext.Provider>;
};

export const useAdminContext = () => useContext(AdminContext);
export default AdminContextProvider;