import { useEffect, useState, type FormEvent } from 'react';
import type { Client, ProjectDetail, ProjectInput, ProjectPriority, ProjectStatus } from '@/types';
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Select } from '@/components/ui/Select';
import { humanizeEnum } from '@/utils/format';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

interface ProjectFormModalProps {
  isOpen: boolean;
  project?: ProjectDetail | null;
  clients: Client[];
  defaultClientId?: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (body: ProjectInput) => void;
  onClose: () => void;
}

function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  return value.slice(0, 10);
}

export function ProjectFormModal({
  isOpen,
  project,
  clients,
  defaultClientId,
  isSubmitting = false,
  errorMessage,
  onSubmit,
  onClose,
}: ProjectFormModalProps) {
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('PLANNING');
  const [priority, setPriority] = useState<ProjectPriority>('MEDIUM');
  const [startDate, setStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    if (isOpen) {
      setClientId(project?.clientId ?? defaultClientId ?? '');
      setTitle(project?.title ?? '');
      setDescription(project?.description ?? '');
      setStatus(project?.status ?? 'PLANNING');
      setPriority(project?.priority ?? 'MEDIUM');
      setStartDate(toDateInputValue(project?.startDate));
      setExpectedEndDate(toDateInputValue(project?.expectedEndDate));
      setBudget(project?.budget ?? '');
      setCurrency(project?.currency ?? 'USD');
    }
  }, [isOpen, project, defaultClientId]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      clientId,
      title: title.trim(),
      description: description.trim() || undefined,
      status: project ? status : undefined,
      priority,
      startDate: startDate || undefined,
      expectedEndDate: expectedEndDate || undefined,
      budget: budget || undefined,
      currency,
    });
  };

  const isValid = clientId && title.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Edit project' : 'New project'}
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="project-form" isLoading={isSubmitting} disabled={!isValid}>
            {project ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form
        id="project-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <Select
            label="Client"
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="" disabled>
              Select a client…
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <TextArea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {project && (
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            {PROJECT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {humanizeEnum(value)}
              </option>
            ))}
          </Select>
        )}
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as ProjectPriority)}
        >
          {PROJECT_PRIORITIES.map((value) => (
            <option key={value} value={value}>
              {humanizeEnum(value)}
            </option>
          ))}
        </Select>
        <Input
          label="Start date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          label="Expected end date"
          type="date"
          value={expectedEndDate}
          onChange={(e) => setExpectedEndDate(e.target.value)}
        />
        <Input
          label="Budget"
          type="number"
          min="0"
          step="0.01"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </Select>
        {errorMessage && (
          <p className="sm:col-span-2 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        )}
      </form>
    </Modal>
  );
}
