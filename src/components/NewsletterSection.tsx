
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TEXT } from '@/constants/text';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter signup with backend
    console.log('Newsletter signup:', email);
    setIsSubscribed(true);
    setEmail('');
  };

  return (
    <section className="py-16 bg-background-warm relative overflow-hidden">
      {/* Diagonal text stripes inspired by design */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 -left-32 rotate-[-15deg] w-[150%] h-20 bg-black/5 flex items-center">
            <div className="flex whitespace-nowrap animate-[slide-in-right_12s_ease-in-out_infinite_alternate]">
              <span className="text-4xl font-headline text-black/10 mr-16">WOHIN.</span>
              <span className="text-4xl font-headline text-black/10 mr-16">NEWSLETTER</span>
              <span className="text-4xl font-headline text-black/10 mr-16">WOHIN.</span>
              <span className="text-4xl font-headline text-black/10 mr-16">NEWSLETTER</span>
              <span className="text-4xl font-headline text-black/10 mr-16">WOHIN.</span>
              <span className="text-4xl font-headline text-black/10 mr-16">NEWSLETTER</span>
            </div>
          </div>
          <div className="absolute bottom-1/4 -right-32 rotate-[15deg] w-[150%] h-20 bg-black/5 flex items-center">
            <div className="flex whitespace-nowrap animate-[slide-out-right_14s_ease-in-out_infinite_alternate]">
              <span className="text-4xl font-headline text-black/10 mr-16">UPDATE</span>
              <span className="text-4xl font-headline text-black/10 mr-16">EVENTS</span>
              <span className="text-4xl font-headline text-black/10 mr-16">UPDATE</span>
              <span className="text-4xl font-headline text-black/10 mr-16">EVENTS</span>
              <span className="text-4xl font-headline text-black/10 mr-16">UPDATE</span>
              <span className="text-4xl font-headline text-black/10 mr-16">EVENTS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Enhanced headline with gradient background */}
          <div className="relative mb-6">
            <h2 className="text-[36px] md:text-4xl font-headline text-black mb-3 md:mb-4 animate-fade-in">
              {TEXT.NEWSLETTER.headline}
            </h2>
            
          </div>
          
          <p className="text-xl font-greta text-gray-700 mb-10 animate-fade-in">
            {TEXT.NEWSLETTER.subtitle}
          </p>
          
          {isSubscribed ? (
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-8 animate-scale-in shadow-lg">
              <p className="text-green-800 font-greta-bold text-lg">
                {TEXT.NEWSLETTER.successMessage}
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Enhanced form with gradient background */}
              <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 animate-scale-in">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder={TEXT.NEWSLETTER.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12 text-lg border-gray-200 focus:border-gray-300 focus:ring-0 transition-all duration-300"
                  />
                  <Button 
                    type="submit"
                    className="bg-volat-yellow hover:bg-volat-yellow-dark text-black font-greta-bold px-8 h-12 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {TEXT.NEWSLETTER.subscribeButton}
                  </Button>
                </form>
                
              </div>

              {/* Subtle pulse effect around the form */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-volat-yellow/10 to-volat-yellow-dark/10 animate-pulse opacity-50 -z-10"></div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
