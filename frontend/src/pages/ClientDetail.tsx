import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useClient, useDeleteClient, useUpdateClient } from '@/hooks/useClients';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ClientFormModal } from '@/components/ClientFormModal';
import { isApiError } from '@/services/api/apiError';
import { formatDate } from '@/utils/format';
import type { ClientInput } from '@/types';

export function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientQuery = useClient(id);
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm' | 'forceConfirm'>('idle');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!id) return <ErrorState message="Missing client id." />;

  if (clientQuery.isLoading) return <LoadingState label="Loading client…" />;
  if (clientQuery.isError || !clientQuery.data) {
    return (
      <ErrorState message="Couldn't load this client." onRetry={() => clientQuery.refetch()} />
    );
  }

  const client = clientQuery.data;

  const handleUpdate = (body: ClientInput) => {
    updateClient.mutate({ id, body }, { onSuccess: () => setIsEditOpen(false) });
  };

  const handleDelete = () => {
    setDeleteError(null);
    deleteClient.mutate(
      { id },
      {
        onSuccess: () => navigate('/clients'),
        onError: (error) => {
          if (isApiError(error) && error.status === 409) {
            setDeleteStep('forceConfirm');
          } else {
            setDeleteError(isApiError(error) ? error.message : 'Failed to delete client.');
            setDeleteStep('idle');
          }
        },
      },
    );
  };

  const handleForceDelete = () => {
    deleteClient.mutate(
      { id, force: true },
      {
        onSuccess: () => navigate('/clients'),
        onError: (error) => {
          setDeleteError(isApiError(error) ? error.message : 'Failed to delete client.');
          setDeleteStep('idle');
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/clients" className="text-sm text-ink-muted hover:text-ink">
            ← Back to clients
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink">
            {client.companyName}
          </h1>
          <p className="text-sm text-ink-muted">{client.contactPerson}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => setDeleteStep('confirm')}>
            Delete
          </Button>
        </div>
      </div>

      {deleteError && (
        <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {deleteError}
        </p>
      )}

      <Card>
        <CardHeader title="Client details" />
        <CardBody>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Email</dt>
              <dd className="mt-1 break-all font-mono text-sm text-ink">{client.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Phone</dt>
              <dd className="mt-1 font-mono text-sm tabular-nums text-ink">
                {client.phone || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
                Industry
              </dt>
              <dd className="mt-1 text-sm text-ink">{client.industry || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
                Address
              </dt>
              <dd className="mt-1 text-sm text-ink">{client.address || '—'}</dd>
            </div>
            {client.notes && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
                  Notes
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{client.notes}</dd>
              </div>
            )}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Projects"
          description={
            <>
              <span className="font-mono tabular-nums">{client.projects.length}</span> project(s)
              for this client
            </>
          }
        />
        <CardBody className="p-0">
          {client.projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create a project and assign it to this client."
            />
          ) : (
            <ul className="divide-y divide-border">
              {client.projects.map((project) => (
                <li
                  key={project.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-hover"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-sm font-medium text-ink hover:text-accent"
                    >
                      {project.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StatusBadge status={project.status} />
                      <PriorityBadge priority={project.priority} />
                      <span className="text-xs text-ink-subtle">
                        Due{' '}
                        <span className="font-mono tabular-nums">
                          {formatDate(project.expectedEndDate)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="w-32 shrink-0">
                    <ProgressBar value={project.overallProgress} size="sm" showLabel />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <ClientFormModal
        isOpen={isEditOpen}
        client={client}
        isSubmitting={updateClient.isPending}
        errorMessage={
          updateClient.isError
            ? isApiError(updateClient.error)
              ? updateClient.error.message
              : 'Failed to update client.'
            : null
        }
        onSubmit={handleUpdate}
        onClose={() => setIsEditOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleteStep === 'confirm'}
        title="Delete client"
        message={`Are you sure you want to delete ${client.companyName}? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteClient.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteStep('idle')}
      />

      <ConfirmDialog
        isOpen={deleteStep === 'forceConfirm'}
        title="Client has active projects"
        message="This client has active projects. Deleting will also permanently remove all of their projects, modules, features, files, and share links. Continue?"
        confirmLabel="Delete anyway"
        isLoading={deleteClient.isPending}
        onConfirm={handleForceDelete}
        onCancel={() => setDeleteStep('idle')}
      />
    </div>
  );
}
