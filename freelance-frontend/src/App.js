import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import NavMenu from './components/NavMenu';
import Prijava from './pages/Prijava';
import Registracija from './pages/Registracija';
import "./App.css";

function AppContent() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Continuously check sessionStorage for user data
  useEffect(() => {
    const checkUserData = () => {
      const token = sessionStorage.getItem('userToken');
      const userName = sessionStorage.getItem('userName');
      const userRole = sessionStorage.getItem('userRole');
      if (token && userName && userRole) {
        setUserData({ token, userName, userRole });
      } else {
        setUserData(null);
      }
    };

    checkUserData();
    const intervalId = setInterval(checkUserData, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Logout handler – calls the logout endpoint with the Bearer token and navigates to "/"
  const handleLogout = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userData.token}`,
        },
      });
      if (response.ok) {
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('userRole');
        setUserData(null);
        navigate("/"); // Navigate to home or login page after logout
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Show NavMenu only if userData exists */}
      {userData && <NavMenu userData={userData} onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={!userData && <Prijava />} />
        <Route path="/registracija" element={!userData && <Registracija />} />
        <Route path="/pocetna" element={<span>Pocetna</span>} />
        <Route path="/usluge" element={<span>Usluge</span>} />
        <Route path="/onama" element={<span>O Nama</span>} />
        {/* Add additional routes as needed */}
      </Routes>
    </>
  );
}

export default AppContent;
