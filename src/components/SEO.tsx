import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  noIndex?: boolean;
  ogImage?: string;
  ogUrl?: string;
  eventData?: {
    name: string;
    startDate: string;
    endDate?: string;
    location?: string;
    description: string;
    image?: string;
    price?: string;
    organizer?: string;
  };
}

export const SEO = ({ 
  title, 
  description, 
  noIndex = false, 
  ogImage = "/lovable-uploads/b7cdb4bd-dc7a-4f81-b54e-eeb1ca326f98.png",
  ogUrl = window.location.href,
  eventData 
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('author', 'Wohin.events');
    updateMetaTag('theme-color', '#2563eb');
    updateMetaTag('format-detection', 'telephone=no');
    
    // Robots meta tag
    if (noIndex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', eventData ? 'article' : 'website', true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', 'Wohin - Entdecke die besten Events in deiner Region', true);
    updateMetaTag('og:url', ogUrl, true);
    updateMetaTag('og:locale', 'de_AT', true);
    updateMetaTag('og:site_name', 'Wohin', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
    updateMetaTag('twitter:site', '@wohin_events');
    
    // Structured Data (JSON-LD)
    const updateStructuredData = () => {
      // Remove existing structured data
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const structuredData: any = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://wohin.events/#organization",
            "name": "Wohin",
            "url": "https://wohin.events",
            "logo": {
              "@type": "ImageObject",
              "url": ogImage
            },
            "description": "Die Event-Plattform für Vorarlberg - Entdecke die besten Events in deiner Region",
            "areaServed": {
              "@type": "State",
              "name": "Vorarlberg"
            }
          },
          {
            "@type": "WebSite",
            "@id": "https://wohin.events/#website",
            "url": "https://wohin.events",
            "name": "Wohin",
            "description": description,
            "publisher": {
              "@id": "https://wohin.events/#organization"
            },
            "inLanguage": "de-AT"
          }
        ]
      };
      
      if (eventData) {
        structuredData["@graph"].push({
          "@type": "Event",
          "name": eventData.name,
          "startDate": eventData.startDate,
          "endDate": eventData.endDate || eventData.startDate,
          "description": eventData.description,
          "image": eventData.image || ogImage,
          "location": eventData.location ? {
            "@type": "Place",
            "name": eventData.location
          } : undefined,
          "organizer": eventData.organizer ? {
            "@type": "Organization",
            "name": eventData.organizer
          } : {
            "@id": "https://wohin.events/#organization"
          },
          "offers": eventData.price ? {
            "@type": "Offer",
            "price": eventData.price,
            "priceCurrency": "EUR"
          } : undefined
        });
      }
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    };
    
    updateStructuredData();
    
    // Language
    document.documentElement.setAttribute('lang', 'de');
    
    // Canonical URL (only for indexed pages)
    if (!noIndex) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', ogUrl);
    }
    
  }, [title, description, noIndex, ogImage, ogUrl, eventData]);

  return null;
};