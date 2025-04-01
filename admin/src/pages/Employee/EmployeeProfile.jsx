import axios from "axios";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { EmployeeContext } from "../../context/EmployeeContext";

// Extracted components for better code organization
const ProfileHeader = ({ employeeInfo }) => {
  // Function to format the name
  const formatName = (employee) => {
    const middleInitial = employee?.middleName ? `${employee.middleName.charAt(0)}.` : '';
    return `${employee?.firstName}, ${middleInitial} ${employee?.lastName}`;
  };

  return (
    <div className="bg-gradient-to-r from-customRed to-navbar p-8 text-white flex items-center">
      {employeeInfo?.image && (
        <img
          src={employeeInfo.image}
          alt="Employee"
          className="w-32 h-32 rounded-full border-2 border-white shadow-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = employeeInfo.image; // Use user image as fallback
          }}
        />
      )}
      <div className="ml-6">
        <h2 className="text-3xl font-bold">{employeeInfo ? formatName(employeeInfo) : 'Loading...'}</h2>
        <p className="text-lg opacity-80">{employeeInfo?.email}</p>
        {employeeInfo?.position && <p className="text-lg opacity-80">Position: {employeeInfo.position}</p>}
      </div>
    </div>
  );
};

const ProfileForm = ({ formData, setFormData, onSubmit }) => (
  <form onSubmit={onSubmit} className="p-6">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
          First Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="firstName"
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="middleName">
          Middle Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="middleName"
          type="text"
          placeholder="Middle Name"
          value={formData.middleName}
          onChange={(e) => setFormData({...formData, middleName: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number">
          Contact Number
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="number"
          type="text"
          placeholder="Contact Number"
          value={formData.number}
          onChange={(e) => setFormData({...formData, number: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
          Last Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="lastName"
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
         Position
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="position"
          type="text"
          placeholder="Position"
          value={formData.position}
          onChange={(e) => setFormData({...formData, position: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
          Address
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="address"
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </div>
    </div>
    <div className="flex items-center justify-between mt-4">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="submit"
      >
        Update Profile
      </button>
    </div>
  </form>
);

const EmployeeProfile = () => {
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    position:'',
    number: '',
    address: '',
  });
  const {
    eToken,
    backendUrl,
    updateEmployeeProfile
  } = useContext(EmployeeContext);

  const fetchEmployeeProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/employee/profile`, {
        headers: { Authorization: `Bearer ${eToken}` },
      });
      
      if (response.data.success) {
        const profileData = response.data.profileData;
        setEmployeeInfo(profileData);
        
        // Initialize form data
        setFormData({
          firstName: profileData.firstName || '',
          middleName: profileData.middleName || '',
          lastName: profileData.lastName || '',
          email: profileData.email || '',
          position: profileData.position || '',
          number: profileData.number || '',
          address: profileData.address || '',
        });
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eToken, backendUrl]);

  useEffect(() => {
    fetchEmployeeProfile();
  }, [fetchEmployeeProfile]);

  useEffect(() => {
    if (employeeInfo) {
      document.title = `${employeeInfo.firstName} ${employeeInfo.lastName}`;
    }
  }, [employeeInfo]);

  const SuccessModal = ({ isOpen, onClose }) => (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
          <h2 className="text-md font-bold mb-4 text-gray-600">Profile Updated Successfully!</h2>
          <button
            className="bg-customRed hover:text-navbar text-sm text-white font-medium py-2 px-4 rounded-lg"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    )
  );

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Validation checks
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.number || !formData.address || !formData.position) {
      return alert('Missing Details');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return alert('Please enter a valid email');
    }

    try {
      const profileData = {
        ...formData,
        number: Number(formData.number)
      };

      const success = await updateEmployeeProfile(profileData);

      if (success) {
        fetchEmployeeProfile();
        setShowSuccessCard(true);
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="w-screen h-screen mt-0 bg-gray-100 flex flex-col">
      {/* Profile Header */}
      <ProfileHeader employeeInfo={employeeInfo} />

      {/* Profile Form */}
      <ProfileForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmitHandler}
      />

      {/* Success Modal */}
      {showSuccessCard && <SuccessModal isOpen={showSuccessCard} onClose={() => setShowSuccessCard(false)} />}
    </div>
  );
};

export default EmployeeProfile;