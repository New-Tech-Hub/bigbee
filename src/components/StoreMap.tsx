import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmpx-api-loader': any;
      'gmpx-store-locator': any;
    }
  }
}

const StoreMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Fetch Google Maps API key securely from Edge Function
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('maps-proxy');
        
        if (error) {
          console.error('Failed to load Maps API key:', error);
          toast.error('Failed to load map. Please refresh the page.');
          return;
        }
        
        if (data && data.apiKey) {
          setApiKey(data.apiKey);
        } else {
          console.error('No API key returned');
          toast.error('Failed to load map. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching Maps API key:', error);
        toast.error('Failed to load map. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApiKey();
  }, []);

  useEffect(() => {
    if (!apiKey || isInitialized) return;
    
    // Load Google Maps Extended Component Library
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js';
    document.head.appendChild(script);

    const initializeMap = async () => {
      const CONFIGURATION = {
        "locations": [{
          "title": "Ebeth Boutique & Exclusive Store",
          "address1": "40 Ajose St",
          "address2": "Mabuse, Abuja 900108, Federal Capital Territory, Nigeria",
          "coords": { "lat": 9.069538862290694, "lng": 7.443070893254107 },
          "placeId": "Ek5cZWSGVzLCBBam9zZSBBZiS0LCBBam9zZSBBZmlybyBvL0VCLCWGCZWdPHOE5TCMLZF4NSUYE4JE5GVYF8"
        }],
        "mapOptions": {
          "center": { "lat": 9.069538862, "lng": 7.443070893254107 },
          "fullscreenControl": true,
          "mapTypeControl": false,
          "streetViewControl": false,
          "zoomControl": true,
          "zoom": 15,
          "maxZoom": 17
        },
        "mapsApiKey": apiKey,
        "capabilities": {
          "input": true,
          "autocomplete": true,
          "directions": false,
          "distanceMatrix": true,
          "details": false,
          "actions": false
        }
      };

      await customElements.whenDefined('gmpx-store-locator');
      const locator = document.querySelector('gmpx-store-locator');
      if (locator) {
        (locator as any).configureFromQuickBuilder(CONFIGURATION);
        setIsInitialized(true);
      }
    };

    script.onload = initializeMap;

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [apiKey, isInitialized]);

  if (loading) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </Card>
    );
  }

  if (!apiKey) {
    return (
      <Card className="w-full p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Map Unavailable</h3>
          <p className="text-sm text-muted-foreground">
            Unable to load map at this time. Please try again later.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-96 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full">
        <gmpx-api-loader 
          key={apiKey}
          solution-channel="GMP-QB_v5-cABCD"
        />
        <gmpx-store-locator 
          className="w-full h-full"
          style={{
            '--gmpx-color-surface': 'hsl(var(--background))',
            '--gmpx-color-on-surface': 'hsl(var(--foreground))',
            '--gmpx-color-on-surface-variant': 'hsl(var(--muted-foreground))',
            '--gmpx-color-primary': 'hsl(var(--primary))',
            '--gmpx-color-on-outline': 'hsl(var(--border))',
            '--gmpx-font-family-base': 'inherit',
            '--gmpx-font-family-headings': 'inherit',
            '--gmpx-font-size-base': '0.875rem',
            '--gmpx-hours-color-open': '#188038',
            '--gmpx-hours-color-closed': '#d50-1993',
            '--gmpx-rating-color': '#ffb300',
            '--gmpx-rating-color-empty': 'hsl(var(--muted))'
          } as React.CSSProperties}
        />
      </div>
    </Card>
  );
};

export default StoreMap;
