import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Separator } from '@/components/UI/separator';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  
  const { login, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Handle sign up (create user then login)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, surname, email, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Sign up failed');
        }

        toast({
          title: 'Account created successfully',
          description: 'You can now sign in with your credentials',
          className: 'bg-success text-success-foreground',
        });

        // Switch to login mode
        setIsSignUp(false);
        setName('');
        setSurname('');
      } catch (error: any) {
        toast({
          title: 'Sign up failed',
          description: error.message || 'Failed to create account',
          variant: 'destructive',
        });
      }
    } else {
      // Handle login
      const result = await login(email, password);
      
      if (!result.success) {
        toast({
          title: 'Login failed',
          description: result.error || 'Invalid credentials',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-background">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <img src="public/favicon.ico" width="max" height="max"/>
          </div>
          <h1 className="text-3xl font-bold text-gradient">
            AI Event Finder
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover events through intelligent conversations
          </p>
        </div>

        {/* Login/Signup Form */}
        <Card className="glass-card border-card-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Fill in your details to create a new account'
                : 'Enter your credentials to access your account'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sign up fields */}
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">First Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surname">Last Name</Label>
                      <Input
                        id="surname"
                        type="text"
                        placeholder="Doe"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gradient-primary hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>

            <Separator />

            {/* Toggle between login/signup */}
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setName('');
                  setSurname('');
                }}
                disabled={loading}
                className="text-muted-foreground hover:text-foreground"
              >
                {isSignUp ? (
                  <>Already have an account? <span className="ml-1 text-primary">Sign In</span></>
                ) : (
                  <>Don't have an account? <span className="ml-1 text-primary">Sign Up</span></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{' '}
            <Link to="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}