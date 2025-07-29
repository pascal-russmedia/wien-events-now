import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Plus, Settings, Download, Menu, Mail, BookOpen } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { TEXT } from '@/constants/text';

interface InternalLayoutProps {
  children: React.ReactNode;
  title: string;
}

const InternalLayout: React.FC<InternalLayoutProps> = ({ children, title }) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/internal/manage', label: TEXT.HARDCODED_ENGLISH.manage, icon: Settings },
    { path: '/internal/export', label: TEXT.HARDCODED_ENGLISH.exportNav, icon: Download },
    { path: '/internal/newsletter', label: TEXT.HARDCODED_ENGLISH.newsletter, icon: Mail },
    { path: '/internal/add', label: TEXT.HARDCODED_ENGLISH.add, icon: Plus },
    { path: '/internal/documentation', label: 'Dokumentation', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Logo */}
              <button onClick={handleLogoClick} className="flex items-center cursor-pointer flex-shrink-0">
                <img 
                  src="/lovable-uploads/36061d13-ff15-409c-b04b-f49a30e3a770.png" 
                  alt="WOHIN Logo" 
                  className="h-12 w-auto"
                />
              </button>
              
              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                {navigationItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button 
                      variant={isActive(item.path) ? "default" : "outline"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Sign out */}
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{TEXT.PAGES.login.signOut}</span>
              </Button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <button onClick={handleLogoClick} className="flex items-center cursor-pointer">
                <img 
                  src="/lovable-uploads/36061d13-ff15-409c-b04b-f49a30e3a770.png" 
                  alt="WOHIN Logo" 
                  className="h-10 w-auto"
                />
              </button>
              
              {/* Mobile menu button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-2"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <div className="mt-4 pb-4 border-t border-gray-200">
                <div className="pt-4 space-y-2">
                  {navigationItems.map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button 
                        variant={isActive(item.path) ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start gap-2"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                  
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSignOut}
                      className="w-full justify-start gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      {TEXT.PAGES.login.signOut}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default InternalLayout;
