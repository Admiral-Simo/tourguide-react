import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuth } from '../components/AuthContext';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Divider,
} from "@nextui-org/react";
import { Mail, Lock, Eye, EyeOff, User, Compass, AlertCircle, LogIn } from 'lucide-react'; 


const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const toggleVisibility = () => setIsVisible(!isVisible);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call the signup API endpoint
      await apiService.signup({ email, password, name }); // Pass name in signup request
      
      // After successful signup, automatically log the user in
      await login(email, password); // Use email and password again 4 login after signup
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/80">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="flex-col gap-2 items-center justify-center pt-8 pb-0">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
              <Compass size={24} className="text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">Create Account</h2>
              <p className="text-sm text-default-500">Sign up to join Tour Guide</p>
            </div>
          </CardHeader>

          <CardBody className="px-8 py-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="name"
                type="text"
                label="Your Name"
                labelPlacement="outside"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isRequired
                startContent={<User size={16} className="text-default-400" />}
                variant="bordered"
                classNames={{
                  input: "text-small",
                  inputWrapper: "h-12",
                }}
                disabled={isLoading}
              />
              <Input
                id="email"
                type="email"
                label="Email"
                labelPlacement="outside"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
                startContent={<Mail size={16} className="text-default-400" />}
                variant="bordered"
                classNames={{
                  input: "text-small",
                  inputWrapper: "h-12",
                }}
                disabled={isLoading}
              />

              <Input
                id="password"
                label="Password"
                labelPlacement="outside"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
                startContent={<Lock size={16} className="text-default-400" />}
                endContent={
                  <button type="button" onClick={toggleVisibility} className="focus:outline-none">
                    {isVisible ? (
                      <EyeOff size={16} className="text-default-400" />
                    ) : (
                      <Eye size={16} className="text-default-400" />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
                variant="bordered"
                classNames={{
                  input: "text-small",
                  inputWrapper: "h-12",
                }}
                disabled={isLoading}
              />

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-50 text-danger text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full font-medium"
                startContent={<LogIn size={18} />}
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing up...' : 'Sign up'}
              </Button>
            </form>
          </CardBody>

          <Divider />

          <CardFooter className="flex-col items-center gap-2 px-8 py-5">
            <p className="text-sm text-default-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};


export default SignupPage;
