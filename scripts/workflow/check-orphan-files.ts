import fs from 'node:fs/promises';
import path from 'node:path';

import { getCurrentPath } from '../../lib/utils/helpers';

const __dirname = getCurrentPath(import.meta.url);
const repoRoot = path.join(__dirname, '../..');

export const findOrphanFiles = async (): Promise<string[]> => {
    const entries = await fs.readdir(path.join(repoRoot, 'lib'), { recursive: true, withFileTypes: true });
    const candidates = entries
        .filter((entry) => entry.isFile() && /\.(?:spec|test)\.[cm]?[jt]sx?$/.test(entry.name))
        .map((entry) => {
            const absolute = path.join(entry.parentPath, entry.name);
            return { absolute, relative: path.relative(repoRoot, absolute).replaceAll('\\', '/') };
        })
        .filter(({ relative }) => relative !== 'lib/setup.test.ts');

    const orphans = candidates
        .map(({ absolute, relative }) => {
            if (relative.startsWith('lib/routes/')) {
                return relative;
            }
            const dir = path.dirname(absolute);
            const base = path.basename(absolute).replace(/\.(?:spec|test)\.[cm]?[jt]sx?$/, '');
            const exists = entries.some((entry) => entry.parentPath === dir && entry.isFile() && new RegExp(`^${base.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)}\\.[cm]?[jt]sx?$`).test(entry.name));
            return exists ? null : relative;
        })
        .filter((relative) => relative !== null);

    const deprecated = entries
        .filter((entry) => entry.isFile())
        .map((entry) => path.relative(repoRoot, path.join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
        .filter((relative) => relative.startsWith('lib/routes-deprecated/'));

    return [...orphans, ...deprecated];
};
