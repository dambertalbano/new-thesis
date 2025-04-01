import axios from "axios";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { StudentContext } from "../../context/StudentContext";
import gradeOptions from "../../utils/gradeOptions";

const ProfileHeader = ({ studentInfo }) => {
  // Function to format the name
  const formatName = (student) => {
    const middleInitial = student.middleName ? `${student.middleName.charAt(0)}.` : '';
    return `${student.firstName}, ${middleInitial} ${student.lastName}`;
  };

  return (
    <div className="bg-gradient-to-r from-customRed to-navbar p-8 text-white flex items-center">
      {studentInfo?.image && (
        <img
          src={studentInfo.image}
          alt="Student"
          className="w-32 h-32 rounded-full border-2 border-white shadow-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = studentInfo.image; // Use user image as fallback
          }}
        />
      )}
      <div className="ml-6">
        <h2 className="text-3xl font-bold">{studentInfo ? formatName(studentInfo) : 'Loading...'}</h2>
        <p className="text-lg opacity-80">{studentInfo.email}</p>
      </div>
    </div>
  );
};

const ProfileForm = ({ formData, setFormData, onSubmit }) => (
  <form onSubmit={onSubmit} className="p-6">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
          First Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="firstName"
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="middleName">
          Middle Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="middleName"
          type="text"
          placeholder="Middle Name"
          value={formData.middleName}
          onChange={(e) => setFormData({...formData, middleName: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
          Last Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="lastName"
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number">
          Contact Number
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="number"
          type="text"
          placeholder="Contact Number"
          value={formData.number}
          onChange={(e) => setFormData({...formData, number: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
          Address
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="address"
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="studentNumber">
          Student Number
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="studentNumber"
          type="text"
          placeholder="Student Number"
          value={formData.studentNumber}
          onChange={(e) => setFormData({...formData, studentNumber: e.target.value})}
        />
      </div>
    </div>
    <div className="flex items-center justify-between mt-4">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="submit"
      >
        Update Profile
      </button>
    </div>
  </form>
);

// Reusable section component for displaying items with edit/delete functionality
const ItemListSection = ({
  title,
  items,
  newItemValue,
  setNewItemValue,
  handleAddItem,
  handleRemoveItem,
  handleEditItem,
  editingItemId,
  setEditingItemId,
  editedItemValue,
  setEditedItemValue
}) => (
  <div className="p-6">
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <div className="flex items-center mb-2">
      <input
        type="text"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
        placeholder={`New ${title}`}
        value={newItemValue}
        onChange={(e) => setNewItemValue(e.target.value)}
      />
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={handleAddItem}
      >
        Add {title}
      </button>
    </div>
    {items.map((item, index) => (
      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200">
        {editingItemId === item._id ? (
          <>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
              value={editedItemValue}
              onChange={(e) => setEditedItemValue(e.target.value)}
            />
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
              onClick={handleEditItem}
            >
              Update
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => setEditingItemId(null)}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <span>{item}</span>
            <div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                onClick={() => {
                  setEditingItemId(item._id);
                  setEditedItemValue(item);
                }}
              >
                Edit
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => handleRemoveItem(item._id)}
              >
                Remove
              </button>
            </div>
          </>
        )}
      </div>
    ))}
  </div>
);

// Component to display teaching assignments
const TeachingAssignmentsList = ({ assignments, onRemove }) => (
  <div>
    <h4 className="text-lg font-medium mt-6 mb-2">Current Teaching Assignments</h4>
    {assignments.length > 0 ? (
      <ul className="list-disc list-inside">
        {assignments.map((assignment, index) => (
          <li key={index} className="mb-2">
            {`${assignment.educationLevel} - Grade ${assignment.gradeYearLevel} - Section ${assignment.section}`}
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
              onClick={() => onRemove(assignment)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p>No teaching assignments added yet.</p>
    )}
  </div>
);

// Educational selections component
const EducationalSelections = ({ 
  educationLevel, 
  setEducationLevel, 
  gradeYearLevel, 
  setGradeYearLevel, 
  section, 
  setSection, 
  availableSections, 
  educationLevels,
  onSubmit,
  teachingAssignments // Add teachingAssignments prop
}) => {
  // Function to check if an assignment is already selected
  const isAssignmentSelected = (edLevel, grLevel, sec) => {
    return teachingAssignments.some(
      (assignment) =>
        assignment.educationLevel === edLevel &&
        assignment.gradeYearLevel === grLevel &&
        assignment.section === sec
    );
  };

  return (
    <div className="mt-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="educationLevel">
          Education Level
        </label>
        <select
          id="educationLevel"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={Array.isArray(educationLevel) ? (educationLevel.length > 0 ? educationLevel[0] : '') : educationLevel}
          onChange={(e) => {
            setEducationLevel(e.target.value);
            setGradeYearLevel('');
            setSection('');
          }}
        >
          <option value="">Select Education Level</option>
          {educationLevels.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
      
      {educationLevel && (
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gradeYearLevel">
            Grade/Year Level
          </label>
          <select
            id="gradeYearLevel"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={Array.isArray(gradeYearLevel) ? (gradeYearLevel.length > 0 ? gradeYearLevel[0] : '') : gradeYearLevel}
            onChange={(e) => {
              setGradeYearLevel(e.target.value);
              setSection('');
            }}
          >
            <option value="">Select Grade/Year Level</option>
            {gradeOptions[educationLevel] &&
              Object.keys(gradeOptions[educationLevel]).map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
          </select>
        </div>
      )}

      {gradeYearLevel && (
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="section">
            Section
          </label>
          <select
            id="section"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={Array.isArray(section) ? (section.length > 0 ? section[0] : '') : section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="">Select Section</option>
            {availableSections &&
              availableSections.map((sec, index) => (
                <option
                  key={index}
                  value={sec}
                  disabled={isAssignmentSelected(educationLevel, gradeYearLevel, sec)}
                >
                  {sec}
                  {isAssignmentSelected(educationLevel, gradeYearLevel, sec)
                    ? " (Already Assigned)"
                    : ""}
                </option>
              ))}
          </select>
        </div>
      )}
      
      {/* Add Submit Button */}
      {section && (
        <div className="mt-4">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={onSubmit}
          >
            Add Teaching Assignment
          </button>
        </div>
      )}
    </div>
  );
};

// Success card modal
const SuccessModal = ({ isOpen, onClose }) => (
  isOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <h2 className="text-md font-bold mb-4 text-gray-600">Profile Updated Successfully!</h2>
        <button
          className="bg-customRed hover:text-navbar text-sm text-white font-medium py-2 px-4 rounded-lg"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  )
);

const StudentProfile = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const {
    sToken,
    backendUrl,
    updateStudentProfile, // Changed to student-specific function
    addStudentClassSchedule,
    removeStudentClassSchedule,
    editStudentClassSchedule,
    addStudentSubjects,
    removeStudentSubjects,
    editStudentSubjects,
  } = useContext(StudentContext);

  // Consolidated form data state
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    number: '',
    address: '',
    studentNumber: '', // Added studentNumber
  });

  // State variables for Class Schedule and Subjects
  const [classSchedule, setClassSchedule] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Input state
  const [newClassSchedule, setNewClassSchedule] = useState('');
  const [newSubjects, setNewSubjects] = useState('');

  // Editing state
  const [editingClassScheduleId, setEditingClassScheduleId] = useState(null);
  const [editedClassSchedule, setEditedClassSchedule] = useState('');
  const [editingSubjectsId, setEditingSubjectsId] = useState(null);
  const [editedSubjects, setEditedSubjects] = useState('');

  const fetchStudentProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/student/profile`, {
        headers: { Authorization: `Bearer ${sToken}` }, // Changed to sToken
      });
      
      if (response.data.success) {
        const profileData = response.data.profileData;
        setStudentInfo(profileData);
        
        // Initialize form data
        setFormData({
          firstName: profileData.firstName || '',
          middleName: profileData.middleName || '',
          lastName: profileData.lastName || '',
          email: profileData.email || '',
          number: profileData.number || '',
          address: profileData.address || '',
          studentNumber: profileData.studentNumber || '', // Initialize studentNumber
        });

        // Initialize other state variables
        setClassSchedule(profileData.classSchedule || []);
        setSubjects(profileData.subjects || []);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sToken, backendUrl]); // Changed to sToken

  useEffect(() => {
    fetchStudentProfile();
  }, [fetchStudentProfile]);

  useEffect(() => {
    if (studentInfo) {
      document.title = `${studentInfo.firstName} ${studentInfo.lastName}`;
    }
  }, [studentInfo]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Validation checks
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.number || !formData.address || !formData.studentNumber) {
      return alert('Missing Details');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return alert('Please enter a valid email');
    }

    try {
      const profileData = {
        ...formData,
        number: Number(formData.number)
      };

      const success = await updateStudentProfile(profileData); // Changed to student-specific function

      if (success) {
        fetchStudentProfile();
        setShowSuccessCard(true);
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || error.message);
    }
  };

  // Memoized handlers for better performance
  const handleAddClassSchedule = useCallback(async () => {
    if (newClassSchedule) {
      try {
        const success = await addStudentClassSchedule(newClassSchedule);
        if (success) {
          setNewClassSchedule('');
          fetchStudentProfile();
        }
      } catch (error) {
        console.error("Error adding class schedule:", error);
        alert(error.response?.data?.message || error.message);
      }
    }
  }, [newClassSchedule, addStudentClassSchedule, fetchStudentProfile]);

  const handleRemoveClassSchedule = useCallback(async (id) => {
    try {
      const success = await removeStudentClassSchedule(id);
      if (success) {
        fetchStudentProfile();
      }
    } catch (error) {
      console.error("Error removing class schedule:", error);
      alert(error.response?.data?.message || error.message);
    }
  }, [removeStudentClassSchedule, fetchStudentProfile]);

  const handleEditClassSchedule = useCallback(async () => {
    if (editingClassScheduleId && editedClassSchedule) {
      try {
        const success = await editStudentClassSchedule(editingClassScheduleId, editedClassSchedule);
        if (success) {
          setEditingClassScheduleId(null);
          setEditedClassSchedule('');
          fetchStudentProfile();
        }
      } catch (error) {
        console.error("Error editing class schedule:", error);
        alert(error.response?.data?.message || error.message);
      }
    }
  }, [editingClassScheduleId, editedClassSchedule, editStudentClassSchedule, fetchStudentProfile]);

  const handleAddSubjects = useCallback(async () => {
    if (newSubjects) {
      try {
        const success = await addStudentSubjects(newSubjects);
        if (success) {
          setNewSubjects('');
          fetchStudentProfile();
        }
      } catch (error) {
        console.error("Error adding subjects:", error);
        alert(error.response?.data?.message || error.message);
      }
    }
  }, [newSubjects, addStudentSubjects, fetchStudentProfile]);

  const handleRemoveSubjects = useCallback(async (id) => {
    try {
      const success = await removeStudentSubjects(id);
      if (success) {
        fetchStudentProfile();
      }
    } catch (error) {
      console.error("Error removing subjects:", error);
      alert(error.response?.data?.message || error.message);
    }
  }, [removeStudentSubjects, fetchStudentProfile]);

  const handleEditSubjects = useCallback(async () => {
    if (editingSubjectsId && editedSubjects) {
      try {
        const success = await editStudentSubjects(editingSubjectsId, editedSubjects);
        if (success) {
          setEditingSubjectsId(null);
          setEditedSubjects('');
          fetchStudentProfile();
        }
      } catch (error) {
        console.error("Error editing subjects:", error);
        alert(error.response?.data?.message || error.message);
      }
    }
  }, [editingSubjectsId, editedSubjects, editStudentSubjects, fetchStudentProfile]);

  if (loading) return <div className="h-screen flex items-center justify-center text-lg">Loading profile...</div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500 text-lg">{error}</div>;

  return (
    <div className="w-screen h-screen mt-0 bg-gray-100 flex flex-col">
  {/* Profile Header */}
  <ProfileHeader studentInfo={studentInfo} />

  {/* Profile Form */}
  <ProfileForm
    formData={formData}
    setFormData={setFormData}
    onSubmit={onSubmitHandler}
  />

  {/* Grouped Sections in a 2-Column Layout */}
  <div className="flex flex-col gap-4 m-5 max-w-screen-md mx-auto">
    <div className="flex md:flex-row flex-col gap-4"> {/* Modified this line */}
      {/* First Column */}
      <div className="p-6 w-full md:w-1/2"> {/* Modified this line */}
        <ItemListSection
          title="Class Schedule"
          items={classSchedule}
          newItemValue={newClassSchedule}
          setNewItemValue={setNewClassSchedule}
          handleAddItem={handleAddClassSchedule}
          handleRemoveItem={handleRemoveClassSchedule}
          handleEditItem={handleEditClassSchedule}
          editingItemId={editingClassScheduleId}
          setEditingItemId={setEditingClassScheduleId}
          editedItemValue={editedClassSchedule}
          setEditedItemValue={setEditedClassSchedule}
        />
      </div>

      {/* Second Column */}
      <div className="p-6 w-full md:w-1/2"> {/* Modified this line */}
        <ItemListSection
          title="Subjects"
          items={subjects}
          newItemValue={newSubjects}
          setNewItemValue={setNewSubjects}
          handleAddItem={handleAddSubjects}
          handleRemoveItem={handleRemoveSubjects}
          handleEditItem={handleEditSubjects}
          editingItemId={editingSubjectsId}
          setEditingItemId={setEditingSubjectsId}
          editedItemValue={editedSubjects}
          setEditedItemValue={setEditedSubjects}
        />
      </div>
    </div>
  </div>

  {/* Success Modal */}
  <SuccessModal
    isOpen={showSuccessCard}
    onClose={() => setShowSuccessCard(false)}
  />
</div>
  );
};

export default StudentProfile;