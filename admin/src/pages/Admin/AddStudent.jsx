import axios from 'axios';
import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { RFIDReaderInput } from 'rfid-reader-input';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';

const AddStudent = () => {
  const [docImg, setDocImg] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [number, setNumber] = useState('');
  const [level, setLevel] = useState('Primary');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [code, setCode] = useState(''); // RFID serial state
  const [openCardReaderWindow, setOpenCardReaderWindow] = useState(false); // RFID reader modal state

  const { backendUrl } = useContext(AppContext);
  const { aToken } = useContext(AdminContext);

  const handleOpenRFID = () => {
    setOpenCardReaderWindow(true);
  };

  const handleCloseRFID = () => {
    setOpenCardReaderWindow(false);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (!docImg) {
        return toast.error('Image Not Selected');
      }

      const formData = new FormData();

      formData.append('image', docImg);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('level', level);
      formData.append('number', Number(number));
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }));
      formData.append('code', code); // Include RFID serial in the form

      const { data } = await axios.post(backendUrl + '/api/admin/add-student', formData, { headers: { aToken } });
      if (data.success) {
        toast.success(data.message);
        setDocImg(false);
        setName('');
        setPassword('');
        setEmail('');
        setAddress1('');
        setAddress2('');
        setLevel('');
        setNumber('');
        setCode(''); // Reset RFID serial state
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[90vh] w-full">
      <form onSubmit={onSubmitHandler} className="w-full max-w-5xl bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">Add Student</h2>
        
        <div className="flex flex-col items-center mb-4">
          <label htmlFor="doc-img" className="cursor-pointer">
            <img
              className="w-20 h-20 rounded-full bg-gray-200 object-cover"
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt="Profile"
            />
          </label>
          <input type="file" id="doc-img" hidden onChange={(e) => setDocImg(e.target.files[0])} />
          <p className="text-sm text-gray-500">Upload Profile Picture</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Scan RFID Card</label>
          <div className="flex items-center gap-2">
            <input value={code} className="border rounded px-3 py-2 w-full" type="text" placeholder="RFID Serial" readOnly />
            <button type="button" onClick={handleOpenRFID} className="bg-customRed text-white px-3 py-2 rounded hover:bg-red-600">
              Open Scanner
            </button>
          </div>
          <RFIDReaderInput isOpen={openCardReaderWindow} onRequestClose={handleCloseRFID} handleCodeCardRFID={setCode} textTitle='RFID Identification'
            textBody='Please bring your card closer'/>
        </div>

        <div className="space-y-3">
          <input onChange={(e) => setName(e.target.value)} value={name} className="border rounded px-3 py-2 w-full" type="text" placeholder="Name" required />
          <input onChange={(e) => setEmail(e.target.value)} value={email} className="border rounded px-3 py-2 w-full" type="email" placeholder="Email" required />
          <input onChange={(e) => setPassword(e.target.value)} value={password} className="border rounded px-3 py-2 w-full" type="password" placeholder="Password" required />
          <input onChange={(e) => setNumber(e.target.value)} value={number} className="border rounded px-3 py-2 w-full" type="number" placeholder="Contact Number" required />
          <select onChange={(e) => setLevel(e.target.value)} value={level} className="border rounded px-3 py-2 w-full">
            <option value="Primary">Primary</option>
            <option value="Secondary">Secondary</option>
            <option value="Tertiary">Tertiary</option>
          </select>
          <input onChange={(e) => setAddress1(e.target.value)} value={address1} className="border rounded px-3 py-2 w-full" type="text" placeholder="Address Line 1" required />
          <input onChange={(e) => setAddress2(e.target.value)} value={address2} className="border rounded px-3 py-2 w-full" type="text" placeholder="Address Line 2" required />
        </div>

        <button type="submit" className="w-full bg-customRed px-4 py-2 mt-4 text-white rounded hover:bg-red-600">
          Add Student
        </button>
      </form>
    </div>
  );
};

export default AddStudent;