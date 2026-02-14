export type ModuleSize = "1x1" | "1x2" | "2x1" | "2x2" | "4x2" | "2x4";

export type Tab = "Search" | "Interface" | "About";

export type SearchEngine =
  | "google"
  | "bing"
  | "yahoo"
  | "baidu"
  | "duckduckgo"
  | "yandex"
  | "ecosia"
  | "ask"
  | "aol"
  | "facebook"
  | "instagram"
  | "x"
  | "tiktok"
  | "bluesky"
  | "mastodon";

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  size: ModuleSize;
  html?: string; // HTML content for the module
  js?: string; // JavaScript code to execute
  moduleUrl?: string; // URL to remote ES module
  thematicOverride?: boolean; // If true, module handles its own theming
  links?: Array<{ label: string; url: string }>;
  previewImg?: string;
}

export interface GridProps {
  modules: PlacedModule[];
  onDropModule: (
    module: ModuleDefinition,
    gridPosition: { col: number; row: number },
  ) => void;
  onMoveModule: (
    id: string,
    gridPosition: { col: number; row: number },
  ) => void;
  onRemoveModule: (id: string) => void;
  onCellSizeChange: (cellSize: number) => void;
  customColors?: {
    background?: string;
    primaryBorder?: string;
    secondaryBorder?: string;
    gridBackground?: string;
    success?: string;
    error?: string;
    accent?: string;
  };
  showScrollbars?: boolean;
  active?: boolean;
  draggingModule?: {
    data: ModuleDefinition;
    fromGrid?: { id: string; originalPos: { x: number; y: number } };
  } | null;
  onDragStart?: (drag: any) => void;
  onDragEnd?: () => void;
}

export interface IconProps {
  name:
    | "trash"
    | "save"
    | "folder"
    | "settings"
    | "menu"
    | "grid"
    | "search"
    | "xmark"
    | "sun"
    | "moon"
    | "link"
    | "reset";
  color?: string;
  size?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export interface RemoteModuleRendererProps {
  code: string;
  theme?: "dark" | "light";
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export interface ModuleContentProps {
  html?: string;
  js?: string;
  moduleUrl?: string;
  label: string;
  backgroundColor: string;
  thematicOverride?: boolean;
  showScrollbars?: boolean;
}

export interface ModuleDrawerProps {
  open: boolean;
  tab: "my" | "browse" | "upload";
  setTab: (t: "my" | "browse" | "upload") => void;
  modules: ModuleDefinition[];
  myModules: string[];
  onDragStart?: (drag: { data: ModuleDefinition }) => void;
  onLoadFromFile?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveToFile?: () => void;
  onClearGrid?: () => void;
  onClose?: () => void;
  onAddModule?: (moduleUrl: string) => void;
  onRemoveModule?: (moduleUrl: string) => void;
  customColors?: {
    background?: string;
    primaryBorder?: string;
    secondaryBorder?: string;
    gridBackground?: string;
    success?: string;
    error?: string;
    accent?: string;
  };
}

export interface ModuleCardProps {
  module: ModuleDefinition;
  onDragStart?: (drag: { data: ModuleDefinition }) => void;
  onRemove?: () => void;
  onAdd?: () => void;
  showAddButton?: boolean;
  customColors?: {
    background?: string;
    primaryBorder?: string;
    secondaryBorder?: string;
    gridBackground?: string;
    success?: string;
    error?: string;
    accent?: string;
  };
}

export interface NavigationProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  customColors?: {
    background?: string;
    primaryBorder?: string;
    secondaryBorder?: string;
    gridBackground?: string;
    success?: string;
    error?: string;
    accent?: string;
  };
  onSettingsClick?: (tab?: "Search" | "Interface" | "About") => void;
  onDrawerClick?: () => void;
  selectedEngine: SearchEngine;
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customColors: {
    background: string;
    primaryBorder: string;
    secondaryBorder: string;
    gridBackground: string;
    success: string;
    error: string;
    accent: string;
  };
  onCustomColorsChange: (colors: SettingsModalProps["customColors"]) => void;
  showScrollbars: boolean;
  onShowScrollbarsChange: (show: boolean) => void;
  selectedEngine: SearchEngine;
  onSelectedEngineChange: (engine: SearchEngine) => void;
  initialTab?: Tab;
}

export interface PlacedModule {
  id: string;
  position: { x: number; y: number };
  data: {
    label: string;
    size: ModuleSize;
    html?: string;
    js?: string;
    moduleUrl?: string;
    thematicOverride?: boolean;
    links?: Array<{ label: string; url: string }>;
  };
  style: React.CSSProperties;
}
