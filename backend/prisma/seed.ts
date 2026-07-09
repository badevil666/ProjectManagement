/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { env } from '../src/config/env';
import { LocalStorageService } from '../src/services/storage/LocalStorageService';
import { hashPassword } from '../src/utils/password';
import { generateShareToken } from '../src/utils/shareToken';

/**
 * ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME are consumed ONLY by this seed
 * script — they are intentionally NOT part of `config/env.ts`'s schema
 * (which the running server uses), per the spec.
 */
const seedEnvSchema = z.object({
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email'),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD must be at least 8 characters'),
  ADMIN_NAME: z.string().min(1, 'ADMIN_NAME is required'),
});

function loadSeedEnv() {
  const parsed = seedEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid seed environment configuration — missing/invalid variables:');
    console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
    process.exit(1);
  }
  return parsed.data;
}

const prisma = new PrismaClient();
const storage = new LocalStorageService(env.uploadDir);

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function completionPercentage(features: { status: string }[]): number {
  if (features.length === 0) return 0;
  const completed = features.filter((f) => f.status === 'COMPLETED').length;
  return Math.round((completed / features.length) * 100);
}

interface FeatureSeed {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  estimatedHours?: string;
}

interface ModuleSeed {
  title: string;
  description?: string;
  estimatedHours?: string;
  features: FeatureSeed[];
}

async function upsertClient(data: {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  industry?: string;
  notes?: string;
}) {
  return prisma.client.upsert({
    where: { email: data.email },
    update: {
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      phone: data.phone,
      address: data.address,
      industry: data.industry,
      notes: data.notes,
    },
    create: data,
  });
}

async function findOrCreateProject(data: {
  clientId: string;
  title: string;
  description: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  budget: string;
  currency: string;
  createdBy: string;
}) {
  const existing = await prisma.project.findFirst({
    where: { clientId: data.clientId, title: data.title },
  });
  if (existing) return existing;
  return prisma.project.create({ data });
}

