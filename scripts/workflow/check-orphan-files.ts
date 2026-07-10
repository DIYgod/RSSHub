import fs from 'node:fs/promises';
import path from 'node:path';

import { getCurrentPath } from '../../lib/utils/helpers';

const __dirname = getCurrentPath(import.meta.url);
const repoRoot = path.join(__dirname, '../..');

const fileExists = async (filePath: string) => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
};

export const findOrphanFiles = async (): Promise<string[]> => {
    const excludedDirs = ['lib/routes', 'lib/routes-deprecated'].map((dir) => path.join(repoRoot, dir) + path.sep);

    const entries = await fs.readdir(path.join(repoRoot, 'lib'), { recursive: true, withFileTypes: true });
    const candidates = entries
        .filter((entry) => excludedDirs.every((dir) => !`${entry.parentPath}${path.sep}`.startsWith(dir)))
        .filter((entry) => entry.isFile() && /\.test\.tsx?$/.test(entry.name))
        .map((entry) => {
            const absolute = path.join(entry.parentPath, entry.name);
            return { absolute, relative: path.relative(repoRoot, absolute).replaceAll('\\', '/') };
        })
        .filter(({ relative }) => relative !== 'lib/setup.test.ts');

    const orphans = await Promise.all(
        candidates.map(async ({ absolute, relative }) => {
            const base = absolute.replace(/\.test\.tsx?$/, '');
            const [tsExists, tsxExists] = await Promise.all([fileExists(`${base}.ts`), fileExists(`${base}.tsx`)]);
            return tsExists || tsxExists ? null : relative;
        })
    );

    return orphans.filter((relative) => relative !== null).toSorted((a, b) => a.localeCompare(b));
};
