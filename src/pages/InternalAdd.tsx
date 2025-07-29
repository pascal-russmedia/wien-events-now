
import { useEffect } from 'react';
import InternalLayout from '@/components/auth/InternalLayout';
import InternalAddEventForm from '@/components/InternalAddEventForm';
import { TEXT } from '@/constants/text';
import { SEO } from '@/components/SEO';

const InternalAdd = () => {
  // Always scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFormSuccess = () => {
    // Success will be handled by the form itself
  };

  return (
    <>
      <SEO 
        title="Event hinzufügen | Wohin"
        description="Internes Tool zum Hinzufügen von Events"
        noIndex={true}
      />
      <InternalLayout title={TEXT.PAGES.internal.add.title}>
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-[28px] md:text-4xl font-headline text-black mb-3 md:mb-4">
                {TEXT.PAGES.internal.add.title}
              </h1>
              <p className="text-lg font-greta text-gray-600">
                {TEXT.PAGES.internal.add.subtitle}
              </p>
            </div>
            
            <InternalAddEventForm onSuccess={handleFormSuccess} />
          </div>
        </main>
      </div>
      </InternalLayout>
    </>
  );
};

export default InternalAdd;
