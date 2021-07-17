const fs = require('fs/promises');
const path = require('path');
const globby = require('globby');
const { nodeFileTrace } = require('@vercel/nft');
const files = ['lib/index.js', 'api/now.js'];
const exclude = [];

(async () => {
    const { fileList } = await nodeFileTrace(files, {
        base: path.resolve(path.join(__dirname, '..')),
    });
    const deps = await globby('node_modules/**/*', { dot: true, onlyFiles: false });
    const toDel = deps.filter((f) => exclude.every((re) => !re.test(f)) && !fileList.includes(f));
    await Promise.all(
        toDel.map(async (f) => {
            const stat = await fs.lstat(f);
            if (stat.isDirectory()) {
                return fs.rmdir(f, { recursive: true });
            } else {
                return fs.unlink(f);
            }
        })
    );
})();
