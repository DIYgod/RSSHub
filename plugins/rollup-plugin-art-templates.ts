// rollup-plugin-art-templates.js
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import MagicString from 'magic-string';

/**
 * @param {object} [opts]
 * @param {string} [opts.outputDir='templates']  Sub‑folder inside your Rollup output where the
 *                                               cloned templates will live (e.g. dist/templates)
 */
export default function artTemplatesPlugin(opts = {}) {
    const templatesDir = opts.outputDir || 'templates';
    /** Map<absoluteSourcePath,   { newName, fileName, referenceId }> */
    const emitted = new Map();

    return {
        name: 'art-template-assets',

        /**
         * Scan every JS/TS file for `path.join(...'.art'...)`
         * and rewrite it on the fly.
         */
        transform(code, id) {
            // Skip dependencies
            if (id.includes('node_modules')) {
                return null;
            }

            // Quick pre‑check – bail fast for files with no “.art”
            if (!code.includes('.art')) {
                return null;
            }

            const callRe = /path\.(join|resolve)\s*\(([^)]+)\)/g; // whole call
            const strRe = /['"]([^'"]+\.art)['"]/g; // individual string literals

            let match,
                mString = null;

            while ((match = callRe.exec(code))) {
                const callSrc = match[0];

                // Extract the **last** '.art' string literal in this call
                let strMatch,
                    relPath = null;
                while ((strMatch = strRe.exec(callSrc))) {
                    relPath = strMatch[1];
                }
                if (!relPath) {
                    continue;
                } // nothing to do

                // Resolve & hash the template file
                const absPath = path.resolve(path.dirname(id), relPath);
                const buf = fs.readFileSync(absPath);
                const hash = createHash('sha256').update(buf).digest('hex').slice(0, 8);
                const newName = `${path.basename(relPath, '.art')}-${hash}.art`;
                const fileName = `${templatesDir}/${newName}`;

                // Emit only once per unique file
                if (!emitted.has(absPath)) {
                    const refId = this.emitFile({ type: 'asset', name: newName, fileName, source: buf });
                    emitted.set(absPath, { newName, fileName, refId });
                }

                // Replace the original string inside the call
                const replacedCall = callSrc.replaceAll(strRe, `'${templatesDir}/${newName}'`);
                mString ||= new MagicString(code);
                mString.overwrite(match.index, match.index + callSrc.length, replacedCall);
            }

            if (mString) {
                return {
                    code: mString.toString(),
                    map: mString.generateMap({ hires: true }),
                };
            }

            return null; // untouched
        },
    };
}
