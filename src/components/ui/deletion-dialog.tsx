'use client';

import React, { useState } from 'react';
import { ModernPopup } from './modern-popup';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Badge } from './badge';
import { useToast } from './toast-system';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { 
  AlertTriangle, 
  Trash2, 
  User, 
  FileText, 
  CreditCard,
  Users,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'client' | 'creator';
  data: {
    id: string;
    name: string;
    email?: string;
    tasksCount?: number;
    transactionsCount?: number;
    assignedTasksCount?: number;
  };
  availableCreators?: Array<{ id: string; name: string; email: string }>;
  onConfirmDelete: (options: {
    id: string;
    confirmationText: string;
    reassignTo?: string;
  }) => Promise<void>;
}

export const DeletionDialog: React.FC<DeletionDialogProps> = ({
  isOpen,
  onClose,
  type,
  data,
  availableCreators = [],
  onConfirmDelete,
}) => {
  const [step, setStep] = useState<'warning' | 'confirmation' | 'processing'>('warning');
  const [confirmationText, setConfirmationText] = useState('');
  const [reassignTo, setReassignTo] = useState<string>('unassign');
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const haptic = useHapticFeedback();

  const expectedConfirmation = `DELETE ${data.name.toUpperCase()}`;
  const isConfirmationValid = confirmationText === expectedConfirmation;

  const handleClose = () => {
    if (!isDeleting) {
      setStep('warning');
      setConfirmationText('');
      setReassignTo('unassign');
      onClose();
    }
  };

  const handleProceedToConfirmation = () => {
    haptic.androidClick();
    setStep('confirmation');
  };

  const handleConfirmDelete = async () => {
    if (!isConfirmationValid) {
      haptic.error();
      showToast({
        type: 'error',
        message: 'Please type the confirmation text exactly as shown',
        style: 'modern'
      });
      return;
    }

    try {
      setIsDeleting(true);
      setStep('processing');
      haptic.androidClick();

      await onConfirmDelete({
        id: data.id,
        confirmationText,
        reassignTo: type === 'creator' ? reassignTo : undefined,
      });

      showToast({
        type: 'success',
        title: `${type === 'client' ? 'Client' : 'Creator'} Deleted`,
        message: `${data.name} and all associated data have been permanently deleted.`,
        style: 'modern'
      });

      handleClose();
    } catch (error) {
      console.error('Deletion failed:', error);
      haptic.error();
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        style: 'modern'
      });
      setStep('confirmation');
    } finally {
      setIsDeleting(false);
    }
  };

  const getWarningContent = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-800">Permanent Deletion Warning</h3>
          <p className="text-sm text-red-700 mt-1">
            This action cannot be undone. All data will be permanently deleted.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">{data.name}</p>
            <p className="text-sm text-muted-foreground">{data.email || 'No email'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {type === 'client' && (
            <>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Associated Tasks</span>
                </div>
                <Badge variant="destructive">{data.tasksCount || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Transactions</span>
                </div>
                <Badge variant="destructive">{data.transactionsCount || 0}</Badge>
              </div>
            </>
          )}

          {type === 'creator' && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Assigned Tasks</span>
              </div>
              <Badge variant="destructive">{data.assignedTasksCount || 0}</Badge>
            </div>
          )}
        </div>

        {type === 'creator' && data.assignedTasksCount && data.assignedTasksCount > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Task Reassignment Required</h4>
            <p className="text-sm text-yellow-700 mb-3">
              This creator has {data.assignedTasksCount} assigned tasks. Choose what to do with them:
            </p>
            <Select value={reassignTo} onValueChange={setReassignTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select reassignment option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassign">Unassign all tasks</SelectItem>
                {availableCreators.map(creator => (
                  <SelectItem key={creator.id} value={creator.id}>
                    Reassign to {creator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">What will be deleted:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Firebase Authentication account</li>
          <li>• User profile and personal data</li>
          {type === 'client' && (
            <>
              <li>• All associated tasks and project data</li>
              <li>• All transaction records</li>
              <li>• Payment history and invoices</li>
            </>
          )}
          {type === 'creator' && (
            <li>• Creator profile and work history</li>
          )}
          <li>• All related audit logs and activity records</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleClose} className="flex-1">
          Cancel
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleProceedToConfirmation}
          className="flex-1"
        >
          Proceed to Delete
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const getConfirmationContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800">Final Confirmation</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Type the following text exactly to confirm deletion:
        </p>
      </div>

      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-center font-mono text-red-800 font-semibold">
          {expectedConfirmation}
        </p>
      </div>

      <div className="space-y-2">
        <Input
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          placeholder="Type confirmation text here..."
          className={cn(
            'text-center font-mono',
            isConfirmationValid ? 'border-green-500 bg-green-50' : 'border-red-300'
          )}
        />
        {confirmationText && !isConfirmationValid && (
          <p className="text-xs text-red-600 text-center">
            Text doesn't match. Please type exactly as shown above.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('warning')} className="flex-1">
          Back
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleConfirmDelete}
          disabled={!isConfirmationValid}
          className="flex-1"
        >
          Delete Permanently
        </Button>
      </div>
    </div>
  );

  const getProcessingContent = () => (
    <div className="text-center py-8">
      <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
      <h3 className="text-lg font-semibold mb-2">Deleting {type === 'client' ? 'Client' : 'Creator'}...</h3>
      <p className="text-sm text-muted-foreground">
        Please wait while we permanently delete all associated data.
      </p>
    </div>
  );

  const getContent = () => {
    switch (step) {
      case 'warning':
        return getWarningContent();
      case 'confirmation':
        return getConfirmationContent();
      case 'processing':
        return getProcessingContent();
      default:
        return getWarningContent();
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'warning':
        return `Delete ${type === 'client' ? 'Client' : 'Creator'}`;
      case 'confirmation':
        return 'Confirm Deletion';
      case 'processing':
        return 'Processing...';
      default:
        return `Delete ${type === 'client' ? 'Client' : 'Creator'}`;
    }
  };

  return (
    <ModernPopup
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
      variant="error"
      style="modern"
      size="lg"
      showCloseButton={step !== 'processing'}
      closeOnOverlayClick={step !== 'processing'}
    >
      {getContent()}
    </ModernPopup>
  );
};
