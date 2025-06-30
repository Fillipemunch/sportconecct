import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { sportsAPI } from '../services/api';
import { Eye, EyeOff, Globe, Loader2 } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sports, setSports] = useState([]);
  const { login, register } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    location: '',
    sports: [],
    skill_level: '',
    bio: ''
  });

  React.useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    try {
      const sportsData = await sportsAPI.getAll();
      setSports(sportsData);
    } catch (error) {
      console.error('Error loading sports:', error);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(loginForm.email, loginForm.password);
      toast({
        title: t('common.success'),
        description: `${t('dashboard.welcome')}!`
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.detail || t('common.error'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(registerForm);
      toast({
        title: t('common.success'),
        description: 'Account created successfully!'
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.detail || t('common.error'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSport = (sportId) => {
    setRegisterForm(prev => ({
      ...prev,
      sports: prev.sports.includes(sportId)
        ? prev.sports.filter(id => id !== sportId)
        : [...prev.sports, sportId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => changeLanguage(language === 'en' ? 'da' : 'en')}
          className="text-white hover:bg-white/20 backdrop-blur-lg"
        >
          <Globe className="mr-2 h-4 w-4" />
          {language === 'en' ? '🇩🇰 Dansk' : '🇬🇧 English'}
        </Button>
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-lg bg-white/95 shadow-2xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-full">
              <div className="text-white text-3xl">🏃</div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            SportConnect
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {isLogin ? 'Welcome back!' : 'Join the sports community'}
          </p>
        </CardHeader>

        <CardContent>
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2.5 shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('common.loading')}</span>
                  </div>
                ) : (
                  t('auth.loginBtn')
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('auth.name')}</Label>
                  <Input
                    id="name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">{t('auth.age')}</Label>
                  <Input
                    id="age"
                    type="number"
                    min="13"
                    max="100"
                    value={registerForm.age}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, age: parseInt(e.target.value) || '' }))}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 pr-10"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{t('auth.location')}</Label>
                <Input
                  id="location"
                  value={registerForm.location}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Copenhagen, Denmark"
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('auth.sports')}</Label>
                <div className="flex flex-wrap gap-2">
                  {sports.map(sport => (
                    <Badge
                      key={sport.id}
                      variant={registerForm.sports.includes(sport.id) ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 ${
                        registerForm.sports.includes(sport.id)
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                          : 'hover:bg-orange-50 hover:border-orange-300'
                      }`}
                      onClick={() => toggleSport(sport.id)}
                    >
                      <span className="mr-1">{sport.icon}</span>
                      {language === 'da' ? sport.name_da : sport.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill_level">{t('auth.skillLevel')}</Label>
                <Select onValueChange={(value) => setRegisterForm(prev => ({ ...prev, skill_level: value }))}>
                  <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder={`Select ${t('auth.skillLevel').toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{t('skill.beginner')}</SelectItem>
                    <SelectItem value="intermediate">{t('skill.intermediate')}</SelectItem>
                    <SelectItem value="advanced">{t('skill.advanced')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t('auth.bio')}</Label>
                <Textarea
                  id="bio"
                  value={registerForm.bio}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself and your sports interests..."
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 resize-none"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2.5 shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('common.loading')}</span>
                  </div>
                ) : (
                  t('auth.registerBtn')
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-600 hover:text-orange-600 hover:bg-orange-50"
            >
              {isLogin ? t('auth.switchToRegister') : t('auth.switchToLogin')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;