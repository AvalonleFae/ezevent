// src/pages/PaymentSuccess.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {

    setTimeout(() => {

      alert("Registration Successful!");
      

      navigate('/participant/registered');
    }, 500);
  }, [navigate]);


  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Payment Successful!</h2>
        <p>Finalizing your registration...</p>
      </div>
    </div>
  );
};

export default SuccessPage;