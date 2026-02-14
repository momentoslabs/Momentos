import type { PlacedModule, ModuleSize } from "./types";
import { SIZE_GRID_UNITS } from "./constants";

export const wouldOverlap = (
  modules: PlacedModule[],
  newGridPos: { col: number; row: number },
  newSize: { cols: number; rows: number },
  excludeId?: string,
  cellSize?: number,
): boolean => {
  if (!cellSize) return false;

  for (const module of modules) {
    if (excludeId && module.id === excludeId) continue;

    const size = module.data.size as ModuleSize;
    const { cols, rows } = SIZE_GRID_UNITS[size];
    const existingCol = Math.round(module.position.x / cellSize);
    const existingRow = Math.round(module.position.y / cellSize);

    // Check if rectangles overlap
    const overlapX =
      newGridPos.col < existingCol + cols &&
      newGridPos.col + newSize.cols > existingCol;
    const overlapY =
      newGridPos.row < existingRow + rows &&
      newGridPos.row + newSize.rows > existingRow;

    if (overlapX && overlapY) return true;
  }
  return false;
};
