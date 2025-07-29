
import { useEffect } from 'react';
import { AddPageHeader } from '@/components/header/AddPageHeader';
import AddEventForm from '@/components/AddEventForm';
import { TEXT } from '@/constants/text';
import { SEO } from '@/components/SEO';

const Add = () => {
  // Always scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Event hinzufügen | Wohin"
        description="Präsentiere deine Veranstaltung Tausenden Vorarlbergern – kostenlos & in wenigen Klicks Events hinzufügen."
      />
      <AddPageHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-[28px] md:text-4xl font-headline text-black mb-3 md:mb-4">
              {TEXT.PAGES.add.title}
            </h1>
            <p className="text-lg font-greta text-gray-600">
              {TEXT.PAGES.add.fillFormSubtitle}
            </p>
          </div>
          
          <AddEventForm onSuccess={() => {}} />
        </div>
      </main>
    </div>
  );
};

export default Add;
