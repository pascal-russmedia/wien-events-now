
import { HeaderLogo } from './HeaderLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TEXT } from '@/constants/text';

export const AddPageHeader = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-[7px]">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <HeaderLogo onClick={handleLogoClick} />
          <Button 
            variant="outline"
            onClick={handleBackClick}
            className="flex items-center gap-2 border border-white bg-transparent text-white hover:bg-white hover:text-black font-greta-bold px-4 py-2 text-base h-8 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            {TEXT.BUTTONS.backToEvents}
          </Button>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between gap-2">
            <HeaderLogo onClick={handleLogoClick} size="small" />
            <Button 
              variant="outline"
              onClick={handleBackClick}
              className="flex items-center gap-1 border border-white bg-transparent text-white hover:bg-white hover:text-black font-greta-bold px-3 py-1.5 text-sm h-8 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
