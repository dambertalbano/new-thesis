import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { FaSearch, FaClock } from 'react-icons/fa';

const AttendanceUtilityCard = () => {
  const { utilitys, aToken, getAllUtilitys } = useContext(AdminContext);
  const [isViewingTimeIn, setIsViewingTimeIn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (aToken) {
      getAllUtilitys()
        .then(() => setLoading(false))
        .catch((error) => {
          console.error('Error fetching utility staff data:', error);
          setError(`Failed to fetch utility staff data: ${error.message}`);
          setLoading(false);
        });
    }
  }, [aToken, getAllUtilitys]);

  const toggleView = (view) => {
    setIsViewingTimeIn(view === 'timeIn');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUtilityStaff = utilitys?.filter((utility) =>
    utility.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-white w-full">
      <div className="mb-6 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            className="border rounded px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by Name"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FaSearch className="absolute top-3 right-3 text-gray-400" />
        </div>
        <div className="flex space-x-2">
          <button
            className={`bg-green-500 text-white text-sm font-medium py-2 px-4 rounded hover:bg-green-700 transition duration-200 ${isViewingTimeIn ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => toggleView('timeIn')}
            disabled={isViewingTimeIn}
            title="View Time-In"
          >
            <FaClock className="inline mr-2" /> View Time-In
          </button>
          <button
            className={`bg-customRed text-white text-sm font-medium py-2 px-4 rounded hover:bg-red-700 transition duration-200 ${!isViewingTimeIn ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => toggleView('timeOut')}
            disabled={!isViewingTimeIn}
            title="View Time-Out"
          >
            <FaClock className="inline mr-2" /> View Time-Out
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse mt-5">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="px-4 py-2 text-left text-gray-600">Utility ID</th>
              <th className="px-4 py-2 text-left text-gray-600">Name</th>
              <th className="px-4 py-2 text-left text-gray-600">{isViewingTimeIn ? 'Time-In' : 'Time-Out'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUtilityStaff?.map((utility, index) => (
              <tr key={utility.utilityId} className={`hover:bg-gray-50 ${index === filteredUtilityStaff.length - 1 ? '' : 'border-b'}`}>
                <td className="px-4 py-2">{utility.utilityId}</td>
                <td className="px-4 py-2">{utility.name}</td>
                <td className="px-4 py-2">
                  {isViewingTimeIn ? utility.timeIn : utility.timeOut}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceUtilityCard;