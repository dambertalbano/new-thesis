import axios from "axios";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TeacherContext } from "../../context/TeacherContext";
import gradeOptions from "../../utils/gradeOptions";

// Extracted components for better code organization
const ProfileHeader = ({ teacherInfo }) => {
  // Function to format the name
  const formatName = (teacher) => {
    const middleInitial = teacher.middleName ? `${teacher.middleName.charAt(0)}.` : '';
    return `${teacher.firstName}, ${middleInitial} ${teacher.lastName}`;
  };

  return (
    <div className="bg-gradient-to-r from-customRed to-navbar p-8 text-white flex items-center">
      {teacherInfo?.image && (
        <img
          src={teacherInfo.image}
          alt="Teacher"
          className="w-32 h-32 rounded-full border-2 border-white shadow-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = teacherInfo.image; // Use user image as fallback
          }}
        />
      )}
      <div className="ml-6">
        <h2 className="text-3xl font-bold">{teacherInfo ? formatName(teacherInfo) : 'Loading...'}</h2>
        <p className="text-lg opacity-80">{teacherInfo.email}</p>
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

const TeacherProfile = () => {
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const {
    dToken,
    backendUrl,
    updateTeacherByProfile,
    addTeacherClassSchedule,
    removeTeacherClassSchedule,
    editTeacherClassSchedule,
    addTeacherSubjects,
    removeTeacherSubjects,
    editTeacherSubjects,
    updateTeacherTeachingAssignments // Add this line
  } = useContext(TeacherContext);

  // Consolidated form data state
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    number: '',
    address: '',
    code: ''
  });

  // State variables for Class Schedule, Education Level, Grade/Year Level, Section, and Subjects
  const [classSchedule, setClassSchedule] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // New state to store teaching assignments
  const [teachingAssignments, setTeachingAssignments] = useState([]);

  const [educationLevel, setEducationLevel] = useState('');
  const [gradeYearLevel, setGradeYearLevel] = useState('');
  const [section, setSection] = useState('');
  const [availableSections, setAvailableSections] = useState([]);
  const educationLevels = useMemo(() => Object.keys(gradeOptions), []);

  // Input state
  const [newClassSchedule, setNewClassSchedule] = useState('');
  const [newSubjects, setNewSubjects] = useState('');

  // Editing state
  const [editingClassScheduleId, setEditingClassScheduleId] = useState(null);
  const [editedClassSchedule, setEditedClassSchedule] = useState('');
  const [editingSubjectsId, setEditingSubjectsId] = useState(null);
  const [editedSubjects, setEditedSubjects] = useState('');

  const fetchTeacherProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/teacher/profile`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      
      if (response.data.success) {
        const profileData = response.data.profileData;
        setTeacherInfo(profileData);
        
        // Initialize form data
        setFormData({
          firstName: profileData.firstName || '',
          middleName: profileData.middleName || '',
          lastName: profileData.lastName || '',
          email: profileData.email || '',
          number: profileData.number || '',
          address: profileData.address || '',
          code: profileData.code || ''
        });

        // Initialize other state variables
        setClassSchedule(profileData.classSchedule || []);
        setSubjects(profileData.subjects || []);

        // Initialize teaching assignments from profile data
        setTeachingAssignments(profileData.teachingAssignments || []);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dToken, backendUrl]);

  useEffect(() => {
    fetchTeacherProfile();
  }, [fetchTeacherProfile]);

  useEffect(() => {
    if (teacherInfo) {
      document.title = `${teacherInfo.firstName} ${teacherInfo.lastName}`;
    }
  }, [teacherInfo]);

  useEffect(() => {
    if (educationLevels.length > 0) {
      setEducationLevel(educationLevels[0]);
    }
  }, [educationLevels]);

  // Memoize this calculation to avoid recalculating on every render
  useEffect(() => {
    setAvailableSections(gradeOptions[educationLevel]?.[gradeYearLevel] || []);
  }, [educationLevel, gradeYearLevel]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Validation checks
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.number || !formData.address || !formData.code) {
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

      const success = await updateTeacherByProfile(profileData);

      if (success) {
        fetchTeacherProfile();
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
        const success = await addTeacherClassSchedule(newClassSchedule);
        if (success) {
          setNewClassSchedule('');
          fetchTeacherProfile();
        }
      } catch (error) {
        console.error("Error adding class schedule:", error);
        alert(error.response?.data?.message || error.message);
      }
    }
  }, [newClassSchedule, addTeacherClassSchedule, fetchTeacherProfile]);

  const handleRemoveClassSchedule = useCallback(async (id) => {
    try {
      const success = await removeTeacherClassSchedule(id);
      if (success) {
        fetchTeacherProfile();
      }
    } catch (error) {
      console.error("Error removing class schedule:", error);
      alert(error.response?.data?.message || error.message);
    }
  }, [removeTeacherClassSchedule, fetchTeacherProfile]);

  const handleEditClassSchedule = useCallback(async () => {
    if (editingClassScheduleId && editedClassSchedule) {
      try {
        const success = await editTeacherClassSchedule(editingClassScheduleId, editedClassSchedule);
        if (success) {
          setEditingClassScheduleId(null);
          setEditedClassSchedule('');
          fetchTeacherProfile();
        }
      } catch (error) {
        console.error("Error editing class schedule:", error);
        alert(error.response?.data?.message || error.message);
      }
    }
  }, [editingClassScheduleId, editedClassSchedule, editTeacherClassSchedule, fetchTeacherProfile]);

  const handleAddSubjects = useCallback(async () => {
    if (newSubjects) {
      try {
        const success = await addTeacherSubjects(newSubjects);
        if (success) {
          setNewSubjects('');
          fetchTeacherProfile();
        }
      } catch (error) {
        console.error("Error adding subjects:", error);
        alert(error.response?.data?.message || error.message);
      }
    }
  }, [newSubjects, addTeacherSubjects, fetchTeacherProfile]);

  const handleRemoveSubjects = useCallback(async (id) => {
    try {
      const success = await removeTeacherSubjects(id);
      if (success) {
        fetchTeacherProfile();
      }
    } catch (error) {
      console.error("Error removing subjects:", error);
      alert(error.response?.data?.message || error.message);
    }
  }, [removeTeacherSubjects, fetchTeacherProfile]);

  const handleEditSubjects = useCallback(async () => {
    if (editingSubjectsId && editedSubjects) {
      try {
        const success = await editTeacherSubjects(editingSubjectsId, editedSubjects);
        if (success) {
          setEditingSubjectsId(null);
          setEditedSubjects('');
          fetchTeacherProfile();
        }
      } catch (error) {
        console.error("Error editing subjects:", error);
        alert(error.response?.data?.message || error.message);
      }
    }
  }, [editingSubjectsId, editedSubjects, editTeacherSubjects, fetchTeacherProfile]);

  const handleAddTeachingAssignment = useCallback(async () => {
    if (!educationLevel || !gradeYearLevel || !section) {
      return alert('Please select all fields: Education Level, Grade/Year Level, and Section');
    }
    
    if (teachingAssignments.some(
      (assignment) =>
        assignment.educationLevel === educationLevel &&
        assignment.gradeYearLevel === gradeYearLevel &&
        assignment.section === section
    )) {
      return alert('This teaching assignment is already added.');
    }

    try {
      // Create a new teaching assignment object
      const newAssignment = {
        educationLevel,
        gradeYearLevel,
        section
      };

      // Update the teachingAssignments state
      const updatedAssignments = [...teachingAssignments, newAssignment];
      setTeachingAssignments(updatedAssignments);

      // Update teaching assignments in the backend
      const success = await updateTeacherTeachingAssignments(updatedAssignments);
      if (success) {
        // Clear the selection fields
        setEducationLevel('');
        setGradeYearLevel('');
        setSection('');

        alert('Teaching assignment added successfully!');
      } else {
        alert('Failed to update teaching assignments.');
      }
    } catch (error) {
      console.error("Error adding teaching assignment:", error);
      alert(error.response?.data?.message || error.message);
    }
  }, [educationLevel, gradeYearLevel, section, teachingAssignments, updateTeacherTeachingAssignments, setTeachingAssignments]);

  const handleRemoveTeachingAssignment = useCallback(async (assignmentToRemove) => {
    // Filter out the assignment to remove
    const updatedAssignments = teachingAssignments.filter(
      (assignment) =>
        assignment.educationLevel !== assignmentToRemove.educationLevel ||
        assignment.gradeYearLevel !== assignmentToRemove.gradeYearLevel ||
        assignment.section !== assignmentToRemove.section
    );
    setTeachingAssignments(updatedAssignments);

    try {
      // Update teaching assignments in the backend
      const success = await updateTeacherTeachingAssignments(updatedAssignments);
      if (success) {
        alert('Teaching assignment removed successfully!');
      } else {
        alert('Failed to update teaching assignments.');
      }
    } catch (error) {
      console.error("Error removing teaching assignment:", error);
      alert(error.response?.data?.message || error.message);
    }
  }, [teachingAssignments, updateTeacherTeachingAssignments, setTeachingAssignments]);

  if (loading) return <div className="h-screen flex items-center justify-center text-lg">Loading profile...</div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500 text-lg">{error}</div>;

  return (
    <div className="w-screen h-screen mt-0 bg-gray-100 flex flex-col">
  {/* Profile Header */}
  <ProfileHeader teacherInfo={teacherInfo} />

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
        <h3 className="text-xl font-semibold mb-4">Select Teaching Assignments</h3>
        <EducationalSelections
          educationLevel={educationLevel}
          setEducationLevel={setEducationLevel}
          gradeYearLevel={gradeYearLevel}
          setGradeYearLevel={setGradeYearLevel}
          section={section}
          setSection={setSection}
          availableSections={availableSections}
          educationLevels={educationLevels}
          onSubmit={handleAddTeachingAssignment}
          teachingAssignments={teachingAssignments}
        />
        <TeachingAssignmentsList
          assignments={teachingAssignments}
          onRemove={handleRemoveTeachingAssignment}
        />
      </div>

      {/* Second Column */}
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

export default TeacherProfile;