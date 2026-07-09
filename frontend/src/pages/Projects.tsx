import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects, useCreateProject } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProjectFormModal } from '@/components/ProjectFormModal';
import { isApiError } from '@/services/api/apiError';
import { formatDate, humanizeEnum } from '@/utils/format';
import { PROJECT_STATUSES } from '@/types';
import type { ProjectInput, ProjectStatus } from '@/types';

export function Projects() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProjectStatus | ''>('');
  const [clientId, setClientId] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const projectsQuery = useProjects({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    status: status || undefined,
    clientId: clientId || undefined,
  });
  const clientsQuery = useClients({ limit: 100 });
  const createProject = useCreateProject();

  const handleCreate = (body: ProjectInput) => {
    createProject.mutate(body, { onSuccess: () => setIsCreateOpen(false) });
  };

  const clients = clientsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Projects</h1>
          <p className="mt-1 text-sm text-ink-muted">Every project across every client.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ New project</Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 border-b border-border p-4 sm:grid-cols-3">
          <Input
            placeholder="Search by title…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ProjectStatus | '');
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {PROJECT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {humanizeEnum(value)}
              </option>
            ))}
          </Select>
          <Select
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </Select>
        </div>
        <CardBody className="p-0">
          {projectsQuery.isLoading ? (
            <LoadingState label="Loading projects…" />
          ) : projectsQuery.isError ? (
            <ErrorState message="Couldn't load projects." onRetry={() => projectsQuery.refetch()} />
          ) : projectsQuery.data && projectsQuery.data.data.length > 0 ? (
            <ul className="divide-y divide-border">
              {projectsQuery.data.data.map((project) => (
                <li
                  key={project.id}
                  className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-surface-hover"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-sm font-medium text-ink transition-colors hover:text-accent"
                    >
                      {project.title}
                    </Link>
                    <p className="text-xs text-ink-muted">{project.client.companyName}</p>
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
          ) : (
            <EmptyState
              title="No projects found"
              description="Try adjusting your filters, or create a new project."
              action={
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                  + New project
                </Button>
              }
            />
          )}
        </CardBody>
        {projectsQuery.data && <Pagination meta={projectsQuery.data.meta} onPageChange={setPage} />}
      </Card>

      <ProjectFormModal
        isOpen={isCreateOpen}
        clients={clients}
        isSubmitting={createProject.isPending}
        errorMessage={
          createProject.isError
            ? isApiError(createProject.error)
              ? createProject.error.message
              : 'Failed to create project.'
            : null
        }
        onSubmit={handleCreate}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
