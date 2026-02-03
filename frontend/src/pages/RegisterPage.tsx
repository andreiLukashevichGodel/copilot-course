import React from 'react';
import AuthLayout from '../components/AuthLayout';
import SignupForm from '../components/SignupForm';

const RegisterPage: React.FC = () => {
  return (
    <AuthLayout title="Create Account">
      <SignupForm />
    </AuthLayout>
  );
};

export default RegisterPage;
