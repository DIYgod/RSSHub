
// https://github.com/rhysd/dirname-filename-esm
// import.meta

import { fileURLToPath } from 'url';
import { dirname as pathDirname } from 'path';

export function __dirname(importMeta) {
    return pathDirname(__filename(importMeta));
}

export function __filename(importMeta) {
    return importMeta.url ? fileURLToPath(importMeta.url) : '';
}