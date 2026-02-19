import { useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const ResetPassword = () => {
  const { navigate, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      // Obtenir le token reCAPTCHA
      let recaptchaToken = null;
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha('reset_password');
      }

      const response = await axios.post(`${backendUrl}/api/user/reset-password`, { 
        token, 
        newPassword,
        recaptchaToken
      });
      
      if (response.data.success) {
        setResetSuccess(true);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (!token) {
    return (
      <div className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10'>
          <p className='prata-regular text-3xl'>Invalid Link</p>
          <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
        </div>
        <p className='text-center text-sm text-gray-600 mb-4'>
          This password reset link is invalid or has expired.
        </p>
        <button 
          onClick={() => navigate('/forgot-password')} 
          className='bg-black text-white font-light px-8 py-2 mt-4'
        >
          Request New Link
        </button>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10'>
          <p className='prata-regular text-3xl'>Success!</p>
          <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
        </div>
        <p className='text-center text-sm text-gray-600 mb-4'>
          Your password has been reset successfully. You can now login with your new password.
        </p>
        <button 
          onClick={() => navigate('/login')} 
          className='bg-black text-white font-light px-8 py-2 mt-4'
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>Reset Password</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
      </div>
      <p className='text-center text-sm text-gray-600 mb-4'>
        Enter your new password below.
      </p>
      <input 
        onChange={(e) => setNewPassword(e.target.value)} 
        value={newPassword} 
        type="password" 
        className='w-full px-3 py-2 border border-gray-800' 
        placeholder='New Password' 
        required
        minLength={6}
      />
      <input 
        onChange={(e) => setConfirmPassword(e.target.value)} 
        value={confirmPassword} 
        type="password" 
        className='w-full px-3 py-2 border border-gray-800' 
        placeholder='Confirm New Password' 
        required
        minLength={6}
      />
      <button className='bg-black text-white font-light px-8 py-2 mt-4'>Reset Password</button>
      <p onClick={() => navigate('/login')} className='cursor-pointer text-sm mt-2'>
        Back to Login
      </p>
    </form>
  );
};

export default ResetPassword;