async function findOrCreateModule(
  projectId: string,
  orderNumber: number,
  seed: ModuleSeed,
): Promise<{ id: string; features: { id: string; status: string }[] }> {
  let module = await prisma.module.findFirst({ where: { projectId, title: seed.title } });
  if (!module) {
    module = await prisma.module.create({
      data: {
        projectId,
        title: seed.title,
        description: seed.description,
        orderNumber,
        estimatedHours: seed.estimatedHours,
      },
    });
  }

  const features: { id: string; status: string }[] = [];
  for (const [index, featureSeed] of seed.features.entries()) {
    let feature = await prisma.feature.findFirst({
      where: { moduleId: module.id, title: featureSeed.title },
    });
    if (!feature) {
      feature = await prisma.feature.create({
        data: {
          moduleId: module.id,
          title: featureSeed.title,
          description: featureSeed.description,
          priority: featureSeed.priority ?? 'MEDIUM',
          status: featureSeed.status,
          orderNumber: index,
          estimatedHours: featureSeed.estimatedHours,
          completedAt: featureSeed.status === 'COMPLETED' ? new Date() : null,
        },
      });
    }
    features.push({ id: feature.id, status: feature.status });
  }

  const allComplete = features.length > 0 && features.every((f) => f.status === 'COMPLETED');
  if (allComplete && module.status !== 'COMPLETED') {
    module = await prisma.module.update({
      where: { id: module.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }

  return { id: module.id, features };
}

async function seedProjectContent(
  adminId: string,
  project: { id: string; title: string; status: string },
  modules: ModuleSeed[],
) {
  const moduleResults = [];
  for (const [index, moduleSeed] of modules.entries()) {
    moduleResults.push(await findOrCreateModule(project.id, index, moduleSeed));
  }

  const overallProgress = Math.round(
    moduleResults.reduce((sum, m) => sum + completionPercentage(m.features), 0) /
      Math.max(moduleResults.length, 1),
  );
  await prisma.project.update({ where: { id: project.id }, data: { overallProgress } });

  // Timeline/comments/share-link are only seeded once (idempotent re-runs).
  const existingActivityCount = await prisma.activity.count({ where: { projectId: project.id } });
  if (existingActivityCount > 0) {
    return { overallProgress };
  }

  await prisma.activity.create({
    data: {
      projectId: project.id,
      type: 'PROJECT_CREATED',
      message: `Project "${project.title}" was created`,
      createdBy: adminId,
    },
  });

  for (const [i, moduleSeed] of modules.entries()) {
    const moduleResult = moduleResults[i];
    if (!moduleResult) continue;

    await prisma.activity.create({
      data: {
        projectId: project.id,
        type: 'MODULE_CREATED',
        message: `Module "${moduleSeed.title}" was created`,
        createdBy: adminId,
      },
    });

    for (const featureSeed of moduleSeed.features) {
      await prisma.activity.create({
        data: {
          projectId: project.id,
          type: 'FEATURE_CREATED',
          message: `Feature "${featureSeed.title}" was created`,
          createdBy: adminId,
        },
      });
      if (featureSeed.status === 'COMPLETED') {
        await prisma.activity.create({
          data: {
            projectId: project.id,
            type: 'FEATURE_COMPLETED',
            message: `Feature "${featureSeed.title}" completed`,
            createdBy: adminId,
          },
        });
      }
    }

    if (completionPercentage(moduleResult.features) === 100 && moduleResult.features.length > 0) {
      await prisma.activity.create({
        data: {
          projectId: project.id,
          type: 'MODULE_COMPLETED',
          message: `Module "${moduleSeed.title}" completed`,
          createdBy: adminId,
        },
      });
    }
  }

  // Sample file upload.
  const stored = await storage.save({
    buffer: Buffer.from(
      `Kickoff notes for ${project.title}\n\nGenerated by the Client Portal seed script for demo purposes.`,
      'utf-8',
    ),
    originalName: 'kickoff-notes.txt',
    mimeType: 'text/plain',
  });
  await prisma.file.create({
    data: {
      projectId: project.id,
      name: 'kickoff-notes.txt',
      url: stored.url,
      size: stored.size,
      mimeType: 'text/plain',
      uploadedBy: adminId,
      storageProvider: 'LOCAL',
      storageKey: stored.key,
    },
  });
  await prisma.activity.create({
    data: {
      projectId: project.id,
      type: 'FILE_UPLOADED',
      message: 'File "kickoff-notes.txt" was uploaded',
      createdBy: adminId,
    },
  });

  // Sample comments (one admin, one client).
  await prisma.comment.create({
    data: {
      projectId: project.id,
      authorType: 'ADMIN',
      authorName: 'Admin',
      message: `Kicking off "${project.title}" — excited to get started!`,
    },
  });
  await prisma.activity.create({
    data: {
      projectId: project.id,
      type: 'COMMENT_ADDED',
      message: 'Admin commented: "Kicking off — excited to get started!"',
      createdBy: adminId,
    },
  });

  await prisma.comment.create({
    data: {
      projectId: project.id,
      authorType: 'CLIENT',
      authorName: 'Client Stakeholder',
      message: 'Looks great so far, thanks for the update!',
    },
  });
  await prisma.activity.create({
    data: {
      projectId: project.id,
      type: 'COMMENT_ADDED',
      message:
        'Client Stakeholder (client) commented: "Looks great so far, thanks for the update!"',
      createdBy: null,
    },
  });

  return { overallProgress };
}

async function main() {
  const seedEnv = loadSeedEnv();

  console.log('Seeding admin user...');
  const passwordHash = await hashPassword(seedEnv.ADMIN_PASSWORD);
  const admin = await prisma.user.upsert({
    where: { email: seedEnv.ADMIN_EMAIL },
    update: { name: seedEnv.ADMIN_NAME, passwordHash },
    create: {
      email: seedEnv.ADMIN_EMAIL,
      name: seedEnv.ADMIN_NAME,
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('Seeding demo clients...');
  const acme = await upsertClient({
    companyName: 'Acme Corp',
    contactPerson: 'Jane Doe',
    email: 'jane@acme.test',
    phone: '+1-555-0100',
    address: '123 Market St, San Francisco, CA',
    industry: 'Retail',
    notes: 'Long-standing client, prefers weekly check-ins.',
  });

  const globex = await upsertClient({
    companyName: 'Globex Inc',
    contactPerson: 'John Smith',
    email: 'john@globex.test',
    phone: '+1-555-0142',
    address: '500 Industrial Ave, Austin, TX',
    industry: 'Manufacturing',
    notes: 'Interested in phase 2 once phase 1 wraps up.',
  });

  const initech = await upsertClient({
    companyName: 'Initech',
    contactPerson: 'Peter Gibbons',
    email: 'peter@initech.test',
    phone: '+1-555-0199',
    address: '4120 Freidrich Ln, Austin, TX',
    industry: 'Software',
    notes: 'Small internal tools project, quick turnaround.',
  });

  console.log('Seeding demo projects...');

  const acmeProject = await findOrCreateProject({
    clientId: acme.id,
    title: 'Acme E-Commerce Platform Rebuild',
    description: 'Full rebuild of the Acme storefront, checkout, and customer account experience.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    startDate: daysFromNow(-45),
    expectedEndDate: daysFromNow(45),
    budget: '45000.00',
    currency: 'USD',
    createdBy: admin.id,
  });

  const globexProject = await findOrCreateProject({
    clientId: globex.id,
    title: 'Globex Inventory Management System',
    description: 'Warehouse scanning and reporting dashboard for real-time inventory visibility.',
    status: 'PLANNING',
    priority: 'MEDIUM',
    startDate: daysFromNow(-10),
    expectedEndDate: daysFromNow(90),
    budget: '28000.00',
    currency: 'USD',
    createdBy: admin.id,
  });

  const initechProject = await findOrCreateProject({
    clientId: initech.id,
    title: 'Initech Internal Time Tracker',
    description: 'Lightweight internal tool for employee time entry and admin reporting.',
    status: 'COMPLETED',
    priority: 'LOW',
    startDate: daysFromNow(-60),
    expectedEndDate: daysFromNow(-5),
    actualEndDate: daysFromNow(-3),
    budget: '8000.00',
    currency: 'USD',
    createdBy: admin.id,
  });

  const acmeProgress = await seedProjectContent(admin.id, acmeProject, [
    {
      title: 'Product Catalog',
      description: 'Browsing, search, and product detail pages.',
      estimatedHours: '80.00',
      features: [
        {
          title: 'Product listing grid',
          status: 'COMPLETED',
          priority: 'HIGH',
          estimatedHours: '20.00',
        },
        {
          title: 'Full-text search',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          estimatedHours: '24.00',
        },
        {
          title: 'Product detail page',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          estimatedHours: '16.00',
        },
      ],
    },
    {
      title: 'Checkout & Payments',
      description: 'Cart, checkout flow, and payment gateway integration.',
      estimatedHours: '100.00',
      features: [
        { title: 'Shopping cart', status: 'COMPLETED', priority: 'HIGH', estimatedHours: '18.00' },
        { title: 'Stripe integration', status: 'TODO', priority: 'HIGH', estimatedHours: '30.00' },
        {
          title: 'Order confirmation emails',
          status: 'TODO',
          priority: 'MEDIUM',
          estimatedHours: '10.00',
        },
        { title: 'Discount codes', status: 'TODO', priority: 'LOW', estimatedHours: '12.00' },
      ],
    },
    {
      title: 'Customer Accounts',
      description: 'Registration, login, and order history.',
      estimatedHours: '40.00',
      features: [
        {
          title: 'Account registration',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          estimatedHours: '12.00',
        },
        {
          title: 'Order history view',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          estimatedHours: '14.00',
        },
      ],
    },
  ]);

  await seedProjectContent(admin.id, globexProject, [
    {
      title: 'Warehouse Scanning',
      description: 'Barcode scanning app for warehouse staff.',
      estimatedHours: '60.00',
      features: [
        {
          title: 'Barcode scan-in flow',
          status: 'TODO',
          priority: 'HIGH',
          estimatedHours: '20.00',
        },
        {
          title: 'Bin location mapping',
          status: 'TODO',
          priority: 'MEDIUM',
          estimatedHours: '20.00',
        },
        { title: 'Offline mode', status: 'TODO', priority: 'LOW', estimatedHours: '20.00' },
      ],
    },
    {
      title: 'Reporting Dashboard',
      description: 'Real-time stock level and movement reports.',
      estimatedHours: '40.00',
      features: [
        {
          title: 'Stock level widget',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          estimatedHours: '16.00',
        },
        {
          title: 'Movement history report',
          status: 'TODO',
          priority: 'MEDIUM',
          estimatedHours: '24.00',
        },
      ],
    },
  ]);

  await seedProjectContent(admin.id, initechProject, [
    {
      title: 'Time Entry UI',
      description: 'Simple daily time entry form for employees.',
      estimatedHours: '24.00',
      features: [
        {
          title: 'Daily time entry form',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          estimatedHours: '12.00',
        },
        {
          title: 'Weekly summary view',
          status: 'COMPLETED',
          priority: 'LOW',
          estimatedHours: '12.00',
        },
      ],
    },
    {
      title: 'Admin Reports',
      description: 'CSV export and team totals for managers.',
      estimatedHours: '16.00',
      features: [
        { title: 'CSV export', status: 'COMPLETED', priority: 'MEDIUM', estimatedHours: '8.00' },
        {
          title: 'Team totals dashboard',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          estimatedHours: '8.00',
        },
      ],
    },
  ]);

  console.log(`Acme project overallProgress: ${acmeProgress.overallProgress}%`);

  console.log('Seeding an active share link...');
  const existingShareLink = await prisma.shareLink.findFirst({
    where: { projectId: acmeProject.id, revoked: false },
  });
  if (!existingShareLink) {
    const token = generateShareToken();
    await prisma.shareLink.create({
      data: {
        projectId: acmeProject.id,
        token,
        expiresAt: null,
        createdBy: admin.id,
      },
    });
    await prisma.activity.create({
      data: {
        projectId: acmeProject.id,
        type: 'SHARE_LINK_CREATED',
        message: 'A new share link was created',
        createdBy: admin.id,
      },
    });
    console.log(`Demo share link: /share/${token}`);
  } else {
    console.log(`Existing demo share link token: ${existingShareLink.token}`);
  }

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
