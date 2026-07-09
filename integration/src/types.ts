export interface ScannedAsset {
  /** Path relative to the assets directory, using forward slashes, e.g. "images/car.webp" */
  path: string;
  /** Absolute filesystem path to the asset */
  absolute: string;
}

export interface TypesFileRef {
  url?: URL;
}

export interface AssetsVitePluginOptions {
  /** Absolute path to the assets directory */
  assetsDir: string;
  /** Absolute path to the project root */
  root: string;
  /** Ref populated with the injectTypes() URL once astro:config:done runs */
  typesFileRef: TypesFileRef;
}
