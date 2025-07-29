
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { TEXT } from '@/constants/text';

const HeroSection = () => {
  const navigate = useNavigate();
  
  const regionButtons = [
    'Bregenz',
    'Dornbirn', 
    'Feldkirch',
    'Bludenz',
    'Deutschland',
    'Schweiz'
  ];

  const handleRegionClick = (region: string) => {
    navigate(`/search?region=${encodeURIComponent(region)}`);
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/d828bc1b-b4b4-44eb-81a3-1404c007e5c1.png')`
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-headline text-white leading-tight mb-12 drop-shadow-lg">
            {TEXT.HERO.discoverBest}{' '}
            <span className="text-volat-yellow">{TEXT.HERO.events}</span>{' '}
            {TEXT.HERO.inYourRegion}
          </h1>
          
          {/* Region Buttons Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg mx-auto px-2 relative z-20">
            {regionButtons.map((region) => (
              <Button
                key={region}
                variant="outline"
                onClick={() => handleRegionClick(region)}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/40 hover:text-white py-4 px-4 text-sm rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] w-full relative z-30 hover:scale-105"
              >
                {region}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
