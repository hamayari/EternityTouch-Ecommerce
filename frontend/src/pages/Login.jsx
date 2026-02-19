import React, { useState } from 'react'
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const Login = () => {
  const [currentState, setCurrentState]= useState('Sign Up');
  const {token, setToken, navigate, backendUrl} = useContext(ShopContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // ✅ FIX: Loading state
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Validation en temps réel
  const validateForm = () => {
    const newErrors = {};
    
    if (currentState === 'Sign Up' && !name.trim()) {
      newErrors.name = 'Name is required';
    } else if (currentState === 'Sign Up' && name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    // Valider avant soumission
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    // ✅ FIX: Empêcher double soumission
    if (loading) return;
    
    setLoading(true); // ✅ FIX: Activer loading
    
    try{
      // Obtenir le token reCAPTCHA
      let recaptchaToken = null;
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha(currentState === 'Sign Up' ? 'register' : 'login');
      }

      if(currentState === 'Sign Up'){
        const response = await axios.post(backendUrl + '/api/user/register', {
          name, 
          email, 
          password,
          recaptchaToken
        })
        if(response.data.success){
          if (response.data.requiresVerification) {
            toast.success(response.data.message);
            // Clear form
            setName('');
            setEmail('');
            setPassword('');
            // Switch to login view
            setCurrentState('Login');
          } else {
            setToken(response.data.token)
            localStorage.setItem('token', response.data.token)
            toast.success(response.data.message || 'Registration successful!');
          }
        }
        else{
          toast.error(response.data.message)
        }
      }
      else{
        const response = await axios.post(backendUrl + '/api/user/login', {
          email, 
          password,
          recaptchaToken
        })
        if(response.data.success){
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
        }
        else{
          toast.error(response.data.message)
        }
      }
    }
    catch (error){
      console.error('[Login Error]:', error);
      // ✅ FIX: Message d'erreur user-friendly
      if (error.response) {
        toast.error(error.response.data.message || 'Something went wrong. Please try again.');
      } else if (error.request) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
    finally {
      setLoading(false); // ✅ FIX: Désactiver loading
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const endpoint = currentState === 'Sign Up' ? '/api/user/google-register' : '/api/user/google-login';
      const response = await axios.post(backendUrl + endpoint, {
        credential: credentialResponse.credential
      });

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        toast.success(`${currentState} successful with Google`);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('[Google Auth Error]:', error);
      toast.error(error.response?.data?.message || 'Google authentication failed');
    }
  }

  const handleGoogleError = () => {
    toast.error('Google authentication failed');
  }
  useEffect(()=>{
    if(token){
      navigate('/')
    }
  })
  return (
    <div>
      <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10'>
          <p className='prata-regular text-3xl'>{currentState}</p>
          <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
        </div>
        {currentState === 'Login' ? '' : <input onChange={(e)=>setName(e.target.value)} value={name} type="text" className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-800'}`} placeholder='Name' required/>}
        {errors.name && <p className='text-red-500 text-sm w-full text-left -mt-3'>{errors.name}</p>}
        
        <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-800'}`} placeholder='Email' required/>
        {errors.email && <p className='text-red-500 text-sm w-full text-left -mt-3'>{errors.email}</p>}
        
        <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-800'}`} placeholder='Password'required/>
        {errors.password && <p className='text-red-500 text-sm w-full text-left -mt-3'>{errors.password}</p>}
        <div className='w-full flex justify-between text-sm mt-[-8px]'>
          <p onClick={() => navigate('/forgot-password')} className='cursor-pointer'>Forgot your password?</p>
          {
            currentState === 'Login'
            ? <p onClick={()=> setCurrentState('Sign Up')} className='cursor-pointer'>Create account</p>
            : <p onClick={()=> setCurrentState('Login')} className='cursor-pointer'>Login Here</p>
          }
        </div>
        <button 
          disabled={loading}
          className={`bg-black text-white font-light px-8 py-2 mt-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className='flex items-center gap-2'>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            currentState === 'Login' ? 'Sign In' : 'Sign Up'
          )}
        </button>
        
        <div className='w-full flex items-center gap-2 my-4'>
          <hr className='flex-1 border-gray-300'/>
          <span className='text-gray-500 text-sm'>OR</span>
          <hr className='flex-1 border-gray-300'/>
        </div>

        <div className='w-full flex justify-center'>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text={currentState === 'Login' ? 'signin_with' : 'signup_with'}
            shape="rectangular"
            width="320"
          />
        </div>
      </form>
    </div>
  )
}

export default Login;
