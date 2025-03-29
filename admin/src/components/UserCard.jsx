import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers } from "react-icons/fi"; // Using the same icon for consistency

const UserCard = ({ title, navigateTo }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={{
        initial: { scale: 0.5, y: 50, opacity: 0 },
        animate: { scale: 1, y: 0, opacity: 1 },
      }}
      transition={{ type: "spring", mass: 3, stiffness: 400, damping: 50 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => navigate(navigateTo)}
      className="relative w-full max-w-[350px] h-[250px] sm:h-[280px] rounded-xl cursor-pointer bg-white overflow-hidden group shadow-lg flex flex-col items-center justify-center"
    >
      {/* Background Gradient Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#A81010] to-red-700 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300" />

      {/* Large Background Icon */}
      <FiUsers className="absolute z-0 -top-12 -right-12 text-9xl text-gray-100 group-hover:text-red-400 group-hover:rotate-12 transition-transform duration-300" />

      {/* Foreground Content */}
      <div className="relative z-10 text-center">
        <FiUsers className="mb-2 text-4xl text-red-600 group-hover:text-white transition-colors duration-300" />
        <p className="text-2xl font-semibold text-gray-600 group-hover:text-red-200 transition-colors duration-300">
          {title}
        </p>
      </div>
    </motion.div>
  );
};

// Attendance Cards
export const AttendanceStudentCard = () => <UserCard title="Student Attendance" navigateTo="/attendance-student" />;
export const AttendanceTeacherCard = () => <UserCard title="Teacher Attendance" navigateTo="/attendance-teacher" />;
export const AttendanceEmployeeCard = () => <UserCard title="Employee Attendance" navigateTo="/attendance-employee" />;

// Add Users
export const AddStudentCard = () => <UserCard title="Add Student" navigateTo="/add-student" />;
export const AddAdministratorCard = () => <UserCard title="Add Administrator" navigateTo="/add-administrator" />;
export const AddTeachersCard = () => <UserCard title="Add Teacher" navigateTo="/add-teacher" />;
export const AddUtilityCard = () => <UserCard title="Add Utility" navigateTo="/add-utility" />;
export const AddEmployeeCard = () => <UserCard title="Add Employee" navigateTo="/add-employee" />;

// All Users
export const StudentCard = () => <UserCard title="Students" navigateTo="/student-list" />;
export const TeacherCard = () => <UserCard title="Teachers" navigateTo="/teacher-list" />;
export const UtilityCard = () => <UserCard title="Utilities" navigateTo="/utility-list" />;
export const AdministratorCard = () => <UserCard title="Administrators" navigateTo="/administrator-list" />;
export const EmployeeCard = () => <UserCard title="Employees" navigateTo="/employee-list" />; // Added this export

// Card Container Component with Responsive Grid
const CardContainer = () => {
  return (
    <div className="flex flex-wrap justify-center gap-8 p-8">
      <AttendanceStudentCard />
      <AttendanceTeacherCard />
      <AttendanceEmployeeCard />
    </div>
  );
};

export default CardContainer;