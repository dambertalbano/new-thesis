import React from "react";
import {
  AttendanceEmployeeCard,
  AttendanceStudentCard,
  AttendanceTeacherCard,
} from "../../components/UserCard";
import { motion } from "framer-motion";

function Attendance() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-screen w-full bg-gray-100">
      <motion.div
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.1 }}
        className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-7xl"
      >
        <motion.div variants={cardAnimation}>
          <AttendanceStudentCard />
        </motion.div>
        <motion.div variants={cardAnimation}>
          <AttendanceTeacherCard />
        </motion.div>
        <motion.div variants={cardAnimation}>
          <AttendanceEmployeeCard />
        </motion.div>
      </motion.div>
    </div>
  );
}

const cardAnimation = {
  initial: { scale: 0.5, y: 50, opacity: 0 },
  animate: { scale: 1, y: 0, opacity: 1 },
  transition: { type: "spring", mass: 3, stiffness: 400, damping: 50 },
};

export default Attendance;
