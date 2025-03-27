import React, { useEffect, useState } from 'react';
import { FaEdit, FaSearch, FaTrash } from 'react-icons/fa';
import ReactPaginate from 'react-paginate';
import { toast } from 'react-toastify';
import { useAdminContext } from '../../context/AdminContext';

const EmployeeList = () => {
    const { employees, getAllEmployees, updateEmployee, deleteEmployee } = useAdminContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);

    const employeesPerPage = 10;

    useEffect(() => {
        getAllEmployees();
    }, [getAllEmployees]);

    const filteredEmployees = employees?.filter(employee => {
        const fullName = `${employee?.firstName} ${employee?.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) ||
            employee?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0);
    };

    const handleEditClick = (employee) => {
        setCurrentEmployee(employee);
        setIsEditing(true);
    };

    const handleDelete = async (employeeId) => {
        try {
            await deleteEmployee(employeeId);
            toast.success("Employee deleted successfully!");
        } catch (error) {
            console.error("Error deleting employee:", error);
            toast.error("Failed to delete employee.");
        }
    };

    const handleChange = (e) => {
        setCurrentEmployee(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        try {
            await updateEmployee(currentEmployee);
            toast.success("Employee updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating employee:", error);
            toast.error("Failed to update employee.");
        }
    };

    const pageCount = Math.ceil((filteredEmployees?.length || 0) / employeesPerPage);
    const offset = currentPage * employeesPerPage;
    const currentEmployees = filteredEmployees?.slice(offset, offset + employeesPerPage) || [];

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className="flex flex-col h-full w-full p-5">
            <h1 className="text-xl font-bold mb-4">EMPLOYEE LIST</h1>

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
                            <th className="px-4 py-2">Address</th>
                            <th className="px-4 py-2">Position</th>
                            <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentEmployees?.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-100 text-center">
                                <td className="px-4 py-2">
                                    <img
                                        className="w-16 h-16 object-cover rounded-full mx-auto"
                                        src={item?.image ?? '/default-image.png'}
                                        alt="Employee"
                                    />
                                </td>
                                <td className="px-4 py-2">{`${item?.firstName ?? ''} ${item?.middleName ? item.middleName.charAt(0) + '.' : ''} ${item?.lastName ?? ''}`}</td>
                                <td className="px-4 py-2">{item?.email ?? 'No Email'}</td>
                                <td className="px-4 py-2">{item?.number ?? 'No Number'}</td>
                                <td className="px-4 py-2">{item?.address ?? 'No Address'}</td>
                                <td className="px-4 py-2">{item?.position ?? 'No Position'}</td>
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

            <ReactPaginate
                previousLabel={'< Previous'}
                nextLabel={'Next >'}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                containerClassName={'flex items-center justify-center space-x-4 mt-4'}
                previousLinkClassName={'border p-2 rounded text-gray-600 hover:bg-gray-200 cursor-pointer'}
                nextLinkClassName={'border p-2 rounded text-gray-600 hover:bg-gray-200 cursor-pointer'}
                disabledClassName={'opacity-50 cursor-not-allowed'}
                activeClassName={'font-bold'}
            />

            {isEditing && currentEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg w-1/3">
                        <h2 className="text-2xl font-bold mb-4">Edit Employee</h2>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="firstName"
                                value={currentEmployee?.firstName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="middleName"
                                value={currentEmployee?.middleName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="lastName"
                                value={currentEmployee?.lastName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="email"
                                value={currentEmployee?.email || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Number</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="number"
                                value={currentEmployee?.number || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="address"
                                value={currentEmployee?.address || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Position</label>
                            <input
                                className="border w-full p-2 rounded mt-1"
                                name="position"
                                value={currentEmployee?.position || ''}
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

export default EmployeeList;