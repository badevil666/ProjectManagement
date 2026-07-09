import type { Activity } from '@/types';
import { Timeline } from '@/components/Timeline';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

interface ProjectTimelineProps {
  activities?: Activity[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function ProjectTimeline({ activities, isLoading, isError, onRetry }: ProjectTimelineProps) {
  if (isLoading) return <LoadingState label="Loading timeline…" />;
  if (isError)
    return <ErrorState message="Couldn't load the project timeline." onRetry={onRetry} />;
  return <Timeline activities={activities ?? []} emptyMessage="No activity recorded yet." />;
}
