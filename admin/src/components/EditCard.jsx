import React from 'react';
import { useNavigate } from 'react-router-dom';

export const EditCard = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/student-list');
  };

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll bg-white shadow-lg rounded-lg">
      <div className="p-6">
        <h5 className="text-2xl font-bold text-blue-gray-700 mb-4">
          Students
        </h5>
        <p className="text-gray-600 mb-6">
          Manage and edit student information.
        </p>
        <button
          className="bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
          onClick={handleNavigate}
        >
          Student List
        </button>
      </div>
    </div>
  );
};

export const EditAdministratorCard = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/edit-administrators');
  };

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll bg-white shadow-lg rounded-lg">
      <div className="p-6">
        <h5 className="text-2xl font-bold text-blue-gray-700 mb-4">
          Administrator
        </h5>
        <p className="text-gray-600 mb-6">
          Manage and edit administrator information.
        </p>
        <button
          className="bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
          onClick={handleNavigate}
        >
          Edit Administrator
        </button>
      </div>
    </div>
  );
};

export default EditCard;