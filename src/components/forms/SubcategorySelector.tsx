import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUBCATEGORIES } from '@/types/event';
import { TEXT } from '@/constants/text';

interface SubcategorySelectorProps {
  control: Control<any>;
  category: string | undefined;
}

export const SubcategorySelector = ({ control, category }: SubcategorySelectorProps) => {
  const subcategories = category ? SUBCATEGORIES[category] || [] : [];

  return (
    <FormField
      control={control}
      name="subcategory"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{TEXT.FORMS.labels.subcategoryOptional}</FormLabel>
          <Select onValueChange={(value) => field.onChange(value === "none" ? "" : value)} value={category ? (field.value || "none") : ""} disabled={!category}>
            <FormControl>
              <SelectTrigger className={fieldState.error ? "border-destructive focus:ring-destructive" : ""}>
                <SelectValue placeholder={category ? TEXT.FORMS.placeholders.selectSubcategory : TEXT.FORMS.placeholders.selectCategoryFirst} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">{TEXT.FORMS.labels.none}</SelectItem>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};