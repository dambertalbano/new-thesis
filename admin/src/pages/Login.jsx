import axios from 'axios';
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Removed toast import
import { AdminContext } from '../context/AdminContext';
import { EmployeeContext } from '../context/EmployeeContext';
import { StudentContext } from '../context/StudentContext';
import { TeacherContext } from '../context/TeacherContext';
import bgSolid from '../assets/bg-solid.png';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Select from 'react-select';

const Login = () => {
    useEffect(() => {
        document.title = 'SCC AMS';
        }, []);

    const [state, setState] = useState('Admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null); // For error messages

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const { setAToken } = useContext(AdminContext);
    const { setDToken } = useContext(TeacherContext);
    const { setSToken } = useContext(StudentContext);
    const { setEToken } = useContext(EmployeeContext);

    const navigate = useNavigate();

    const roleConfig = {
        Admin: {
            endpoint: '/api/admin/login',
            tokenSetter: setAToken,
            localStorageKey: 'aToken',
            redirectTo: '/admin-dashboard',
        },
        Teacher: {
            endpoint: '/api/teacher/login',
            tokenSetter: setDToken,
            localStorageKey: 'dToken',
            redirectTo: '/teacher-dashboard',
        },
        Student: {
            endpoint: '/api/student/login',
            tokenSetter: setSToken,
            localStorageKey: 'sToken',
            redirectTo: '/student-dashboard',
        },
        Employee: {
            endpoint: '/api/employee/login',
            tokenSetter: setEToken,
            localStorageKey: 'eToken',
            redirectTo: '/employee-dashboard',
        },
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null); // Clear previous errors
        
        try {
            const { endpoint, tokenSetter, localStorageKey, redirectTo } = roleConfig[state];
            const { data } = await axios.post(backendUrl + endpoint, { email, password });

            if (data.success) {
                tokenSetter(data.token);
                localStorage.setItem(localStorageKey, data.token);
                // No toast notification, just navigate
                navigate(redirectTo);
            } else {
                setError("Invalid email or password."); // Set error for invalid credentials
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setError("Invalid email or password. Please try again."); // Unauthorized
            } else if (error.response?.status === 404) {
                setError("User not found. Please check your email."); // Not found
            } else {
                setError("Login failed. Please try again later."); // Generic error
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${bgSolid})` }}>
            <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                onSubmit={onSubmitHandler}
                className="w-full max-w-2xl p-14 bg-white rounded-2xl shadow-2xl"
            >
                <div className="flex flex-col gap-6">
                    <p className="text-4xl font-bold m-auto text-gray-800">
                        Welcome <span className="text-customRed">{state}</span>!
                    </p>
                    
                    {/* Display error message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    {/* Rest of your form remains the same */}
                    <div className="w-full">
                        <label htmlFor="role" className="block text-md font-medium text-gray-700">Sign In as</label>
                        <select
                            id="role"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-customRed focus:border-customRed text-gray-800"
                            aria-label="Select Role"
                        >
                            <option value="Admin">Admin</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Student">Student</option>
                            <option value="Employee">Employee</option>
                        </select>
                    </div>
                    <div className="w-full">
                        <label htmlFor="email" className="block text-md font-medium text-gray-700">E-mail</label>
                        <input
                            id="email"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:ring-customRed focus:border-customRed text-gray-800 focus:ring-2 focus:ring-customRed"
                            type="email"
                            placeholder="Enter your email"
                            required
                            aria-label={`${state} Email`}
                        />
                    </div>
                    <div className="w-full relative">
                        <label htmlFor="password" className="block text-md font-medium text-gray-700">
                            Password
                        </label>
                        <div className="relative mt-1">
                            <input
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:ring-customRed focus:border-customRed text-gray-800 focus:ring-2 focus:ring-customRed"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            required
                            aria-label={`${state} Password`}
                            />
                            <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <button
                        className={`bg-customRed hover:text-navbar hover:bg-red-800 text-white w-full py-3 rounded-md text-base transition-all duration-300 shadow-md hover:shadow-lg hover:translate-y-[-2px] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                        aria-label="Login Button"
                    >
                        {loading ? 'Logging in ...' : 'Sign In'}
                    </button>
                </div>
            </motion.form>
        </div>
    );
};

export default Login;