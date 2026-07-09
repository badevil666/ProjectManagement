import { useParams } from 'react-router-dom';
import { useSharedProject, useShareComment, useShareTimeline } from '@/hooks/useShare';
import { shareApi } from '@/services/api';
import { isApiError } from '@/services/api/apiError';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import {
  ProjectHeader,
  ModuleList,
  FileList,
  CommentThread,
  ProjectTimeline,
} from '@/components/project';
import type { ProjectFile } from '@/types';

function LinkGoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-10 w-10"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244M3 3l18 18"
      />
    </svg>
  );
}

function NotFoundIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-10 w-10"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
      />
    </svg>
  );
}

export function SharedProject() {
  const { token } = useParams<{ token: string }>();
  const projectQuery = useSharedProject(token);
  const timelineQuery = useShareTimeline(token);
  const shareComment = useShareComment(token ?? '');

  if (!token) {
    return <EmptyState icon={<NotFoundIcon />} title="No share link provided" />;
  }

  if (projectQuery.isLoading) {
    return <LoadingState label="Loading project…" />;
  }

  if (projectQuery.isError) {
    const status = isApiError(projectQuery.error) ? projectQuery.error.status : undefined;
    if (status === 410) {
      return (
        <EmptyState
          icon={<LinkGoneIcon />}
          title="This link is no longer available"
          description="The developer has revoked this share link, or it has expired. Ask them for a new one."
        />
      );
    }
    if (status === 404) {
      return (
        <EmptyState
          icon={<NotFoundIcon />}
          title="Share link not found"
          description="Double-check the link you were given — it may have been mistyped."
        />
      );
    }
    return (
      <ErrorState
        message="Something went wrong loading this project."
        onRetry={() => projectQuery.refetch()}
      />
    );
  }

  const project = projectQuery.data;
  if (!project) {
    return <EmptyState icon={<NotFoundIcon />} title="Share link not found" />;
  }

  const handleDownload = (file: ProjectFile) => {
    const url = shareApi.fileDownloadUrl(token, file.id);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="space-y-6">
      <ProjectHeader
        title={project.title}
        description={project.description}
        client={project.client}
        status={project.status}
        priority={project.priority}
        overallProgress={project.overallProgress}
        budget={project.budget}
        currency={project.currency}
        startDate={project.startDate}
        expectedEndDate={project.expectedEndDate}
        actualEndDate={project.actualEndDate}
        readOnly
      />

      <Card>
        <CardHeader title="Modules" />
        <CardBody>
          <ModuleList modules={project.modules} readOnly />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Files" />
        <CardBody>
          <FileList
            files={project.files}
            modules={project.modules}
            readOnly
            onDownload={handleDownload}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Comments" />
        <CardBody>
          <CommentThread
            comments={project.comments}
            mode="client"
            isSubmitting={shareComment.isPending}
            errorMessage={
              shareComment.isError
                ? isApiError(shareComment.error)
                  ? shareComment.error.message
                  : 'Failed to post comment.'
                : null
            }
            onSubmitClient={(authorName, message) => shareComment.mutate({ authorName, message })}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Timeline" />
        <CardBody>
          <ProjectTimeline
            activities={timelineQuery.data}
            isLoading={timelineQuery.isLoading}
            isError={timelineQuery.isError}
            onRetry={() => timelineQuery.refetch()}
          />
        </CardBody>
      </Card>
    </div>
  );
}
