import { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  location: string | null;
}

interface LocationInfo {
  name: string;
  location: string;
}

interface CategoryConfig {
  color: string;
  icon: string;
  locations: LocationInfo[];
}

const getLocationData = (location: string): Record<string, CategoryConfig> => {
  const locationData: Record<string, Record<string, CategoryConfig>> = {
    'mumbai': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'IIT Bombay',
            location: 'Powai, Mumbai, Maharashtra'
          },
          {
            name: 'University of Mumbai',
            location: 'Fort, Mumbai, Maharashtra'
          },
          {
            name: 'St. Xavier\'s College',
            location: 'Dhobi Talao, Mumbai, Maharashtra'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Lilavati Hospital',
            location: 'Bandra West, Mumbai, Maharashtra'
          },
          {
            name: 'Breach Candy Hospital',
            location: 'Breach Candy, Mumbai, Maharashtra'
          },
          {
            name: 'Tata Memorial Hospital',
            location: 'Parel, Mumbai, Maharashtra'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Gateway of India',
            location: 'Apollo Bunder, Colaba, Mumbai'
          },
          {
            name: 'Marine Drive',
            location: 'Netaji Subhash Chandra Bose Road, Mumbai'
          },
          {
            name: 'Juhu Beach',
            location: 'Juhu, Mumbai, Maharashtra'
          }
        ]
      }
    },
    'maharashtra': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'Savitribai Phule Pune University',
            location: 'Pune, Maharashtra'
          },
          {
            name: 'VJTI',
            location: 'Matunga, Mumbai, Maharashtra'
          },
          {
            name: 'COEP',
            location: 'Shivajinagar, Pune, Maharashtra'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Ruby Hall Clinic',
            location: 'Pune, Maharashtra'
          },
          {
            name: 'Wockhardt Hospital',
            location: 'Mumbai Central, Maharashtra'
          },
          {
            name: 'Aditya Birla Hospital',
            location: 'Pune, Maharashtra'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Ajanta Caves',
            location: 'Aurangabad, Maharashtra'
          },
          {
            name: 'Ellora Caves',
            location: 'Aurangabad, Maharashtra'
          },
          {
            name: 'Shirdi Sai Baba Temple',
            location: 'Shirdi, Maharashtra'
          }
        ]
      }
    },
    'delhi': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'Delhi University',
            location: 'North Campus, Delhi'
          },
          {
            name: 'JNU',
            location: 'New Delhi, Delhi'
          },
          {
            name: 'IIT Delhi',
            location: 'Hauz Khas, New Delhi'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'AIIMS Delhi',
            location: 'Ansari Nagar, New Delhi'
          },
          {
            name: 'Fortis Hospital',
            location: 'Vasant Kunj, New Delhi'
          },
          {
            name: 'Max Super Speciality Hospital',
            location: 'Saket, New Delhi'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Red Fort',
            location: 'Chandni Chowk, Delhi'
          },
          {
            name: 'Qutub Minar',
            location: 'Mehrauli, Delhi'
          },
          {
            name: 'India Gate',
            location: 'Rajpath, New Delhi'
          }
        ]
      }
    },
    'karnataka': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'IISc Bangalore',
            location: 'Bangalore, Karnataka'
          },
          {
            name: 'NITK Surathkal',
            location: 'Mangalore, Karnataka'
          },
          {
            name: 'Manipal Academy of Higher Education',
            location: 'Manipal, Karnataka'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Manipal Hospital',
            location: 'Bangalore, Karnataka'
          },
          {
            name: 'Apollo Hospital',
            location: 'Bangalore, Karnataka'
          },
          {
            name: 'Narayana Health City',
            location: 'Bangalore, Karnataka'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Mysore Palace',
            location: 'Mysore, Karnataka'
          },
          {
            name: 'Hampi',
            location: 'Bellary, Karnataka'
          },
          {
            name: 'Coorg',
            location: 'Madikeri, Karnataka'
          }
        ]
      }
    },
    'tamil nadu': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'IIT Madras',
            location: 'Chennai, Tamil Nadu'
          },
          {
            name: 'Anna University',
            location: 'Chennai, Tamil Nadu'
          },
          {
            name: 'NIT Trichy',
            location: 'Tiruchirappalli, Tamil Nadu'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Apollo Hospitals',
            location: 'Greams Road, Chennai'
          },
          {
            name: 'CMC Vellore',
            location: 'Vellore, Tamil Nadu'
          },
          {
            name: 'MIOT International',
            location: 'Chennai, Tamil Nadu'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Meenakshi Temple',
            location: 'Madurai, Tamil Nadu'
          },
          {
            name: 'Marina Beach',
            location: 'Chennai, Tamil Nadu'
          },
          {
            name: 'Ooty',
            location: 'Nilgiris, Tamil Nadu'
          }
        ]
      }
    },
    'new york': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'Columbia University',
            location: 'Morningside Heights, Manhattan, New York'
          },
          {
            name: 'New York University (NYU)',
            location: 'Greenwich Village, Manhattan, New York'
          },
          {
            name: 'The Juilliard School',
            location: 'Lincoln Center, Manhattan, New York'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'NewYork-Presbyterian Hospital',
            location: 'East 68th Street, Manhattan, New York'
          },
          {
            name: 'Mount Sinai Hospital',
            location: 'Upper East Side, Manhattan, New York'
          },
          {
            name: 'NYC Health + Hospitals/Bellevue',
            location: 'First Avenue, Kips Bay, Manhattan'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Empire State Building',
            location: '350 Fifth Avenue, Midtown Manhattan, New York'
          },
          {
            name: 'Metropolitan Museum of Art',
            location: '1000 Fifth Avenue, Museum Mile, Manhattan'
          },
          {
            name: 'Times Square',
            location: 'Broadway and 7th Avenue, Midtown Manhattan'
          }
        ]
      }
    },
    'india': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'Indian Institute of Technology Delhi',
            location: 'Hauz Khas, New Delhi, India'
          },
          {
            name: 'University of Delhi',
            location: 'North Campus, Delhi, India'
          },
          {
            name: 'Indian Institute of Science',
            location: 'Bangalore, Karnataka, India'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'All India Institute of Medical Sciences',
            location: 'Ansari Nagar, New Delhi, India'
          },
          {
            name: 'Tata Memorial Hospital',
            location: 'Parel, Mumbai, India'
          },
          {
            name: 'Apollo Hospitals',
            location: 'Chennai, Tamil Nadu, India'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Taj Mahal',
            location: 'Agra, Uttar Pradesh, India'
          },
          {
            name: 'Amber Fort',
            location: 'Jaipur, Rajasthan, India'
          },
          {
            name: 'Gateway of India',
            location: 'Apollo Bunder, Mumbai, India'
          }
        ]
      }
    },
    'germany': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'Technical University of Munich',
            location: 'Munich, Bavaria, Germany'
          },
          {
            name: 'Heidelberg University',
            location: 'Heidelberg, Baden-Württemberg, Germany'
          },
          {
            name: 'Humboldt University of Berlin',
            location: 'Berlin, Germany'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Charité - Universitätsmedizin Berlin',
            location: 'Berlin, Germany'
          },
          {
            name: 'University Hospital Heidelberg',
            location: 'Heidelberg, Germany'
          },
          {
            name: 'University Hospital Munich',
            location: 'Munich, Germany'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Brandenburg Gate',
            location: 'Pariser Platz, Berlin, Germany'
          },
          {
            name: 'Neuschwanstein Castle',
            location: 'Schwangau, Bavaria, Germany'
          },
          {
            name: 'Cologne Cathedral',
            location: 'Cologne, North Rhine-Westphalia, Germany'
          }
        ]
      }
    },
    'japan': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'University of Tokyo',
            location: 'Bunkyo, Tokyo, Japan'
          },
          {
            name: 'Kyoto University',
            location: 'Sakyo-ku, Kyoto, Japan'
          },
          {
            name: 'Osaka University',
            location: 'Suita, Osaka, Japan'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Tokyo Medical University Hospital',
            location: 'Shinjuku, Tokyo, Japan'
          },
          {
            name: 'Kyoto University Hospital',
            location: 'Sakyo-ku, Kyoto, Japan'
          },
          {
            name: 'National Cancer Center Hospital',
            location: 'Chuo, Tokyo, Japan'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Senso-ji Temple',
            location: 'Asakusa, Tokyo, Japan'
          },
          {
            name: 'Fushimi Inari Shrine',
            location: 'Fushimi-ku, Kyoto, Japan'
          },
          {
            name: 'Mount Fuji',
            location: 'Fujinomiya, Shizuoka, Japan'
          }
        ]
      }
    },
    'france': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'Sorbonne University',
            location: 'Latin Quarter, Paris, France'
          },
          {
            name: 'École Polytechnique',
            location: 'Palaiseau, Île-de-France, France'
          },
          {
            name: 'Sciences Po',
            location: 'Saint-Germain-des-Prés, Paris, France'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Hôpital Pitié-Salpêtrière',
            location: '13th arrondissement, Paris, France'
          },
          {
            name: 'American Hospital of Paris',
            location: 'Neuilly-sur-Seine, France'
          },
          {
            name: 'Hôpital Necker-Enfants Malades',
            location: '15th arrondissement, Paris, France'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Eiffel Tower',
            location: 'Champ de Mars, Paris, France'
          },
          {
            name: 'Palace of Versailles',
            location: 'Versailles, France'
          },
          {
            name: 'Louvre Museum',
            location: '1st arrondissement, Paris, France'
          }
        ]
      }
    },
    'united kingdom': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'University of Oxford',
            location: 'Oxford, England, UK'
          },
          {
            name: 'University of Cambridge',
            location: 'Cambridge, England, UK'
          },
          {
            name: 'Imperial College London',
            location: 'South Kensington, London, UK'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Guy\'s Hospital',
            location: 'London Bridge, London, UK'
          },
          {
            name: 'St Thomas\' Hospital',
            location: 'Westminster Bridge Road, London, UK'
          },
          {
            name: 'Great Ormond Street Hospital',
            location: 'Bloomsbury, London, UK'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Big Ben',
            location: 'Westminster, London, UK'
          },
          {
            name: 'Tower of London',
            location: 'Tower Hill, London, UK'
          },
          {
            name: 'Edinburgh Castle',
            location: 'Edinburgh, Scotland, UK'
          }
        ]
      }
    },
    'australia': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'University of Melbourne',
            location: 'Melbourne, Victoria, Australia'
          },
          {
            name: 'University of Sydney',
            location: 'Sydney, New South Wales, Australia'
          },
          {
            name: 'Australian National University',
            location: 'Canberra, Australian Capital Territory, Australia'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Royal Melbourne Hospital',
            location: 'Melbourne, Victoria, Australia'
          },
          {
            name: 'Sydney Hospital',
            location: 'Sydney, New South Wales, Australia'
          },
          {
            name: 'Alfred Hospital',
            location: 'Melbourne, Victoria, Australia'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Sydney Opera House',
            location: 'Sydney, New South Wales, Australia'
          },
          {
            name: 'Uluru',
            location: 'Northern Territory, Australia'
          },
          {
            name: 'Great Barrier Reef',
            location: 'Queensland, Australia'
          }
        ]
      }
    },
    'canada': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'University of Toronto',
            location: 'Toronto, Ontario, Canada'
          },
          {
            name: 'McGill University',
            location: 'Montreal, Quebec, Canada'
          },
          {
            name: 'University of British Columbia',
            location: 'Vancouver, British Columbia, Canada'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Toronto General Hospital',
            location: 'Toronto, Ontario, Canada'
          },
          {
            name: 'Montreal General Hospital',
            location: 'Montreal, Quebec, Canada'
          },
          {
            name: 'Vancouver General Hospital',
            location: 'Vancouver, British Columbia, Canada'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'CN Tower',
            location: 'Toronto, Ontario, Canada'
          },
          {
            name: 'Niagara Falls',
            location: 'Ontario, Canada'
          },
          {
            name: 'Banff National Park',
            location: 'Alberta, Canada'
          }
        ]
      }
    },
    'italy': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'University of Bologna',
            location: 'Bologna, Emilia-Romagna, Italy'
          },
          {
            name: 'Sapienza University of Rome',
            location: 'Rome, Lazio, Italy'
          },
          {
            name: 'University of Milan',
            location: 'Milan, Lombardy, Italy'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Policlinico Gemelli',
            location: 'Rome, Lazio, Italy'
          },
          {
            name: 'Ospedale Maggiore Policlinico',
            location: 'Milan, Lombardy, Italy'
          },
          {
            name: 'Ospedale San Raffaele',
            location: 'Milan, Lombardy, Italy'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Colosseum',
            location: 'Rome, Lazio, Italy'
          },
          {
            name: 'Venice Canals',
            location: 'Venice, Veneto, Italy'
          },
          {
            name: 'Leaning Tower of Pisa',
            location: 'Pisa, Tuscany, Italy'
          }
        ]
      }
    },
    'spain': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'University of Barcelona',
            location: 'Barcelona, Catalonia, Spain'
          },
          {
            name: 'Complutense University of Madrid',
            location: 'Madrid, Spain'
          },
          {
            name: 'University of Valencia',
            location: 'Valencia, Spain'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Hospital Clinic Barcelona',
            location: 'Barcelona, Catalonia, Spain'
          },
          {
            name: 'Hospital La Paz',
            location: 'Madrid, Spain'
          },
          {
            name: 'Hospital Universitari i Politècnic La Fe',
            location: 'Valencia, Spain'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Sagrada Familia',
            location: 'Barcelona, Catalonia, Spain'
          },
          {
            name: 'Royal Palace of Madrid',
            location: 'Madrid, Spain'
          },
          {
            name: 'Alhambra',
            location: 'Granada, Andalusia, Spain'
          }
        ]
      }
    },
    'brazil': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'University of São Paulo',
            location: 'São Paulo, Brazil'
          },
          {
            name: 'Federal University of Rio de Janeiro',
            location: 'Rio de Janeiro, Brazil'
          },
          {
            name: 'University of Campinas',
            location: 'Campinas, São Paulo, Brazil'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Hospital Israelita Albert Einstein',
            location: 'São Paulo, Brazil'
          },
          {
            name: 'Hospital Sírio-Libanês',
            location: 'São Paulo, Brazil'
          },
          {
            name: 'Hospital das Clínicas',
            location: 'Rio de Janeiro, Brazil'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Christ the Redeemer',
            location: 'Rio de Janeiro, Brazil'
          },
          {
            name: 'Sugarloaf Mountain',
            location: 'Rio de Janeiro, Brazil'
          },
          {
            name: 'Iguazu Falls',
            location: 'Foz do Iguaçu, Paraná, Brazil'
          }
        ]
      }
    },
    'russia': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'Moscow State University',
            location: 'Moscow, Russia'
          },
          {
            name: 'Saint Petersburg State University',
            location: 'Saint Petersburg, Russia'
          },
          {
            name: 'Novosibirsk State University',
            location: 'Novosibirsk, Russia'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'First Moscow State Medical University',
            location: 'Moscow, Russia'
          },
          {
            name: 'N.I. Pirogov Russian National Research Medical University',
            location: 'Moscow, Russia'
          },
          {
            name: 'Saint Petersburg State Pediatric Medical University',
            location: 'Saint Petersburg, Russia'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Red Square',
            location: 'Moscow, Russia'
          },
          {
            name: 'Kremlin',
            location: 'Moscow, Russia'
          },
          {
            name: 'Hermitage Museum',
            location: 'Saint Petersburg, Russia'
          }
        ]
      }
    },
    'china': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'Tsinghua University',
            location: 'Haidian District, Beijing, China'
          },
          {
            name: 'Peking University',
            location: 'Haidian District, Beijing, China'
          },
          {
            name: 'Fudan University',
            location: 'Shanghai, China'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Peking Union Medical College Hospital',
            location: 'Beijing, China'
          },
          {
            name: 'Shanghai Ruijin Hospital',
            location: 'Shanghai, China'
          },
          {
            name: 'West China Hospital',
            location: 'Chengdu, Sichuan, China'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Great Wall of China',
            location: 'Beijing, China'
          },
          {
            name: 'Forbidden City',
            location: 'Beijing, China'
          },
          {
            name: 'Terracotta Army',
            location: "Xi'an, Shaanxi, China"
          }
        ]
      }
    },
    'south korea': {
      education: {
        color: '#4CAF50',
        icon: '🎓',
        locations: [
          {
            name: 'Seoul National University',
            location: 'Gwanak-gu, Seoul, South Korea'
          },
          {
            name: 'Korea Advanced Institute of Science and Technology',
            location: 'Daejeon, South Korea'
          },
          {
            name: 'Yonsei University',
            location: 'Seodaemun-gu, Seoul, South Korea'
          }
        ]
      },
      healthcare: {
        color: '#F44336',
        icon: '🏥',
        locations: [
          {
            name: 'Samsung Medical Center',
            location: 'Gangnam-gu, Seoul, South Korea'
          },
          {
            name: 'Asan Medical Center',
            location: 'Songpa-gu, Seoul, South Korea'
          },
          {
            name: 'Severance Hospital',
            location: 'Seodaemun-gu, Seoul, South Korea'
          }
        ]
      },
      tourism: {
        color: '#2196F3',
        icon: '🏛️',
        locations: [
          {
            name: 'Gyeongbokgung Palace',
            location: 'Jongno-gu, Seoul, South Korea'
          },
          {
            name: 'N Seoul Tower',
            location: 'Yongsan-gu, Seoul, South Korea'
          },
          {
            name: 'Jeju Island',
            location: 'Jeju-do, South Korea'
          }
        ]
      }
    }
  };

  const locationKey = location.toLowerCase();
  return locationData[locationKey] || {
    education: { color: '#4CAF50', icon: '🎓', locations: [] },
    healthcare: { color: '#F44336', icon: '🏥', locations: [] },
    tourism: { color: '#2196F3', icon: '🏛️', locations: [] }
  };
};

