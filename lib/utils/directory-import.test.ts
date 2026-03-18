import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { directoryImport } from '@/utils/directory-import';

const createTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'rsshub-dir-import-'));

const writeFile = (filePath: string, content: string) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
};

describe('directory-import', () => {
    let tempDir = '';

    afterEach(() => {
        if (tempDir) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            tempDir = '';
        }
    });

    it('imports valid files and skips invalid ones', async () => {
        tempDir = createTempDir();
        const rootModule = path.join(tempDir, 'valid.mjs');
        const jsonModule = path.join(tempDir, 'data.json');
        const ignoredText = path.join(tempDir, 'note.txt');
        const declaration = path.join(tempDir, 'types.d.ts');
        const nestedModule = path.join(tempDir, 'sub', 'child.mjs');

        writeFile(rootModule, "export const value = 'root';");
        writeFile(jsonModule, JSON.stringify({ value: 'json' }));
        writeFile(ignoredText, 'ignore');
        writeFile(declaration, 'export {};');
        writeFile(nestedModule, "export const value = 'child';");

        const modules = await directoryImport({ targetDirectoryPath: tempDir });
        const keyFor = (filePath: string) => filePath.slice(tempDir.length);

        expect(modules).toHaveProperty(keyFor(rootModule));
        expect(modules).toHaveProperty(keyFor(jsonModule));
        expect(modules).toHaveProperty(keyFor(nestedModule));
        expect(modules).not.toHaveProperty(keyFor(ignoredText));
        expect(modules).not.toHaveProperty(keyFor(declaration));
    });

    it('can skip subdirectories and apply patterns', async () => {
        tempDir = createTempDir();
        const rootModule = path.join(tempDir, 'keep.mjs');
        const nestedModule = path.join(tempDir, 'sub', 'skip.mjs');

        writeFile(rootModule, "export const value = 'keep';");
        writeFile(nestedModule, "export const value = 'skip';");

        const modules = await directoryImport({
            targetDirectoryPath: tempDir,
            includeSubdirectories: false,
            importPattern: /keep/,
        });
        const keyFor = (filePath: string) => filePath.slice(tempDir.length);

        expect(modules).toHaveProperty(keyFor(rootModule));
        expect(modules).not.toHaveProperty(keyFor(nestedModule));
    });
});
