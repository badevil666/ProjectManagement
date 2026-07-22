import type { Feature, FeatureStatus, Module, ModuleStatus, ModuleWithFeatures } from '@/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ModuleCard } from './ModuleCard';

interface ModuleListProps {
  modules: ModuleWithFeatures[];
  readOnly: boolean;
  busyModuleId?: string | null;
  busyFeatureId?: string | null;
  onCreateModule?: () => void;
  onEditModule?: (module: Module) => void;
  onDeleteModule?: (module: Module) => void;
  onModuleStatusChange?: (module: Module, status: ModuleStatus) => void;
  onSendModuleUpdate?: (module: Module) => void;
  onReorderModules?: (order: string[]) => void;
  onCreateFeature?: (module: Module) => void;
  onEditFeature?: (feature: Feature) => void;
  onDeleteFeature?: (feature: Feature) => void;
  onFeatureStatusChange?: (feature: Feature, status: FeatureStatus) => void;
  onReorderFeatures?: (moduleId: string, order: string[]) => void;
}

export function ModuleList({
  modules,
  readOnly,
  busyModuleId,
  busyFeatureId,
  onCreateModule,
  onEditModule,
  onDeleteModule,
  onModuleStatusChange,
  onSendModuleUpdate,
  onReorderModules,
  onCreateFeature,
  onEditFeature,
  onDeleteFeature,
  onFeatureStatusChange,
  onReorderFeatures,
}: ModuleListProps) {
  const sorted = [...modules].sort((a, b) => a.orderNumber - b.orderNumber);

  const moveModule = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const reordered = [...sorted];
    const [moved] = reordered.splice(index, 1);
    if (!moved) return;
    reordered.splice(target, 0, moved);
    onReorderModules?.(reordered.map((m) => m.id));
  };

  return (
    <div className="space-y-3">
      {sorted.length === 0 ? (
        <EmptyState
          title="No modules yet"
          description={
            readOnly
              ? 'The development team has not added any modules yet.'
              : 'Break the project down into modules to start tracking progress.'
          }
          action={
            !readOnly && onCreateModule ? (
              <Button size="sm" onClick={onCreateModule}>
                + Add module
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {sorted.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              readOnly={readOnly}
              isFirst={index === 0}
              isLast={index === sorted.length - 1}
              isBusy={busyModuleId === module.id}
              busyFeatureId={busyFeatureId}
              onMoveUp={() => moveModule(index, -1)}
              onMoveDown={() => moveModule(index, 1)}
              onEdit={() => onEditModule?.(module)}
              onDelete={() => onDeleteModule?.(module)}
              onStatusChange={(status) => onModuleStatusChange?.(module, status)}
              onSendUpdate={onSendModuleUpdate ? () => onSendModuleUpdate(module) : undefined}
              onAddFeature={() => onCreateFeature?.(module)}
              onEditFeature={onEditFeature}
              onDeleteFeature={onDeleteFeature}
              onFeatureStatusChange={onFeatureStatusChange}
              onReorderFeatures={(order) => onReorderFeatures?.(module.id, order)}
            />
          ))}
          {!readOnly && onCreateModule && (
            <Button variant="secondary" size="sm" onClick={onCreateModule}>
              + Add module
            </Button>
          )}
        </>
      )}
    </div>
  );
}
