const dirname = __dirname + '/v2';
const fs = require('fs');
const { join } = require('path');

// Presence Check
for (const dir of fs.readdirSync(dirname)) {
    const dirPath = join(dirname, dir);
    if (!fs.existsSync(join(dirPath, 'maintainer.js'))) {
        throw Error(`No maintainer.js in "${dirPath}".`);
    }
}

// 遍历整个 routes 文件夹，收集模块 maintainer.js
const maintainerPath = require('require-all')({
    dirname,
    filter: /maintainer\.js$/,
});

const maintainers = {};

// 将收集到的自定义模块进行合并
for (const dir in maintainerPath) {
    const routes = maintainerPath[dir]['maintainer.js']; // Do not merge other file

    // typo check e.g., ✘ module.export, ✔ module.exports
    if (!Object.keys(routes).length) {
        throw Error(`No maintainer in "${dir}".`);
    }
    for (const author of Object.values(routes)) {
        if (!Array.isArray(author)) {
            throw Error(`Maintainers' name should be an array in "${dir}".`);
        }
        // check for [], [''] or ['Someone', '']
        if (author.length < 1 || author.includes('')) {
            throw Error(`Empty maintainer in "${dir}".`);
        }
    }

    for (const key in routes) {
        maintainers['/' + dir + key] = routes[key];
    }
}

// 兼容旧版路由
const router = require('./router');
router.stack.forEach((e) => {
    if (!maintainers[e.path]) {
        maintainers[e.path] = [];
    }
});

module.exports = maintainers;
