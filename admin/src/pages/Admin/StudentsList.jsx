import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import ReactPaginate from 'react-paginate';

const StudentsList = () => {
  const { students, aToken, getAllStudents, updateStudent, deleteStudent } = useContext(AdminContext);

  const [isEditing, setIsEditing] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const studentsPerPage = 10;

  useEffect(() => {
    if (aToken) {
      getAllStudents();
    }
  }, [aToken]);

  const handleEditClick = (admin) => {
    if (!admin._id) {
      console.error("Student ID is missing for the selected student.");
      return;
    }
    setCurrentAdmin(admin);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentAdmin._id) {
      console.error("Student ID is missing for the current student.");
      return;
    }
    updateStudent(currentAdmin);
    setIsEditing(false);
    setCurrentAdmin(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentAdmin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (studentId) => {
    try {
      await deleteStudent(studentId);
      getAllStudents();
    } catch (error) {
      console.error("Failed to delete student:", error.message);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredStudents.length / studentsPerPage);
  const offset = currentPage * studentsPerPage;
  const currentStudents = filteredStudents.slice(offset, offset + studentsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="flex flex-col h-full w-full p-5">
      <h1 className="text-xl font-bold mb-4">STUDENT LIST</h1>

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
              <th className="px-4 py-2">Level</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-100 text-center">
                <td className="px-4 py-2">
                  <img
                    className="w-16 h-16 object-cover rounded-full mx-auto"
                    src={item.image ?? '/default-image.png'}
                    alt="Student"
                  />
                </td>
                <td className="px-4 py-2">{item.name ?? 'No Name'}</td>
                <td className="px-4 py-2">{item.email ?? 'No Email'}</td>
                <td className="px-4 py-2">{item.number ?? 'No Number'}</td>
                <td className="px-4 py-2">{item.level ?? 'No Level'}</td>
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

      {isEditing && currentAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">Edit Student</h2>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                className="border w-full p-2 rounded mt-1"
                name="name"
                value={currentAdmin.name || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                className="border w-full p-2 rounded mt-1"
                name="email"
                value={currentAdmin.email || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Number</label>
              <input
                className="border w-full p-2 rounded mt-1"
                name="number"
                value={currentAdmin.number || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Level</label>
              <select
                className="border rounded px-2 py-2 w-full mt-1"
                name="level"
                value={currentAdmin.level || ''}
                onChange={handleChange}
              >
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
                <option value="High School">High School</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
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

export default StudentsList;