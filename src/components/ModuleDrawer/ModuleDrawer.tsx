import ModuleCard from "./ModuleCard";
import { ModuleDrawerProps } from "../../utils/types";
import { getThemeColors } from "../../utils/colors";
import { useState, useEffect, useRef } from "react";
import Icon from "../Icon/Icon";

const ModuleDrawer = ({
  open,
  tab,
  setTab,
  modules,
  myModules,
  onDragStart,
  onLoadFromFile,
  onSaveToFile,
  onClearGrid,
  onClose,
  onAddModule,
  onRemoveModule,
  customColors,
}: ModuleDrawerProps) => {
  const [browseQuery, setBrowseQuery] = useState("");
  const [myModulesSearch, setMyModulesSearch] = useState("");
  const [customModuleUrl, setCustomModuleUrl] = useState("");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "name-desc">("name");
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const colors = getThemeColors(customColors);
  const bg = colors.surface;
  const borderColor = colors.border;
  const textColor = colors.text;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showActionsMenu]);

  // Filter my modules
  const myModulesList = modules
    .filter((m) => myModules.includes(m.moduleUrl || ""))
    .filter(
      (m) =>
        m.name.toLowerCase().includes(myModulesSearch.toLowerCase()) ||
        (m.description || "")
          .toLowerCase()
          .includes(myModulesSearch.toLowerCase()),
    );

  // Filter and sort browse results
  const browseResults = modules
    .filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(browseQuery.toLowerCase()) ||
        (m.description || "").toLowerCase().includes(browseQuery.toLowerCase());
      const matchesSize = sizeFilter === "all" || m.size === sizeFilter;
      return matchesSearch && matchesSize;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div
        data-testid="ModuleDrawer"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: open ? 300 : 0,
          background: bg,
          overflow: "hidden",
          transition: "width 0.3s ease",
          zIndex: 9,
          borderRight: open ? `1px solid ${borderColor}` : "none",
        }}
      >
        {/* Close button */}
        {open && (
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 2,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 24,
              color: textColor,
              opacity: 0.85,
              zIndex: 10,
              fontFamily: "Montserrat, sans-serif",
            }}
            onClick={onClose}
          >
            <Icon name="xmark" color={textColor} size={20} />
          </div>
        )}

        {/* Chrome-style Tabs */}
        <div
          style={{
            display: "flex",
            gap: 2,
            padding: "12px 12px 0 12px",
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          {(["my", "browse"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? bg : "transparent",
                border: tab === t ? `1px solid ${borderColor}` : "none",
                borderBottom: tab === t ? "none" : `1px solid ${borderColor}`,
                padding: "10px 20px",
                cursor: "pointer",
                color: textColor,
                fontSize: 13,
                borderRadius: "8px 8px 0 0",
                transition: "all 0.2s ease",
                opacity: tab === t ? 1 : 0.7,
                position: "relative",
                marginBottom: -1,
                fontFamily: "Montserrat, sans-serif",
                outline: "none",
              }}
            >
              {t === "my" ? "My Modules" : "Browse"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{ padding: 12, height: "calc(100% - 60px)", overflow: "auto" }}
        >
          {tab === "my" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              {/* Header with Actions Menu */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 12,
                  position: "relative",
                }}
              >
                <input
                  type="text"
                  placeholder="Browse my modules..."
                  value={myModulesSearch}
                  onChange={(e) => setMyModulesSearch(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: 6,
                    backgroundColor: bg,
                    color: textColor,
                    fontSize: 13,
                    fontFamily: "Montserrat, sans-serif",
                    boxSizing: "border-box",
                  }}
                />
                <div
                  ref={menuRef}
                  style={{ position: "relative", marginLeft: 8 }}
                >
                  <button
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    style={{
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: bg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 18,
                      color: textColor,
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    <Icon name="menu" color={textColor} size={18} />
                  </button>
                  {showActionsMenu && (
                    <div
                      style={{
                        position: "absolute",
                        top: 42,
                        right: 0,
                        background: bg,
                        border: `1px solid ${borderColor}`,
                        borderRadius: 6,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 100,
                        minWidth: 180,
                        overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={() => {
                          onClearGrid?.();
                          setShowActionsMenu(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "transparent",
                          border: "none",
                          borderBottom: `1px solid ${borderColor}`,
                          color: colors.error,
                          fontSize: 13,
                          fontFamily: "Montserrat, sans-serif",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            colors.gridBackground)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <Icon
                          name="trash"
                          color={colors.error}
                          size={14}
                          style={{ marginRight: 8 }}
                        />
                        Clear Grid
                      </button>
                      <label
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "transparent",
                          border: "none",
                          borderBottom: `1px solid ${borderColor}`,
                          color: textColor,
                          fontSize: 13,
                          fontFamily: "Montserrat, sans-serif",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "block",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            colors.gridBackground)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <Icon
                          name="folder"
                          color={textColor}
                          size={14}
                          style={{ marginRight: 8 }}
                        />
                        Import .mmt
                        <input
                          type="file"
                          accept=".mmt"
                          onChange={(e) => {
                            onLoadFromFile?.(e);
                            setShowActionsMenu(false);
                          }}
                          style={{ display: "none" }}
                        />
                      </label>
                      <button
                        onClick={() => {
                          onSaveToFile?.();
                          setShowActionsMenu(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "transparent",
                          border: "none",
                          color: textColor,
                          fontSize: 13,
                          fontFamily: "Montserrat, sans-serif",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            colors.gridBackground)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <Icon
                          name="save"
                          color={textColor}
                          size={14}
                          style={{ marginRight: 8 }}
                        />
                        Export .mmt
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* My Modules List */}
              {myModulesList.length === 0 && (
                <p
                  style={{
                    opacity: 0.6,
                    textAlign: "center",
                    marginTop: 20,
                    fontSize: 13,
                    color: textColor,
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  No modules added yet. Browse for modules to add them.
                </p>
              )}
              {myModulesList.map((m) => (
                <ModuleCard
                  key={m.id}
                  module={m}
                  onDragStart={onDragStart}
                  customColors={customColors}
                  onRemove={() => onRemoveModule?.(m.moduleUrl || "")}
                />
              ))}
            </div>
          )}

          {tab === "browse" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              {/* Browse Bar */}
              <input
                type="text"
                placeholder="Browse modules..."
                value={browseQuery}
                onChange={(e) => setBrowseQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${borderColor}`,
                  borderRadius: 6,
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: 13,
                  fontFamily: "Montserrat, sans-serif",
                  marginBottom: 12,
                  boxSizing: "border-box",
                }}
              />

              {/* Add Module from Link */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Paste module URL..."
                    value={customModuleUrl}
                    onChange={(e) => setCustomModuleUrl(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 6,
                      backgroundColor: bg,
                      color: textColor,
                      fontSize: 13,
                      fontFamily: "Montserrat, sans-serif",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={() => {
                      if (customModuleUrl.trim()) {
                        const isVerified = modules.some(
                          (m) => m.moduleUrl === customModuleUrl.trim(),
                        );
                        if (!isVerified) {
                          const confirmed = window.confirm(
                            "⚠️ WARNING: This module has not been verified by the Momentos team. Only add modules from sources you trust. Continue?",
                          );
                          if (!confirmed) return;
                        }
                        onAddModule?.(customModuleUrl.trim());
                        setCustomModuleUrl("");
                      }
                    }}
                    style={{
                      padding: "10px 14px",
                      background: bg,
                      color: colors.accent,
                      border: `1px solid ${colors.accent}`,
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 13,
                      fontFamily: "Montserrat, sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 24px 8px 10px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: 6,
                    backgroundColor: colors.surface,
                    color: textColor,
                    fontSize: 12,
                    fontFamily: "Montserrat, sans-serif",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="all">All Sizes</option>
                  <option value="1x1">1×1</option>
                  <option value="1x2">1×2</option>
                  <option value="1x4">1×4</option>
                  <option value="2x1">2×1</option>
                  <option value="2x2">2×2</option>
                  <option value="2x4">2×4</option>
                  <option value="4x1">4×1</option>
                  <option value="4x2">4×2</option>
                  <option value="4x4">4×4</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "name" | "name-desc")
                  }
                  style={{
                    flex: 1,
                    padding: "8px 24px 8px 10px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: 6,
                    backgroundColor: colors.surface,
                    color: textColor,
                    fontSize: 12,
                    fontFamily: "Montserrat, sans-serif",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="name">Sort: A-Z</option>
                  <option value="name-desc">Sort: Z-A</option>
                </select>
              </div>

              {/* Search Results */}
              {browseResults.length === 0 && (
                <p
                  style={{
                    opacity: 0.6,
                    textAlign: "center",
                    marginTop: 20,
                    fontSize: 13,
                    color: textColor,
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  No modules found
                </p>
              )}
              {browseResults.map((m) => (
                <ModuleCard
                  key={m.id}
                  module={m}
                  onDragStart={onDragStart}
                  customColors={customColors}
                  showAddButton={!myModules.includes(m.moduleUrl || "")}
                  onAdd={() => onAddModule?.(m.moduleUrl || "")}
                />
              ))}
            </div>
          )}
          {tab === "upload" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 12,
              }}
            >
              <label
                style={{
                  padding: "12px 16px",
                  background: bg,
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "Montserrat, sans-serif",
                  textAlign: "center",
                }}
              >
                <Icon
                  name="folder"
                  color={textColor}
                  size={16}
                  style={{ marginRight: 8 }}
                />
                Import from .mmt
                <input
                  type="file"
                  accept=".mmt"
                  onChange={onLoadFromFile}
                  style={{ display: "none" }}
                />
              </label>
              <button
                onClick={onSaveToFile}
                style={{
                  padding: "12px 16px",
                  background: bg,
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                <Icon
                  name="save"
                  color={textColor}
                  size={16}
                  style={{ marginRight: 8 }}
                />
                Export to .mmt
              </button>
              <button
                onClick={onClearGrid}
                style={{
                  padding: "12px 16px",
                  background: bg,
                  color: colors.error,
                  border: `1px solid ${colors.error}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                <Icon
                  name="trash"
                  color={colors.error}
                  size={16}
                  style={{ marginRight: 8 }}
                />
                Clear Grid
              </button>
              <p
                style={{
                  fontSize: 12,
                  color: textColor,
                  opacity: 0.6,
                  marginTop: 8,
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                Import and export your module layouts as .mmt files, or clear
                the entire grid.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ModuleDrawer;
