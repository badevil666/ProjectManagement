import { useEffect, useState, type FormEvent } from 'react';
import type { Module, ModuleInput } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';

interface ModuleFormModalProps {
  isOpen: boolean;
  module?: Module | null;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (body: ModuleInput) => void;
  onClose: () => void;
}

export function ModuleFormModal({
  isOpen,
  module,
  isSubmitting = false,
  errorMessage,
  onSubmit,
  onClose,
}: ModuleFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(module?.title ?? '');
      setDescription(module?.description ?? '');
      setEstimatedHours(module?.estimatedHours ?? '');
    }
  }, [isOpen, module]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      estimatedHours: estimatedHours ? Number.parseFloat(estimatedHours) : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={module ? 'Edit module' : 'New module'}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="module-form"
            isLoading={isSubmitting}
            disabled={!title.trim()}
          >
            {module ? 'Save changes' : 'Create module'}
          </Button>
        </>
      }
    >
      <form id="module-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Authentication"
        />
        <TextArea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details about this module"
        />
        <Input
          label="Estimated hours"
          type="number"
          min="0"
          step="0.5"
          value={estimatedHours}
          onChange={(e) => setEstimatedHours(e.target.value)}
        />
        {errorMessage && <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>}
      </form>
    </Modal>
  );
}
