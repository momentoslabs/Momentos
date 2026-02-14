import { useState, useEffect } from "react";
import { getThemeColors } from "../../utils/colors";
import { SettingsModalProps, Tab } from "../../utils/types";
import { SEARCH_ENGINE_LOGOS, SEARCH_ENGINES } from "../../utils/constants";
import Icon from "../Icon/Icon";
import wordmarkBlack from "../../graphics/branding/wordmarkblack.svg";
import wordmarkWhite from "../../graphics/branding/wordmarkwhite.svg";

const SettingsModal = ({
  isOpen,
  onClose,
  customColors,
  onCustomColorsChange,
  showScrollbars,
  onShowScrollbarsChange,
  selectedEngine,
  onSelectedEngineChange,
  initialTab = "Interface",
}: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("Interface");

  // Reset to initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Provide fallback for customColors to avoid undefined errors
  const safeCustomColors = customColors || {};
  const colors = getThemeColors(safeCustomColors);
  const bg = colors.surface;
  const borderColor = colors.border;
  const textColor = colors.text;
  const tabBg = colors.gridBackground;

  const handleColorChange = (
    colorKey: keyof typeof customColors,
    value: string,
  ) => {
    onCustomColorsChange({
      ...customColors,
      [colorKey]: value,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="SettingsModal"
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 9998,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 800,
          minHeight: 600,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: bg,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          zIndex: 9999,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 14,
            background: "none",
            border: "none",
            fontSize: 24,
            color: textColor,
            cursor: "pointer",
            padding: 0,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.85,
            zIndex: 10,
          }}
        >
          <Icon name="xmark" color={colors.text} size={20} />
        </button>

        {/* Header with Chrome-style Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: 24,
            paddingTop: 12,
            borderBottom: `1px solid ${borderColor}`,
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          <p
            style={{
              margin: 0,
              marginRight: 16,
              color: textColor,
              fontSize: 13,
              fontFamily: "Montserrat, sans-serif",
              opacity: 0.33,
            }}
          >
            Settings
          </p>

          {/* Chrome-style Tabs */}
          <div
            style={{
              display: "flex",
              gap: 2,
              flex: 1,
            }}
          >
            {(["Interface", "Search", "About"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? bg : "transparent",
                  border:
                    activeTab === tab ? `1px solid ${borderColor}` : "none",
                  borderBottom:
                    activeTab === tab ? "none" : `1px solid ${borderColor}`,
                  padding: "10px 20px",
                  cursor: "pointer",
                  color: textColor,
                  fontSize: 13,
                  borderRadius: "8px 8px 0 0",
                  transition: "all 0.2s ease",
                  opacity: activeTab === tab ? 1 : 0.7,
                  position: "relative",
                  marginBottom: -1,
                  fontFamily: "Montserrat, sans-serif",
                  outline: "none",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ padding: 24, maxHeight: 500, overflowY: "auto" }}>
          {activeTab === "Search" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <p
                style={{
                  color: textColor,
                  marginTop: 0,
                  marginBottom: 20,
                  fontSize: 14,
                  opacity: 0.8,
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                Select your preferred search engine or platform
              </p>

              {/* 8x2 Grid of Search Engines */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(8, 1fr)",
                  gap: 16,
                }}
              >
                {SEARCH_ENGINES.map((engine, index) => {
                  if (engine === "coming-soon") {
                    return (
                      <div
                        key="coming-soon"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            border: `1.5px dashed ${borderColor}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            color: textColor,
                            opacity: 0.5,
                            textAlign: "center",
                            padding: 8,
                            boxSizing: "border-box",
                            fontFamily: "Montserrat, sans-serif",
                          }}
                        >
                          More Coming Soon
                        </div>
                      </div>
                    );
                  }

                  const isSelected = selectedEngine === engine.id;

                  return (
                    <div
                      key={engine.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <button
                        onClick={() => onSelectedEngineChange(engine.id)}
                        style={{
                          width: 64,
                          height: 64,
                          backgroundColor: "transparent",
                          border: isSelected
                            ? `1px solid ${colors.accent}`
                            : `1px solid ${borderColor}`,
                          borderRadius: 8,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 8,
                          boxSizing: "border-box",
                          boxShadow: isSelected
                            ? `0 0 0 3px ${colors.accent}40`
                            : "none",
                          transition: "all 0.2s",
                          transform: isSelected ? "scale(1.05)" : "scale(1)",
                        }}
                      >
                        <img
                          src={SEARCH_ENGINE_LOGOS[engine.id]}
                          alt={engine.name}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </button>
                      <span
                        style={{
                          fontSize: 11,
                          color: textColor,
                          opacity: 0.8,
                          textAlign: "center",
                          fontFamily: "Montserrat, sans-serif",
                        }}
                      >
                        {engine.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "Interface" && (
            <div>
              <p
                style={{
                  color: textColor,
                  marginTop: 0,
                  marginBottom: 20,
                  fontSize: 14,
                  opacity: 0.8,
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                Customize your theme and colors
              </p>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {/* Color Presets */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    onClick={() =>
                      onCustomColorsChange({
                        background: "#ffffff",
                        primaryBorder: "#d7dae4",
                        secondaryBorder: "#e0e0e0",
                        gridBackground: "#f8f8f8",
                        success: "#4ade80",
                        error: "#f87171",
                        accent: "#547aa0",
                      })
                    }
                    style={{
                      padding: "10px 16px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 6,
                      backgroundColor: bg,
                      color: textColor,
                      cursor: "pointer",
                      fontSize: 14,
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    <Icon
                      name="sun"
                      color={textColor}
                      size={14}
                      style={{ marginRight: 6 }}
                    />
                    Light
                  </button>
                  <button
                    onClick={() =>
                      onCustomColorsChange({
                        background: "#11141c",
                        primaryBorder: "#2a2f3d",
                        secondaryBorder: "#1f2432",
                        gridBackground: "#1a1d28",
                        success: "#4ade80",
                        error: "#f87171",
                        accent: "#ffffff",
                      })
                    }
                    style={{
                      padding: "10px 16px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 6,
                      backgroundColor: bg,
                      color: textColor,
                      cursor: "pointer",
                      fontSize: 14,
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    <Icon
                      name="moon"
                      color={textColor}
                      size={14}
                      style={{ marginRight: 6 }}
                    />
                    Dark
                  </button>
                  <button
                    onClick={() =>
                      onCustomColorsChange({
                        background: "#ffffff",
                        primaryBorder: "#d6d6d6",
                        secondaryBorder: "#e0e0e0",
                        gridBackground: "#f8f8f8",
                        success: "#22c55e",
                        error: "#ef4444",
                        accent: "#222222",
                      })
                    }
                    style={{
                      padding: "10px 16px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 6,
                      backgroundColor: bg,
                      color: textColor,
                      cursor: "pointer",
                      fontSize: 14,
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    <Icon
                      name="reset"
                      color={textColor}
                      size={14}
                      style={{ marginRight: 6 }}
                    />
                    Reset
                  </button>
                </div>

                {/* Background Color */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      flex: 1,
                      color: textColor,
                      fontSize: 14,
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={customColors.background}
                    onChange={(e) =>
                      handleColorChange("background", e.target.value)
                    }
                    style={{
                      width: 60,
                      height: 36,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    value={customColors.background}
                    onChange={(e) =>
                      handleColorChange("background", e.target.value)
                    }
                    style={{
                      width: 80,
                      padding: "6px 8px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 4,
                      backgroundColor: bg,
                      color: textColor,
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                {/* Primary Line Color */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      flex: 1,
                      color: textColor,
                      fontSize: 14,
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={customColors.primaryBorder}
                    onChange={(e) =>
                      handleColorChange("primaryBorder", e.target.value)
                    }
                    style={{
                      width: 60,
                      height: 36,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    value={customColors.primaryBorder}
                    onChange={(e) =>
                      handleColorChange("primaryBorder", e.target.value)
                    }
                    style={{
                      width: 80,
                      padding: "6px 8px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 4,
                      backgroundColor: bg,
                      color: textColor,
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                {/* Secondary Line Color */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      flex: 1,
                      color: textColor,
                      fontSize: 14,
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={customColors.secondaryBorder}
                    onChange={(e) =>
                      handleColorChange("secondaryBorder", e.target.value)
                    }
                    style={{
                      width: 60,
                      height: 36,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    value={customColors.secondaryBorder}
                    onChange={(e) =>
                      handleColorChange("secondaryBorder", e.target.value)
                    }
                    style={{
                      width: 80,
                      padding: "6px 8px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 4,
                      backgroundColor: bg,
                      color: textColor,
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                {/* Grid Background */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      flex: 1,
                      color: textColor,
                      fontSize: 14,
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    Grid Background
                  </label>
                  <input
                    type="color"
                    value={customColors.gridBackground}
                    onChange={(e) =>
                      handleColorChange("gridBackground", e.target.value)
                    }
                    style={{
                      width: 60,
                      height: 36,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    value={customColors.gridBackground}
                    onChange={(e) =>
                      handleColorChange("gridBackground", e.target.value)
                    }
                    style={{
                      width: 80,
                      padding: "6px 8px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 4,
                      backgroundColor: bg,
                      color: textColor,
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                {/* Accent */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      flex: 1,
                      color: textColor,
                      fontSize: 14,
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    Accent Color
                  </label>
                  <input
                    type="color"
                    value={customColors.accent}
                    onChange={(e) =>
                      handleColorChange("accent", e.target.value)
                    }
                    style={{
                      width: 60,
                      height: 36,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    value={customColors.accent}
                    onChange={(e) =>
                      handleColorChange("accent", e.target.value)
                    }
                    style={{
                      width: 80,
                      padding: "6px 8px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 4,
                      backgroundColor: bg,
                      color: textColor,
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                {/* Success */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      flex: 1,
                      color: textColor,
                      fontSize: 14,
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    Success Color
                  </label>
                  <input
                    type="color"
                    value={customColors.success}
                    onChange={(e) =>
                      handleColorChange("success", e.target.value)
                    }
                    style={{
                      width: 60,
                      height: 36,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    value={customColors.success}
                    onChange={(e) =>
                      handleColorChange("success", e.target.value)
                    }
                    style={{
                      width: 80,
                      padding: "6px 8px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 4,
                      backgroundColor: bg,
                      color: textColor,
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                {/* Error */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      flex: 1,
                      color: textColor,
                      fontSize: 14,
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    Error Color
                  </label>
                  <input
                    type="color"
                    value={customColors.error}
                    onChange={(e) => handleColorChange("error", e.target.value)}
                    style={{
                      width: 60,
                      height: 36,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    value={customColors.error}
                    onChange={(e) => handleColorChange("error", e.target.value)}
                    style={{
                      width: 80,
                      padding: "6px 8px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 4,
                      backgroundColor: bg,
                      color: textColor,
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                {/* Always Show Scrollbars Toggle */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 16,
                    borderTop: `1px solid ${borderColor}`,
                    marginTop: 16,
                  }}
                >
                  <label
                    style={{
                      color: textColor,
                      fontSize: 14,
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    Always Show Scrollbars
                  </label>
                  <label
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: 48,
                      height: 24,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={showScrollbars}
                      onChange={(e) => onShowScrollbarsChange(e.target.checked)}
                      style={{
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: showScrollbars
                          ? colors.accent
                          : borderColor,
                        borderRadius: 24,
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          height: 18,
                          width: 18,
                          left: showScrollbars ? 26 : 3,
                          bottom: 3,
                          backgroundColor: bg,
                          borderRadius: "50%",
                          transition: "left 0.2s ease",
                        }}
                      />
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "About" && (
            <div>
              {/* Logo */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: 36,
                }}
              >
                <img
                  src={(() => {
                    const hex = colors.background.replace("#", "");
                    const r = parseInt(hex.substr(0, 2), 16);
                    const g = parseInt(hex.substr(2, 2), 16);
                    const b = parseInt(hex.substr(4, 2), 16);
                    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    return luminance > 0.5 ? wordmarkBlack : wordmarkWhite;
                  })()}
                  alt="Momentos logo"
                  style={{ height: 48, width: "auto", objectFit: "contain" }}
                />
              </div>

              {/* About Text */}
              <div
                style={{
                  color: textColor,
                  fontSize: 14,
                  lineHeight: 1.6,
                  textAlign: "left",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                <p style={{ marginTop: 0 }}>
                  Take back your browser's start page.
                </p>
                <p>
                  Your browser's home page used to mean something. It was yours
                  to customize and control. Now it's filled with content chosen
                  by companies, shaped by deals you never agreed to, and locked
                  down so you can't truly make it your own.
                </p>
                <p>
                  Momentos gives you that power back. Create, collect, and
                  maintain your own "Momentos" — customizable modules that
                  display exactly what you want. Share them with others or
                  discover new ones from the community.
                </p>
                <p>
                  Built on a barebones, cross-functional protocol, Momentos lets
                  you:
                </p>
                <ul style={{ paddingLeft: 20, marginTop: 8, marginBottom: 16 }}>
                  <li>Search across countless platforms and social media</li>
                  <li>Fully customize your interface and color scheme</li>
                  <li>Create and share your own modules</li>
                  <li>Take complete control of what you see</li>
                </ul>
                <p>
                  This is your portal. And because it's open source, you can
                  make the tweaks you want to see.
                </p>
                <p style={{ marginBottom: 0 }}>
                  We invite collaborations at our GitHub repo:
                  <br />
                  <a
                    href="https://github.com/momentoslabs/Momentos"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: customColors.accent,
                      textDecoration: "none",
                      marginTop: 8,
                      display: "inline-block",
                    }}
                  >
                    github.com/momentoslabs/Momentos →
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsModal;
