/**
 * Composition root: instantiates repositories, then services (constructor
 * injection of repository interfaces), then exports singleton service
 * instances for controllers to use. This is the ONLY place services are
 * wired together — no DI framework needed at this scale.
 */
import { env } from './config/env';
import { activityRepository } from './repositories/activityRepository';
import { clientRepository } from './repositories/clientRepository';
import { commentRepository } from './repositories/commentRepository';
import { featureRepository } from './repositories/featureRepository';
import { fileRepository } from './repositories/fileRepository';
import { moduleRepository } from './repositories/moduleRepository';
import { notificationRepository } from './repositories/notificationRepository';
import { projectRepository } from './repositories/projectRepository';
import { shareLinkRepository } from './repositories/shareLinkRepository';
import { userRepository } from './repositories/userRepository';
import { ActivityService } from './services/activityService';
import { AuthService } from './services/authService';
import { ClientService } from './services/clientService';
import { CommentService } from './services/commentService';
import { DashboardService } from './services/dashboardService';
import { FeatureService } from './services/featureService';
import { FileService } from './services/fileService';
import { createEmailSender } from './services/mailer';
import { ModuleService } from './services/moduleService';
import { NotificationService } from './services/notificationService';
import { ProgressService } from './services/progressService';
import { ProjectNotificationService } from './services/projectNotificationService';
import { ProjectService } from './services/projectService';
import { ShareLinkService } from './services/shareLinkService';
import { LocalStorageService } from './services/storage/LocalStorageService';
import type { StorageService } from './services/storage/StorageService';

export const storageService: StorageService = new LocalStorageService(env.uploadDir);
const emailSender = createEmailSender();

export const activityService = new ActivityService(activityRepository);
export const notificationService = new NotificationService(notificationRepository, emailSender);
export const progressService = new ProgressService(moduleRepository, projectRepository);
export const projectNotificationService = new ProjectNotificationService(
  projectRepository,
  notificationService,
  progressService,
);

export const authService = new AuthService(userRepository);

export const clientService = new ClientService(clientRepository, fileRepository, storageService);

export const projectService = new ProjectService(
  projectRepository,
  clientRepository,
  fileRepository,
  commentRepository,
  storageService,
  activityService,
  progressService,
);

export const moduleService = new ModuleService(
  moduleRepository,
  featureRepository,
  projectRepository,
  activityService,
  progressService,
);

export const featureService = new FeatureService(
  featureRepository,
  moduleRepository,
  activityService,
  progressService,
);

export const fileService = new FileService(
  fileRepository,
  projectRepository,
  moduleRepository,
  storageService,
  activityService,
);

export const commentService = new CommentService(
  commentRepository,
  projectRepository,
  activityService,
  notificationService,
);

export const shareLinkService = new ShareLinkService(
  shareLinkRepository,
  projectRepository,
  activityService,
);

export const dashboardService = new DashboardService(
  clientRepository,
  projectRepository,
  activityRepository,
);
