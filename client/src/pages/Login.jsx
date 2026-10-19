import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Lock, Mail, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pastel-peach via-pastel-rose to-pastel-lavender p-0.5 shadow-sm inline-flex items-center justify-center mb-4">
            <div className="w-full h-full bg-white/90 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pastel-plum" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-pastel-plum tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-xs text-pastel-muted">
            Sign in to access your autonomous research dashboard
          </p>
        </div>

        <Card className="shadow-soft border border-pastel-border p-8">
          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-pastel-plum mb-1.5">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 border border-pastel-border text-xs text-pastel-plum placeholder-pastel-muted/60 focus:outline-none focus:ring-2 focus:ring-pastel-rose/50 focus:bg-white transition-all"
                />
                <Mail className="w-4 h-4 text-pastel-muted absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-pastel-plum mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/80 border border-pastel-border text-xs text-pastel-plum placeholder-pastel-muted/60 focus:outline-none focus:ring-2 focus:ring-pastel-rose/50 focus:bg-white transition-all"
                />
                <Lock className="w-4 h-4 text-pastel-muted absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-pastel-muted hover:text-pastel-plum transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-pastel-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-purple-700 hover:underline">
              Create account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
