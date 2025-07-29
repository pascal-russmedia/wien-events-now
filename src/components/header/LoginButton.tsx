
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TEXT } from '@/constants/text';

const LoginButton = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{user.email}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSignOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{TEXT.PAGES.login.signOut}</span>
        </Button>
        {user.email === 'admin@example.com' && (
          <Link to="/internal/manage">
            <Button size="sm" variant="secondary">
              Admin
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <Link to="/login">
      <Button size="sm" className="flex items-center gap-2">
        <User className="h-4 w-4" />
        {TEXT.PAGES.login.signIn}
      </Button>
    </Link>
  );
};

export default LoginButton;
