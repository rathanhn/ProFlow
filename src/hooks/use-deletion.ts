'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-system';
import { useHapticFeedback } from '@/lib/haptic-feedback';

interface DeletionOptions {
  id: string;
  confirmationText: string;
  reassignTo?: string;
}

interface DeletionResult {
  success: boolean;
  message: string;
  deletedData?: {
    tasksDeleted?: number;
    transactionsDeleted?: number;
    tasksReassigned?: number;
    tasksUnassigned?: number;
    authAccountDeleted?: boolean;
    reassignedTo?: string;
  };
}

export const useDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const haptic = useHapticFeedback();
  const router = useRouter();

  const deleteClient = async (options: DeletionOptions): Promise<DeletionResult> => {
    setIsDeleting(true);
    
    try {
      // Get current user email for admin verification
      const adminEmail = localStorage.getItem('adminEmail') || 'admin@proflow.com';
      
      const response = await fetch('/api/admin/delete-client', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: options.id,
          adminEmail,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete client');
      }

      haptic.androidClick();
      
      // Refresh the page to update the client list
      router.refresh();

      return {
        success: true,
        message: result.message,
        deletedData: result.deletedData,
      };

    } catch (error) {
      console.error('Client deletion error:', error);
      haptic.error();
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete client';
      
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: errorMessage,
        style: 'modern',
      });

      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteCreator = async (options: DeletionOptions): Promise<DeletionResult> => {
    setIsDeleting(true);
    
    try {
      // Get current user email for admin verification
      const adminEmail = localStorage.getItem('adminEmail') || 'admin@proflow.com';
      
      const response = await fetch('/api/admin/delete-creator', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId: options.id,
          adminEmail,
          reassignTo: options.reassignTo,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete creator');
      }

      haptic.androidClick();
      
      // Refresh the page to update the creator list
      router.refresh();

      return {
        success: true,
        message: result.message,
        deletedData: result.deletedData,
      };

    } catch (error) {
      console.error('Creator deletion error:', error);
      haptic.error();
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete creator';
      
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: errorMessage,
        style: 'modern',
      });

      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const getClientDeletionData = async (clientId: string) => {
    try {
      const response = await fetch(`/api/admin/client-deletion-info?clientId=${clientId}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get client deletion info');
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get client deletion info:', error);
      return {
        tasksCount: 0,
        transactionsCount: 0,
      };
    }
  };

  const getCreatorDeletionData = async (creatorId: string) => {
    try {
      const response = await fetch(`/api/admin/creator-deletion-info?creatorId=${creatorId}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get creator deletion info');
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get creator deletion info:', error);
      return {
        assignedTasksCount: 0,
        availableCreators: [],
      };
    }
  };

  return {
    isDeleting,
    deleteClient,
    deleteCreator,
    getClientDeletionData,
    getCreatorDeletionData,
  };
};
