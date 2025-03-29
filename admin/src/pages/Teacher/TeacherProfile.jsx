import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { TeacherContext } from "../../context/TeacherContext";
import { Menu } from "@headlessui/react";
import { FiMoreVertical } from "react-icons/fi";

const TeacherProfile = () => {
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // State to toggle the popup
  const [editedInfo, setEditedInfo] = useState({});
  const [showSuccessCard, setShowSuccessCard] = useState(false); // State for success card
  const { dToken, backendUrl } = useContext(TeacherContext);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${backendUrl}/api/teacher/profile`, {
          headers: { Authorization: `Bearer ${dToken}` },
        });
        if (response.data.success) {
          setTeacherInfo(response.data.profileData);
          setEditedInfo(response.data.profileData); // Initialize editedInfo with fetched data
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, [dToken, backendUrl]);

  // Dynamically set the document title to the user's name
  useEffect(() => {
    if (teacherInfo) {
      document.title = `${teacherInfo.firstName} ${teacherInfo.lastName}`;
    }
  }, [teacherInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo({
      ...editedInfo,
      [name]: value,
    });
  };

  const handleSaveClick = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/teacher/update-profile`,
        editedInfo,
        {
          headers: { Authorization: `Bearer ${dToken}` },
        }
      );

      if (response.data.success) {
        setTeacherInfo(editedInfo); // Update local state with edited info
        setIsEditing(false); // Close the popup
        setShowSuccessCard(true); // Show success card
      } else {
        console.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-lg">Loading profile...</div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500 text-lg">{error}</div>;

  return (
    <div className="w-screen h-screen pt-[60px] mt-0 bg-gray-100 flex flex-col">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-customRed to-navbar p-8 text-white flex items-center">
        <img
          src={teacherInfo?.image || "https://via.placeholder.com/150"}
          alt="Teacher"
          className="w-32 h-32 rounded-full border-2 border-white shadow-md"
        />
        <div className="ml-6">
          <h2 className="text-3xl font-bold">{teacherInfo.firstName} {teacherInfo.lastName}</h2>
          <p className="text-lg opacity-80">{teacherInfo.email}</p>
        </div>
        <Menu as="div" className="ml-auto relative">
          <Menu.Button className="text-white hover:text-gray-300">
            <FiMoreVertical size={24} />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${active ? "bg-gray-100" : ""} block px-4 py-2 text-gray-700 w-full text-left`}
                  onClick={() => setIsEditing(true)} // Open the popup
                >
                  Edit Profile
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>

      {/* Popup Card for Editing */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={editedInfo.firstName || ""}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={editedInfo.lastName || ""}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editedInfo.email || ""}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg"
                onClick={() => setIsEditing(false)} // Close the popup
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
                onClick={handleSaveClick} // Save changes
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Confirmation Card */}
      {showSuccessCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h2 className="text-md font-bold mb-4 text-gray-600">Profile Updated Successfully!</h2>
            <button
              className="bg-customRed hover:text-navbar text-sm text-white font-medium py-2 px-4 rounded-lg"
              onClick={() => setShowSuccessCard(false)} // Close the success card
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProfile;