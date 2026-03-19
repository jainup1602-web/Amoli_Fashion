import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Forgot Password - E-Commerce Store',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-8">
        <Link href="/login" className="flex items-center text-sm text-gray-600 hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Forgot Password?</h1>
          <p className="text-gray-600 mt-2">
            Enter your email to receive password reset instructions
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <Input type="email" placeholder="Enter your email" />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Send Reset Link
          </Button>
        </form>
      </Card>
    </div>
  );
}
