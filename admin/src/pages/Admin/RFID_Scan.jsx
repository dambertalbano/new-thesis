import { useContext, useEffect, useState } from "react";
import blankImage from "../../assets/blank-image.webp";
import { AdminContext } from "../../context/AdminContext";
import { FaSpinner } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";

const RFID_Scan = () => {
    const { getUserByCode, adminSignIn, adminSignOut } = useContext(AdminContext);
    const [scannedCode, setScannedCode] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastScannedTimes, setLastScannedTimes] = useState({});

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                if (scannedCode.trim() !== '') {
                    handleScan(scannedCode.trim());
                }
                setScannedCode('');
            } else {
                setScannedCode((prevCode) => prevCode + event.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [scannedCode]);

    const handleScan = async (code) => {
        if (!code.trim()) {
            setError('Please scan a valid code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await getUserByCode(code);

            if (response && response.success && response.user) {
                setUserInfo(response.user);
            } else {
                setError('No user found with this code');
                setUserInfo(null);
            }
        } catch (err) {
            setError('An error occurred while fetching user data.');
            setUserInfo(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-2xl w-full">
                <div className="flex items-center justify-center mb-4 text-customRed">
                    <FiInfo className="w-8 h-8" />
                    <h2 className="text-3xl font-semibold ml-2">User Information</h2>
                </div>
                {loading ? (
                    <p className="text-blue-500 flex items-center justify-center text-lg">
                        <FaSpinner className="animate-spin mr-2" /> Scanning ...
                    </p>
                ) : error ? (
                    <p className="text-red-500 text-lg font-semibold">{error}</p>
                ) : null}

                {userInfo ? (
                    <UserInfoDisplay userInfo={userInfo} />
                ) : (
                    <BlankUserInfo />
                )}
            </div>
        </div>
    );
};

const UserInfoDisplay = ({ userInfo }) => {
    const formatDateTime = (dateTimeString) => {
        return dateTimeString ? new Date(dateTimeString).toLocaleString() : 'No Data';
    };

    return (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow-md text-left w-full">
            <div className="flex flex-wrap items-center gap-4">
                <img src={userInfo.image || blankImage} alt="User" className="w-28 h-28 rounded-full border" />
                <div className="flex-1 min-w-0">
                    <p className="text-xl font-semibold truncate">{userInfo.firstName} {userInfo.lastName}</p>
                    <p className="text-sm text-gray-500">{userInfo.studentNumber}</p>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-base text-gray-700 break-words">
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Address:</strong> {userInfo.address}</p>
                <p><strong>Sign In:</strong> <span className="text-green-500">{formatDateTime(userInfo.signInTime)}</span></p>
                <p><strong>Sign Out:</strong> <span className="text-red-500">{formatDateTime(userInfo.signOutTime)}</span></p>
            </div>
        </div>
    );
};

const BlankUserInfo = () => {
    return (
        <div className="flex flex-col items-center justify-center mt-6">
            <img src={blankImage} alt="User" className="w-28 h-28 rounded-full bg-gray-200" />
            <p className="text-gray-500 mt-3 text-lg">No user scanned</p>
        </div>
    );
};

export default RFID_Scan;