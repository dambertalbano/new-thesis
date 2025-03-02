import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import ReactPaginate from 'react-paginate';

const TeachersList = () => {
  const { teachers, aToken, getAllTeachers, updateTeacher, deleteTeacher } = useContext(AdminContext);

  const [isEditing, setIsEditing] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const teachersPerPage = 10;

  useEffect(() => {
    if (aToken) {
      getAllTeachers();
    }
  }, [aToken]);

  const handleEditClick = (teacher) => {
    if (!teacher._id) {
      console.error("Teacher ID is missing for the selected teacher.");
      return;
    }
    setCurrentTeacher(teacher);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentTeacher._id) {
      console.error("Teacher ID is missing for the current teacher.");
      return;
    }
    updateTeacher(currentTeacher);
    setIsEditing(false);
    setCurrentTeacher(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentTeacher((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (teacherId) => {
    try {
      await deleteTeacher(teacherId);
      getAllTeachers();
    } catch (error) {
      console.error("Failed to delete teacher:", error.message);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredTeachers.length / teachersPerPage);
  const offset = currentPage * teachersPerPage;
  const currentTeachers = filteredTeachers.slice(offset, offset + teachersPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="flex flex-col h-full w-full p-5">
      <h1 className="text-xl font-bold mb-4">TEACHER LIST</h1>

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
              <th className="px-4 py-2">Subject</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTeachers.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-100 text-center">
                <td className="px-4 py-2">
                  <img
                    className="w-16 h-16 object-cover rounded-full mx-auto"
                    src={item.image ?? '/default-image.png'}
                    alt="Teacher"
                  />
                </td>
                <td className="px-4 py-2">{item.name ?? 'No Name'}</td>
                <td className="px-4 py-2">{item.email ?? 'No Email'}</td>
                <td className="px-4 py-2">{item.number ?? 'No Number'}</td>
                <td className="px-4 py-2">{item.subject ?? 'No Subject'}</td>
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

      {isEditing && currentTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">Edit Teacher</h2>
            <div className="mt-4">
              <label className="block">Name</label>
              <input
                className="border w-full p-2 rounded"
                name="name"
                value={currentTeacher.name || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block">Email</label>
              <input
                className="border w-full p-2 rounded"
                name="email"
                value={currentTeacher.email || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block">Number</label>
              <input
                className="border w-full p-2 rounded"
                name="number"
                value={currentTeacher.number || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label className="block">Subject</label>
              <input
                className="border w-full p-2 rounded"
                name="subject"
                value={currentTeacher.subject || ''}
                onChange={handleChange}
              />
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

export default TeachersList;