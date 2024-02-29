const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, '../../assets/build/maintainer.json');
const dirname = path.join(__dirname + '../../../lib/routes');

// Presence Check
for (const dir of fs.readdirSync(dirname)) {
    const dirPath = path.join(dirname, dir);
    if (fs.existsSync(path.join(dirPath, 'router.js')) && !fs.existsSync(path.join(dirPath, 'maintainer.js'))) {
        throw new Error(`No maintainer.js in "${dirPath}".`);
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
        throw new Error(`No maintainer in "${dir}".`);
    }
    for (const author of Object.values(routes)) {
        if (!Array.isArray(author)) {
            throw new TypeError(`Maintainers' name should be an array in "${dir}".`);
        }
        // check for [], [''] or ['Someone', '']
        if (author.length < 1 || author.includes('')) {
            throw new Error(`Empty maintainer in "${dir}".`);
        }
    }

    for (const key in routes) {
        maintainers['/' + dir + (key.endsWith('/') ? key.substring(0, key.length - 1) : key)] = routes[key];
    }
}

// 兼容旧版路由
const router = require('../../lib/router.js');
for (const e of router.stack) {
    if (!maintainers[e.path]) {
        maintainers[e.path] = [];
    }
}

const maintainer = Object.keys(maintainers)
    .sort()
    .reduce((obj, path) => {
        obj[path] = maintainers[path];
        return obj;
    }, {});

const count = Object.keys(maintainer).length;
const uniqueMaintainer = new Set();
for (const e of Object.values(maintainer).flat()) {
    uniqueMaintainer.add(e);
}

// eslint-disable-next-line no-console
console.log(`We have ${count} routes and maintained by ${uniqueMaintainer.size} contributors!`);

fs.writeFileSync(target, JSON.stringify(maintainer, null, 4));
