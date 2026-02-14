// constants.ts
import googleLogo from "../graphics/branding/google.svg";
import bingLogo from "../graphics/branding/bing.svg";
import yahooLogo from "../graphics/branding/yahoo.svg";
import baiduLogo from "../graphics/branding/baidu.svg";
import duckduckgoLogo from "../graphics/branding/duckduckgo.svg";
import yandexLogo from "../graphics/branding/yandex.svg";
import ecosiaLogo from "../graphics/branding/ecosia.svg";
import askLogo from "../graphics/branding/ask.svg";
import aolLogo from "../graphics/branding/aol.svg";
import facebookLogo from "../graphics/branding/facebook.svg";
import instagramLogo from "../graphics/branding/instagram.svg";
import tiktokLogo from "../graphics/branding/tiktik.svg";
import xLogo from "../graphics/branding/x.svg";
import blueskyLogo from "../graphics/branding/bluesky.svg";
import mastodonLogo from "../graphics/branding/mastodon.svg";

import type { SearchEngine, ModuleSize } from "./types";

export const SEARCH_ENGINE_LOGOS: Record<SearchEngine, string> = {
  google: googleLogo,
  bing: bingLogo,
  yahoo: yahooLogo,
  baidu: baiduLogo,
  duckduckgo: duckduckgoLogo,
  yandex: yandexLogo,
  ecosia: ecosiaLogo,
  ask: askLogo,
  aol: aolLogo,
  facebook: facebookLogo,
  instagram: instagramLogo,
  x: xLogo,
  tiktok: tiktokLogo,
  bluesky: blueskyLogo,
  mastodon: mastodonLogo,
};

export const SEARCH_ENGINES: Array<
  { id: SearchEngine; name: string; color: string } | "coming-soon"
> = [
  { id: "google", name: "Google", color: "#4285F4" },
  { id: "bing", name: "Bing", color: "#008373" },
  { id: "yahoo", name: "Yahoo", color: "#720E9E" },
  { id: "baidu", name: "Baidu", color: "#2319DC" },
  { id: "duckduckgo", name: "DuckDuckGo", color: "#DE5833" },
  { id: "yandex", name: "Yandex", color: "#FF0000" },
  { id: "ecosia", name: "Ecosia", color: "#56AE57" },
  { id: "ask", name: "Ask.com", color: "#C41E3A" },
  { id: "aol", name: "AOL", color: "#00A8E1" },
  { id: "facebook", name: "Facebook", color: "#1877F2" },
  { id: "instagram", name: "Instagram", color: "#E4405F" },
  { id: "x", name: "X", color: "#000000" },
  { id: "tiktok", name: "TikTok", color: "#000000" },
  { id: "bluesky", name: "Bluesky", color: "#0085FF" },
  { id: "mastodon", name: "Mastodon", color: "#6364FF" },
  "coming-soon",
];

export const GRID_COLS = 8;
export const GRID_ROWS = 4;

export const SIZE_GRID_UNITS: Record<
  ModuleSize,
  { cols: number; rows: number }
> = {
  "1x1": { cols: 1, rows: 1 },
  "1x2": { cols: 1, rows: 2 },
  "2x1": { cols: 2, rows: 1 },
  "2x2": { cols: 2, rows: 2 },
  "4x2": { cols: 4, rows: 2 },
  "2x4": { cols: 2, rows: 4 },
};

export const MODULE_REGISTRY_URL =
  "https://raw.githubusercontent.com/toluooshy/public-js-modules/refs/heads/main/modules.txt";
export const DEFAULT_CELL_SIZE = 80;
