
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TEXT } from '@/constants/text';

interface AddEventButtonProps {
  size?: 'normal' | 'small';
}

const AddEventButton = ({ size = 'normal' }: AddEventButtonProps) => {
  const buttonClasses = size === 'small' 
    ? "flex items-center gap-1 border border-white bg-transparent text-white hover:bg-white hover:text-black font-greta-bold px-3 py-1.5 text-sm h-8 transition-all duration-200"
    : "flex items-center gap-2 border border-white bg-transparent text-white hover:bg-white hover:text-black font-greta-bold px-4 py-2 text-base h-8 transition-all duration-200";
  
  const iconSize = size === 'small' ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={size === 'small' ? "flex-shrink-0" : ""}>
      <Link to="/add">
        <Button 
          variant="outline"
          className={buttonClasses}
        >
          <Plus className={iconSize} />
          {TEXT.NAVIGATION.addEvent}
        </Button>
      </Link>
    </div>
  );
};

export { AddEventButton };
