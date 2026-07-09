import { useEffect, useState, type FormEvent } from 'react';
import type { Client, ClientInput } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';

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
    }
  }, [isOpen, client]);

  const update = (field: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      companyName: form.companyName.trim(),
      contactPerson: form.contactPerson.trim(),
      email: form.email.trim(),
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
        <Input label="Email" type="email" required value={form.email} onChange={update('email')} />
        <Input label="Phone" value={form.phone} onChange={update('phone')} />
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
