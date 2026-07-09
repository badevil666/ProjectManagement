import { Router } from 'express';
import { requireAdmin } from '../middlewares/requireAdmin';
import { requireAuth } from '../middlewares/requireAuth';
import { shareRateLimiter } from '../middlewares/rateLimiter';

import authRoutes from './auth.routes';
import clientRoutes from './client.routes';
import * as commentRoutes from './comment.routes';
import dashboardRoutes from './dashboard.routes';
import * as featureRoutes from './feature.routes';
import * as fileRoutes from './file.routes';
import healthRoutes from './health.routes';
import * as moduleRoutes from './module.routes';
import projectRoutes from './project.routes';
import shareRoutes from './share.routes';
import * as shareLinkRoutes from './shareLink.routes';

const router = Router();

const adminOnly = [requireAuth, requireAdmin];

// --- Public, unauthenticated -------------------------------------------------
router.use('/health', healthRoutes);
router.use('/auth', authRoutes); // login is public; /me is guarded inline
router.use('/share', shareRateLimiter, shareRoutes);

// --- Admin (JWT-protected) ----------------------------------------------------
router.use('/dashboard', ...adminOnly, dashboardRoutes);
router.use('/clients', ...adminOnly, clientRoutes);

// Nested resource routes MUST be mounted before their parent's generic
// `/projects` router so more specific paths (e.g. `/projects/:id/modules`)
// are matched first.
router.use('/projects/:projectId/modules', ...adminOnly, moduleRoutes.nestedModuleRouter);
router.use('/projects/:projectId/share-links', ...adminOnly, shareLinkRoutes.nestedShareLinkRouter);
router.use('/projects/:projectId/comments', ...adminOnly, commentRoutes.nestedCommentRouter);
router.use('/projects/:projectId/files', ...adminOnly, fileRoutes.nestedFileRouter);
router.use('/projects', ...adminOnly, projectRoutes);

router.use('/modules/:moduleId/features', ...adminOnly, featureRoutes.nestedFeatureRouter);
router.use('/modules', ...adminOnly, moduleRoutes.moduleByIdRouter);
router.use('/features', ...adminOnly, featureRoutes.featureByIdRouter);
router.use('/files', ...adminOnly, fileRoutes.fileByIdRouter);
router.use('/share-links', ...adminOnly, shareLinkRoutes.shareLinkByIdRouter);

export default router;
