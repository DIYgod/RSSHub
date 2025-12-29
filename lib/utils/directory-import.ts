import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

export type DirectoryImportOptions = {
    targetDirectoryPath: string;
    importPattern?: RegExp;
    includeSubdirectories?: boolean;
};

const VALID_IMPORT_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.json']);

const readDirectory = (targetDirectoryPath: string, includeSubdirectories: boolean): string[] => {
    const entries = fs.readdirSync(targetDirectoryPath, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(targetDirectoryPath, entry.name);
        if (entry.isDirectory()) {
            if (includeSubdirectories) {
                files.push(...readDirectory(fullPath, includeSubdirectories));
            }
            continue;
        }

        if (entry.isFile()) {
            files.push(fullPath);
        }
    }

    return files;
};

export const directoryImport = ({ targetDirectoryPath, importPattern = /.*/, includeSubdirectories = true }: DirectoryImportOptions) => {
    const modules: Record<string, unknown> = {};
    const filesPaths = readDirectory(targetDirectoryPath, includeSubdirectories);

    for (const filePath of filesPaths) {
        const { ext: fileExtension } = path.parse(filePath);
        const isValidModuleExtension = VALID_IMPORT_EXTENSIONS.has(fileExtension);
        const isDeclarationFile = filePath.endsWith('.d.ts') || filePath.endsWith('.d.tsx');
        const isValidFilePath = importPattern.test(filePath);

        if (!isValidModuleExtension || isDeclarationFile || !isValidFilePath) {
            continue;
        }

        const relativeModulePath = filePath.slice(targetDirectoryPath.length);
        modules[relativeModulePath] = require(filePath);
    }

    return modules;
};
