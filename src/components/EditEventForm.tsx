import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Event } from '@/types/event';
import { useEditEventForm } from '@/hooks/useEditEventForm';
import { EditEventFormFields } from '@/components/forms/EditEventFormFields';
import { TEXT } from '@/constants/text';

interface EditEventFormProps {
  initialData: Event;
  onSuccess: () => void;
}

const EditEventForm = ({ initialData, onSuccess }: EditEventFormProps) => {
  const {
    form,
    selectedDates,
    currentImage,
    isSubmitting,
    watchedRegion,
    watchedSubregion,
    watchedCategory,
    watchedPriceType,
    watchedConfirmAccuracy,
    shouldEnableSubmit,
    handleDatesChange,
    handleImageChange,
    handleDescriptionChange,
    onSubmit
  } = useEditEventForm({ initialData, onSuccess });

  return (
    <div className="max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <EditEventFormFields
            control={form.control}
            watchedRegion={watchedRegion}
            watchedSubregion={watchedSubregion}
            watchedCategory={watchedCategory}
            watchedPriceType={watchedPriceType}
            selectedDates={selectedDates}
            currentImage={currentImage}
            onDatesChange={handleDatesChange}
            onImageChange={handleImageChange}
            onDescriptionChange={handleDescriptionChange}
          />

          <Button 
            type="submit" 
            className="w-full bg-volat-yellow hover:bg-volat-yellow-dark text-black"
            disabled={!shouldEnableSubmit || isSubmitting}
          >
            {isSubmitting ? TEXT.ACTIONS.updating : TEXT.ACTIONS.updateEvent}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditEventForm;