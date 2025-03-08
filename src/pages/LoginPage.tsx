import { useState } from 'react';
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
  Divider
} from "@nextui-org/react";
import { Mail, Lock, Eye, EyeOff, LogIn, Compass, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const response = await apiService.login({ email, password });
      login(response);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
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
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-sm text-default-500">Sign in to continue to Tour Guide</p>
            </div>
          </CardHeader>
          
          <CardBody className="px-8 py-5">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardBody>
          
          <Divider />
          
          <CardFooter className="flex-col items-center gap-2 px-8 py-5">
            <p className="text-sm text-default-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;