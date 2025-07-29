import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';

interface CitySelectorProps {
  control: Control<any>;
  watchedRegion: string;
  watchedSubregion?: string;
}

const CITY_LISTS = {
  'Vorarlberg': [
    'Alberschwende', 'Altach', 'Andelsbuch', 'Au', 'Bartholomäberg', 'Bezau', 'Bildstein', 'Bizau', 'Blons', 'Bludenz',
    'Bludesch', 'Brand', 'Bregenz', 'Buch', 'Bürs', 'Bürserberg', 'Dalaas', 'Damüls', 'Doren', 'Dornbirn',
    'Düns', 'Dünserberg', 'Egg', 'Eichenberg', 'Feldkirch', 'Fontanella', 'Frastanz', 'Fraxern', 'Fußach', 'Gaißau',
    'Gaschurn', 'Göfis', 'Götzis', 'Hard', 'Hittisau', 'Höchst', 'Hohenems', 'Hohenweiler', 'Hörbranz', 'Innerbraz',
    'Kennelbach', 'Klaus', 'Klösterle', 'Koblach', 'Krumbach', 'Langen bei Bregenz', 'Langenegg', 'Laterns', 'Lauterach', 'Lech',
    'Lingenau', 'Lochau', 'Lorüns', 'Ludesch', 'Lustenau', 'Mäder', 'Meiningen', 'Mellau', 'Mittelberg', 'Möggers',
    'Nenzing', 'Nüziders', 'Raggal', 'Rankweil', 'Reuthe', 'Riefensberg', 'Röns', 'Röthis', 'Satteins', 'Schlins',
    'Schnepfau', 'Schnifis', 'Schoppernau', 'Schröcken', 'Schruns', 'Schwarzach', 'Schwarzenberg', 'Sibratsgfäll', 'Silbertal', 'Sonntag',
    'St. Anton im Montafon', 'St. Gallenkirch', 'St. Gerold', 'Stallehr', 'Sulz', 'Sulzberg', 'Thüringen', 'Thüringerberg', 'Tschagguns', 'Übersaxen',
    'Vandans', 'Viktorsberg', 'Warth', 'Weiler', 'Wolfurt', 'Zwischenwasser'
  ],
  'Bregenz': [
    'Bregenz', 'Alberschwende', 'Andelsbuch', 'Au', 'Bezau', 'Bildstein', 'Bizau', 'Buch', 'Damüls', 'Doren',
    'Egg', 'Eichenberg', 'Fußach', 'Gaißau', 'Hard', 'Hittisau', 'Höchst', 'Hohenweiler', 'Hörbranz', 'Kennelbach',
    'Krumbach', 'Langen bei Bregenz', 'Langenegg', 'Lauterach', 'Lingenau', 'Lochau', 'Mellau', 'Mittelberg', 'Möggers', 'Reuthe',
    'Riefensberg', 'Schnepfau', 'Schoppernau', 'Schröcken', 'Schwarzach', 'Schwarzenberg', 'Sibratsgfäll', 'Sulzberg', 'Warth', 'Wolfurt'
  ],
  'Dornbirn': [
    'Dornbirn', 'Hohenems', 'Lustenau'
  ],
  'Feldkirch': [
    'Feldkirch', 'Altach', 'Düns', 'Dünserberg', 'Frastanz', 'Fraxern', 'Göfis', 'Götzis', 'Klaus', 'Koblach',
    'Laterns', 'Mäder', 'Meiningen', 'Rankweil', 'Röns', 'Röthis', 'Satteins', 'Schlins', 'Schnifis', 'Sulz',
    'Übersaxen', 'Viktorsberg', 'Weiler', 'Zwischenwasser'
  ],
  'Bludenz': [
    'Bludenz', 'Bartholomäberg', 'Blons', 'Bludesch', 'Brand', 'Bürs', 'Bürserberg', 'Dalaas', 'Fontanella', 'Gaschurn',
    'Innerbraz', 'Klösterle', 'Lech', 'Lorüns', 'Ludesch', 'Nenzing', 'Nüziders', 'Raggal', 'Schruns', 'Silbertal',
    'Sonntag', 'St. Anton im Montafon', 'St. Gallenkirch', 'St. Gerold', 'Stallehr', 'Thüringen', 'Thüringerberg', 'Tschagguns', 'Vandans'
  ]
};

const FREE_TEXT_REGIONS = ['Deutschland', 'Schweiz'];

export const CitySelector = ({ control, watchedRegion, watchedSubregion }: CitySelectorProps) => {
  const showFreeText = FREE_TEXT_REGIONS.includes(watchedRegion);
  
  // Use subregion if available, otherwise use region
  const regionKey = watchedSubregion || watchedRegion;
  const cityList = CITY_LISTS[regionKey as keyof typeof CITY_LISTS];

  return (
    <FormField
      control={control}
      name="city"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ort</FormLabel>
          <FormControl>
            {showFreeText ? (
              <Input 
                placeholder="Ort eingeben..." 
                {...field} 
              />
            ) : cityList ? (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Ort auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {cityList.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input 
                placeholder="Zuerst Region wählen" 
                disabled 
                {...field} 
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};