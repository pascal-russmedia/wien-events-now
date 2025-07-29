import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CATEGORIES, FRONTEND_REGIONS as REGIONS } from '@/types/event';
import RichTextEditor from '@/components/RichTextEditor';
import EventDateSelector from '@/components/forms/EventDateSelector';
import EventImageUpload from '@/components/forms/EventImageUpload';
import EventPriceSection from '@/components/forms/EventPriceSection';
import { SubcategorySelector } from '@/components/forms/SubcategorySelector';
import { CitySelector } from '@/components/forms/CitySelector';
import { Control } from 'react-hook-form';
import { EditEventFormData } from '@/components/forms/editEventSchema';
import { DateWithTimes } from '@/components/forms/eventFormSchema';
import { getTextLength } from '@/utils/eventFormatters';
import { TEXT } from '@/constants/text';

interface EditEventFormFieldsProps {
  control: Control<EditEventFormData>;
  watchedRegion: string;
  watchedSubregion?: string;
  watchedCategory: string;
  watchedPriceType: 'Free' | 'Cost';
  selectedDates: DateWithTimes[];
  currentImage: string;
  onDatesChange: (dates: DateWithTimes[]) => void;
  onImageChange: (image: string) => void;
  onDescriptionChange: (data: string) => void;
}

export const EditEventFormFields = ({
  control,
  watchedRegion,
  watchedSubregion,
  watchedCategory,
  watchedPriceType,
  selectedDates,
  currentImage,
  onDatesChange,
  onImageChange,
  onDescriptionChange
}: EditEventFormFieldsProps) => {
  return (
    <>
      {/* Group 1: Event Details */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground border-b pb-2">Event Details</h3>
        
        <FormField
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{TEXT.FORMS.fields.title}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={TEXT.FORMS.placeholders.eventTitle}
                  maxLength={50} 
                  className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                  {...field} 
                />
              </FormControl>
              <div className="text-sm text-muted-foreground">{field.value?.length || 0}/50</div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="category"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{TEXT.FORMS.fields.category}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={fieldState.error ? "border-destructive focus:ring-destructive" : ""}>
                      <SelectValue placeholder={TEXT.FORMS.placeholders.selectCategory} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <SubcategorySelector 
            control={control} 
            category={watchedCategory} 
          />
        </div>

        <FormField
          control={control}
          name="dates"
          render={() => (
            <EventDateSelector
              selectedDates={selectedDates}
              onDatesChange={onDatesChange}
            />
          )}
        />

        <FormField
          control={control}
          name="link"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{TEXT.FORMS.fields.eventWebsite}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={TEXT.FORMS.placeholders.eventWebsite} 
                  className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{TEXT.FORMS.fields.description}</FormLabel>
              <RichTextEditor
                value={field.value}
                onChange={onDescriptionChange}
                placeholder={TEXT.FORMS.placeholders.enterDetails}
              />
              <div className={`text-sm mt-1 ${getTextLength(field.value || '') > 2000 ? 'text-destructive' : 'text-muted-foreground'}`}>{getTextLength(field.value || '')}/2000</div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="image"
          render={() => (
            <EventImageUpload 
              onImageChange={onImageChange}
              initialImage={currentImage}
            />
          )}
        />
      </div>

      {/* Group 2: Location */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground border-b pb-2">{TEXT.HARDCODED_ENGLISH.location}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="region"
            render={({ field, fieldState }) => {
              // Flatten all regions and subregions for dropdown
              const allRegionOptions = REGIONS.flatMap(region => {
                const options = [{ name: region.name, isSubregion: false, parentRegion: region.name }];
                if (region.subregions) {
                  options.push(...region.subregions.map(sub => ({ 
                    name: sub, 
                    isSubregion: true, 
                    parentRegion: region.name 
                  })));
                }
                return options;
              });

              // Find the selected option - prefer subregion if available, otherwise parent region
              const selectedSubregion = control._formValues.subregion;
              const selectedOption = allRegionOptions.find(option => 
                selectedSubregion && option.isSubregion && option.name === selectedSubregion
                  ? true 
                  : !selectedSubregion && option.parentRegion === field.value && !option.isSubregion
              );

              return (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      const option = allRegionOptions.find(opt => opt.name === value);
                      if (option) {
                        // Always store the parent region in the field
                        field.onChange(option.parentRegion);
                        // Store the actual selected value separately for subregion field
                        if (option.isSubregion) {
                          control._formValues.subregion = option.name;
                        } else {
                          control._formValues.subregion = '';
                        }
                      }
                    }} 
                    value={selectedOption?.name || field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={fieldState.error ? "border-destructive focus:ring-destructive" : ""}>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allRegionOptions.map((option) => (
                        <SelectItem 
                          key={option.name} 
                          value={option.name}
                          className={option.isSubregion ? "pl-8 text-muted-foreground" : "font-medium"}
                        >
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <CitySelector control={control} watchedRegion={watchedRegion} watchedSubregion={watchedSubregion} />

          <FormField
            control={control}
            name="address"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{TEXT.FORMS.fields.eventAddress}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={TEXT.FORMS.placeholders.eventAddress} 
                    className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="host"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{TEXT.FORMS.fields.eventHost}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={TEXT.FORMS.placeholders.eventHost} 
                    maxLength={40}
                    className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                    {...field} 
                  />
                </FormControl>
                <div className="text-sm text-muted-foreground">{field.value?.length || 0}/40</div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Group 3: Pricing */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground border-b pb-2">{TEXT.FORMS.sections.pricing}</h3>
        <EventPriceSection
          control={control}
          watchedPriceType={watchedPriceType}
        />
      </div>

      {/* Group 4: Confirmation */}
      <div className="space-y-6 pb-12">
        <FormField
          control={control}
          name="confirmAccuracy"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm">
                  {TEXT.MESSAGES.consentMessage}
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};