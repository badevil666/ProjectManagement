import { Link } from 'react-router-dom';
import { useDashboardActivity, useDashboardStats } from '@/hooks/useDashboard';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Timeline } from '@/components/Timeline';

function ClientsGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.5v-2.25a3 3 0 00-3-3h-3a3 3 0 00-3 3v2.25M15 6.75a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
function ProjectsGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 7.5a1.5 1.5 0 011.5-1.5h4.19a1.5 1.5 0 011.06.44l1.31 1.31a1.5 1.5 0 001.06.44h6.63a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-11.19z"
      />
    </svg>
  );
}
function ActiveGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
function CompletedGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75l1.5 1.5 3.75-3.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
function OverdueGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m0 3.75h.008v.008H12V16.5zm9-4.5a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function Dashboard() {
  const statsQuery = useDashboardStats();
  const activityQuery = useDashboardActivity({ limit: 20 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">An overview of every client and project.</p>
      </div>

      {statsQuery.isLoading ? (
        <LoadingState label="Loading stats…" />
      ) : statsQuery.isError || !statsQuery.data ? (
        <ErrorState message="Couldn't load dashboard stats." onRetry={() => statsQuery.refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Clients"
            value={statsQuery.data.totalClients}
            icon={<ClientsGlyph />}
            tone="brand"
          />
          <StatCard
            label="Projects"
            value={statsQuery.data.totalProjects}
            icon={<ProjectsGlyph />}
            tone="default"
          />
          <StatCard
            label="Active"
            value={statsQuery.data.activeProjects}
            icon={<ActiveGlyph />}
            tone="brand"
          />
          <StatCard
            label="Completed"
            value={statsQuery.data.completedProjects}
            icon={<CompletedGlyph />}
            tone="success"
          />
          <StatCard
            label="Overdue"
            value={statsQuery.data.totalOverdue}
            icon={<OverdueGlyph />}
            tone="danger"
          />
        </div>
      )}

      <Card>
        <CardHeader title="Recent activity" description="Across every project" />
        <CardBody>
          {activityQuery.isLoading ? (
            <LoadingState label="Loading activity…" />
          ) : activityQuery.isError ? (
            <ErrorState
              message="Couldn't load recent activity."
              onRetry={() => activityQuery.refetch()}
            />
          ) : (
            <Timeline
              activities={activityQuery.data ?? []}
              emptyMessage="No activity across your projects yet."
              renderMeta={(activity) => {
                const entry = activityQuery.data?.find((a) => a.id === activity.id);
                if (!entry?.project) return null;
                return (
                  <Link
                    to={`/projects/${entry.project.id}`}
                    className="text-accent hover:underline"
                  >
                    {entry.project.title}
                  </Link>
                );
              }}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
