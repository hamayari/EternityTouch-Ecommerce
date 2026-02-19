import { useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const ForgotPassword = () => {
  const { navigate, backendUrl } = useContext(ShopContext);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      // Obtenir le token reCAPTCHA
      let recaptchaToken = null;
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha('forgot_password');
      }

      const response = await axios.post(`${backendUrl}/api/user/request-password-reset`, { 
        email,
        recaptchaToken
      });
      
      if (response.data.success) {
        setEmailSent(true);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  if (emailSent) {
    return (
      <div className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10'>
          <p className='prata-regular text-3xl'>Email Sent</p>
          <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
        </div>
        <p className='text-center text-sm text-gray-600 mb-4'>
          We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
        </p>
        <button 
          onClick={() => navigate('/login')} 
          className='bg-black text-white font-light px-8 py-2 mt-4'
        >
          Back to Login
        </button>
        <p 
          onClick={() => setEmailSent(false)} 
          className='cursor-pointer text-sm mt-2'
        >
          Try another email
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>Forgot Password</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
      </div>
      <p className='text-center text-sm text-gray-600 mb-4'>
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <input 
        onChange={(e) => setEmail(e.target.value)} 
        value={email} 
        type="email" 
        className='w-full px-3 py-2 border border-gray-800' 
        placeholder='Email' 
        required
      />
      <button className='bg-black text-white font-light px-8 py-2 mt-4'>Send Reset Link</button>
      <p onClick={() => navigate('/login')} className='cursor-pointer text-sm mt-2'>
        Back to Login
      </p>
    </form>
  );
};

export default ForgotPassword;
