import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Search } from 'lucide-react';
import ReactPaginate from 'react-paginate';
import { toast } from 'react-toastify';
import { useAdminContext } from '../../context/AdminContext';

const EmployeeList = () => {
    const { employees, getAllEmployees, updateEmployee, deleteEmployee } = useAdminContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [filters, setFilters] = useState({
        withEmail: false,
        noEmail: false,
        withContact: false,
        noContact: false,
        position: '',
    });

    const employeesPerPage = 10;

    useEffect(() => {
        getAllEmployees();
    }, [getAllEmployees]);

    const filteredEmployees = employees?.filter(employee => {
        const fullName = `${employee?.firstName} ${employee?.lastName}`.toLowerCase();
        const email = employee?.email?.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email?.includes(searchTerm.toLowerCase()) || employee?.address?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filters.withEmail && !employee.email) return false;
        if (filters.noEmail && employee.email) return false;
        if (filters.withContact && !employee.number) return false;
        if (filters.noContact && employee.number) return false;
        if (filters.position && employee.position !== filters.position) return false;

        return matchesSearch;
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

    const handleFilterChange = (filterName, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterName]: value !== undefined ? value : !prevFilters[filterName],
        }));
    };

    const formatName = (employee) => {
        return `${employee?.firstName ?? ''} ${employee?.middleName ? employee.middleName.charAt(0) + '.' : ''} ${employee?.lastName ?? ''}`;
    };

    return (
        <div className="flex flex-col w-full p-6 mt-16 bg-white shadow-md rounded-2xl font-sans">

            <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-1/2">
                    <input
                        type="text"
                        className="w-full p-3 border rounded-lg pl-10 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search by name or email"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <Search className="absolute top-3 left-3 text-gray-400" size={20} />
                </div>
                <div className="relative">
                    <button
                        className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-200"
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                    >
                        Filters
                    </button>
                    {isFilterDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <input
                                    type="checkbox"
                                    checked={filters.withEmail}
                                    onChange={() => handleFilterChange('withEmail')}
                                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                With Email
                            </label>
                            <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <input
                                    type="checkbox"
                                    checked={filters.noEmail}
                                    onChange={() => handleFilterChange('noEmail')}
                                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                No Email
                            </label>
                            <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <input
                                    type="checkbox"
                                    checked={filters.withContact}
                                    onChange={() => handleFilterChange('withContact')}
                                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                With Contact
                            </label>
                            <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <input
                                    type="checkbox"
                                    checked={filters.noContact}
                                    onChange={() => handleFilterChange('noContact')}
                                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                No Contact
                            </label>
                            <select
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                                value={filters.position}
                                onChange={(e) => handleFilterChange('position', e.target.value)}
                            >
                                <option value="">Position</option>
                                <option value="Manager">Manager</option>
                                <option value="Staff">Staff</option>
                                <option value="Assistant">Assistant</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 text-left">
                            <th className="p-4 font-semibold">Image</th>
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Number</th>
                            <th className="p-4 font-semibold">Address</th>
                            <th className="p-4 font-semibold">Position</th>
                            <th className="p-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentEmployees?.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50 text-left">
                                <td className="p-4">
                                    <img className="w-12 h-12 object-cover rounded-full" src={item?.image ?? '/default-image.png'} alt="Employee" />
                                </td>
                                <td className="p-4">{formatName(item)}</td>
                                <td className="p-4">{item?.email ?? 'No Email'}</td>
                                <td className="p-4">{item?.number ?? 'No Number'}</td>
                                <td className="p-4">{item?.address ?? 'No Address'}</td>
                                <td className="p-4">{item?.position ?? 'No Position'}</td>
                                <td className="p-4 flex justify-center gap-3">
                                    <div className="relative group">
                                        <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={() => handleEditClick(item)}>
                                            <Pencil size={18} />
                                        </button>
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                            Edit
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={() => handleDelete(item._id)}>
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                            Delete
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ReactPaginate
                previousLabel={'< Prev'}
                nextLabel={'Next >'}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                containerClassName={'flex justify-center mt-6 space-x-3'}
                previousLinkClassName={'px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-200'}
                nextLinkClassName={'px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-200'}
                disabledClassName={'opacity-50 cursor-not-allowed'}
                activeClassName={'bg-blue-500 text-white px-4 py-2 rounded-lg'}
            />

            {isEditing && currentEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg w-1/3">
                        <h2 className="text-2xl font-semibold mb-4">Edit Employee</h2>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="firstName"
                                value={currentEmployee?.firstName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="middleName"
                                value={currentEmployee?.middleName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="lastName"
                                value={currentEmployee?.lastName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="email"
                                value={currentEmployee?.email || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Number</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="number"
                                value={currentEmployee?.number || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="address"
                                value={currentEmployee?.address || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Position</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="position"
                                value={currentEmployee?.position || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button className="px-4 py-2 bg-red-500 text-white rounded-lg mr-2" onClick={() => setIsEditing(false)}>
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-green-500 text-white rounded-lg" onClick={handleSave}>
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