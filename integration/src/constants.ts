export const PACKAGE_NAME = "astro-asset-map";

export const PLUGIN_NAME = `vite-plugin-${PACKAGE_NAME}`;

export const VIRTUAL_MODULE_ID = `${PACKAGE_NAME}:runtime`;

export const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

export const TYPES_FILE_NAME = "astro-asset-map.d.ts";

export const ASSETS_DIR = "src/assets";

export const PUBLIC_ASSET_PREFIX = "public:";

export const VALID_INPUT_FORMATS = [
  "jpeg",
  "jpg",
  "png",
  "tiff",
  "webp",
  "gif",
  "svg",
  "avif",
] as const;

export const VALID_ASSET_EXT_REGEX = new RegExp(`\\.(${VALID_INPUT_FORMATS.join("|")})$`, "i");

export const WATCH_DEBOUNCE_MS = 150;

export const MAX_EDIT_DISTANCE = 5;
