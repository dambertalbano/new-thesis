import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import ReactPaginate from 'react-paginate';

const UtilitysList = () => {
  const { utilitys, aToken, getAllUtilitys, updateUtility, deleteUtility } = useContext(AdminContext);

  const [isEditing, setIsEditing] = useState(false);
  const [currentUtility, setCurrentUtility] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const utilitysPerPage = 10;

  useEffect(() => {
    if (aToken) {
      getAllUtilitys();
    }
  }, [aToken, getAllUtilitys]);

  const handleEditClick = (utility) => {
    if (!utility._id) {
      console.error("Utility ID is missing for the selected utility.");
      return;
    }
    setCurrentUtility(utility);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentUtility._id) {
      console.error("Utility ID is missing for the current utility.");
      return;
    }
    updateUtility(currentUtility);
    setIsEditing(false);
    setCurrentUtility(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentUtility((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (utilityId) => {
    try {
      await deleteUtility(utilityId);
      getAllUtilitys();
    } catch (error) {
      console.error("Failed to delete utility:", error.message);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUtilitys = utilitys.filter((utility) =>
    utility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    utility.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredUtilitys.length / utilitysPerPage);
  const offset = currentPage * utilitysPerPage;
  const currentUtilitys = filteredUtilitys.slice(offset, offset + utilitysPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="flex flex-col h-full w-full p-5">
      <h1 className="text-xl font-bold mb-4">UTILITY LIST</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            type="text"
            className="border rounded px-4 py-2 w-64"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FaSearch className="absolute top-3 right-3 text-gray-400" />
        </div>
      </div>

      <div className="flex-grow overflow-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="border-b text-center">
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Number</th>
              <th className="px-4 py-2">Position</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUtilitys.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-100 text-center">
                <td className="px-4 py-2">
                  <img
                    className="w-16 h-16 object-cover rounded-full mx-auto"
                    src={item.image ?? '/default-image.png'}
                    alt="Utility"
                  />
                </td>
                <td className="px-4 py-2">{item.name ?? 'No Name'}</td>
                <td className="px-4 py-2">{item.email ?? 'No Email'}</td>
                <td className="px-4 py-2">{item.number ?? 'No Number'}</td>
                <td className="px-4 py-2">{item.position ?? 'No Position'}</td>
                <td className="px-4 py-2">{item.address?.line1 ?? 'No Address'}</td>
                <td className="px-4 py-2 flex justify-center space-x-2">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
                    onClick={() => handleEditClick(item)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded flex items-center"
                    onClick={() => handleDelete(item._id)}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center space-x-4 mt-4">
        <button
          onClick={() => handlePageClick({ selected: Math.max(0, currentPage - 1) })}
          disabled={currentPage === 0}
          className={`border p-2 rounded text-gray-600 hover:bg-gray-200 ${
            currentPage === 0 ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
          }`}> {'< Previous'}
        </button>

        <p className="text-lg font-medium">{currentPage + 1} of {pageCount}</p>

        <button
          onClick={() => handlePageClick({ selected: Math.min(pageCount - 1, currentPage + 1) })}
          disabled={currentPage === pageCount - 1}
          className={`border p-2 rounded text-gray-600 hover:bg-gray-200 ${
            currentPage === pageCount - 1 ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
          }`}> {'Next >'}
        </button>
      </div>


      {isEditing && currentUtility && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">Edit Utility</h2>
            <div className="mt-4">
              <label className="block">Name</label>
              <input
                className="border w-full p-2 rounded"
                name="name"
                value={currentUtility.name || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block">Email</label>
              <input
                className="border w-full p-2 rounded"
                name="email"
                value={currentUtility.email || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block">Number</label>
              <input
                className="border w-full p-2 rounded"
                name="number"
                value={currentUtility.number || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block">Position</label>
              <select
                className="border rounded px-2 py-2 w-full"
                name="position"
                value={currentUtility.position || ''}
                onChange={handleChange}
              >
                <option value="Repair Man">Repair Man</option>
                <option value="Security Guard">Security Guard</option>
                <option value="Janitor">Janitor</option>
                <option value="Cook">Cook</option>
                <option value="Canteen Supervisor">Canteen Supervisor</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded mr-2"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UtilitysList;