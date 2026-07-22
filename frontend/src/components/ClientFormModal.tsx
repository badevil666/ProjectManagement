import { useEffect, useState, type FormEvent } from 'react';
import type { Client, ClientInput } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { IconButton } from '@/components/ui/IconButton';
import { TrashIcon } from '@/components/ui/icons';

interface ClientFormModalProps {
  isOpen: boolean;
  client?: Client | null;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (body: ClientInput) => void;
  onClose: () => void;
}

const EMPTY_FORM = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  industry: '',
  notes: '',
};

export function ClientFormModal({
  isOpen,
  client,
  isSubmitting = false,
  errorMessage,
  onSubmit,
  onClose,
}: ClientFormModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setForm({
        companyName: client?.companyName ?? '',
        contactPerson: client?.contactPerson ?? '',
        email: client?.email ?? '',
        phone: client?.phone ?? '',
        address: client?.address ?? '',
        industry: client?.industry ?? '',
        notes: client?.notes ?? '',
      });
      setAdditionalEmails(client?.additionalEmails ?? []);
    }
  }, [isOpen, client]);

  const update = (field: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const addEmail = () => setAdditionalEmails((prev) => [...prev, '']);
  const updateEmail = (index: number, value: string) =>
    setAdditionalEmails((prev) => prev.map((email, i) => (i === index ? value : email)));
  const removeEmail = (index: number) =>
    setAdditionalEmails((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      companyName: form.companyName.trim(),
      contactPerson: form.contactPerson.trim(),
      email: form.email.trim(),
      additionalEmails: additionalEmails.map((e) => e.trim()).filter(Boolean),
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      industry: form.industry.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
  };

  const isValid = form.companyName.trim() && form.contactPerson.trim() && form.email.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? 'Edit client' : 'New client'}
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="client-form" isLoading={isSubmitting} disabled={!isValid}>
            {client ? 'Save changes' : 'Create client'}
          </Button>
        </>
      }
    >
      <form
        id="client-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <Input
          label="Company name"
          required
          value={form.companyName}
          onChange={update('companyName')}
        />
        <Input
          label="Contact person"
          required
          value={form.contactPerson}
          onChange={update('contactPerson')}
        />
        <Input
          label="Primary email"
          type="email"
          required
          value={form.email}
          onChange={update('email')}
        />
        <Input label="Phone" value={form.phone} onChange={update('phone')} />

        <div className="sm:col-span-2">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-ink">Additional emails</label>
            <Button type="button" variant="ghost" size="sm" onClick={addEmail}>
              + Add email
            </Button>
          </div>
          {additionalEmails.length === 0 ? (
            <p className="text-xs text-ink-subtle">
              Add other people at the company who should be able to receive project updates.
            </p>
          ) : (
            <div className="space-y-2">
              {additionalEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    className="flex-1"
                  />
                  <IconButton
                    title="Remove email"
                    label="Remove email"
                    danger
                    onClick={() => removeEmail(index)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
        </div>
        <Input label="Industry" value={form.industry} onChange={update('industry')} />
        <Input label="Address" value={form.address} onChange={update('address')} />
        <div className="sm:col-span-2">
          <TextArea label="Notes" value={form.notes} onChange={update('notes')} />
        </div>
        {errorMessage && (
          <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400 sm:col-span-2">
            {errorMessage}
          </p>
        )}
      </form>
    </Modal>
  );
}
