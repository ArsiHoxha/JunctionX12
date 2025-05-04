import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const UserOnboarding = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (isSignedIn && user) {
      // Check if user's email is in the admin list (hardcoded for this example)
      const ADMIN_EMAILS = [
        'admin@aadf.al',
        'testadmin@example.com',
        'junction@aadf.al',
        'arsihoxha07yt@gmail.com'
      ];
      
      const userEmail = user.primaryEmailAddress?.emailAddress || '';
      let role = 'supplier'; // Default role
      
      if (ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
        role = 'admin';
      }
      
      // Save role and onboarded status to localStorage
      localStorage.setItem(`user_role_${user.id}`, role);
      localStorage.setItem(`user_onboarded_${user.id}`, 'true');
      
      setStatus('success');
      
      // Redirect after short delay
      setTimeout(() => {
        const dashboardPath = role === 'admin' ? '/admin' : '/supplier';
        navigate(dashboardPath);
      }, 1000);
    }
  }, [isSignedIn, user, navigate]);

  // Display loading or success message
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          {status === 'loading' ? 'Setting up your account...' : 'Account setup complete!'}
        </h1>
        
        <div className="flex justify-center">
          {status === 'loading' ? (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          ) : (
            <div className="text-green-500 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="mt-4 text-lg">Redirecting you to dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOnboarding;