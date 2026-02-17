import { useState } from "react";
import { ModuleCardProps } from "../../utils/types";
import { getThemeColors } from "../../utils/colors";
import Icon from "../Icon/Icon";

const ModuleCard = ({
  module,
  onDragStart,
  onRemove,
  onAdd,
  showAddButton,
  customColors,
  isInGrid = false,
}: ModuleCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const colors = getThemeColors(customColors);
  const cardBg = colors.surface;
  const borderColor = colors.border;
  const previewBg = colors.gridBackground;
  const textColor = colors.text;
  const sizeBadgeBg = colors.gridBackground;

  const [showFullName, setShowFullName] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Helper to truncate text
  const truncate = (str: string, n: number) =>
    str.length > n ? str.slice(0, n) + "..." : str;

  // Preview image logic
  const previewImg = module.previewImg || null;

  return (
    <div
      data-testid="ModuleCard"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 260,
        background: cardBg,
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        border: `1px solid ${borderColor}`,
        transition: "all 0.2s ease",
        fontFamily: "Montserrat, sans-serif",
        opacity: isInGrid ? 0.7 : 1,
        cursor: isInGrid ? "not-allowed" : undefined,
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
      title={isInGrid ? "Module already in grid" : undefined}
    >
      <div
        onMouseDown={(e) => {
          if (isInGrid) return;
          if (onDragStart) {
            e.preventDefault();
            setIsDragging(true);
            onDragStart({ data: module });
          }
        }}
        onMouseOut={(e) => {
          setIsDragging(false);
        }}
        style={{
          flex: 1,
          cursor: isInGrid ? "not-allowed" : onDragStart ? "grab" : "default",
          opacity: isDragging ? 0.5 : 1,
          transform: isDragging ? "scale(0.95)" : "scale(1)",
          pointerEvents: isInGrid ? "none" : undefined,
        }}
        onMouseEnter={(e) => {
          if (isInGrid) {
            e.currentTarget.style.cursor = "not-allowed";
            e.currentTarget.style.setProperty(
              "cursor",
              "not-allowed",
              "important",
            );
            e.currentTarget.title = "Module already in grid";
            return;
          }
          if (!isDragging && onDragStart) {
            e.currentTarget.style.transform = "scale(1.02)";
          }
        }}
        onMouseLeave={(e) => {
          if (isInGrid) {
            e.currentTarget.style.cursor = "not-allowed";
            e.currentTarget.title = "Module already in grid";
            return;
          }
          if (!isDragging) {
            e.currentTarget.style.transform = "scale(1)";
          }
        }}
      >
        {/* ...existing code for preview, name, description... */}
        {/* Preview image logic and text content remain unchanged */}
        {/* ...existing code... */}
        <div
          style={{
            height: 128,
            background: previewBg,
            borderRadius: 6,
            marginBottom: 10,
            padding: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontFamily: "Montserrat, sans-serif",
            overflow: "hidden",
          }}
        >
          {previewImg ? (
            <img
              src={previewImg}
              alt="Module preview"
              style={{ maxHeight: "100%", maxWidth: "100%", borderRadius: 6 }}
            />
          ) : (
            <span style={{ fontSize: 64 }} title="No preview">
              📦
            </span>
          )}
        </div>
        <div style={{ marginBottom: 4, userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none" }}>
          <span
            style={{
              fontSize: 14,
              color: textColor,
              fontFamily: "Montserrat, sans-serif",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
          >
            {showFullName ? module.name : truncate(module.name, 32)}
            {module.name.length > 32 && !showFullName && (
              <button
                style={{
                  marginLeft: 6,
                  fontSize: 11,
                  background: "none",
                  border: "none",
                  color: colors.accent,
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontFamily: "inherit",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullName(true);
                }}
              >
                Read more
              </button>
            )}
          </span>
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              opacity: 0.5,
              background: sizeBadgeBg,
              color: textColor,
              padding: "2px 6px",
              borderRadius: 4,
              fontFamily: "Montserrat, sans-serif",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
          >
            {module.size}
          </span>
        </div>
        <div
          style={{
            fontSize: 11,
            opacity: 0.7,
            margin: 0,
            color: textColor,
            fontFamily: "Montserrat, sans-serif",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          {showFullDesc ? module.description : truncate(module.description, 64)}
          {module.description.length > 64 && !showFullDesc && (
            <button
              style={{
                marginLeft: 6,
                fontSize: 10,
                background: "none",
                border: "none",
                color: colors.accent,
                cursor: "pointer",
                textDecoration: "underline",
                fontFamily: "inherit",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowFullDesc(true);
              }}
            >
              Read more
            </button>
          )}
        </div>
      </div>
      {/* Action buttons row at the bottom */}
      {(onRemove || (showAddButton && onAdd)) && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          {onRemove && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              style={{
                marginRight: -4,
                marginBottom: -4,
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 16,
                color: colors.error,
                borderRadius: 4,
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.gridBackground;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon name="trash" color={colors.error} size={16} />
            </div>
          )}
          {showAddButton && onAdd && !isInGrid && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              style={{
                padding: "4px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 11,
                color: colors.accent,
                border: `1px solid ${colors.accent}`,
                borderRadius: 4,
                backgroundColor: cardBg,
                transition: "all 0.2s ease",
                fontFamily: "Montserrat, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.accent;
                e.currentTarget.style.color = cardBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = cardBg;
                e.currentTarget.style.color = colors.accent;
              }}
            >
              + Add
            </div>
          )}
          {showAddButton && isInGrid && (
            <div
              style={{
                padding: "4px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: 4,
                backgroundColor: cardBg,
                opacity: 0.5,
                fontFamily: "Montserrat, sans-serif",
                cursor: "not-allowed",
              }}
              title="Module already in grid"
            >
              Already in grid
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleCard;