export default function MapView({ location }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    mapRef.current = L.map(mapContainerRef.current).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [location]);

  useEffect(() => {
    if (!location || !mapRef.current) return;

    const geocodeLocation = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);

          mapRef.current?.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
              layer.remove();
            }
          });

          mapRef.current?.setView([lat, lng], 6);
          L.marker([lat, lng])
            .addTo(mapRef.current!)
            .bindPopup(`<b>${location}</b>`)
            .openPopup();
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        toast({
          title: "Error",
          description: "Failed to load location on map. Please try again.",
          variant: "destructive"
        });
      }
    };

    geocodeLocation();
  }, [location]);

  if (!location) return null;

  const categories = getLocationData(location);

  const capitalizedLocation = location
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-3">
        <div 
          ref={mapContainerRef}
          className="w-full h-[600px] rounded-lg overflow-hidden shadow-md"
        />
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {Object.entries(categories).map(([category, config]) => (
          <Card key={category} className="p-4">
            <div className="flex items-center gap-2 mb-4" style={{ color: config.color }}>
              <span className="text-2xl">{config.icon}</span>
              <h3 className="text-lg font-semibold capitalize">{category}</h3>
            </div>
            <div className="space-y-4">
              {config.locations.map((loc, index) => (
                <div key={index} className="space-y-2 border-b pb-4 last:border-b-0 last:pb-0">
                  <p><strong>Place:</strong> {capitalizedLocation}</p>
                  <p><strong>Name:</strong> {loc.name}</p>
                  <p><strong>Location:</strong> {loc.location}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}