import type { Activity, Comment } from '@prisma/client';
import type { ProjectDetail, ProjectListItem } from '../../repositories/projectRepository';
import { decimalToMoneyString } from '../../utils/money';
import { fileDownloadUrl, shareFileDownloadUrl } from '../../utils/urls';
import type { ProgressService } from '../progressService';
import { serializeActivity } from './activitySerializer';
import { serializeClient, serializeClientSummary } from './clientSerializer';
import { serializeComment } from './commentSerializer';
import { serializeFile } from './fileSerializer';
import { serializeModuleWithFeatures } from './moduleSerializer';
import { serializeShareLink } from './shareLinkSerializer';

function baseProjectFields(project: ProjectListItem | ProjectDetail) {
  return {
    id: project.id,
    clientId: project.clientId,
    title: project.title,
    description: project.description,
    status: project.status,
    priority: project.priority,
    startDate: project.startDate,
    expectedEndDate: project.expectedEndDate,
    actualEndDate: project.actualEndDate,
    overallProgress: project.overallProgress,
    budget: decimalToMoneyString(project.budget),
    currency: project.currency,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export function serializeProjectListItem(project: ProjectListItem) {
  return {
    ...baseProjectFields(project),
    createdBy: project.createdBy,
    client: serializeClientSummary(project.client),
  };
}

export function serializeProjectDetailForAdmin(
  project: ProjectDetail,
  progressService: ProgressService,
) {
  return {
    ...baseProjectFields(project),
    createdBy: project.createdBy,
    client: serializeClient(project.client),
    modules: project.modules.map((module) => serializeModuleWithFeatures(module, progressService)),
    files: project.files.map((file) => serializeFile(file, fileDownloadUrl(file.id))),
    shareLinks: project.shareLinks.map(serializeShareLink),
    commentCount: project._count.comments,
  };
}

/**
 * Public share-link project detail: same shape as the admin detail minus
 * internal fields (`createdBy`, `shareLinks`), plus embedded `comments` and
 * `timeline` per API_CONTRACT.md's `GET /api/share/:token` row. Budget is
 * intentionally included (spec: client should see budget).
 */
export function serializeProjectDetailForShare(
  project: ProjectDetail,
  progressService: ProgressService,
  token: string,
  comments: Comment[],
  timeline: Activity[],
) {
  return {
    ...baseProjectFields(project),
    client: serializeClient(project.client),
    modules: project.modules.map((module) => serializeModuleWithFeatures(module, progressService)),
    files: project.files.map((file) => serializeFile(file, shareFileDownloadUrl(token, file.id))),
    commentCount: project._count.comments,
    comments: comments.map(serializeComment),
    timeline: timeline.map(serializeActivity),
  };
}
