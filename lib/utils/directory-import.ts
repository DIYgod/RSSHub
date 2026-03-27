import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

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

export const directoryImport = async ({ targetDirectoryPath, importPattern = /.*/, includeSubdirectories = true }: DirectoryImportOptions) => {
    const modules: Record<string, unknown> = {};
    const filesPaths = readDirectory(targetDirectoryPath, includeSubdirectories);

    await Promise.all(
        filesPaths.map(async (filePath) => {
            const { ext: fileExtension } = path.parse(filePath);
            const isValidModuleExtension = VALID_IMPORT_EXTENSIONS.has(fileExtension);
            const isDeclarationFile = filePath.endsWith('.d.ts') || filePath.endsWith('.d.tsx');
            const isValidFilePath = importPattern.test(filePath);

            if (!isValidModuleExtension || isDeclarationFile || !isValidFilePath) {
                return;
            }

            const relativeModulePath = filePath.slice(targetDirectoryPath.length);
            modules[relativeModulePath] = await import(pathToFileURL(filePath).href);
        })
    );

    return modules;
};
