
interface HeaderLogoProps {
  onClick: () => void;
  size?: 'normal' | 'small';
}

const HeaderLogo = ({ onClick, size = 'normal' }: HeaderLogoProps) => {
  const logoHeight = size === 'small' ? 'h-[38px]' : 'h-[38px]';
  
  const handleLogoClick = () => {
    // Clear all horizontal scroll positions from session storage
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('horizontal-scroll-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    // Call the original onClick handler
    onClick();
  };
  
  return (
    <button onClick={handleLogoClick} className="flex items-center cursor-pointer flex-shrink-0">
      <img 
        src="/lovable-uploads/wohin-logo-svg.svg" 
        alt="WOHIN Logo" 
        className={`${logoHeight} w-auto`}
      />
    </button>
  );
};

export { HeaderLogo };
