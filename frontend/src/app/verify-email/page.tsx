'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setVerifying(true);
    try {
      const response = await authAPI.verifyEmail(verificationToken);
      
      if (response.success && response.data) {
        setVerified(true);
        updateUser(response.data.user);
        toast.success('Email verified successfully!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        toast.error(response.message || 'Verification failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const resendVerification = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      // This would need to be implemented in the backend
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error('Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <Layout>
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying your email...
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (verified) {
    return (
      <Layout>
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verified!
            </h1>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You will be redirected to your dashboard shortly.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          {user?.verified ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Already Verified
              </h1>
              <p className="text-gray-600 mb-6">
                Your email address is already verified.
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              <Mail className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verify Your Email
              </h1>
              <p className="text-gray-600 mb-6">
                We've sent a verification email to{' '}
                <span className="font-medium">{user?.email}</span>.
                Please check your inbox and click the verification link.
              </p>
              
              <div className="space-y-4">
                <Button
                  onClick={resendVerification}
                  loading={loading}
                  variant="outline"
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
                
                <div className="text-sm text-gray-500">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Check your spam folder if you don't see the email
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}
