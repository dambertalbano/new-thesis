import React from "react";
import { Link } from "react-router-dom";
import bgSolid from '../assets/bg-solid.png';
import scc_bg from "../assets/scc_bg.webp"; // Import the image

export default function LandingPage() {
  return (
    <div className="flex h-screen">
      {/* Left Side - Building Image */}
      <div
        className="w-7/12 bg-cover bg-center"
        style={{
          backgroundImage: `url(${scc_bg})` // Use the imported image
        }}
      ></div>

      {/* Right Side - Login Section */}
      <div className="w-5/12 bg-gray-100 flex flex-col justify-center items-center p-10 shadow-lg"
      style={{ backgroundImage: `url(${bgSolid})` }}>
        <img
          src="/src/assets/admin_logo.svg" // Replace with actual logo path
          alt="SCC Logo"
          className="w-20 h-20 mb-4"
        />
        <h1 className="text-3xl font-bold text-white">Hi, Clareans!</h1>
        <p className="text-white mb-6">Please click or tap your destination.</p>

        <Link to="/student-login" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded w-full max-w-xs mb-4 text-center">
          Student
        </Link>

        <Link to="/teacher-login" className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded w-full max-w-xs mb-4 text-center">
          Teachers
        </Link>

        <p className="text-sm text-center text-white">
          By using this service, you understood and agree to the SCC Online Services
          <a
            href="#"
            className="text-blue-600 hover:underline ml-1"
          >
            Terms of Use
          </a>
          and
          <a
            href="#"
            className="text-blue-600 hover:underline ml-1"
          >
            Privacy Statement
          </a>
          .
        </p>
      </div>
    </div>
  );
}