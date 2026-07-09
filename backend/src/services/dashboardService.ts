import type { IActivityRepository } from '../repositories/activityRepository';
import type { IClientRepository } from '../repositories/clientRepository';
import type { IProjectRepository } from '../repositories/projectRepository';
import { serializeActivityWithProject } from './serializers/activitySerializer';

export class DashboardService {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly activityRepository: IActivityRepository,
  ) {}

  async getStats() {
    const [totalClients, totalProjects, activeProjects, completedProjects, totalOverdue] =
      await Promise.all([
        this.clientRepository.count({}),
        this.projectRepository.countAll(),
        this.projectRepository.countByStatuses(['PLANNING', 'IN_PROGRESS', 'ON_HOLD']),
        this.projectRepository.countByStatuses(['COMPLETED']),
        this.projectRepository.countOverdueActive(),
      ]);

    return { totalClients, totalProjects, activeProjects, completedProjects, totalOverdue };
  }

  async getRecentActivity(limit: number) {
    const activities = await this.activityRepository.listRecentAcrossProjects(limit);
    return activities.map(serializeActivityWithProject);
  }
}
