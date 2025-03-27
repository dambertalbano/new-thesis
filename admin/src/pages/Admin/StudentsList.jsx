import React, { useContext, useEffect, useState } from 'react';
import { FaEdit, FaSearch, FaTrash } from 'react-icons/fa';
import { AdminContext } from '../../context/AdminContext';

const StudentsList = () => {
    const { students, aToken, getAllStudents, updateStudent, deleteStudent } = useContext(AdminContext);

    const [isEditing, setIsEditing] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const studentsPerPage = 10;
    const [expandedEmail, setExpandedEmail] = useState(null);
    const [expandedAddress, setExpandedAddress] = useState(null);

    useEffect(() => {
        if (aToken) {
            getAllStudents();
        }
    }, [aToken, getAllStudents]);

    const handleEditClick = (student) => {
        if (!student._id) {
            console.error("Student ID is missing for the selected student.");
            return;
        }
        setCurrentStudent(student);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!currentStudent._id) {
            console.error("Student ID is missing for the current student.");
            return;
        }
        updateStudent(currentStudent);
        setIsEditing(false);
        setCurrentStudent(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentStudent((prev) => ({
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

    const filteredStudents = students.filter((student) => {
        const fullName = `${student.firstName} ${student.middleName ? student.middleName.charAt(0) + '.' : ''} ${student.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.address?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const pageCount = Math.ceil(filteredStudents.length / studentsPerPage);
    const offset = currentPage * studentsPerPage;
    const currentStudents = filteredStudents.slice(offset, offset + studentsPerPage);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    const shortenEmail = (email, maxLength = 15) => {
        if (!email) return 'No Email';
        if (email.length > maxLength && expandedEmail !== email) {
            return email.substring(0, maxLength) + '...';
        }
        return email;
    };

    const shortenAddress = (address, maxLength = 15) => {
        if (!address) return 'No Address';
        if (address.length > maxLength && expandedAddress !== address) {
            return address.substring(0, maxLength) + '...';
        }
        return address;
    };

    const toggleEmailExpansion = (email) => {
        setExpandedEmail(expandedEmail === email ? null : email);
    };

    const toggleAddressExpansion = (address) => {
        setExpandedAddress(expandedAddress === address ? null : address);
    };

    const formatName = (student) => {
        return `${student.firstName} ${student.middleName ? student.middleName.charAt(0) + '.' : ''} ${student.lastName}`;
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
                            {/*<th className="px-4 py-2">Middle Name</th>
                            <th className="px-4 py-2">Last Name</th>*/}
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Number</th>
                            <th className="px-4 py-2">Education Level</th>
                            <th className="px-4 py-2">Grade/Year Level</th>
                            <th className="px-4 py-2">Section</th>
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
                                {/*<td className="px-4 py-2">{item.firstName ?? 'No First Name'}</td>
                                <td className="px-4 py-2">{item.middleName ?? 'No Middle Name'}</td>
                                <td className="px-4 py-2">{item.lastName ?? 'No Last Name'}</td>*/}
                                <td className="px-4 py-2">{formatName(item)}</td>
                                <td className="px-4 py-2" onClick={() => toggleEmailExpansion(item.email)} style={{ cursor: 'pointer' }}>
                                    {shortenEmail(item.email)}
                                </td>
                                <td className="px-4 py-2">{item.number ?? 'No Number'}</td>
                                <td className="px-4 py-2">{item.educationLevel ?? 'No Education Level'}</td>
                                <td className="px-4 py-2">{item.gradeYearLevel ?? 'No Grade/Year Level'}</td>
                                <td className="px-4 py-2">{item.section ?? 'No Section'}</td>
                                <td className="px-4 py-2" onClick={() => toggleAddressExpansion(item.address)} style={{ cursor: 'pointer' }}>
                                    {shortenAddress(item.address)}
                                </td>
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
                    className={`border p-2 rounded text-gray-600 hover:bg-gray-200 ${currentPage === 0 ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}> {'< Previous'}
                </button>

                <p className="text-lg font-medium">{currentPage + 1} of {pageCount}</p>

                <button
                    onClick={() => handlePageClick({ selected: Math.min(pageCount - 1, currentPage + 1) })}
                    disabled={currentPage === pageCount - 1}
                    className={`border p-2 rounded text-gray-600 hover:bg-gray-200 ${currentPage === pageCount - 1 ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}> {'Next >'}
                </button>
            </div>

            {isEditing && currentStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-2xl font-bold mb-4">Edit Student</h2>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="firstName"
                                value={currentStudent.firstName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="middleName"
                                value={currentStudent.middleName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="lastName"
                                value={currentStudent.lastName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="email"
                                value={currentStudent.email || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Number</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="number"
                                value={currentStudent.number || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Education Level</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="educationLevel"
                                value={currentStudent.educationLevel || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Grade/Year Level</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="gradeYearLevel"
                                value={currentStudent.gradeYearLevel || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Section</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="section"
                                value={currentStudent.section || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="address"
                                value={currentStudent.address || ''}
                                onChange={handleChange}
                            />
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