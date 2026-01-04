// No-op shim for directory-import in Cloudflare Workers
// directoryImport is only used in dev mode, Worker builds use pre-built routes

export type DirectoryImportOptions = {
    targetDirectoryPath: string;
    importPattern?: RegExp;
    includeSubdirectories?: boolean;
};

export const directoryImport = (_options: DirectoryImportOptions): Record<string, unknown> => {
    // This should never be called in Worker builds
    // Worker builds use pre-built routes from routes-worker.js
    throw new Error('directoryImport is not available in Worker builds');
};
