import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import NavMenu from './components/NavMenu';
import Footer from './components/Footer';
import Prijava from './pages/Prijava';
import Registracija from './pages/Registracija';
import PocetnaKupac from './pages/kupac/Pocetna';
import PocetnaProdavac from './pages/prodavac/PocetnaProdavac';
import MojeUsluge from './pages/prodavac/MojeUsluge';
import UslugeKupac from './pages/kupac/Usluge';
import DetaljiUslugeKupac from './pages/kupac/DetaljiUsluge';
import ONama from './pages/ONama';
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
        <Route path="/pocetna" element={userData && userData.userRole === "kupac" && <PocetnaKupac/>} />
        <Route path="/pocetna-ponudjac" element={userData && userData.userRole === "ponudjac" && <PocetnaProdavac/>} />
        <Route path="/moje-usluge" element={userData && userData.userRole === "ponudjac" && <MojeUsluge token={userData.token}/>} />
        <Route path="/usluge" element={userData && userData.userRole === "kupac" && <UslugeKupac token={userData.token}/>} />
        <Route path="/usluge/:id" element={userData && userData.userRole === "kupac" && <DetaljiUslugeKupac token={userData.token}/>} />
        <Route path="/onama" element={userData && <ONama/>} />
        {/* Add additional routes as needed */}
      </Routes>
      {userData && <Footer/>}
    </>
  );
}

export default AppContent;
