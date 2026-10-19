import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { User, Lock, Mail, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register({ name, email, password, confirmPassword });
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pastel-peach via-pastel-rose to-pastel-lavender p-0.5 shadow-sm inline-flex items-center justify-center mb-4">
            <div className="w-full h-full bg-white/90 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pastel-plum" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-pastel-plum tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-xs text-pastel-muted">
            Start generating source-backed autonomous research reports
          </p>
        </div>

        <Card className="shadow-soft border border-pastel-border p-8">
          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-pastel-plum mb-1.5">
                Full name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Jordan Hayes"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 border border-pastel-border text-xs text-pastel-plum placeholder-pastel-muted/60 focus:outline-none focus:ring-2 focus:ring-pastel-rose/50 focus:bg-white transition-all"
                />
                <User className="w-4 h-4 text-pastel-muted absolute left-3.5 top-3" />
              </div>
            </div>

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
                  placeholder="At least 8 characters"
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

            <div>
              <label className="block text-xs font-semibold text-pastel-plum mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 border border-pastel-border text-xs text-pastel-plum placeholder-pastel-muted/60 focus:outline-none focus:ring-2 focus:ring-pastel-rose/50 focus:bg-white transition-all"
                />
                <Lock className="w-4 h-4 text-pastel-muted absolute left-3.5 top-3" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-pastel-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-purple-700 hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
