import React, { useState } from 'react'
import axios from 'axios';
import { backendUrl } from '../App'
import { toast } from 'react-toastify';

const Login = ({setToken}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            setLoading(true);

            const response = await axios.post(backendUrl + '/api/user/admin', {
                email, 
                password,
                twoFactorCode: requiresTwoFactor ? twoFactorCode : undefined
            });

            if (response.data.success) {
                if (response.data.requiresTwoFactor) {
                    // Étape 1 : Code 2FA envoyé
                    setRequiresTwoFactor(true);
                    toast.success(response.data.message || 'Code sent to your email');
                } else {
                    // Étape 2 : Connexion réussie
                    setToken(response.data.token);
                    toast.success('Login successful');
                }
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('[Admin Login Error]:', error);
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleResendCode = async () => {
        try {
            setLoading(true);
            const response = await axios.post(backendUrl + '/api/user/admin', {
                email, 
                password
            });

            if (response.data.success && response.data.requiresTwoFactor) {
                toast.success('New code sent to your email');
            }
        } catch (error) {
            toast.error('Failed to resend code');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center w-full bg-gradient-to-br from-blue-50 to-indigo-100'>
            <div className='bg-white shadow-2xl rounded-2xl px-8 py-6 max-w-md w-full'>
                <div className='text-center mb-6'>
                    <h1 className='text-3xl font-bold text-gray-800 mb-2'>Admin Panel</h1>
                    {requiresTwoFactor && (
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4'>
                            <p className='text-sm text-blue-800'>
                                🔐 A 6-digit code has been sent to your email
                            </p>
                        </div>
                    )}
                </div>

                <form onSubmit={onSubmitHandler}>
                    {!requiresTwoFactor ? (
                        <>
                            {/* Étape 1 : Email & Password */}
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Email Address
                                </label>
                                <input 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    value={email} 
                                    className='rounded-lg w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition' 
                                    type="email" 
                                    placeholder='admin@eternitytouch.com' 
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className='mb-6'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Password
                                </label>
                                <input 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    value={password} 
                                    className='rounded-lg w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition' 
                                    type="password" 
                                    placeholder='Enter your password' 
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Étape 2 : Code 2FA */}
                            <div className='mb-6'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Verification Code
                                </label>
                                <input 
                                    onChange={(e) => setTwoFactorCode(e.target.value)} 
                                    value={twoFactorCode} 
                                    className='rounded-lg w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-center text-2xl font-bold tracking-widest' 
                                    type="text" 
                                    placeholder='000000' 
                                    maxLength={6}
                                    pattern='[0-9]{6}'
                                    required
                                    disabled={loading}
                                    autoFocus
                                />
                                <p className='text-xs text-gray-500 mt-2 text-center'>
                                    Enter the 6-digit code sent to {email}
                                </p>
                            </div>

                            <button 
                                type='button'
                                onClick={handleResendCode}
                                className='w-full text-sm text-blue-600 hover:text-blue-800 mb-4 transition'
                                disabled={loading}
                            >
                                Didn't receive the code? Resend
                            </button>
                        </>
                    )}

                    <button 
                        className='w-full py-3 px-4 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed' 
                        type='submit'
                        disabled={loading}
                    >
                        {loading ? (
                            <span className='flex items-center justify-center'>
                                <svg className='animate-spin h-5 w-5 mr-2' viewBox='0 0 24 24'>
                                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none'></circle>
                                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                </svg>
                                Processing...
                            </span>
                        ) : requiresTwoFactor ? 'Verify Code' : 'Login'}
                    </button>

                    {requiresTwoFactor && (
                        <button 
                            type='button'
                            onClick={() => {
                                setRequiresTwoFactor(false);
                                setTwoFactorCode('');
                            }}
                            className='w-full mt-3 text-sm text-gray-600 hover:text-gray-800 transition'
                        >
                            ← Back to login
                        </button>
                    )}
                </form>

                <div className='mt-6 text-center'>
                    <p className='text-xs text-gray-500'>
                        🔒 Secured with Two-Factor Authentication
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
