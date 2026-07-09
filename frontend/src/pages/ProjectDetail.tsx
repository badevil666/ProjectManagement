import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { useModuleMutations } from '@/hooks/useModuleMutations';
import { useFeatureMutations } from '@/hooks/useFeatureMutations';
import { useDeleteFile, useFiles, useUploadFile } from '@/hooks/useFiles';
import { useCreateShareLink, useRevokeShareLink, useShareLinks } from '@/hooks/useShareLinks';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { useTimeline } from '@/hooks/useTimeline';
import { filesApi } from '@/services/api';
import { isApiError } from '@/services/api/apiError';
import { triggerBlobDownload } from '@/utils/download';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProjectFormModal } from '@/components/ProjectFormModal';
import {
  CommentThread,
  FeatureFormModal,
  FileList,
  FileUploadPanel,
  ModuleFormModal,
  ModuleList,
  ProjectHeader,
  ProjectTimeline,
  ShareLinkPanel,
} from '@/components/project';
import type { Feature, Module, ProjectFile, ProjectInput } from '@/types';

type ModuleModalState = { mode: 'create' } | { mode: 'edit'; module: Module } | null;
type FeatureModalState =
  | { mode: 'create'; moduleId: string }
  | { mode: 'edit'; feature: Feature }
  | null;

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectQuery = useProject(id);
  const updateProject = useUpdateProject();
  const clientsQuery = useClients({ limit: 100 });

  const moduleMutations = useModuleMutations(id ?? '');
  const featureMutations = useFeatureMutations(id ?? '');
  const filesQuery = useFiles(id);
  const uploadFile = useUploadFile(id ?? '');
  const deleteFile = useDeleteFile(id ?? '');
  const shareLinksQuery = useShareLinks(id);
  const createShareLink = useCreateShareLink(id ?? '');
  const revokeShareLink = useRevokeShareLink(id ?? '');
  const commentsQuery = useComments(id);
  const createComment = useCreateComment(id ?? '');
  const timelineQuery = useTimeline(id);

  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [moduleModal, setModuleModal] = useState<ModuleModalState>(null);
  const [featureModal, setFeatureModal] = useState<FeatureModalState>(null);
  const [deleteModuleTarget, setDeleteModuleTarget] = useState<Module | null>(null);
  const [deleteFeatureTarget, setDeleteFeatureTarget] = useState<Feature | null>(null);
  const [deleteFileTarget, setDeleteFileTarget] = useState<ProjectFile | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  if (!id) return <ErrorState message="Missing project id." />;
  if (projectQuery.isLoading) return <LoadingState label="Loading project…" />;
  if (projectQuery.isError || !projectQuery.data) {
    return (
      <ErrorState message="Couldn't load this project." onRetry={() => projectQuery.refetch()} />
    );
  }

  const project = projectQuery.data;

  const handleDownload = async (file: ProjectFile) => {
    setDownloadError(null);
    setDownloadingFileId(file.id);
    try {
      const blob = await filesApi.download(file.id);
      triggerBlobDownload(blob, file.name);
    } catch (error) {
      setDownloadError(isApiError(error) ? error.message : 'Failed to download file.');
    } finally {
      setDownloadingFileId(null);
    }
  };

  const moduleFormMutation =
    moduleModal?.mode === 'edit' ? moduleMutations.updateModule : moduleMutations.createModule;
  const featureFormMutation =
    featureModal?.mode === 'edit' ? featureMutations.updateFeature : featureMutations.createFeature;

  const busyModuleId = moduleMutations.updateStatus.isPending
    ? (moduleMutations.updateStatus.variables?.id ?? null)
    : null;
  const busyFeatureId = featureMutations.updateStatus.isPending
    ? (featureMutations.updateStatus.variables?.id ?? null)
    : null;

  return (
    <div className="space-y-6">
      <Link to="/projects" className="text-sm text-ink-muted hover:text-ink">
        ← Back to projects
      </Link>

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
        onEdit={() => setIsEditProjectOpen(true)}
      />

      <Card>
        <CardHeader title="Modules" description="Break the project into modules and features" />
        <CardBody>
          <ModuleList
            modules={project.modules}
            readOnly={false}
            busyModuleId={busyModuleId}
            busyFeatureId={busyFeatureId}
            onCreateModule={() => setModuleModal({ mode: 'create' })}
            onEditModule={(module) => setModuleModal({ mode: 'edit', module })}
            onDeleteModule={(module) => setDeleteModuleTarget(module)}
            onModuleStatusChange={(module, status) =>
              moduleMutations.updateStatus.mutate({ id: module.id, status })
            }
            onReorderModules={(order) => moduleMutations.reorderModules.mutate(order)}
            onCreateFeature={(module) => setFeatureModal({ mode: 'create', moduleId: module.id })}
            onEditFeature={(feature) => setFeatureModal({ mode: 'edit', feature })}
            onDeleteFeature={(feature) => setDeleteFeatureTarget(feature)}
            onFeatureStatusChange={(feature, status) =>
              featureMutations.updateStatus.mutate({ id: feature.id, status })
            }
            onReorderFeatures={(moduleId, order) =>
              featureMutations.reorderFeatures.mutate({ moduleId, order })
            }
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Files"
          description="Uploaded documents, scoped to the project or a specific module"
        />
        <CardBody className="space-y-4">
          <FileUploadPanel
            modules={project.modules}
            isUploading={uploadFile.isPending}
            progress={uploadProgress}
            errorMessage={
              uploadFile.isError
                ? isApiError(uploadFile.error)
                  ? uploadFile.error.message
                  : 'Upload failed.'
                : null
            }
            onUpload={(file, moduleId) => {
              setUploadProgress(0);
              uploadFile.mutate(
                { file, moduleId, onProgress: setUploadProgress },
                { onSettled: () => setUploadProgress(null) },
              );
            }}
          />
          {downloadError && (
            <p className="text-sm text-red-600 dark:text-red-400">{downloadError}</p>
          )}
          {filesQuery.isLoading ? (
            <LoadingState label="Loading files…" />
          ) : filesQuery.isError ? (
            <ErrorState message="Couldn't load files." onRetry={() => filesQuery.refetch()} />
          ) : (
            <FileList
              files={filesQuery.data ?? []}
              modules={project.modules}
              readOnly={false}
              downloadingFileId={downloadingFileId}
              deletingFileId={deleteFile.isPending ? (deleteFile.variables ?? null) : null}
              onDownload={handleDownload}
              onDelete={(file) => setDeleteFileTarget(file)}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Share links"
          description="Give the client read-only access without a login"
        />
        <CardBody>
          {shareLinksQuery.isLoading ? (
            <LoadingState label="Loading share links…" />
          ) : shareLinksQuery.isError ? (
            <ErrorState
              message="Couldn't load share links."
              onRetry={() => shareLinksQuery.refetch()}
            />
          ) : (
            <ShareLinkPanel
              shareLinks={shareLinksQuery.data ?? []}
              isCreating={createShareLink.isPending}
              revokingId={revokeShareLink.isPending ? (revokeShareLink.variables ?? null) : null}
              onCreate={(expiresAt) => createShareLink.mutate({ expiresAt })}
              onRevoke={(shareLinkId) => revokeShareLink.mutate(shareLinkId)}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Comments" />
        <CardBody>
          {commentsQuery.isLoading ? (
            <LoadingState label="Loading comments…" />
          ) : commentsQuery.isError ? (
            <ErrorState message="Couldn't load comments." onRetry={() => commentsQuery.refetch()} />
          ) : (
            <CommentThread
              comments={commentsQuery.data ?? []}
              mode="admin"
              isSubmitting={createComment.isPending}
              errorMessage={
                createComment.isError
                  ? isApiError(createComment.error)
                    ? createComment.error.message
                    : 'Failed to post comment.'
                  : null
              }
              onSubmitAdmin={(message) => createComment.mutate({ message })}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Timeline" description="Everything that has happened on this project" />
        <CardBody>
          <ProjectTimeline
            activities={timelineQuery.data}
            isLoading={timelineQuery.isLoading}
            isError={timelineQuery.isError}
            onRetry={() => timelineQuery.refetch()}
          />
        </CardBody>
      </Card>

      <ProjectFormModal
        isOpen={isEditProjectOpen}
        project={project}
        clients={clientsQuery.data?.data ?? []}
        isSubmitting={updateProject.isPending}
        errorMessage={
          updateProject.isError
            ? isApiError(updateProject.error)
              ? updateProject.error.message
              : 'Failed to update project.'
            : null
        }
        onSubmit={(body: ProjectInput) =>
          updateProject.mutate({ id, body }, { onSuccess: () => setIsEditProjectOpen(false) })
        }
        onClose={() => setIsEditProjectOpen(false)}
      />

      <ModuleFormModal
        isOpen={moduleModal !== null}
        module={moduleModal?.mode === 'edit' ? moduleModal.module : null}
        isSubmitting={moduleFormMutation.isPending}
        errorMessage={
          moduleFormMutation.isError
            ? isApiError(moduleFormMutation.error)
              ? moduleFormMutation.error.message
              : 'Failed to save module.'
            : null
        }
        onSubmit={(body) => {
          if (moduleModal?.mode === 'edit') {
            moduleMutations.updateModule.mutate(
              { id: moduleModal.module.id, body },
              { onSuccess: () => setModuleModal(null) },
            );
          } else {
            moduleMutations.createModule.mutate(body, { onSuccess: () => setModuleModal(null) });
          }
        }}
        onClose={() => setModuleModal(null)}
      />

      <FeatureFormModal
        isOpen={featureModal !== null}
        feature={featureModal?.mode === 'edit' ? featureModal.feature : null}
        isSubmitting={featureFormMutation.isPending}
        errorMessage={
          featureFormMutation.isError
            ? isApiError(featureFormMutation.error)
              ? featureFormMutation.error.message
              : 'Failed to save feature.'
            : null
        }
        onSubmit={(body) => {
          if (featureModal?.mode === 'edit') {
            featureMutations.updateFeature.mutate(
              { id: featureModal.feature.id, body },
              { onSuccess: () => setFeatureModal(null) },
            );
          } else if (featureModal?.mode === 'create') {
            featureMutations.createFeature.mutate(
              { moduleId: featureModal.moduleId, body },
              { onSuccess: () => setFeatureModal(null) },
            );
          }
        }}
        onClose={() => setFeatureModal(null)}
      />

      <ConfirmDialog
        isOpen={deleteModuleTarget !== null}
        title="Delete module"
        message={`Delete "${deleteModuleTarget?.title}"? This also deletes all of its features and file associations.`}
        confirmLabel="Delete"
        isLoading={moduleMutations.deleteModule.isPending}
        onConfirm={() => {
          if (!deleteModuleTarget) return;
          moduleMutations.deleteModule.mutate(deleteModuleTarget.id, {
            onSuccess: () => setDeleteModuleTarget(null),
          });
        }}
        onCancel={() => setDeleteModuleTarget(null)}
      />

      <ConfirmDialog
        isOpen={deleteFeatureTarget !== null}
        title="Delete feature"
        message={`Delete "${deleteFeatureTarget?.title}"?`}
        confirmLabel="Delete"
        isLoading={featureMutations.deleteFeature.isPending}
        onConfirm={() => {
          if (!deleteFeatureTarget) return;
          featureMutations.deleteFeature.mutate(deleteFeatureTarget.id, {
            onSuccess: () => setDeleteFeatureTarget(null),
          });
        }}
        onCancel={() => setDeleteFeatureTarget(null)}
      />

      <ConfirmDialog
        isOpen={deleteFileTarget !== null}
        title="Delete file"
        message={`Delete "${deleteFileTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteFile.isPending}
        onConfirm={() => {
          if (!deleteFileTarget) return;
          deleteFile.mutate(deleteFileTarget.id, { onSuccess: () => setDeleteFileTarget(null) });
        }}
        onCancel={() => setDeleteFileTarget(null)}
      />
    </div>
  );
}
