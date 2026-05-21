// src/pages/Landing.jsx
import { useState } from 'react';
import { Music, Sparkles, Loader2, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';

export default function Landing() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMessage, setRegMessage] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(email.trim(), password);
      window.location.href = '/';
    } catch (err) {
      setLoginError('Invalid email or password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegMessage('');

    if (!regFirstName.trim() || !regLastName.trim()) {
      setRegError('Please enter your first and last name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@') || !regEmail.includes('.')) {
      setRegError('Please enter a valid email address.');
      return;
    }

    try {
      setRegLoading(true);
      await api.post('/auth/register', {
        first_name: regFirstName.trim(),
        last_name: regLastName.trim(),
        email: regEmail.trim(),
      });
      setRegMessage(
        `✅ An account has been created or an invitation has been sent to ${regEmail}. Check your inbox to set your password and log in.`
      );
      setRegFirstName('');
      setRegLastName('');
      setRegEmail('');
    } catch (err) {
      setRegError('Could not create account. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary/20 via-background to-accent/10 border-r border-border p-12">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/8 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
            <Music className="w-6 h-6 text-primary" />
          </div>
          <span className="font-heading font-bold text-2xl text-foreground tracking-tight">QuizVinyl</span>
        </div>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI-Powered UK Music Quiz Generator
          </div>
          <h1 className="font-heading font-bold text-5xl text-foreground leading-tight">
            The ultimate
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              pub quiz tool
            </span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
            Generate hundreds of unique UK chart music questions, track what you've used, and never repeat a question
            again.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-4">
          {[
            { label: 'Question Types', value: '8+' },
            { label: 'Decades Covered', value: '7' },
            { label: 'Repeat-Free', value: '100%' },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-card/50 border border-border text-center">
              <p className="font-heading font-bold text-2xl text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <span className="font-heading font-bold text-xl text-foreground">QuizVinyl</span>
        </div>

        <div className="w-full max-w-md">
          {mode === 'login' ? (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading font-bold text-3xl text-foreground">Welcome back</h2>
                <p className="text-muted-foreground mt-1">Sign in to your QuizVinyl account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary border-border"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary border-border"
                    required
                  />
                </div>

                {loginError && <p className="text-sm text-destructive">{loginError}</p>}

                <Button type="submit" size="lg" className="w-full gap-2 font-heading text-base" disabled={loginLoading}>
                  {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                  {loginLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button onClick={() => setMode('register')} className="text-primary hover:underline font-medium">
                  Create one
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setMode('login');
                    setRegError('');
                    setRegMessage('');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="font-heading font-bold text-3xl text-foreground">Create account</h2>
                  <p className="text-muted-foreground mt-1">Join QuizVinyl — it's free</p>
                </div>
              </div>

              {regMessage ? (
                <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400 leading-relaxed">
                  {regMessage}
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMode('login');
                        setRegMessage('');
                      }}
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">First Name</Label>
                      <Input
                        placeholder="John"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        className="bg-secondary border-border"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Last Name</Label>
                      <Input
                        placeholder="Smith"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        className="bg-secondary border-border"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Email Address</Label>
                    <Input
                      type="email"
                      placeholder="john.smith@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="bg-secondary border-border"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be a real email — you'll receive a login invitation or password setup link.
                    </p>
                  </div>

                  {regError && <p className="text-sm text-destructive">{regError}</p>}

                  <Button type="submit" size="lg" className="w-full gap-2 font-heading" disabled={regLoading}>
                    {regLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {regLoading ? 'Creating account...' : 'Create Account'}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="mt-12 text-xs text-muted-foreground text-center">QuizVinyl — UK Music Pub Quiz Generator</p>
      </div>
    </div>
  );
}