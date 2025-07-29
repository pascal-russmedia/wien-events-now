import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { TEXT } from '@/constants/text';

interface EditEventSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditEventSuccessModal = ({ isOpen, onClose }: EditEventSuccessModalProps) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-center">{TEXT.SUCCESS_MODALS.editEvent.title}</DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              {TEXT.SUCCESS_MODALS.editEvent.notVisibleNote}
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleClose}
            className="bg-volat-yellow hover:bg-volat-yellow-dark text-black"
          >
            {TEXT.SUCCESS_MODALS.editEvent.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventSuccessModal;