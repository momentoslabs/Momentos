import { useState, useEffect, useRef } from "react";
import { getThemeColors } from "../../utils/colors";
import { SearchEngine, NavigationProps } from "../../utils/types";
import { SEARCH_ENGINE_LOGOS, SEARCH_ENGINES } from "../../utils/constants";
import Icon from "../Icon/Icon";
import wordmarkBlack from "../../graphics/branding/wordmarkblack.svg";
import wordmarkWhite from "../../graphics/branding/wordmarkwhite.svg";

const Navigation = ({
  query,
  onQueryChange,
  onSubmit,
  customColors,
  onSettingsClick,
  onDrawerClick,
  selectedEngine,
}: NavigationProps) => {
  const safeCustomColors = customColors || {};
  const colors = getThemeColors(safeCustomColors);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const [logoSvgContent, setLogoSvgContent] = useState<string>("");

  // Determine if background is light or dark
  const isLightBackground = () => {
    const hex = colors.background.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  const wordmarkLogo = isLightBackground() ? wordmarkBlack : wordmarkWhite;
  const isLight = isLightBackground();

  // Adjust the brightness of a hex color by a percentage (positive for brighten, negative for darken)
  const adjustBrightness = (hex: string, percent: number) => {
    const num = parseInt(hex.replace("#", ""), 16);

    // Extract RGB components
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;

    // Check if the color is very dark
    const brightness = (r + g + b) / 3;

    // If the color is very dark (below a threshold), lighten it by 20% before applying other brightness adjustments
    if (brightness < 50) {
      // Lighten by 20% before applying the requested adjustment
      r = Math.min(255, r + (255 - r) * 0.2);
      g = Math.min(255, g + (255 - g) * 0.2);
      b = Math.min(255, b + (255 - b) * 0.2);
    }

    // Apply brightness adjustment (increase or decrease based on percent)
    r = Math.min(255, Math.max(0, Math.floor(r * (1 + percent))));
    g = Math.min(255, Math.max(0, Math.floor(g * (1 + percent))));
    b = Math.min(255, Math.max(0, Math.floor(b * (1 + percent))));

    // Return the new color in hex format
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  };

  // Fetch and modify SVG for light mode
  useEffect(() => {
    if (!isLight) {
      setLogoSvgContent("");
      return;
    }

    fetch(wordmarkBlack)
      .then((response) => response.text())
      .then((svgText) => {
        const startColor = adjustBrightness(colors.accent, 0.5);
        const endColor = adjustBrightness(colors.accent, 0.1);
        // Remove any existing linearGradient definitions
        let modifiedSvg = svgText.replace(
          /<linearGradient[\s\S]*?<\/linearGradient>/g,
          "",
        );
        // Inject our own gradient definition
        const gradientDef = `\n<defs>\n  <linearGradient id=\"accentGradient\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n    <stop offset=\"0%\" stop-color=\"${startColor}\" />\n    <stop offset=\"100%\" stop-color=\"${endColor}\" />\n  </linearGradient>\n</defs>\n`;
        modifiedSvg = modifiedSvg.replace(/(<svg[^>]*>)/, `$1${gradientDef}`);
        // Replace all fills with the gradient
        modifiedSvg = modifiedSvg.replace(
          /fill="#[0-9a-fA-F]{3,6}"/g,
          'fill="url(#accentGradient)"',
        );
        modifiedSvg = modifiedSvg.replace(
          /fill="url\(#paint0_linear_248_32\)"/g,
          'fill="url(#accentGradient)"',
        );
        // Add height styling to svg
        modifiedSvg = modifiedSvg.replace(
          /<svg([^>]*)>/,
          `<svg$1 style="height: 56px; width: auto;">`,
        );
        setLogoSvgContent(modifiedSvg);
      })
      .catch((error) => {
        console.error("Failed to load SVG:", error);
      });
  }, [wordmarkBlack, isLight, colors.accent]);

  // Get engine name for placeholder
  const engineName =
    (
      SEARCH_ENGINES.find(
        (e) => typeof e !== "string" && e.id === selectedEngine,
      ) as { id: SearchEngine; name: string; color: string } | undefined
    )?.name || "the Web";

  // Fetch search suggestions
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        // Using Google's autocomplete API via JSONP workaround
        // Create a JSONP callback
        const callbackName = `jsonp_callback_${Date.now()}`;

        (window as any)[callbackName] = (data: any) => {
          if (data && data[1] && Array.isArray(data[1])) {
            setSuggestions(data[1].slice(0, 8)); // Limit to 8 suggestions
            setShowSuggestions(true);
          }
          // Cleanup
          delete (window as any)[callbackName];
          document.body.removeChild(script);
        };

        // Create script tag for JSONP
        const script = document.createElement("script");
        script.src = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}&callback=${callbackName}`;
        script.onerror = () => {
          console.error("Failed to fetch suggestions");
          delete (window as any)[callbackName];
          document.body.removeChild(script);
        };
        document.body.appendChild(script);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      }
    }, 300); // Debounce by 300ms

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navigationRef.current &&
        !navigationRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    onQueryChange(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);

    // Trigger search immediately
    const searchUrls: Record<SearchEngine, string> = {
      google: `https://www.google.com/search?q=${encodeURIComponent(suggestion)}`,
      bing: `https://www.bing.com/search?q=${encodeURIComponent(suggestion)}`,
      yahoo: `https://search.yahoo.com/search?p=${encodeURIComponent(suggestion)}`,
      baidu: `https://www.baidu.com/s?wd=${encodeURIComponent(suggestion)}`,
      duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(suggestion)}`,
      yandex: `https://yandex.com/search/?text=${encodeURIComponent(suggestion)}`,
      ecosia: `https://www.ecosia.org/search?q=${encodeURIComponent(suggestion)}`,
      ask: `https://www.ask.com/web?q=${encodeURIComponent(suggestion)}`,
      aol: `https://search.aol.com/aol/search?q=${encodeURIComponent(suggestion)}`,
      facebook: `https://www.facebook.com/search/top?q=${encodeURIComponent(suggestion)}`,
      instagram: `https://www.instagram.com/explore/tags/${encodeURIComponent(suggestion.replace(/[^a-zA-Z0-9]/g, ""))}`,
      x: `https://x.com/search?q=${encodeURIComponent(suggestion)}`,
      tiktok: `https://www.tiktok.com/search?q=${encodeURIComponent(suggestion)}`,
      bluesky: `https://bsky.app/search?q=${encodeURIComponent(suggestion)}`,
      mastodon: `https://mastodon.social/search?q=${encodeURIComponent(suggestion)}`,
    };

    window.open(searchUrls[selectedEngine as SearchEngine], "_blank");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div
      data-testid="Navigation"
      ref={navigationRef}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: 1600,
        marginBottom: 16,
        gap: 8,
        background: "transparent",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginBottom: 24,
        }}
      >
        {isLight && logoSvgContent ? (
          <div
            style={{
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            dangerouslySetInnerHTML={{ __html: logoSvgContent }}
          />
        ) : (
          <img
            src={wordmarkLogo}
            alt="Momentos"
            style={{
              height: 56,
              objectFit: "contain",
              filter: isLight
                ? "none"
                : `drop-shadow(0 0 20px ${colors.accent}40) drop-shadow(0 0 40px ${colors.accent}20) drop-shadow(0 0 60px ${colors.accent}10)`,
            }}
          />
        )}
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
        }}
      >
        {/* Search bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginRight: 12,
            flex: 1,
            position: "relative",
          }}
        >
          <form
            onSubmit={onSubmit}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
            }}
          >
            <img
              src={SEARCH_ENGINE_LOGOS[selectedEngine as SearchEngine]}
              alt="Search"
              onClick={() => onSettingsClick?.("Search")}
              style={{
                width: 20,
                height: 20,
                objectFit: "contain",
                cursor: "pointer",
              }}
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={`Search ${engineName}`}
              style={{
                flex: 1,
                background: "transparent",
                color: colors.text,
                border: "none",
                fontSize: 14,
                outline: "none",
                fontFamily: "Montserrat, sans-serif",
              }}
            />
            <button
              type="submit"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon name="search" color={colors.accent} size={20} />
            </button>
          </form>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: 4,
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                maxHeight: 300,
                overflowY: "auto",
                zIndex: 1000,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    backgroundColor:
                      selectedIndex === index
                        ? colors.gridBackground
                        : "transparent",
                    color: colors.text,
                    fontSize: 14,
                    fontFamily: "Montserrat, sans-serif",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <Icon
                    name="search"
                    color={colors.accent}
                    size={14}
                    style={{ marginRight: 8, opacity: 0.6 }}
                  />
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Icons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon
            name="grid"
            color={colors.accent}
            size={20}
            onClick={onDrawerClick}
          />
          <Icon
            name="settings"
            color={colors.accent}
            size={20}
            onClick={() => onSettingsClick?.()}
          />
        </div>
      </div>
    </div>
  );
};

export default Navigation;
