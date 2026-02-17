import {
  useCallback,
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { GridProps } from "../../utils/types";
import ModuleContent from "../ModuleContent/ModuleContent";
import { getThemeColors } from "../../utils/colors";
import Icon from "../Icon/Icon";

const Grid = forwardRef<any, GridProps>(
  (
    {
      modules,
      onDropModule,
      onMoveModule,
      onRemoveModule,
      onCellSizeChange,
      customColors,
      showScrollbars = false,
      active = true,
      draggingModule,
      onDragStart,
      onDragEnd,
      gridCols,
      gridRows,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [cellWidth, setCellWidth] = useState(0);
    const [cellHeight, setCellHeight] = useState(0);
    const [hoveredCell, setHoveredCell] = useState<{
      col: number;
      row: number;
    } | null>(null);
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [isValidPlacement, setIsValidPlacement] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [longPressTimer, setLongPressTimer] = useState<ReturnType<
      typeof setTimeout
    > | null>(null);
    const [removingModule, setRemovingModule] = useState<string | null>(null);
    const [isPoofing, setIsPoofing] = useState<boolean>(false);

    // Expose poofModuleByUrl to parent (App)
    useImperativeHandle(
      ref,
      () => ({
        async poofModuleByUrl(moduleUrl: string) {
          // Find the module by URL
          const mod = modules.find((m) => m.data.moduleUrl === moduleUrl);
          if (!mod) return;
          setRemovingModule(mod.id);
          setIsPoofing(true);
          await new Promise((res) => setTimeout(res, 500));
          setIsPoofing(false);
        },
      }),
      [modules],
    );

    // Fixed cell size of 200px
    useEffect(() => {
      const cellSize = 120;
      setCellWidth(cellSize);
      setCellHeight(cellSize);
      onCellSizeChange(cellSize);
    }, [onCellSizeChange]);

    // Convert pixel position to grid coordinates
    const pixelsToGrid = useCallback(
      (x: number, y: number) => ({
        col: Math.floor(x / cellWidth),
        row: Math.floor(y / cellHeight),
      }),
      [cellWidth, cellHeight],
    );

    // Handle mouse move - show highlight (works with both React and DOM events)
    const onMouseMove = useCallback(
      (e: MouseEvent | React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || !draggingModule) return;

        const bounds = containerRef.current.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const gridPos = pixelsToGrid(x, y);

        // Get module size
        const sizeMap: Record<string, { cols: number; rows: number }> = {
          "1x1": { cols: 1, rows: 1 },
          "1x2": { cols: 1, rows: 2 },
          "2x1": { cols: 2, rows: 1 },
          "2x2": { cols: 2, rows: 2 },
          "4x2": { cols: 4, rows: 2 },
          "2x4": { cols: 2, rows: 4 },
        };
        const moduleSize = sizeMap[draggingModule.data.size] || {
          cols: 1,
          rows: 1,
        };

        // Clamp to grid bounds
        gridPos.col = Math.max(
          0,
          Math.min(gridCols - moduleSize.cols, gridPos.col),
        );
        gridPos.row = Math.max(
          0,
          Math.min(gridRows - moduleSize.rows, gridPos.row),
        );

        setHoveredCell(gridPos);

        // Validate placement
        const inBounds =
          gridPos.col >= 0 &&
          gridPos.row >= 0 &&
          gridPos.col + moduleSize.cols <= gridCols &&
          gridPos.row + moduleSize.rows <= gridRows;

        let hasOverlap = false;
        if (inBounds) {
          for (const module of modules) {
            if (
              draggingModule.fromGrid &&
              module.id === draggingModule.fromGrid.id
            )
              continue;

            const mSize = sizeMap[module.data.size] || { cols: 1, rows: 1 };
            const mCol = Math.round(module.position.x / cellWidth);
            const mRow = Math.round(module.position.y / cellHeight);

            const overlapX =
              gridPos.col < mCol + mSize.cols &&
              gridPos.col + moduleSize.cols > mCol;
            const overlapY =
              gridPos.row < mRow + mSize.rows &&
              gridPos.row + moduleSize.rows > mRow;

            if (overlapX && overlapY) {
              hasOverlap = true;
              break;
            }
          }
        }

        setIsValidPlacement(inBounds && !hasOverlap);
      },
      [draggingModule, modules, pixelsToGrid, cellWidth, cellHeight],
    );

    // Handle mouse up - drop module (works with both React and DOM events)
    const onMouseUp = useCallback(
      (e: MouseEvent | React.MouseEvent<HTMLDivElement>) => {
        if (!draggingModule || !containerRef.current) {
          if (onDragEnd) onDragEnd();
          return;
        }

        const bounds = containerRef.current.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const gridPos = pixelsToGrid(x, y);

        const sizeMap: Record<string, { cols: number; rows: number }> = {
          "1x1": { cols: 1, rows: 1 },
          "1x2": { cols: 1, rows: 2 },
          "2x1": { cols: 2, rows: 1 },
          "2x2": { cols: 2, rows: 2 },
          "4x2": { cols: 4, rows: 2 },
          "2x4": { cols: 2, rows: 4 },
        };
        const moduleSize = sizeMap[draggingModule.data.size] || {
          cols: 1,
          rows: 1,
        };

        // Clamp to grid bounds
        gridPos.col = Math.max(
          0,
          Math.min(gridCols - moduleSize.cols, gridPos.col),
        );
        gridPos.row = Math.max(
          0,
          Math.min(gridRows - moduleSize.rows, gridPos.row),
        );

        // Only drop if valid
        if (isValidPlacement) {
          if (draggingModule.fromGrid) {
            // Moving existing module
            onMoveModule(draggingModule.fromGrid.id, gridPos);
          } else {
            // Placing new module
            onDropModule(draggingModule.data, gridPos);
          }
        }

        setHoveredCell(null);
        setIsValidPlacement(true);
        if (onDragEnd) onDragEnd();
      },
      [
        draggingModule,
        isValidPlacement,
        onDropModule,
        onMoveModule,
        onDragEnd,
        pixelsToGrid,
      ],
    );

    // Handle module removal with "poof" animation
    // Allow internal trigger for poof animation
    const handleRemoveModule = (moduleId: string) => {
      setRemovingModule(moduleId);
      setIsPoofing(true);
      setTimeout(() => {
        onRemoveModule(moduleId);
        setIsPoofing(false);
      }, 500);
    };

    // Add global mouse event listeners when dragging
    useEffect(() => {
      if (!draggingModule) return;

      const handleMouseMove = (e: MouseEvent) => {
        onMouseMove(e);
      };

      const handleMouseUp = (e: MouseEvent) => {
        onMouseUp(e);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }, [draggingModule, onMouseMove, onMouseUp]);

    const gridWidth = cellWidth * gridCols;
    const gridHeight = cellHeight * gridRows;
    const colors = getThemeColors(customColors);

    // Determine if background is light or dark
    const isLightBackground = () => {
      const hex = colors.background.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5;
    };

    const isLight = isLightBackground();

    return (
      <div
        style={{
          width: "100%",
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: colors.background,
        }}
      >
        <div
          style={{
            filter: isLight
              ? "none"
              : `drop-shadow(0 0 2px ${colors.accent}12) drop-shadow(0 0 40px ${colors.accent}10) drop-shadow(0 0 10px ${colors.accent}05)`,
          }}
        >
          <div
            data-testid="Grid"
            ref={containerRef}
            style={{
              width: gridWidth > 0 ? gridWidth : "100%",
              height: gridHeight > 0 ? gridHeight : "100%",
              position: "relative",
              background: colors.gridBackground,
              borderRadius: 6,
              overflow: "hidden",
            }}
            onClick={() => {
              setSelectedModule(null);
              setOpenMenuId(null);
            }}
          >
            {/* Dashed grid lines */}
            {cellWidth > 0 && (
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: gridWidth,
                  height: gridHeight,
                  pointerEvents: "none",
                }}
              >
                {/* Vertical lines */}
                {Array.from({ length: gridCols + 1 }).map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={i * cellWidth}
                    y1={0}
                    x2={i * cellWidth}
                    y2={gridHeight}
                    stroke={colors.gridLine}
                    strokeWidth="1"
                    strokeDasharray="8 12"
                    strokeDashoffset="14"
                  />
                ))}
                {/* Horizontal lines */}
                {Array.from({ length: gridRows + 1 }).map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1={0}
                    y1={i * cellHeight}
                    x2={gridWidth}
                    y2={i * cellHeight}
                    stroke={colors.gridLine}
                    strokeWidth="1"
                    strokeDasharray="8 12"
                    strokeDashoffset="14"
                  />
                ))}
              </svg>
            )}

            {/* Drag overlay highlight - green for valid, red for invalid (like Battleship) */}
            {draggingModule && hoveredCell && cellWidth > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: hoveredCell.col * cellWidth,
                  top: hoveredCell.row * cellHeight,
                  width: (() => {
                    const sizeMap: Record<
                      string,
                      { cols: number; rows: number }
                    > = {
                      "1x1": { cols: 1, rows: 1 },
                      "1x2": { cols: 1, rows: 2 },
                      "2x1": { cols: 2, rows: 1 },
                      "2x2": { cols: 2, rows: 2 },
                      "4x2": { cols: 4, rows: 2 },
                      "2x4": { cols: 2, rows: 4 },
                    };
                    return (
                      (
                        sizeMap[draggingModule.data.size] || {
                          cols: 1,
                          rows: 1,
                        }
                      ).cols * cellWidth
                    );
                  })(),
                  height: (() => {
                    const sizeMap: Record<
                      string,
                      { cols: number; rows: number }
                    > = {
                      "1x1": { cols: 1, rows: 1 },
                      "1x2": { cols: 1, rows: 2 },
                      "2x1": { cols: 2, rows: 1 },
                      "2x2": { cols: 2, rows: 2 },
                      "4x2": { cols: 4, rows: 2 },
                      "2x4": { cols: 2, rows: 4 },
                    };
                    return (
                      (
                        sizeMap[draggingModule.data.size] || {
                          cols: 1,
                          rows: 1,
                        }
                      ).rows * cellHeight
                    );
                  })(),
                  background: isValidPlacement
                    ? "rgba(34, 197, 94, 0.25)"
                    : "rgba(239, 68, 68, 0.25)",
                  border: isValidPlacement
                    ? `1px solid ${colors.success}`
                    : `1px solid ${colors.error}`,
                  borderRadius: 6,
                  boxSizing: "border-box",
                  pointerEvents: "none",
                  zIndex: 1000,
                  transition: "all 0.1s ease",
                }}
              />
            )}

            {/* Render modules */}
            {modules.map((module) => {
              const sizeMap: Record<string, { cols: number; rows: number }> = {
                "1x1": { cols: 1, rows: 1 },
                "1x2": { cols: 1, rows: 2 },
                "2x1": { cols: 2, rows: 1 },
                "2x2": { cols: 2, rows: 2 },
                "4x2": { cols: 4, rows: 2 },
                "2x4": { cols: 2, rows: 4 },
              };
              const moduleSize = sizeMap[module.data.size] || {
                cols: 1,
                rows: 1,
              };

              return (
                <div
                  key={module.id}
                  className={
                    removingModule === module.id && isPoofing
                      ? "module-poof"
                      : ""
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedModule(module.id);
                  }}
                  style={{
                    ...module.style,
                    position: "absolute",
                    left: module.position.x,
                    top: module.position.y,
                    width: moduleSize.cols * cellWidth,
                    height: moduleSize.rows * cellHeight,
                    border:
                      selectedModule === module.id
                        ? `2px solid ${colors.accent}`
                        : `1px solid ${colors.border}`,
                    boxShadow:
                      selectedModule === module.id
                        ? `0 0 0 2px rgba(74, 144, 226, 0.15)`
                        : "none",
                    opacity:
                      draggingModule?.fromGrid?.id === module.id ? 0.5 : 1,
                    cursor: "default",
                    transition:
                      draggingModule?.fromGrid?.id === module.id
                        ? "none"
                        : "all 0.2s ease",
                    userSelect: "none",
                  }}
                >
                  {/* Top-right controls */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: -4,
                      zIndex: 4,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Three-dot menu - click to open menu, long press to drag */}
                    <div
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (active && onDragStart) {
                          const timer = setTimeout(() => {
                            // Long press - start drag
                            setOpenMenuId(null); // Close menu if open
                            onDragStart({
                              data: module.data as any,
                              fromGrid: {
                                id: module.id,
                                originalPos: module.position,
                              },
                            });
                          }, 200); // 200ms long press
                          setLongPressTimer(timer);
                        }
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation();
                        if (longPressTimer) {
                          clearTimeout(longPressTimer);
                          setLongPressTimer(null);
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (longPressTimer) {
                          clearTimeout(longPressTimer);
                          setLongPressTimer(null);
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Only toggle menu if we didn't start dragging
                        if (!draggingModule) {
                          setOpenMenuId(
                            openMenuId === module.id ? null : module.id,
                          );
                        }
                      }}
                      style={{
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "grab",
                        fontSize: 14,
                        color: colors.text,
                        userSelect: "none",
                        opacity: 0.5,
                      }}
                      title="Click for menu, long press to drag"
                    >
                      <Icon name="menu" color={colors.text} size={16} />
                    </div>
                    {openMenuId === module.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: 28,
                          right: 3,
                          background: colors.surface,
                          border: `1px solid ${colors.border}`,
                          borderRadius: 6,
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                          minWidth: 160,
                          zIndex: 1000,
                        }}
                      >
                        {module.data.links && module.data.links.length > 0 && (
                          <>
                            {module.data.links.map((link: any, idx: number) => (
                              <div
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(link.url, "_blank");
                                  setOpenMenuId(null);
                                }}
                                style={{
                                  padding: "8px 12px",
                                  cursor: "pointer",
                                  fontSize: 13,
                                  fontFamily: "Montserrat, sans-serif",
                                  fontWeight: 400,
                                  color: colors.text,
                                  borderBottom:
                                    idx < module.data.links!.length - 1 || true
                                      ? `1px solid ${colors.border}`
                                      : "none",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background =
                                    colors.gridBackground;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    "transparent";
                                }}
                              >
                                <Icon
                                  name="link"
                                  color={colors.text}
                                  size={14}
                                  style={{ marginRight: 6 }}
                                />
                                {link.label}
                              </div>
                            ))}
                          </>
                        )}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveModule(module.id); // Trigger "poof" animation and then remove
                            setOpenMenuId(null);
                          }}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: 13,
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 400,
                            color: "#ef4444",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              colors.gridBackground;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <Icon
                            name="trash"
                            color={colors.error}
                            size={14}
                            style={{ marginRight: 6 }}
                          />
                          Remove
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      overflow: showScrollbars ? "scroll" : "auto",
                      boxSizing: "border-box",
                    }}
                  >
                    <ModuleContent
                      html={module.data.html}
                      js={module.data.js}
                      moduleUrl={module.data.moduleUrl}
                      label={module.data.label}
                      backgroundColor={colors.background}
                      thematicOverride={module.data.thematicOverride}
                      showScrollbars={showScrollbars}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);
export default Grid;
