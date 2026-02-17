import { useState, useEffect, useRef } from "react";
import type {
  ModuleDefinition,
  PlacedModule,
  SearchEngine,
  ModuleSize,
} from "./utils/types";
import {
  DEFAULT_CELL_SIZE,
  GRID_COLS as BASE_GRID_COLS,
  GRID_ROWS as BASE_GRID_ROWS,
  MODULE_REGISTRY_URL,
  SIZE_GRID_UNITS,
} from "./utils/constants";
import { wouldOverlap } from "./utils/functions";
import { getThemeColors } from "./utils/colors";
import Grid from "./components/Grid/Grid";
// (removed duplicate useRef import)
import Navigation from "./components/Navigation/Navigation";
import ModuleDrawer from "./components/ModuleDrawer/ModuleDrawer";
import SettingsModal from "./components/SettingsModal/SettingsModal";

const App = () => {
  const appRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [moveAmount, setMoveAmount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "Search" | "Interface" | "About"
  >("Interface");
  const [tab, setTab] = useState<"my" | "browse" | "upload">("my");
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>([]);
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const [showScrollbars, setShowScrollbars] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>("google");
  const [customColors, setCustomColors] = useState({
    background: "#ffffff",
    primaryBorder: "#d6d6d6",
    secondaryBorder: "#e0e0e0",
    gridBackground: "#f8f8f8",
    success: "#22c55e",
    error: "#ef4444",
    accent: "#222222",
  });
  const [draggingModule, setDraggingModule] = useState<{
    data: ModuleDefinition;
    fromGrid?: { id: string; originalPos: { x: number; y: number } };
  } | null>(null);
  const [availableModules, setAvailableModules] = useState<ModuleDefinition[]>(
    [],
  );
  const [myModules, setMyModules] = useState<string[]>([]);

  // Detect mobile window size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 700);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Swap grid cols/rows if mobile
  const gridCols = isMobile ? BASE_GRID_ROWS : BASE_GRID_COLS;
  const gridRows = isMobile ? 6 : BASE_GRID_ROWS;

  // Calculate the translation amount whenever the window resizes or component's width changes
  useEffect(() => {
    const handleResize = () => {
      if (appRef.current) {
        const componentWidth = appRef.current.offsetWidth;
        const windowWidth = window.innerWidth;
        const shiftAmount = Math.min(
          Math.max(0, 300 - (windowWidth - (componentWidth + 300))),
          300,
        );

        setMoveAmount(shiftAmount);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [drawerOpen]);

  // Fetch module metadata from URLs
  useEffect(() => {
    async function fetchModuleMetadata() {
      const modules: ModuleDefinition[] = [];

      try {
        // Fetch module URLs from modules.txt
        const response = await fetch(MODULE_REGISTRY_URL);
        if (!response.ok) throw new Error("Failed to fetch module registry");
        const text = await response.text();
        const moduleUrls = text
          .split("\n")
          .filter((line) => line.trim() && !line.startsWith("#"));

        for (const url of moduleUrls) {
          try {
            const response = await fetch(url);
            if (!response.ok) continue;

            const code = await response.text();

            // Extract metadata using regex
            const metadataMatch = code.match(
              /export\s+const\s+metadata\s*=\s*({[\s\S]*?});/,
            );
            if (metadataMatch) {
              // Parse the metadata object
              const metadataStr = metadataMatch[1];
              // Use Function constructor to safely evaluate the object
              const metadata = new Function(`return ${metadataStr}`)();

              // Create module definition with URL
              modules.push({
                ...metadata,
                moduleUrl: url,
              });
            }
          } catch (error) {
            console.error(`Failed to fetch metadata from ${url}:`, error);
          }
        }
      } catch (error) {
        console.error("Failed to load modules:", error);
      }
      setAvailableModules(modules);
    }
    fetchModuleMetadata();
  }, []);

  // Load layout from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("momentos-layout");
    if (saved) {
      try {
        const layout = JSON.parse(saved);
        setPlacedModules(layout.modules || []);

        // Load scrollbar setting
        if (typeof layout.showScrollbars === "boolean") {
          setShowScrollbars(layout.showScrollbars);
        }

        // Load my modules
        if (Array.isArray(layout.myModules)) {
          setMyModules(layout.myModules);
        }

        // Load selected search engine
        if (layout.selectedEngine) {
          setSelectedEngine(layout.selectedEngine);
        }

        if (layout.customColors) {
          if (layout.customColors.background) {
            if (
              layout.customColors.gridLines &&
              !layout.customColors.primaryBorder
            ) {
              setCustomColors({
                ...layout.customColors,
                primaryBorder: layout.customColors.gridLines,
                secondaryBorder: layout.customColors.gridLines,
              });
            } else {
              setCustomColors(layout.customColors);
            }
          } else if (layout.customColors.darkBg) {
            setCustomColors({
              background: layout.customColors.darkBg,
              primaryBorder: layout.customColors.gridLines || "#d6d6d6",
              secondaryBorder: layout.customColors.gridLines || "#e0e0e0",
              gridBackground: layout.customColors.gridBackground || "#f8f8f8",
              success: layout.customColors.success || "#22c55e",
              error: layout.customColors.error || "#ef4444",
              accent: layout.customColors.accent || "#222222",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load layout:", err);
      }
    }
  }, []);

  // Auto-save to localStorage whenever modules change
  useEffect(() => {
    if (placedModules.length > 0 || myModules.length > 0) {
      const layout = {
        version: "1.0",
        modules: placedModules,
        customColors,
        showScrollbars,
        myModules,
        selectedEngine,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("momentos-layout", JSON.stringify(layout));
    }
  }, [placedModules, customColors, showScrollbars, myModules, selectedEngine]);

  // Update all module styles when theme changes
  useEffect(() => {
    const colors = getThemeColors(customColors);
    setPlacedModules((prev) =>
      prev.map((m) => ({
        ...m,
        style: {
          ...m.style,
          background: colors.surface,
          color: colors.text,
        },
      })),
    );
  }, [customColors]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    const searchUrls: Record<SearchEngine, string> = {
      google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
      yahoo: `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`,
      baidu: `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
      duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      yandex: `https://yandex.com/search/?text=${encodeURIComponent(query)}`,
      ecosia: `https://www.ecosia.org/search?q=${encodeURIComponent(query)}`,
      ask: `https://www.ask.com/web?q=${encodeURIComponent(query)}`,
      aol: `https://search.aol.com/aol/search?q=${encodeURIComponent(query)}`,
      facebook: `https://www.facebook.com/search/top?q=${encodeURIComponent(query)}`,
      instagram: `https://www.instagram.com/explore/tags/${encodeURIComponent(query.replace(/[^a-zA-Z0-9]/g, ""))}`,
      x: `https://x.com/search?q=${encodeURIComponent(query)}`,
      tiktok: `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`,
      bluesky: `https://bsky.app/search?q=${encodeURIComponent(query)}`,
      mastodon: `https://mastodon.social/search?q=${encodeURIComponent(query)}`,
    };

    window.open(searchUrls[selectedEngine], "_blank");
  };

  const handleDropModule = (
    module: ModuleDefinition,
    gridPosition: { col: number; row: number },
  ) => {
    const { cols, rows } = SIZE_GRID_UNITS[module.size as ModuleSize];

    // Ensure module fits within grid
    if (
      gridPosition.col < 0 ||
      gridPosition.row < 0 ||
      gridPosition.col + cols > gridCols ||
      gridPosition.row + rows > gridRows
    ) {
      return;
    }

    // Check for overlap before placing
    if (
      wouldOverlap(
        placedModules,
        gridPosition,
        { cols, rows },
        undefined,
        cellSize,
      )
    ) {
      return; // Don't place if overlapping
    }

    // Calculate pixel position from grid coordinates
    const position = {
      x: gridPosition.col * cellSize,
      y: gridPosition.row * cellSize,
    };

    const colors = getThemeColors(customColors);

    setPlacedModules((prev) => [
      ...prev,
      {
        id: `${module.id}-${Date.now()}`,
        position,
        data: {
          label: module.name,
          size: module.size,
          html: module.html,
          js: module.js,
          moduleUrl: module.moduleUrl,
          links: module.links,
        },
        style: {
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 6,
          boxSizing: "border-box",
          color: colors.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 600,
          cursor: "grab",
          transition: "all 0.2s ease",
        },
      },
    ]);
  };

  const handleMoveModule = (
    id: string,
    gridPosition: { col: number; row: number },
  ) => {
    const colors = getThemeColors(customColors);

    setPlacedModules((prev) => {
      const module = prev.find((m) => m.id === id);
      if (!module) return prev;

      const size = module.data.size as ModuleSize;
      const { cols, rows } = SIZE_GRID_UNITS[size];

      // Ensure module fits within grid
      if (
        gridPosition.col < 0 ||
        gridPosition.row < 0 ||
        gridPosition.col + cols > gridCols ||
        gridPosition.row + rows > gridRows
      ) {
        return prev;
      }

      // Check for overlap (exclude current module)
      if (wouldOverlap(prev, gridPosition, { cols, rows }, id, cellSize)) {
        return prev; // Don't move if it would overlap
      }

      return prev.map((m) => {
        if (m.id !== id) return m;

        return {
          ...m,
          position: {
            x: gridPosition.col * cellSize,
            y: gridPosition.row * cellSize,
          },
          style: {
            ...m.style,
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            borderRadius: 6,
            boxSizing: "border-box",
          },
        };
      });
    });
  };

  const handleRemoveModule = (id: string) => {
    setPlacedModules((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDownloadLayout = () => {
    const layout = {
      version: "1.0",
      modules: placedModules,
      customColors,
      selectedEngine,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(layout, null, 2)], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `momentos-layout-${Date.now()}.mmt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const layout = JSON.parse(content);

        if (layout.modules) {
          setPlacedModules(layout.modules);
        }
        if (layout.customColors) {
          if (layout.customColors.background) {
            if (
              layout.customColors.gridLines &&
              !layout.customColors.primaryBorder
            ) {
              setCustomColors({
                ...layout.customColors,
                primaryBorder: layout.customColors.gridLines,
                secondaryBorder: layout.customColors.gridLines,
              });
            } else {
              setCustomColors(layout.customColors);
            }
          } else if (layout.customColors.darkBg) {
            setCustomColors({
              background: layout.customColors.darkBg || "#ffffff",
              primaryBorder: layout.customColors.gridLines || "#d6d6d6",
              secondaryBorder: layout.customColors.gridLines || "#e0e0e0",
              gridBackground: layout.customColors.gridBackground || "#f8f8f8",
              success: layout.customColors.success || "#22c55e",
              error: layout.customColors.error || "#ef4444",
              accent: layout.customColors.accent || "#222222",
            });
          }
        }
        if (layout.selectedEngine) {
          setSelectedEngine(layout.selectedEngine);
        }
      } catch (err) {
        console.error("Failed to parse layout file:", err);
        alert("Invalid layout file format");
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be loaded again
    event.target.value = "";
  };

  const handleClearLayout = () => {
    if (window.confirm("Clear all modules from the grid?")) {
      setPlacedModules([]);
      localStorage.removeItem("momentos-layout");
    }
  };

  const handleAddModule = async (moduleUrl: string) => {
    if (!myModules.includes(moduleUrl)) {
      try {
        // Validate the URL by trying to fetch it
        const response = await fetch(moduleUrl);
        if (!response.ok) {
          alert(`Failed to add module: Unable to fetch from ${moduleUrl}`);
          return;
        }
        const code = await response.text();

        // Try to extract metadata
        const metadataMatch = code.match(
          /export\s+const\s+metadata\s*=\s*({[\s\S]*?});/,
        );
        if (!metadataMatch) {
          alert(
            `Failed to add module: No valid metadata found in ${moduleUrl}`,
          );
          return;
        }

        setMyModules([...myModules, moduleUrl]);
      } catch (error) {
        alert(
          `Failed to add module: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  };

  const handleRemoveMyModule = (moduleUrl: string) => {
    setMyModules(myModules.filter((url) => url !== moduleUrl));
  };

  // Remove all instances of a module from the grid by moduleUrl
  // Ref to call poof animation on Grid
  const gridRef = useRef<any>(null);
  const handleRemoveModuleFromGrid = async (
    moduleUrl: string,
    opts?: { poof?: boolean },
  ) => {
    if (
      opts &&
      opts.poof &&
      gridRef.current &&
      gridRef.current.poofModuleByUrl
    ) {
      await gridRef.current.poofModuleByUrl(moduleUrl);
      setPlacedModules((prev) =>
        prev.filter((m) => m.data.moduleUrl !== moduleUrl),
      );
    } else {
      setPlacedModules((prev) =>
        prev.filter((m) => m.data.moduleUrl !== moduleUrl),
      );
    }
  };

  const themeColors = getThemeColors(customColors);
  const gridWidth = cellSize * gridCols;

  return (
    <div
      data-testid="app-component"
      style={{
        position: "fixed",
        inset: 0,
        background: themeColors.background,
        color: themeColors.text,
        display: "flex",
        flexDirection: "column",
        transform: isMobile ? "scale(.75)" : undefined,
        transformOrigin: "top left",
        width: isMobile ? "134vw" : "100vw",
        height: isMobile ? "134vh" : "100vh",
      }}
    >
      <div
        ref={appRef}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "auto",
          transform: drawerOpen
            ? `translateX(${moveAmount}px)`
            : "translateX(0)",
          transition: "transform 0.3s ease",
        }}
      >
        <div style={{ width: gridWidth || "100%", maxWidth: "100%" }}>
          {/* Navigation Bar */}
          <Navigation
            query={query}
            onQueryChange={setQuery}
            onSubmit={handleSearch}
            customColors={customColors}
            onSettingsClick={(tab = "Interface") => {
              setSettingsTab(tab);
              setSettingsOpen(true);
            }}
            onDrawerClick={() => setDrawerOpen((o) => !o)}
            selectedEngine={selectedEngine}
          />
          {/* Module Grid */}
          <Grid
            ref={gridRef}
            modules={placedModules}
            onDropModule={handleDropModule}
            onMoveModule={handleMoveModule}
            onRemoveModule={handleRemoveModule}
            onCellSizeChange={setCellSize}
            customColors={customColors}
            showScrollbars={showScrollbars}
            active
            draggingModule={draggingModule}
            onDragStart={setDraggingModule}
            onDragEnd={() => setDraggingModule(null)}
            gridCols={gridCols}
            gridRows={gridRows}
          />
        </div>
      </div>

      {/* Module Drawer */}
      <ModuleDrawer
        open={drawerOpen}
        tab={tab}
        setTab={(t) => setTab(t)}
        modules={availableModules}
        myModules={myModules}
        onDragStart={setDraggingModule}
        onClose={() => setDrawerOpen(false)}
        customColors={customColors}
        onAddModule={handleAddModule}
        onRemoveModule={handleRemoveMyModule}
        onRemoveModuleFromGrid={handleRemoveModuleFromGrid}
        onClearGrid={handleClearLayout}
        onLoadFromFile={handleUploadLayout}
        onSaveToFile={handleDownloadLayout}
        placedModules={placedModules}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        customColors={customColors}
        onCustomColorsChange={setCustomColors}
        showScrollbars={showScrollbars}
        onShowScrollbarsChange={setShowScrollbars}
        selectedEngine={selectedEngine}
        onSelectedEngineChange={setSelectedEngine}
        initialTab={settingsTab}
      />
    </div>
  );
};

export default App;
