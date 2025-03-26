// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthError } from '../types/UserType';
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { UserIcon } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  // Form data state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validation state
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<AuthError | null>(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);
  
  // Load saved username if available
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);
  
  // Validation functions
  const validateUsername = (value: string): string | null => {
    if (!value.trim()) {
      return 'กรุณาระบุชื่อผู้ใช้';
    } else if (value.length > 100) {
      return 'ชื่อผู้ใช้ต้องไม่เกิน 100 ตัวอักษร';
    }
    return null;
  };
  
  const validatePassword = (value: string): string | null => {
    if (!value) {
      return 'กรุณาระบุรหัสผ่าน';
    } else if (value.length < 8) {
      return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    }
    return null;
  };
  
  // Event handlers
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    
    if (isSubmitted) {
      setUsernameError(validateUsername(value));
    }
    
    // Clear server error when user starts typing
    if (serverError) {
      setServerError(null);
    }
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (isSubmitted) {
      setPasswordError(validatePassword(value));
    }
    
    // Clear server error when user starts typing
    if (serverError) {
      setServerError(null);
    }
  };
  
  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    
    setIsSubmitted(true);
    
    // Validate form
    const usernameValidationError = validateUsername(username);
    const passwordValidationError = validatePassword(password);
    
    setUsernameError(usernameValidationError);
    setPasswordError(passwordValidationError);
    
    if (usernameValidationError || passwordValidationError) {
      return;
    }
    
    // Clear previous errors
    setServerError(null);
    setIsLoading(true);
    
    try {
      // Store username in localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username.trim());
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      
      // Attempt login
      await login({
        username: username.trim(),
        password,
        email: '' // Not used for login but required by type
      });
      
      // Show success state briefly before redirecting
      setLoginSuccess(true);
      
      // Navigate to dashboard or the page the user was trying to access
      const from = location.state?.from?.pathname || '/dashboard';
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
      
    } catch (err) {
      console.error('Login error:', err);
      setServerError(err as AuthError);
      setLoginSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border shadow-xl overflow-hidden max-w-4xl w-full flex">
        {/* Left side - Illustration */}
        <div className="w-1/2 p-8 hidden md:block relative">
          <div className="relative z-10">
            <div className="mb-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <img src='/src/assets/logo.svg' alt='logo' className='w-16 h-16'/>
              </div>
              <h2 className="text-2xl font-bold text-header">JodMaiLhong</h2>
              <p className="text-gray-600 mt-2">ระบบระบุตำแหน่งจอดรถในอาคาร</p>
              <p className="text-gray-600">ด้วยการตรวจจับป้ายทะเบียน</p>
            </div>
            
            <div className="illustration">
              <img 
                src="/src/assets/findCar.svg" 
                alt="Security Illustration" 
                className="w-full h-auto"
              />
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-12 left-4 w-20 h-20 bg-blue-100 rounded-full opacity-50"></div>
            <div className="absolute bottom-12 right-4 w-16 h-16 bg-blue-100 rounded-full opacity-50"></div>
            <div className="absolute bottom-1/4 left-12 w-10 h-10 border-2 border-blue-200 rounded-full"></div>
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 bg-secondary p-8 flex justify-center items-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-bold text-header mb-8">เข้าสู่ระบบ</h2>
            
            {serverError && (
              <div className="bg-red-100 border border-red-400 text-error px-4 py-3 rounded-md mb-4 animate-fadeIn">
                {serverError.message}
              </div>
            )}
            
            {loginSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4 animate-fadeIn">
                เข้าสู่ระบบสำเร็จ กำลังนำท่านไปยังหน้าหลัก...
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <div className={`bg-white rounded-md overflow-hidden flex items-center ${
                  usernameError ? 'border border-red-500' : 'border border-transparent'
                }`}>
                  <span className="pl-3 text-gray-400">
                    <UserIcon className='w-5 h-5'/>
                  </span>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 py-2 px-2 outline-none text-gray-700"
                    placeholder="กรอกชื่อผู้ใช้"
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
                {usernameError && (
                  <p className="text-error text-sm mt-1 animate-fadeIn">{usernameError}</p>
                )}
              </div>
              
              <div>
                <div className={`bg-white rounded-md overflow-hidden flex items-center ${
                  passwordError ? 'border border-red-500' : 'border border-transparent'
                }`}>
                  <span className="pl-3 text-gray-400">
                    <LockClosedIcon className="h-5 w-5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 py-2 px-2 outline-none text-gray-700"
                    placeholder="กรอกรหัสผ่านขั้นต่ำ 8 ตัวอักษร"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="pr-3 text-gray-400 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-error text-sm mt-1 animate-fadeIn">{passwordError}</p>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 outline-none rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  จดจำชื่อผู้ใช้
                </label>
              </div>
            
              <div className="flex pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 border border-white text-white bg-primary hover:bg-primaryContrast rounded-md font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังเข้าสู่ระบบ...
                    </div>
                  ) : 'เข้าสู่ระบบ'}
                </button>
              </div>
              
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;