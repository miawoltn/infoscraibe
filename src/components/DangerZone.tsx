'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { DialogClose } from '@radix-ui/react-dialog';

interface DropZoneProps {
  shouldCloseParentDialog?: (state: boolean) => void
}

export const DangerZone = ({ shouldCloseParentDialog }: DropZoneProps) => {
  const [showDeleteChats, setShowDeleteChats] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteChats = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch('/api/chat', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete chats');
      }
      
      const data = await response.json();
      toast.success(data.message);
      window.location.reload();
    } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete chats');
        console.error(error);
      } finally {
        setIsDeleting(false);
        setShowDeleteChats(false);
      }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch('/api/user', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete account');

      toast.success('Account deleted successfully');
      router.replace('/');
      window.location.reload();
      shouldCloseParentDialog?.(true);
    } catch (error) {
      toast.error('Failed to delete account');
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteAccount(false);
    }
  };

  return (
    <Card className="p-4 border-destructive">
      <div className="space-y-4">
        <div>
          <h4 className="text-base font-medium text-destructive mb-2">Danger Zone</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Permanent actions that cannot be undone
          </p>
        </div>
        <div className="space-y-2">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => setShowDeleteChats(true)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete All Chats'}
          </Button>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => setShowDeleteAccount(true)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </div>
      </div>

      <Dialog open={showDeleteChats} onOpenChange={(value) => isDeleting ? false : setShowDeleteChats(value)}>  
        <DialogContent>
          <DialogTitle>Are you sure you want to delete all chats?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete all your chats
            and remove all associated files from our servers.
          </DialogDescription>
          <div className="flex justify-end gap-3 mt-4">
            <DialogClose 
              onClick={() => setShowDeleteChats(false)}
              disabled={isDeleting}
            >
              Cancel
            </DialogClose>
            <Button 
              onClick={handleDeleteChats}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
               {isDeleting ? 'Deleting...' : 'Delete All Chats'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteAccount} onOpenChange={(value) => !isDeleting && setShowDeleteAccount(value)}>
        <DialogContent>
          <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove all your data from our servers, including:
            </DialogDescription>
            <ul className="list-disc ml-6 mt-2 text-sm text-muted-foreground">
              <li>All your chats and uploaded files</li>
              <li>Your profile information</li>
              <li>Usage history and credits</li>
              <li>All associated data</li>
            </ul>
         
          <div className="flex justify-end gap-3 mt-4">
            <DialogClose onClick={() => setShowDeleteAccount(false)}>
              Cancel
            </DialogClose>
            <Button 
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};