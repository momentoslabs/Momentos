import { useEffect, useRef, useState } from "react";
import { isLightColor } from "../../utils/colors";

import type {
  RemoteModuleRendererProps,
  ModuleContentProps,
} from "../../utils/types";

// Child component that runs the fetched code
const RemoteModuleRenderer = ({
  code,
  theme,
  containerRef,
}: RemoteModuleRendererProps) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !containerRef.current) return;

    const moduleName = `__module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let script: HTMLScriptElement | null = null;
    let blobUrl: string | null = null;
    let cleanupFn: (() => void) | undefined;

    async function executeModule() {
      try {
        // Remove ALL export statements to make code executable in script context
        const executableCode = code
          .replace(/export\s+const\s+/g, "const ")
          .replace(/export\s+let\s+/g, "let ")
          .replace(/export\s+var\s+/g, "var ")
          .replace(/export\s+async\s+function\s+/g, "async function ")
          .replace(/export\s+function\s+/g, "function ")
          .replace(/export\s+default\s+/g, "// export default ");

        // Create a wrapper that assigns to window
        const wrapperCode = `
          (function() {
            ${executableCode}
            
            // Export render function to window
            if (typeof render !== 'undefined') {
              window.${moduleName} = { render: render };
            }
          })();
        `;

        // Create a blob with correct MIME type
        const blob = new Blob([wrapperCode], { type: "text/javascript" });
        blobUrl = URL.createObjectURL(blob);

        // Create script tag
        script = document.createElement("script");
        script.src = blobUrl;

        // Wait for script to load
        await new Promise<void>((resolve, reject) => {
          if (!script) return reject(new Error("Script element not created"));

          script.onload = () => {
            resolve();
          };
          script.onerror = () => {
            reject(new Error("Script failed to load"));
          };

          document.head.appendChild(script);
        });

        // Get the module from window
        const module = (window as any)[moduleName];

        if (!module) {
          throw new Error("Module did not export to window");
        }

        // Call the render function ONCE
        if (module.render && containerRef.current) {
          cleanupFn = module.render(containerRef.current, { theme });
        } else if (module.default && containerRef.current) {
          cleanupFn = module.default(containerRef.current, { theme });
        } else {
        }
      } catch (e) {
        console.error("Failed to execute module:", e);
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    }

    executeModule();

    return () => {
      // Call module cleanup if it exists and is a function
      if (typeof cleanupFn === "function") {
        cleanupFn();
      }
      if (script && document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      if (moduleName && (window as any)[moduleName]) {
        delete (window as any)[moduleName];
      }
    };
  }, [code, theme, containerRef]); // Re-execute when theme changes so modules can adapt

  if (error) {
    return (
      <div style={{ color: "#ef4444", padding: 10, fontSize: 12 }}>
        Execution error: {error}
      </div>
    );
  }

  return null;
};

const ModuleContent = ({
  html,
  js,
  moduleUrl,
  label,
  backgroundColor,
  thematicOverride = false,
  showScrollbars = false,
}: ModuleContentProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedCode, setFetchedCode] = useState<string | null>(null);

  // Calculate theme based on background color luminance (unless overridden by module)
  const theme = thematicOverride
    ? undefined
    : isLightColor(backgroundColor)
      ? "light"
      : "dark";

  // Handle remote ES module loading
  useEffect(() => {
    if (!moduleUrl) return;

    const url = moduleUrl;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setFetchedCode(null);

    async function loadModule() {
      try {
        // Fetch the raw JavaScript code
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const code = await response.text();

        if (cancelled) return;

        // Store the fetched code - child component will execute it
        setFetchedCode(code);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load module:", e);
          setError(
            `Failed to load module: ${e instanceof Error ? e.message : "Unknown error"}`,
          );
          setLoading(false);
        }
      }
    }

    loadModule();

    return () => {
      cancelled = true;
    };
  }, [moduleUrl]); // Only re-fetch when URL changes

  useEffect(() => {
    if (!iframeRef.current) return;

    // Use backgroundColor directly, unless module has thematic override
    const bgColor = thematicOverride ? "#ffffff" : backgroundColor;
    const textColor = theme === "light" ? "#1a1a1a" : "#ffffff";

    // If there's custom HTML or JS, render it in an iframe
    if (html || js) {
      const doc = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                width: 100%;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: ${bgColor};
                color: ${textColor};
                overflow: auto;
              }
            </style>
          </head>
          <body>
            ${html || `<div style="text-align: center; font-size: 16px; font-weight: 600;">${label}</div>`}
            ${js ? `<script>${js}</script>` : ""}
          </body>
        </html>
      `;

      iframeRef.current.srcdoc = doc;
    }
  }, [html, js, label, theme, backgroundColor, thematicOverride]);

  const textColor = theme === "light" ? "#1a1a1a" : "#ffffff";

  // If loading remote module, show loading state
  if (moduleUrl && loading) {
    return (
      <div
        data-testid="ModuleContent"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          fontSize: 14,
          color: textColor,
          opacity: 0.6,
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        Loading module...
      </div>
    );
  }

  // If remote module failed, show error
  if (moduleUrl && error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          fontSize: 12,
          color: "#ef4444",
          padding: 10,
          textAlign: "center",
        }}
      >
        {error}
      </div>
    );
  }

  // If remote module loaded successfully, use container
  if (moduleUrl) {
    return (
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: showScrollbars ? "scroll" : "auto",
          boxSizing: "border-box",
        }}
      >
        {fetchedCode && (
          <RemoteModuleRenderer
            code={fetchedCode}
            theme={theme}
            containerRef={containerRef}
          />
        )}
      </div>
    );
  }

  // If there's custom content, use iframe
  if (html || js) {
    return (
      <iframe
        ref={iframeRef}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
          pointerEvents: "none",
          boxSizing: "border-box",
        }}
        sandbox="allow-scripts"
        title={label}
      />
    );
  }

  // Otherwise, just show the label
  return <div style={{ fontSize: 16 }}>{label}</div>;
};

export default ModuleContent;
