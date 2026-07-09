import { useEffect, useState, type FormEvent } from 'react';
import type { Feature, FeatureInput, FeaturePriority } from '@/types';
import { FEATURE_PRIORITIES } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Select } from '@/components/ui/Select';
import { humanizeEnum } from '@/utils/format';

interface FeatureFormModalProps {
  isOpen: boolean;
  feature?: Feature | null;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (body: FeatureInput) => void;
  onClose: () => void;
}

export function FeatureFormModal({
  isOpen,
  feature,
  isSubmitting = false,
  errorMessage,
  onSubmit,
  onClose,
}: FeatureFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<FeaturePriority>('MEDIUM');
  const [estimatedHours, setEstimatedHours] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(feature?.title ?? '');
      setDescription(feature?.description ?? '');
      setPriority(feature?.priority ?? 'MEDIUM');
      setEstimatedHours(feature?.estimatedHours ?? '');
    }
  }, [isOpen, feature]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      estimatedHours: estimatedHours ? Number.parseFloat(estimatedHours) : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={feature ? 'Edit feature' : 'New feature'}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="feature-form"
            isLoading={isSubmitting}
            disabled={!title.trim()}
          >
            {feature ? 'Save changes' : 'Create feature'}
          </Button>
        </>
      }
    >
      <form id="feature-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Password reset flow"
        />
        <TextArea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details about this feature"
        />
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as FeaturePriority)}
        >
          {FEATURE_PRIORITIES.map((value) => (
            <option key={value} value={value}>
              {humanizeEnum(value)}
            </option>
          ))}
        </Select>
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
