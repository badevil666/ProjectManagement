import type { Feature, FeatureStatus } from '@/types';
import { FeatureRow } from './FeatureRow';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

interface FeatureListProps {
  features: Feature[];
  readOnly: boolean;
  busyFeatureId?: string | null;
  onAddFeature?: () => void;
  onEditFeature?: (feature: Feature) => void;
  onDeleteFeature?: (feature: Feature) => void;
  onStatusChange?: (feature: Feature, status: FeatureStatus) => void;
  onReorder?: (order: string[]) => void;
}

export function FeatureList({
  features,
  readOnly,
  busyFeatureId,
  onAddFeature,
  onEditFeature,
  onDeleteFeature,
  onStatusChange,
  onReorder,
}: FeatureListProps) {
  const sorted = [...features].sort((a, b) => a.orderNumber - b.orderNumber);

  const moveFeature = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const reordered = [...sorted];
    const [moved] = reordered.splice(index, 1);
    if (!moved) return;
    reordered.splice(target, 0, moved);
    onReorder?.(reordered.map((f) => f.id));
  };

  return (
    <div className="rounded-md border border-border bg-surface-alt/40">
      {sorted.length === 0 ? (
        <EmptyState
          title="No features yet"
          description={readOnly ? undefined : 'Break this module down into features to track.'}
          className="py-6"
        />
      ) : (
        sorted.map((feature, index) => (
          <FeatureRow
            key={feature.id}
            feature={feature}
            readOnly={readOnly}
            isFirst={index === 0}
            isLast={index === sorted.length - 1}
            isBusy={busyFeatureId === feature.id}
            onMoveUp={() => moveFeature(index, -1)}
            onMoveDown={() => moveFeature(index, 1)}
            onEdit={() => onEditFeature?.(feature)}
            onDelete={() => onDeleteFeature?.(feature)}
            onStatusChange={(status) => onStatusChange?.(feature, status)}
          />
        ))
      )}
      {!readOnly && (
        <div className="border-t border-border px-4 py-2">
          <Button variant="ghost" size="sm" onClick={onAddFeature}>
            + Add feature
          </Button>
        </div>
      )}
    </div>
  );
}
