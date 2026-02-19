import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/verify-email/${token}`);
                
                if (response.data.success) {
                    setSuccess(true);
                    toast.success(response.data.message);
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                } else {
                    setSuccess(false);
                    toast.error(response.data.message);
                }
            } catch (error) {
                setSuccess(false);
                toast.error('Verification failed. Please try again.');
            } finally {
                setVerifying(false);
            }
        };

        if (token) {
            verifyEmail();
        }
    }, [token, navigate]);

    return (
        <div className='min-h-[60vh] flex items-center justify-center'>
            <div className='bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center'>
                {verifying ? (
                    <>
                        <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4'></div>
                        <h2 className='text-2xl font-semibold mb-2'>Verifying your email...</h2>
                        <p className='text-gray-600'>Please wait while we verify your account.</p>
                    </>
                ) : success ? (
                    <>
                        <div className='text-green-500 text-6xl mb-4'>✓</div>
                        <h2 className='text-2xl font-semibold mb-2 text-green-600'>Email Verified!</h2>
                        <p className='text-gray-600 mb-4'>Your account has been successfully verified.</p>
                        <p className='text-sm text-gray-500'>Redirecting to login page...</p>
                    </>
                ) : (
                    <>
                        <div className='text-red-500 text-6xl mb-4'>✗</div>
                        <h2 className='text-2xl font-semibold mb-2 text-red-600'>Verification Failed</h2>
                        <p className='text-gray-600 mb-4'>The verification link is invalid or has expired.</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className='bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors'
                        >
                            Go to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
