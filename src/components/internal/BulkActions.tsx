import { useToast } from '@/hooks/use-toast';
import { TEXT } from '@/constants/text';

interface BulkActionsProps {
  selectedEvents: string[];
  onBulkStateChange: (newState: 'Pending' | 'Approved' | 'Rejected') => Promise<void>;
}

export const BulkActions = ({ selectedEvents, onBulkStateChange }: BulkActionsProps) => {
  const { toast } = useToast();

  const handleBulkAction = async (newState: 'Pending' | 'Approved' | 'Rejected') => {
    if (selectedEvents.length > 100) {
      toast({
        title: "Too many events selected",
        description: "Please select 100 or fewer events for bulk actions",
        variant: "destructive",
      });
      return;
    }

    await onBulkStateChange(newState);
  };

  if (selectedEvents.length === 0) return null;

  return (
    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <span className="text-sm text-blue-700">
          {selectedEvents.length} event{selectedEvents.length > 1 ? 's' : ''} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => handleBulkAction('Approved')}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
          >
            {TEXT.ACTIONS.setApproved}
          </button>
          <button
            onClick={() => handleBulkAction('Rejected')}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
          >
            {TEXT.ACTIONS.setRejected}
          </button>
          <button
            onClick={() => handleBulkAction('Pending')}
            className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            {TEXT.ACTIONS.setPending}
          </button>
        </div>
      </div>
    </div>
  );
};