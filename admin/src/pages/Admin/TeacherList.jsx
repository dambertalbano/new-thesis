import React, { useContext, useEffect, useState } from 'react';
import { Pencil, Trash2, Search, Filter } from 'lucide-react';
import ReactPaginate from 'react-paginate';
import { AdminContext } from '../../context/AdminContext';
import EditCard from '../../components/EditCard';

const TeachersList = () => {
    const { teachers, aToken, getAllTeachers, deleteTeacher } = useContext(AdminContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [isEditOpen, setIsEditOpen] = useState(false); // State to control edit window
    const [selectedTeacher, setSelectedTeacher] = useState(null); // State for selected teacher
    const teachersPerPage = 10;

    useEffect(() => {
        document.title = "Teacher List - Admin Panel";
    }, []);

    useEffect(() => {
        if (aToken) getAllTeachers();
    }, [aToken, getAllTeachers]);

    const handleSearch = (e) => setSearchTerm(e.target.value);
    const handleFilterChange = (e) => setFilter(e.target.value);

    const handleEdit = (teacher) => {
        setSelectedTeacher(teacher); // Set the selected teacher
        setIsEditOpen(true); // Open the edit window
    };

    const handleCloseEdit = () => {
        setIsEditOpen(false); // Close the edit window
        setSelectedTeacher(null); // Clear the selected teacher
    };

    const handleDelete = (teacherId) => {
        deleteTeacher(teacherId); // Ensure this function is implemented in AdminContext
    };

    const filteredTeachers = teachers?.filter((teacher) => {
        const fullName = `${teacher?.firstName} ${teacher?.middleName} ${teacher?.lastName}`.toLowerCase();
        const email = teacher?.email?.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
        if (filter === 'all') return matchesSearch;
        if (filter === 'withEmail') return matchesSearch && teacher?.email;
        if (filter === 'noEmail') return matchesSearch && !teacher?.email;
        return matchesSearch;
    });

    const pageCount = Math.ceil((filteredTeachers?.length || 0) / teachersPerPage);
    const offset = currentPage * teachersPerPage;
    const currentTeachers = filteredTeachers?.slice(offset, offset + teachersPerPage) || [];

    const handlePageClick = ({ selected }) => setCurrentPage(selected);

    return (
        <div className="flex flex-col w-full p-6 mt-16 bg-white shadow-md rounded-2xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Teacher List</h1>

            <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-1/2">
                    <input
                        type="text"
                        className="w-full p-3 border rounded-xl pl-10 focus:ring-2 focus:ring-blue-400"
                        placeholder="Search by name or email"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <Search className="absolute top-3 left-3 text-gray-400" size={20} />
                </div>
                <div className="relative w-full md:w-1/4">
                    <select
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                        value={filter}
                        onChange={handleFilterChange}
                    >
                        <option value="all">All</option>
                        <option value="withEmail">With Email</option>
                        <option value="noEmail">No Email</option>
                    </select>
                    <Filter className="absolute top-3 right-3 text-gray-400" size={20} />
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700 text-left">
                            <th className="p-4">Image</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Number</th>
                            <th className="p-4">Address</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTeachers.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-100 text-left">
                                <td className="p-4">
                                    <img className="w-12 h-12 object-cover rounded-full" src={item?.image ?? '/default-image.png'} alt="Teacher" />
                                </td>
                                <td className="p-4">{`${item?.firstName ?? ''} ${item?.middleName ? item.middleName.charAt(0) + '.' : ''} ${item?.lastName ?? ''}`}</td>
                                <td className="p-4">{item?.email ?? 'No Email'}</td>
                                <td className="p-4">{item?.number ?? 'No Number'}</td>
                                <td className="p-4">{item?.address ?? 'No Address'}</td>
                                <td className="p-4 flex justify-center gap-3">
                                    <button
                                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                        onClick={() => handleEdit(item)}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
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

            {/* Render EditCard Component */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <EditCard teacher={selectedTeacher} onClose={handleCloseEdit} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeachersList;