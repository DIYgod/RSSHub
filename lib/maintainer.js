const dirname = __dirname + '/v2';

// 遍历整个 routes 文件夹，收集模块 maintainer.js
const maintainerPath = require('require-all')({
    dirname,
    filter: /maintainer\.js$/,
});

const maintainers = {};

// 将收集到的自定义模块进行合并
for (const dir in maintainerPath) {
    const routes = maintainerPath[dir]['maintainer.js']; // Do not merge other file
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
