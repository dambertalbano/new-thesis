import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { TeacherContext } from '../context/TeacherContext';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { ChevronDown, ChevronUp } from 'lucide-react';
import '@fontsource/inter';

const Navbar = () => {
  const { dToken, setDToken } = useContext(TeacherContext);
  const { aToken, setAToken } = useContext(AdminContext);
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      // Close mobile menu when screen width is large
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
        setOpenDropdown(null);
      }
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = () => {
    navigate('/');
    dToken && setDToken('');
    dToken && localStorage.removeItem('dToken');
    aToken && setAToken('');
    aToken && localStorage.removeItem('aToken');
  };

  const handleScan = () => {
    navigate('/rfid-scan'); 
  };

  const handleDashboard = () => {
    navigate('/admin-dashboard');
  };

  const navMenus = [
    {
      title: 'Attendance',
      path: '/attendance',
      subMenu: [
        { name: 'View Attendance', path: '/attendance' },
        { name: 'Take Attendance', path: '/take-attendance' },
      ],
    },
    {
      title: 'Add User',
      path: '/add-users',
      subMenu: [
        { name: 'Add Student', path: '/add-student'},
        { name: 'Add Teacher', path: '/add-teacher' },
        { name: 'Add Administrator', path: '/add-administrator' },
        { name: 'Add Utility', path: '/add-utility' }
      ], 
    }
  ];

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <nav className='fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-navbar font-sans'>
      <div className='flex items-center gap-2 text-xs sm:text-sm'>
        <img
          onClick={() => navigate('/admin-dashboard')}
          className='w-24 sm:w-32 md:w-36 lg:w-40 cursor-pointer'
          src={assets.admin_logo}
          alt='Logo'
        />
      </div>
      
      {/* Hamburger menu button */}
      <button 
        className='block lg:hidden text-white p-1'
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
      >
        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className='absolute top-16 left-0 right-0 bg-navbar p-4 flex flex-col'
          >
            <div className='flex flex-col gap-2'>
              <button 
                onClick={handleDashboard} 
                className='text-white py-2 text-left hover:text-customRed transition-colors duration-200'
              >
                Dashboard
              </button>
              
              <button 
                onClick={handleScan} 
                className='text-white py-2 text-left hover:text-customRed transition-colors duration-200'
              >
                Scan
              </button>
              
              {navMenus.map((menu, index) => (
                <div key={index} className='relative'>
                  <button 
                    onClick={() => toggleDropdown(index)}
                    className='w-full text-white py-2 text-left flex justify-between items-center hover:text-customRed transition-colors duration-200'
                  >
                    {menu.title}
                    <span>
                      {openDropdown === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {openDropdown === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className='pl-4'
                      >
                        {menu.subMenu.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            onClick={() => {
                              navigate(subItem.path);
                              setIsMobileMenuOpen(false);
                            }}
                            className='block w-full text-left text-white py-2 px-4 hover:text-customRed transition-colors duration-200'
                          >
                            {subItem.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              
              <button 
                onClick={handleLogout} 
                className='text-white bg-customRed bg-opacity-75 py-2 px-4 text-center hover:text-navbar rounded transition-colors duration-200'
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Desktop menu */}
      <div className='hidden lg:flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8'>
        <FlyoutLink
          title="Dashboard"
          onClick={handleDashboard}
        />
        <FlyoutLink
          title="Scan"
          onClick={handleScan}
        />
        {navMenus.map((menu, index) => (
          <FlyoutLink
            key={index}
            title={menu.title}
            path={menu.path}
            FlyoutContent={() => (
              <MenuContent
                subMenu={menu.subMenu}
                navigate={navigate}
              />
            )}
          />
        ))}
        <CustomButton onClick={handleLogout} label="Sign Out" />
      </div>
    </nav>
  );
};

const FlyoutLink = ({ title, FlyoutContent, path, onClick }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
  
    const handleClick = () => {
      if (path) {
        navigate(path);
      }
      if (onClick) {
        onClick();
      }
    };
  
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className='relative w-fit h-fit'
      >
        <span
          onClick={handleClick}
          className='relative text-white cursor-pointer text-sm sm:text-base'
        >
          {title}
          <span
            style={{
              transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
            }}
            className='absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 origin-left scale-x-0 rounded-full bg-customRed transition-transform duration-300 ease-out'
          />
        </span>
        <AnimatePresence>
          {isHovered && FlyoutContent && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              style={{ translateX: '-50%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className='absolute left-1/2 top-8 sm:top-12 text-black rounded-md shadow-lg'
            >
              <div className='absolute -top-6 left-0 right-0 h-6 bg-transparent' />
              <div className='absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white' />
              {FlyoutContent && <FlyoutContent />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

const MenuContent = ({ subMenu, navigate }) => {
  return (
    <div className='w-48 sm:w-56 bg-white p-4 shadow-xl rounded-md'>
      {subMenu.map((item, index) => (
        <a
          key={index}
          href='#'
          onClick={(e) => {
            e.preventDefault();
            if (item.path) {
              navigate(item.path);
            } else if (item.action) {
              item.action();
            }
          }}
          className='block py-2 px-4 text-sm hover:bg-gray-100 rounded-md transition-colors duration-200 ease-in-out hover:scale-105'
        >
          {item.name}
        </a>
      ))}
    </div>
  );
};

const CustomButton = ({ onClick, label }) => {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      className='relative w-fit h-fit'
    >
      <span
        className={`relative cursor-pointer text-navbar text-sm sm:text-base hover:text-white transition-colors duration-200 rounded px-4 py-2 bg-customRed`}
      >
        {label}
      </span>
    </button>
  );
};

export default Navbar;