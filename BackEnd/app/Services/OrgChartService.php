<?php

namespace App\Services;

use App\Models\Position;

class OrgChartService
{
    /**
     * Check if setting newParentId as parent of positionId would create a cycle.
     */
    public function wouldCreateCycle(int $positionId, ?int $newParentId): bool
    {
        if ($newParentId === null) return false;
        if ($newParentId === $positionId) return true;

        $visited = [];
        $current = $newParentId;

        while ($current !== null) {
            if (in_array($current, $visited)) return true;
            if ($current === $positionId) return true;

            $visited[] = $current;
            $current = Position::find($current)?->parent_position_id;

            if (count($visited) > 50) break; // safety guard for deep trees
        }

        return false;
    }

    /**
     * Recalculate the hierarchy level by traversing up from the given position.
     */
    public function recalculateLevel(Position $position): int
    {
        $level = 0;
        $current = $position->parent_position_id;

        while ($current !== null) {
            $level++;
            $current = Position::find($current)?->parent_position_id;
            if ($level > 20) break; // safety guard
        }

        return $level;
    }

    /**
     * Recursively update hierarchy_level for all descendants of a moved position.
     */
    public function updateDescendantLevels(Position $position, int $baseLevel): void
    {
        $position->update(['hierarchy_level' => $baseLevel]);

        foreach ($position->children as $child) {
            $this->updateDescendantLevels($child, $baseLevel + 1);
        }
    }

    /**
     * Build org chart nodes and edges from positions collection.
     */
    public function buildChartData($positions): array
    {
        $nodes = $positions->map(fn($p) => [
            'id'       => (string) $p->id,
            'type'     => 'orgNode',
            'position' => ['x' => 0, 'y' => 0],
            'data'     => [
                'positionId'     => $p->id,
                'title'          => $p->title,
                'isManagerial'   => (bool) $p->is_managerial,
                'hierarchyLevel' => $p->hierarchy_level,
                'department'     => $p->department?->name,
                'departmentId'   => $p->department_id,
                'isVacant'       => $p->employee === null,
                'employee'       => $p->employee ? [
                    'id'       => $p->employee->id,
                    'name'     => $p->employee->full_name,
                    'jobTitle' => $p->employee->job_title,
                    'avatar'   => $p->employee->profile_pic_url,
                ] : null,
            ],
        ]);

        $edges = $positions
            ->filter(fn($p) => $p->parent_position_id !== null)
            ->map(fn($p) => [
                'id'     => "e{$p->parent_position_id}-{$p->id}",
                'source' => (string) $p->parent_position_id,
                'target' => (string) $p->id,
                'type'   => 'smoothstep',
            ]);

        return [
            'nodes' => $nodes->values(),
            'edges' => $edges->values(),
        ];
    }
}
