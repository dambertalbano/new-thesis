import axios from "axios";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TeacherContext } from "../../context/TeacherContext";
import gradeOptions from "../../utils/gradeOptions";

// Extracted components for better code organization
const ProfileHeader = ({ teacherInfo }) => (
  <div className="bg-gradient-to-r from-customRed to-navbar p-8 text-white flex items-center">
    {teacherInfo?.image && (
      <img
        src={teacherInfo.image}
        alt="Teacher"
        className="w-32 h-32 rounded-full border-2 border-white shadow-md"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/images/default-image.png";
        }}
      />
    )}
    <div className="ml-6">
      <h2 className="text-3xl font-bold">{teacherInfo.firstName} {teacherInfo.lastName}</h2>
      <p className="text-lg opacity-80">{teacherInfo.email}</p>
    </div>
  </div>
);

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
  onSubmit  // Add this prop
}) => (
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
              <option key={index} value={sec}>{sec}</option>
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
    addTeacherEducationLevel, 
    removeTeacherEducationLevel, 
    editTeacherEducationLevel, 
    addTeacherGradeYearLevel, 
    removeTeacherGradeYearLevel, 
    editTeacherGradeYearLevel, 
    addTeacherSection, 
    removeTeacherSection, 
    addTeacherSubjects, 
    removeTeacherSubjects, 
    editTeacherSubjects 
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
  const [educationLevel, setEducationLevel] = useState('');
  const [gradeYearLevel, setGradeYearLevel] = useState('');
  const [section, setSection] = useState('');
  const [subjects, setSubjects] = useState([]);

  const [availableSections, setAvailableSections] = useState([]);
  const educationLevels = useMemo(() => Object.keys(gradeOptions), []);

  // Input state
  const [newClassSchedule, setNewClassSchedule] = useState('');
  const [newEducationLevel, setNewEducationLevel] = useState('');
  const [newSubjects, setNewSubjects] = useState('');

  // Editing state
  const [editingClassScheduleId, setEditingClassScheduleId] = useState(null);
  const [editedClassSchedule, setEditedClassSchedule] = useState('');
  const [editingEducationLevelId, setEditingEducationLevelId] = useState(null);
  const [editedEducationLevel, setEditedEducationLevel] = useState('');
  const [editingSubjectsId, setEditingSubjectsId] = useState(null);
  const [editedSubjects, setEditedSubjects] = useState('');

  useEffect(() => {
    if (educationLevels.length > 0) {
      setEducationLevel(educationLevels[0]);
    }
  }, [educationLevels]);

  // Memoize this calculation to avoid recalculating on every render
  useEffect(() => {
    setAvailableSections(gradeOptions[educationLevel]?.[gradeYearLevel] || []);
  }, [educationLevel, gradeYearLevel]);

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
        
        // Handle potentially array values safely
        setEducationLevel(Array.isArray(profileData.educationLevel) ? 
          (profileData.educationLevel.length > 0 ? profileData.educationLevel[0] : '') : 
          (profileData.educationLevel || ''));
        
        setGradeYearLevel(Array.isArray(profileData.gradeYearLevel) ? 
          (profileData.gradeYearLevel.length > 0 ? profileData.gradeYearLevel[0] : '') : 
          (profileData.gradeYearLevel || ''));
        
        setSection(Array.isArray(profileData.section) ? 
          (profileData.section.length > 0 ? profileData.section[0] : '') : 
          (profileData.section || ''));
        
        setSubjects(profileData.subjects || []);
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

  const handleAddEducationLevel = useCallback(async () => {
    if (newEducationLevel) {
      try {
        const success = await addTeacherEducationLevel(newEducationLevel);
        if (success) {
          setNewEducationLevel('');
          fetchTeacherProfile();
        }
      } catch (error) {
        console.error("Error adding education level:", error);
        alert(error.response?.data?.message || error.message);
      }
    }
  }, [newEducationLevel, addTeacherEducationLevel, fetchTeacherProfile]);

  const handleRemoveEducationLevel = useCallback(async (id) => {
    try {
      const success = await removeTeacherEducationLevel(id);
      if (success) {
        fetchTeacherProfile();
      }
    } catch (error) {
      console.error("Error removing education level:", error);
      alert(error.response?.data?.message || error.message);
    }
  }, [removeTeacherEducationLevel, fetchTeacherProfile]);

  const handleEditEducationLevel = useCallback(async () => {
    if (editingEducationLevelId && editedEducationLevel) {
      try {
        const success = await editTeacherEducationLevel(editingEducationLevelId, editedEducationLevel);
        if (success) {
          setEditingEducationLevelId(null);
          setEditedEducationLevel('');
          fetchTeacherProfile();
        }
      } catch (error) {
        console.error("Error editing education level:", error);
        alert(error.response?.data?.message || error.message);
      }
    }
  }, [editingEducationLevelId, editedEducationLevel, editTeacherEducationLevel, fetchTeacherProfile]);

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
    
    try {
      // First add the education level if needed
      await addTeacherEducationLevel(educationLevel);
      
      // Then add the grade/year level
      await addTeacherGradeYearLevel(gradeYearLevel);
      
      // Finally add the section
      const success = await addTeacherSection(section);
      
      if (success) {
        alert('Teaching assignment added successfully!');
        fetchTeacherProfile();
      }
    } catch (error) {
      console.error("Error adding teaching assignment:", error);
      alert(error.response?.data?.message || error.message);
    }
  }, [educationLevel, gradeYearLevel, section, addTeacherEducationLevel, addTeacherGradeYearLevel, addTeacherSection, fetchTeacherProfile]);

  if (loading) return <div className="h-screen flex items-center justify-center text-lg">Loading profile...</div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500 text-lg">{error}</div>;

  return (
    <div className="w-screen h-screen pt-[60px] mt-0 bg-gray-100 flex flex-col">
      {/* Profile Header */}
      <ProfileHeader teacherInfo={teacherInfo} />

      {/* Profile Form */}
      <ProfileForm 
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmitHandler}
      />

      {/* Class Schedule Management */}
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

      {/* Education Level Management */}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">Add Teacher Qualifications</h3>
        <div className="flex items-center mb-2">
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
            placeholder="New Education Level"
            value={newEducationLevel}
            onChange={(e) => setNewEducationLevel(e.target.value)}
          />
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleAddEducationLevel}
          >
            Add Education Level
          </button>
        </div>
        
        {/* Educational Selections */}
        <h4 className="text-lg font-medium mt-6 mb-2">Select Teaching Assignments</h4>
        <EducationalSelections 
          educationLevel={educationLevel}
          setEducationLevel={setEducationLevel}
          gradeYearLevel={gradeYearLevel}
          setGradeYearLevel={setGradeYearLevel}
          section={section}
          setSection={setSection}
          availableSections={availableSections}
          educationLevels={educationLevels}
          onSubmit={handleAddTeachingAssignment}  // Add this prop
        />
      </div>

      {/* Subjects Management */}
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

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessCard} 
        onClose={() => setShowSuccessCard(false)} 
      />
    </div>
  );
};

export default TeacherProfile;