import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClients, useCreateClient } from '@/hooks/useClients';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ClientFormModal } from '@/components/ClientFormModal';
import { isApiError } from '@/services/api/apiError';
import type { ClientInput } from '@/types';

export function Clients() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const clientsQuery = useClients({ page, limit: 20, search: debouncedSearch || undefined });
  const createClient = useCreateClient();

  const handleCreate = (body: ClientInput) => {
    createClient.mutate(body, {
      onSuccess: () => setIsCreateOpen(false),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Clients</h1>
          <p className="mt-1 text-sm text-ink-muted">Manage the companies you build for.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ New client</Button>
      </div>

      <Card>
        <div className="border-b border-border p-4">
          <Input
            placeholder="Search by company, contact, or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <CardBody className="p-0">
          {clientsQuery.isLoading ? (
            <LoadingState label="Loading clients…" />
          ) : clientsQuery.isError ? (
            <ErrorState message="Couldn't load clients." onRetry={() => clientsQuery.refetch()} />
          ) : clientsQuery.data && clientsQuery.data.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface-alt text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-5 py-2.5 font-medium">Company</th>
                    <th className="px-5 py-2.5 font-medium">Contact</th>
                    <th className="px-5 py-2.5 font-medium">Email</th>
                    <th className="px-5 py-2.5 font-medium">Industry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clientsQuery.data.data.map((client) => (
                    <tr key={client.id} className="transition-colors hover:bg-surface-hover">
                      <td className="px-5 py-3 font-medium text-ink">
                        <Link to={`/clients/${client.id}`} className="hover:text-accent">
                          {client.companyName}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-ink-muted">{client.contactPerson}</td>
                      <td className="px-5 py-3 font-mono text-ink-muted">{client.email}</td>
                      <td className="px-5 py-3 text-ink-muted">{client.industry || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No clients yet"
              description="Add your first client to start creating projects for them."
              action={
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                  + New client
                </Button>
              }
            />
          )}
        </CardBody>
        {clientsQuery.data && <Pagination meta={clientsQuery.data.meta} onPageChange={setPage} />}
      </Card>

      <ClientFormModal
        isOpen={isCreateOpen}
        isSubmitting={createClient.isPending}
        errorMessage={
          createClient.isError
            ? isApiError(createClient.error)
              ? createClient.error.message
              : 'Failed to create client.'
            : null
        }
        onSubmit={handleCreate}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
